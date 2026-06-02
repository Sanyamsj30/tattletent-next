import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import SlaRule from '../models/SlaRule.js';
import User from '../models/User.js';
import { notifyAdminForManualReassignment } from './notification.service.js';
import { checkDuplicateComplaint } from '../agents/duplicateDetectionAgent.js';
import { analyzeEscalationUrgency } from '../agents/smartEscalationAgent.js';
import { calculateDeterministicSeverity, calculateDeterministicPriority } from './ruleEngine.js';
import { runAutoAssignmentEngine } from './assignment.service.js';

const normalizeStatus = (status) => {
  if (!status) return status;
  const s = String(status).trim().toLowerCase();
  if (s === 'new' || s === 'pending') return 'NEW';
  if (s === 'in progress' || s === 'in_progress' || s === 'inprogress') return 'IN_PROGRESS';
  if (s === 'resolved' || s === 'resolve' || s === 'res') return 'RESOLVED';
  if (s === 'resolved_pending' || s === 'resolved-pending' || s === 'resolvedpending') return 'RESOLVED_PENDING';
  if (s === 'duplicate' || s === 'merged') return 'DUPLICATE';
  // If caller already uses canonical values
  if (status === 'NEW' || status === 'IN_PROGRESS' || status === 'RESOLVED' || status === 'RESOLVED_PENDING' || status === 'DUPLICATE') return status;
  return status;
};

const toComplaintDto = (c) => {
  const userIdStr = c.user_id?._id?.toString() || c.user_id?.toString() || c.user_id;
  const staffIdStr = c.staff_id?._id?.toString() || c.staff_id?.toString() || c.staff_id;

  return {
    complaint_id: c._id.toString(),
    title: c.title,
    description: c.description,
    category: c.category,
    location: c.location,
    dept_id: c.dept_id?.toString?.() || c.dept_id,
    priority: c.priority,
    status: c.status,
    photo: c.photo,
    user_id: userIdStr,
    citizen_name: c.user_id?.name || 'Civic Citizen',
    citizen_email: c.user_id?.email || '',
    staff_id: staffIdStr,
    assigned_to: c.staff_id?.name || c.assigned_to,
    latitude: c.latitude,
    longitude: c.longitude,
    sla_deadline: c.sla_deadline,
    submitted_at: c.submitted_at,
    updated_at: c.updated_at,
    severity: c.severity || 'Low',
    is_duplicate: c.is_duplicate || false,
    duplicate_of: c.duplicate_of?.toString?.() || c.duplicate_of,
    escalation_explanation: c.escalation_explanation,
    priority_score: c.priority_score || 0,
    priority_level: c.priority_level || 'Low',
    is_auto_assigned: c.is_auto_assigned !== false,
    recommendation_explanation: c.recommendation_explanation,
    priority_breakdown: c.priority_breakdown || { severity: 0, duplicates: 0, escalations: 0, location: 0, age: 0 },
    assignment_history: (c.assignment_history || []).map(h => ({
      old_staff_id: h.old_staff_id?.toString?.() || h.old_staff_id,
      new_staff_id: h.new_staff_id?.toString?.() || h.new_staff_id,
      old_staff_name: h.old_staff_name,
      new_staff_name: h.new_staff_name,
      timestamp: h.timestamp,
      admin_id: h.admin_id?.toString?.() || h.admin_id,
      admin_name: h.admin_name,
      reason: h.reason,
    })),
  };
};

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

