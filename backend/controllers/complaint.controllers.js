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
  getNearbyComplaints,
  supportComplaintInDB,
  getMapMarkers,
} from '../services/complaint.service.js';
import { notifyStatusChange } from '../services/notification.service.js';
import { logAuditEvent } from '../services/audit.service.js';
import Complaint from '../models/Complaint.js';

const createComplaint = asynchandler(async (req, res) => {
  const { title, description, category, location, latitude, longitude, priority } =
    Object.assign({}, req.body);
  const user_id = req.user?.user_id;

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
    photo: req.file ? (req.file.path.startsWith('http') ? req.file.path : `/temp/${req.file.filename}`) : null,
    latitude: latitude != null ? Number(latitude) : undefined,
    longitude: longitude != null ? Number(longitude) : undefined,
  });

  // Log audit event
  logAuditEvent({
    action: 'COMPLAINT_CREATED',
    complaint_id: complaint._id,
    user: req.user,
    details: { category, priority: priority || 'Low' },
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

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    return res.status(404).json(new ApiResponse(404, null, 'Complaint not found.'));
  }

  if (isCitizen) {
    // Citizens can only confirm or reject their own RESOLVED_PENDING complaints
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
    // Staff or Admin
    const isStaff = role === 'Staff';

    if (isStaff) {
      // Step 6: Restrict staff status updates to assigned complaints only
      if (!complaint.staff_id || complaint.staff_id.toString() !== req.user.user_id) {
        return res.status(403).json(new ApiResponse(403, null, 'Access denied. This complaint is not assigned to you.'));
      }
    }

    // Issue 5: Redirect Staff/Vendor resolutions to RESOLVED_PENDING first
    const isMarkingResolved = String(status).trim().toLowerCase() === 'resolved';

    if (isStaff && isMarkingResolved) {
      status = 'RESOLVED_PENDING';
    }
  }

  const oldStatus = complaint.status;
  const updated = await updateComplaintStatusInDB(id, status, staffId, priority);
  if (!updated) return res.status(404).json(new ApiResponse(404, null, 'Complaint not found'));

  // Log audit event
  logAuditEvent({
    action: 'STATUS_UPDATED',
    complaint_id: id,
    user: req.user,
    details: {
      oldStatus,
      newStatus: status,
      priorityChangedTo: priority,
    },
  });

  // Best-effort notification (email)
  try {
    await notifyStatusChange(updated.complaint_id);
  } catch (err) {
    console.error('notifyStatusChange failed:', err);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updated, 'Complaint status updated successfully'));
});

const updateComplaintPriority = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { priority } = req.body;

  if (!priority)
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'Priority is required for this update.'));

  const updated = await updateComplaintPriorityInDB(id, priority);
  if (!updated) return res.status(404).json(new ApiResponse(404, null, 'Complaint not found'));

  return res
    .status(200)
    .json(new ApiResponse(200, updated, 'Complaint priority updated successfully'));
});

const deleteComplaint = asynchandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await deleteComplaintFromDB(id);
  if (!deleted) return res.status(404).json(new ApiResponse(404, null, 'Complaint not found'));

  logAuditEvent({
    action: 'COMPLAINT_DELETED',
    complaint_id: id,
    user: req.user,
    details: { reason: 'Soft deleted by staff or admin' },
  });

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
    if (req.user.role === 'Citizen') {
      req.query.user_id = req.user.user_id;
    }

    const filters = {
      id: req.query.id,
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
    return res
      .status(200)
      .json(new ApiResponse(200, null, '✅ No complaints needed escalation today'));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: escalated.length, escalated },
        '⚡ Complaints escalated successfully'
      )
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

  logAuditEvent({
    action: 'MANUAL_REASSIGNMENT',
    complaint_id: id,
    user: req.user,
    details: { assignedToStaffId: staffId, reason },
  });

  return res.status(200).json(new ApiResponse(200, updated, 'Complaint reassigned successfully'));
});

const forceEscalateComplaint = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const updated = await forceEscalateComplaintInDB(id, req.user, reason);

  logAuditEvent({
    action: 'FORCED_ESCALATION',
    complaint_id: id,
    user: req.user,
    details: { reason },
  });

  return res.status(200).json(new ApiResponse(200, updated, 'Complaint escalated successfully'));
});

const fetchNearbyComplaints = asynchandler(async (req, res) => {
  const { longitude, latitude, radius, category } = req.query;

  if (longitude == null || latitude == null) {
    return res.status(400).json(new ApiResponse(400, null, 'Longitude and Latitude are required'));
  }

  const nearby = await getNearbyComplaints(longitude, latitude, radius || 100, category);
  return res.status(200).json(new ApiResponse(200, nearby, 'Nearby complaints fetched successfully'));
});

const supportComplaint = asynchandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user?.user_id;

  if (!user_id) {
    return res.status(401).json(new ApiResponse(401, null, 'Unauthorized'));
  }

  const updated = await supportComplaintInDB(id, user_id);

  logAuditEvent({
    action: 'COMPLAINT_SUPPORTED',
    complaint_id: id,
    user: req.user,
    details: { user_id },
  });

  return res.status(200).json(new ApiResponse(200, updated, 'Complaint supported successfully'));
});

const getMapMarkersData = asynchandler(async (req, res) => {
  const { status, category, fromDate, toDate } = req.query;
  const markers = await getMapMarkers({ status, category, fromDate, toDate });
  return res.status(200).json(new ApiResponse(200, markers, 'Map markers fetched successfully'));
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
  fetchNearbyComplaints,
  supportComplaint,
  getMapMarkersData,
};
