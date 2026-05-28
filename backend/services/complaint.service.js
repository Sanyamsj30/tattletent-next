import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import SlaRule from '../models/SlaRule.js';
import User from '../models/User.js';
import { notifyAdminForManualReassignment } from './notification.service.js';

const normalizeStatus = (status) => {
  if (!status) return status;
  const s = String(status).trim().toLowerCase();
  if (s === 'new' || s === 'pending') return 'NEW';
  if (s === 'in progress' || s === 'in_progress' || s === 'inprogress') return 'IN_PROGRESS';
  if (s === 'resolved' || s === 'resolve' || s === 'res') return 'RESOLVED';
  // If caller already uses canonical values
  if (status === 'NEW' || status === 'IN_PROGRESS' || status === 'RESOLVED') return status;
  return status;
};

const toComplaintDto = (c) => ({
  complaint_id: c._id.toString(),
  title: c.title,
  description: c.description,
  category: c.category,
  location: c.location,
  dept_id: c.dept_id?.toString?.() || c.dept_id,
  priority: c.priority,
  status: c.status,
  photo: c.photo,
  user_id: c.user_id?.toString?.() || c.user_id,
  staff_id: c.staff_id?.toString?.() || c.staff_id,
  assigned_to: c.assigned_to,
  latitude: c.latitude,
  longitude: c.longitude,
  sla_deadline: c.sla_deadline,
  submitted_at: c.submitted_at,
  updated_at: c.updated_at,
});

const ensureDepartment = async (categoryName) => {
  const name = String(categoryName || '').trim();
  if (!name) return null;

  const existing = await Department.findOne({ dept_name: new RegExp(`^${name}$`, 'i') });
  if (existing) return existing;
  return Department.create({ dept_name: name });
};

/**
 * Calculate SLA deadline interval in hours based on dept_id and priority.
 */
export const calculateSlaDeadline = async (dept_id, priority) => {
  try {
    const rule = await SlaRule.findOne({ dept_id, priority }).select('time_limit_hours');
    if (!rule) return 24;
    return rule.time_limit_hours;
  } catch (err) {
    console.error('Error fetching SLA rule:', err);
    return 24;
  }
};

/**
 * Save complaint — auto-assign dept_id based on category.
 */
export const saveComplaintToDB = async (newComplaint) => {
  try {
    const dept = await ensureDepartment(newComplaint.category);
    const dept_id = dept?._id;

    const priority = newComplaint.priority || 'Low';
    const slaHours = dept_id ? await calculateSlaDeadline(dept_id, priority) : 24;
    const sla_deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const doc = await Complaint.create({
      title: newComplaint.title,
      description: newComplaint.description,
      status: 'NEW',
      photo: newComplaint.photo,
      category: newComplaint.category,
      location: newComplaint.location,
      dept_id,
      priority,
      user_id: newComplaint.user_id,
      longitude: newComplaint.longitude ?? undefined,
      latitude: newComplaint.latitude ?? undefined,
      geolocation:
        newComplaint.longitude != null && newComplaint.latitude != null
          ? {
              type: 'Point',
              coordinates: [Number(newComplaint.longitude), Number(newComplaint.latitude)],
            }
          : undefined,
      sla_deadline,
    });

    return toComplaintDto(doc);
  } catch (err) {
    console.error('❌ Error saving complaint:', err.message);
    throw err;
  }
};

/**
 * Update complaint status (and optionally assignment/priority).
 */
export const updateComplaintStatusInDB = async (id, status, staffId, priority) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) return null;

  if (staffId) {
    const staff = await User.findById(staffId).select('name');
    if (staff) {
      complaint.staff_id = staff._id;
      complaint.assigned_to = staff.name;
    }
  }

  if (priority) {
    complaint.priority = priority;
    const slaHours = complaint.dept_id
      ? await calculateSlaDeadline(complaint.dept_id, priority)
      : 24;
    complaint.sla_deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
  }

  const normalized = normalizeStatus(status);
  if (normalized === 'RESOLVED') {
    complaint.status = 'RESOLVED';
    // Reward staff points (simple model): add temp_points to staff points
    if (complaint.staff_id) {
      await User.updateOne(
        { _id: complaint.staff_id },
        { $inc: { points: complaint.temp_points || 0 } }
      );
    }
    complaint.temp_points = 0;
  } else if (normalized === 'IN_PROGRESS') {
    complaint.status = 'IN_PROGRESS';
  } else if (normalized === 'NEW') {
    complaint.status = 'NEW';
  } else if (normalized) {
    complaint.status = normalized;
  }

  await complaint.save();
  return toComplaintDto(complaint);
};

/**
 * Update complaint priority (and recalculate SLA).
 */