export const saveComplaintToDB = async (newComplaint) => {
  try {
    const dept = await ensureDepartment(newComplaint.category);
    const dept_id = dept?._id;

    const priority = newComplaint.priority || 'Low';
    const slaHours = dept_id ? await calculateSlaDeadline(dept_id, priority) : 24;
    const sla_deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    // 1. Calculate deterministic severity level
    const severity = calculateDeterministicSeverity({
      title: newComplaint.title,
      description: newComplaint.description,
      category: newComplaint.category,
      location: newComplaint.location,
      escalation_count: 0
    }, 0);

    // 2. Pre-create the complaint document
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
      severity,
      is_duplicate: false,
      duplicate_of: null
    });

    // 3. Compute priority score, level, and point breakdown
    const prioDetails = calculateDeterministicPriority(doc, 0);
    doc.priority_score = prioDetails.priority_score;
    doc.priority_level = prioDetails.priority_level;
    doc.priority_breakdown = prioDetails.breakdown;
    await doc.save();

    // 4. Run the Auto-Assignment Engine synchronously to assign the best vendor instantly
    await runAutoAssignmentEngine(doc._id);

    // 5. Fetch fully assigned updated document
    const finalDoc = await Complaint.findById(doc._id);

    // Launch duplicate check asynchronously in the background
    setImmediate(async () => {
      try {
        const dupResult = await checkDuplicateComplaint({
          title: newComplaint.title,
          description: newComplaint.description,
          category: newComplaint.category,
          location: newComplaint.location,
          latitude: doc.latitude,
          longitude: doc.longitude,
          currentId: doc._id
        });
        if (dupResult && dupResult.isDuplicate && dupResult.duplicateOf) {
          // Count total duplicates of the original complaint
          const duplicateCount = await Complaint.countDocuments({
            $or: [
              { _id: dupResult.duplicateOf },
              { duplicate_of: dupResult.duplicateOf }
            ]
          });

          const origComplaint = await Complaint.findById(dupResult.duplicateOf);
          if (origComplaint) {
            // Re-evaluate original complaint's priority, severity, and breakdown
            const updatedSeverity = calculateDeterministicSeverity(origComplaint, duplicateCount);
            origComplaint.severity = updatedSeverity;

            const prioDetails = calculateDeterministicPriority(origComplaint, duplicateCount);
            origComplaint.priority_score = prioDetails.priority_score;
            origComplaint.priority_level = prioDetails.priority_level;
            origComplaint.priority_breakdown = prioDetails.breakdown;

            await origComplaint.save();
          }

          // Mark current complaint as duplicate
          await Complaint.updateOne(
            { _id: doc._id },
            { $set: { is_duplicate: true, duplicate_of: dupResult.duplicateOf, status: 'DUPLICATE' } }
          );

          // Update workload of assigned staff because duplicate gets auto-resolved/removed from active queue!
          if (doc.staff_id) {
            await updateStaffWorkloadAndAvailability(doc.staff_id);
          }

          console.log(`[AI Background] Complaint ${doc._id} marked as duplicate of ${dupResult.duplicateOf} and merged.`);
        }
      } catch (dupErr) {
        console.error("[AI Background] Duplicate check failed:", dupErr);
      }
    });

    return toComplaintDto(finalDoc || doc);
  } catch (err) {
    console.error('❌ Error saving complaint:', err.message);
    throw err;
  }
};

export const updateStaffWorkloadAndAvailability = async (staffId) => {
  if (!staffId) return;
  try {
    const activeComplaints = await Complaint.countDocuments({
      staff_id: staffId,
      status: 'IN_PROGRESS'
    });

    const resolvedComplaints = await Complaint.countDocuments({
      staff_id: staffId,
      status: 'RESOLVED'
    });

    // 0-5 active: Available, 6-10: Busy, 11+: Overloaded
    let availabilityStatus = 'Available';
    if (activeComplaints >= 6 && activeComplaints <= 10) {
      availabilityStatus = 'Busy';
    } else if (activeComplaints > 10) {
      availabilityStatus = 'Overloaded';
    }

    const vendor = await User.findById(staffId);
    if (vendor) {
      vendor.activeComplaints = activeComplaints;
      vendor.resolvedComplaints = resolvedComplaints;
      vendor.availabilityStatus = availabilityStatus;

      // Recalculate vendor performance score automatically
      const { calculateVendorPerformanceScore } = await import('./ruleEngine.js');
      vendor.performanceScore = calculateVendorPerformanceScore(vendor);
      await vendor.save();
    }
  } catch (err) {
    console.error("Failed to update staff workload:", err);
  }
};

/**
 * Update complaint status (and optionally assignment/priority).
 */
