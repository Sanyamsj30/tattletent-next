import asynchandler from '../utils/asynchandler.js';
import { ApiResponse } from '../utils/api-response.js';
import jwt from 'jsonwebtoken';
import {
  saveComplaintToDB,
  updateComplaintStatusInDB,
  updateComplaintPriorityInDB,
  deleteComplaintFromDB,
  getComplaintCounts,
  searchComplaints,
  escalateComplaintsByCategory,
  fetchHeatmapData,
  adminReassignComplaintInDB,
  forceEscalateComplaintInDB,
} from '../services/complaint.service.js';
import { notifyStatusChange } from '../services/notification.service.js';
import Complaint from '../models/Complaint.js';

const createComplaint = asynchandler(async (req, res) => {
  const { title, description, category, location, user_id, latitude, longitude, priority } = Object.assign({}, req.body);

  if (!user_id || !title || !description || !category || !location) {
    return res.status(400).json(new ApiResponse(400, null, 'All fields are required'));
  }

  const complaint = await saveComplaintToDB({
    user_id,
    title,
    description,
    category,
    location,
    priority: priority || 'Low',
    photo: req.file ? `/temp/${req.file.filename}` : null,
    latitude: latitude != null ? Number(latitude) : undefined,
    longitude: longitude != null ? Number(longitude) : undefined,
  });

  return res.status(201).json(new ApiResponse(201, complaint, 'Complaint submitted successfully'));
});

const updateComplaintStatus = asynchandler(async (req, res) => {
  const { id } = req.params;
  let { status, staffId, priority } = req.body;

  if (!status) {
    return res.status(400).json(new ApiResponse(400, null, 'Status is required for this update.'));
  }

  const role = req.user?.role;
  const isCitizen = role === 'Citizen';
  const isStaffOrAdmin = ['Staff', 'Admin', 'Ringmaster', 'Groundmaster'].includes(role);

  if (!isCitizen && !isStaffOrAdmin) {
    return res.status(403).json(new ApiResponse(403, null, 'Access denied. Unauthorized role.'));
  }

  if (isCitizen) {
    // Citizens can only confirm or reject their own RESOLVED_PENDING complaints
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json(new ApiResponse(404, null, 'Complaint not found.'));
    }

    if (complaint.user_id.toString() !== req.user.user_id) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied. You do not own this complaint.'));
    }

    if (complaint.status !== 'RESOLVED_PENDING') {
      return res.status(400).json(new ApiResponse(400, null, 'Only resolved pending complaints can be updated by citizens.'));
    }

    const normalizedTarget = String(status).trim().toUpperCase();
    if (normalizedTarget !== 'RESOLVED' && normalizedTarget !== 'IN_PROGRESS') {
      return res.status(400).json(new ApiResponse(400, null, 'Invalid status. Citizens can only confirm (RESOLVED) or reject (IN_PROGRESS) the resolution.'));
    }

    // Citizens cannot modify assignment or priority
    staffId = undefined;
    priority = undefined;
  } else {
    // Issue 5: Redirect Staff/Vendor resolutions to RESOLVED_PENDING first
    const isStaff = role === 'Staff';
    const isMarkingResolved = String(status).trim().toLowerCase() === 'resolved';

    if (isStaff && isMarkingResolved) {
      status = 'RESOLVED_PENDING';
    }
  }

  const updated = await updateComplaintStatusInDB(id, status, staffId, priority);
  if (!updated) return res.status(404).json(new ApiResponse(404, null, 'Complaint not found'));

  // Best-effort notification (email)
  try {
    await notifyStatusChange(updated.complaint_id);
  } catch (err) {
    console.error('notifyStatusChange failed:', err);
  }

  return res.status(200).json(new ApiResponse(200, updated, 'Complaint status updated successfully'));
});

const updateComplaintPriority = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { priority } = req.body;

  if (!priority) return res.status(400).json(new ApiResponse(400, null, 'Priority is required for this update.'));

  const updated = await updateComplaintPriorityInDB(id, priority);
  if (!updated) return res.status(404).json(new ApiResponse(404, null, 'Complaint not found'));

  return res.status(200).json(new ApiResponse(200, updated, 'Complaint priority updated successfully'));
});

const deleteComplaint = asynchandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await deleteComplaintFromDB(id);
  if (!deleted) return res.status(404).json(new ApiResponse(404, null, 'Complaint not found'));
  return res.status(200).json(new ApiResponse(200, null, 'Complaint deleted successfully'));
});

const fetchComplaintCounts = async (req, res) => {
  try {
    const counts = await getComplaintCounts();
    res.status(200).json(counts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

const getComplaints = async (req, res) => {
  try {
    // Issue 7: Secure BOLA vulnerability for User-Specific Search
    if (req.query.user_id) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required for user-specific search.' });
      }

      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'Citizen' && decoded.user_id !== req.query.user_id) {
          return res.status(403).json({ error: 'Forbidden: You cannot query complaints filed by other citizens.' });
        }
      } catch (tokenErr) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
      }
    }

    const filters = {
      user_id: req.query.user_id,
      searchText: req.query.q,
      category: req.query.category,
      status: req.query.status,
      location: req.query.location,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      order: req.query.order,
      staff_id: req.query.staff_id,
    };

    const complaints = await searchComplaints(filters);
    res.status(200).json(complaints);
  } catch (err) {
    console.error('Error in getComplaints:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

const escalateComplaints = asynchandler(async (req, res) => {
  const escalated = await escalateComplaintsByCategory();
  if (escalated.length === 0) {
    return res.status(200).json(new ApiResponse(200, null, '✅ No complaints needed escalation today'));
  }
  return res.status(200).json(
    new ApiResponse(200, { count: escalated.length, escalated }, '⚡ Complaints escalated successfully')
  );
});

const getHeatmapData = async (req, res) => {
  try {
    const points = await fetchHeatmapData();
    res.status(200).json(points);
  } catch (err) {
    console.error('Error fetching heatmap data:', err);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
};

const reassignComplaint = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { staffId, reason } = req.body;

  const updated = await adminReassignComplaintInDB(id, staffId, req.user, reason);
  return res.status(200).json(new ApiResponse(200, updated, 'Complaint reassigned successfully'));
});

const forceEscalateComplaint = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const updated = await forceEscalateComplaintInDB(id, req.user, reason);
  return res.status(200).json(new ApiResponse(200, updated, 'Complaint escalated successfully'));
});

export {
  createComplaint,
  updateComplaintStatus,
  updateComplaintPriority,
  deleteComplaint,
  fetchComplaintCounts,
  getComplaints,
  escalateComplaints,
  getHeatmapData,
  reassignComplaint,
  forceEscalateComplaint,
};