export const updateComplaintPriorityInDB = async (id, priority) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) return null;

  complaint.priority = priority;
  const slaHours = complaint.dept_id ? await calculateSlaDeadline(complaint.dept_id, priority) : 24;
  complaint.sla_deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

  await complaint.save();
  return toComplaintDto(complaint);
};

export const deleteComplaintFromDB = async (id) => {
  const deleted = await Complaint.findByIdAndDelete(id);
  return Boolean(deleted);
};

export const getComplaintCounts = async () => {
  const [resolved, pending, in_progress] = await Promise.all([
    Complaint.countDocuments({ status: 'RESOLVED' }),
    Complaint.countDocuments({ status: 'NEW' }),
    Complaint.countDocuments({ status: 'IN_PROGRESS' }),
  ]);
  return { resolved, pending, in_progress };
};

export const searchComplaints = async (filters) => {
  let {
    user_id,
    searchText,
    category,
    status,
    location,
    fromDate,
    toDate,
    page,
    limit,
    sortBy,
    order,
    staff_id,
  } = filters;

  const query = {};

  if (searchText) {
    const re = new RegExp(String(searchText), 'i');
    query.$or = [{ title: re }, { description: re }];
  }

  if (user_id) query.user_id = user_id;
  if (staff_id) query.staff_id = staff_id;
  if (category) query.category = category;
  if (location) query.location = location;

  if (status) query.status = normalizeStatus(status);

  if (fromDate || toDate) {
    query.submitted_at = {};
    if (fromDate) query.submitted_at.$gte = new Date(fromDate);
    if (toDate) query.submitted_at.$lte = new Date(toDate);
  }

  const validSort = ['submitted_at', 'status', 'category', 'sla_deadline'];
  const sortColumn = validSort.includes(sortBy) ? sortBy : 'submitted_at';
  const sortOrder = String(order || 'desc').toLowerCase() === 'asc' ? 1 : -1;
  const sort = { [sortColumn]: sortOrder };

  // Pagination (enabled)
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 50;
  const skip = (page - 1) * limit;

  const results = await Complaint.find(query).sort(sort).skip(skip).limit(limit).lean();
  return results.map((c) => toComplaintDto(c));
};

/**
 * Escalate complaints whose SLA deadline is breached.
 * - Low -> Medium -> High
 * - High -> reset assignment + notify admins for manual reassignment
 */
export const escalateComplaintsByCategory = async () => {
  const now = new Date();
  const overdue = await Complaint.find({
    status: { $in: ['NEW', 'IN_PROGRESS'] },
    sla_deadline: { $ne: null, $lt: now },
  }).lean();

  if (!overdue.length) return [];

  const escalated = [];

  for (const c of overdue) {
    const complaint = await Complaint.findById(c._id);
    if (!complaint) continue;

    if (complaint.priority === 'Low') {
      complaint.priority = 'Medium';
      const slaHours = complaint.dept_id
        ? await calculateSlaDeadline(complaint.dept_id, complaint.priority)
        : 24;
      complaint.sla_deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
      complaint.temp_points = Math.max((complaint.temp_points || 0) - 1, 0);
      await complaint.save();
      escalated.push({ complaint_id: complaint._id.toString(), priority: complaint.priority });
      continue;
    }

    if (complaint.priority === 'Medium') {
      complaint.priority = 'High';
      const slaHours = complaint.dept_id
        ? await calculateSlaDeadline(complaint.dept_id, complaint.priority)
        : 24;
      complaint.sla_deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
      complaint.temp_points = Math.max((complaint.temp_points || 0) - 1, 0);
      await complaint.save();
      escalated.push({ complaint_id: complaint._id.toString(), priority: complaint.priority });
      continue;
    }

    // High priority: reset assignment and notify admin
    complaint.status = 'NEW';
    complaint.staff_id = undefined;
    complaint.assigned_to = undefined;
    const slaHours = complaint.dept_id
      ? await calculateSlaDeadline(complaint.dept_id, complaint.priority)
      : 24;
    complaint.sla_deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
    complaint.temp_points = 3;
    await complaint.save();
    escalated.push({ complaint_id: complaint._id.toString(), priority: complaint.priority });

    try {
      await notifyAdminForManualReassignment(complaint._id.toString());
    } catch (err) {
      console.error('Failed to notify admin:', err);
    }
  }

  return escalated;
};

export const fetchHeatmapData = async () => {
  const docs = await Complaint.find({ 'geolocation.coordinates.0': { $exists: true } })
    .select('geolocation')
    .lean();

  return docs
    .map((c) => {
      const coords = c?.geolocation?.coordinates;
      if (!coords || coords.length < 2) return null;
      const [longitude, latitude] = coords;
      return { complaint_id: c._id.toString(), latitude, longitude };
    })
    .filter(Boolean);
};