export const updateComplaintStatusInDB = async (id, status, staffId, priority) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) return null;

  const oldStaffId = complaint.staff_id;

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
  } else if (normalized === 'RESOLVED_PENDING') {
    complaint.status = 'RESOLVED_PENDING';
  } else if (normalized === 'IN_PROGRESS') {
    complaint.status = 'IN_PROGRESS';
  } else if (normalized === 'NEW') {
    complaint.status = 'NEW';
  } else if (normalized) {
    complaint.status = normalized;
  }

  await complaint.save();

  // Recalculate workloads
  if (complaint.staff_id) {
    await updateStaffWorkloadAndAvailability(complaint.staff_id);
  }
  if (oldStaffId && oldStaffId.toString() !== complaint.staff_id?.toString()) {
    await updateStaffWorkloadAndAvailability(oldStaffId);
  }

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
  const deleted = await Complaint.findByIdAndUpdate(id, { $set: { is_deleted: true } }, { new: true });
  return Boolean(deleted);
};

export const getComplaintCounts = async () => {
  const [resolved, pending, in_progress] = await Promise.all([
    Complaint.countDocuments({ status: 'RESOLVED' }),
    Complaint.countDocuments({ status: 'NEW' }),
    Complaint.countDocuments({ status: { $in: ['IN_PROGRESS', 'RESOLVED_PENDING'] } }),
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

  const query = { is_deleted: { $ne: true } };

  if (searchText) {
    const re = new RegExp(String(searchText), 'i');
    query.$or = [{ title: re }, { description: re }];
  }

  if (user_id) query.user_id = user_id;
  if (staff_id) query.staff_id = staff_id;
  if (category) query.category = category;
  if (location) query.location = location;

  if (status) {
    const norm = normalizeStatus(status);
    if (norm === 'IN_PROGRESS') {
      query.status = { $in: ['IN_PROGRESS', 'RESOLVED_PENDING'] };
    } else {
      query.status = norm;
    }
  }

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

  const results = await Complaint.find(query)
    .populate('user_id', 'name email')
    .populate('staff_id', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
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

      await complaint.save();
      escalated.push({ complaint_id: complaint._id.toString(), priority: complaint.priority });

      // Run AI Urgency Analysis asynchronously in background
      const cId = complaint._id;
      setImmediate(async () => {
        try {
          const explanation = await analyzeEscalationUrgency(cId);
          await Complaint.updateOne({ _id: cId }, { $set: { escalation_explanation: explanation } });
        } catch (aiErr) {
          console.error(`[AI Background] Escalation explanation failed for ${cId}:`, aiErr);
        }
      });
      continue;
    }

    if (complaint.priority === 'Medium') {
      complaint.priority = 'High';
      const slaHours = complaint.dept_id
        ? await calculateSlaDeadline(complaint.dept_id, complaint.priority)
        : 24;
      complaint.sla_deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

      await complaint.save();
      escalated.push({ complaint_id: complaint._id.toString(), priority: complaint.priority });

      // Run AI Urgency Analysis asynchronously in background
      const cId = complaint._id;
      setImmediate(async () => {
        try {
          const explanation = await analyzeEscalationUrgency(cId);
          await Complaint.updateOne({ _id: cId }, { $set: { escalation_explanation: explanation } });
        } catch (aiErr) {
          console.error(`[AI Background] Escalation explanation failed for ${cId}:`, aiErr);
        }
      });
      continue;
    }

    // High priority: reset assignment and notify admin
    complaint.status = 'NEW';
    const oldStaffId = complaint.staff_id;
    complaint.staff_id = undefined;
    complaint.assigned_to = undefined;
    const slaHours = complaint.dept_id
      ? await calculateSlaDeadline(complaint.dept_id, complaint.priority)
      : 24;
    complaint.sla_deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    await complaint.save();

    // Workload recalcs for unassigned staff
    if (oldStaffId) {
      await updateStaffWorkloadAndAvailability(oldStaffId);
    }

    escalated.push({ complaint_id: complaint._id.toString(), priority: complaint.priority });

    // Run AI Urgency Analysis asynchronously in background
    const cId = complaint._id;
    setImmediate(async () => {
      try {
        const explanation = await analyzeEscalationUrgency(cId);
        await Complaint.updateOne({ _id: cId }, { $set: { escalation_explanation: explanation } });
      } catch (aiErr) {
        console.error(`[AI Background] Escalation explanation failed for ${cId}:`, aiErr);
      }
    });

    try {
      await notifyAdminForManualReassignment(complaint._id.toString());
    } catch (err) {
      console.error('Failed to notify admin:', err);
    }
  }

  return escalated;
};

export const fetchHeatmapData = async () => {
  const docs = await Complaint.find({
    'geolocation.coordinates.0': { $exists: true },
    is_deleted: { $ne: true },
    status: { $ne: 'RESOLVED' },
  })
    .select('geolocation title category status priority severity sla_deadline priority_score')
    .lean();

  return docs
    .map((c) => {
      const coords = c?.geolocation?.coordinates;
      if (!coords || coords.length < 2) return null;
      const [longitude, latitude] = coords;

      // Dynamic weight calculation
      let weight = 1.0;

      // Severity factor
      if (c.severity === 'Critical') weight += 3.0;
      else if (c.severity === 'High') weight += 2.0;
      else if (c.severity === 'Medium') weight += 1.0;

      // Priority factor
      if (c.priority === 'High') weight += 2.0;
      else if (c.priority === 'Medium') weight += 1.0;

      // SLA Overdue check
      if (c.sla_deadline && new Date(c.sla_deadline) < new Date()) {
        weight += 2.5; // SLA breached!
      }

      // Priority Score contribution
      weight += (c.priority_score || 0) / 20.0;

      // Cap at 10.0
      weight = Math.min(weight, 10.0);

      return {
        complaint_id: c._id.toString(),
        latitude,
        longitude,
        title: c.title,
        category: c.category,
        status: c.status,
        priority: c.priority,
        severity: c.severity || 'Low',
        priority_score: c.priority_score || 0,
        weight: Number(weight.toFixed(2)),
      };
    })
    .filter(Boolean);
};

/**
 * Administrative override reassignment helper.
 */
export const adminReassignComplaintInDB = async (id, staffId, adminUser, reason) => {
  const { adminOverrideAssignment } = await import('./assignment.service.js');
  const updated = await adminOverrideAssignment(id, staffId, adminUser, reason);
  return toComplaintDto(updated);
};

/**
 * Forced escalation helper.
 */
export const forceEscalateComplaintInDB = async (id, adminUser, reason) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) throw new Error('Complaint not found.');

  // Increment escalation count
  complaint.escalation_count = (complaint.escalation_count || 0) + 1;

  // Recalculate deterministic priority & severity
  const duplicateCount = await Complaint.countDocuments({ duplicate_of: complaint._id });
  complaint.severity = calculateDeterministicSeverity(complaint, duplicateCount);

  const prioDetails = calculateDeterministicPriority(complaint, duplicateCount);
  complaint.priority_score = prioDetails.priority_score;
  complaint.priority_level = prioDetails.priority_level;
  complaint.priority_breakdown = prioDetails.breakdown;

  // Log in assignment history subdocument
  complaint.assignment_history.push({
    old_staff_id: complaint.staff_id || null,
    new_staff_id: complaint.staff_id || null,
    old_staff_name: complaint.assigned_to || 'Unassigned',
    new_staff_name: complaint.assigned_to || 'Unassigned',
    timestamp: new Date(),
    admin_id: adminUser.user_id,
    admin_name: adminUser.name,
    reason: reason ? `Forced Escalation: ${reason}` : 'Forced Escalation',
  });

  await complaint.save();

  // If priority becomes High/Critical, trigger unassignment and re-assignment
  if (complaint.priority_level === 'Critical' || complaint.priority_level === 'High') {
    const oldStaffId = complaint.staff_id;
    complaint.staff_id = undefined;
    complaint.assigned_to = undefined;
    await complaint.save();

    if (oldStaffId) {
      await updateStaffWorkloadAndAvailability(oldStaffId);
    }

    // Trigger auto-assignment
    runAutoAssignmentEngine(complaint._id).catch(err => console.error("Auto reassignment failed in escalation:", err));
  }

  // Trigger background LLM urgency explanation
  setImmediate(async () => {
    try {
      const explanation = await analyzeEscalationUrgency(complaint._id);
      await Complaint.updateOne({ _id: complaint._id }, { $set: { escalation_explanation: explanation } });
    } catch (aiErr) {
      console.error("[AI Background] Escalation explanation failed:", aiErr);
    }
  });

  const finalDoc = await Complaint.findById(id);
  return toComplaintDto(finalDoc || complaint);
};
