import asynchandler from '../utils/asynchandler.js';
import { ApiResponse } from '../utils/api-response.js';
import {
  saveComplaintToDB,
  updateComplaintStatusInDB,
  updateComplaintPriorityInDB,
  deleteComplaintFromDB,
  getComplaintCounts,
  searchComplaints,
  escalateComplaintsByCategory,
  fetchHeatmapData,
} from '../services/complaint.service.js';
import { notifyStatusChange } from '../services/notification.service.js';

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
  const { status, staffId, priority } = req.body;

  if (!status) {
    return res.status(400).json(new ApiResponse(400, null, 'Status is required for this update.'));
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

export {
  createComplaint,
  updateComplaintStatus,
  updateComplaintPriority,
  deleteComplaint,
  fetchComplaintCounts,
  getComplaints,
  escalateComplaints,
  getHeatmapData,
};

