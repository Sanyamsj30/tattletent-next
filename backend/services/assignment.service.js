import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { callGemini } from './ai.service.js';
import { recalculateVendorAvailability } from './rule-engine.service.js';
import { updateStaffWorkloadAndAvailability } from './complaint.service.js';

/**
 * 🤖 Deterministic Auto-Assignment Engine
 * Selects the optimal vendor based on workload, performance, SLA, and ward coverage.
 */
export const runAutoAssignmentEngine = async (complaintId) => {
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return null;

    // Fetch all active vendors (Staff)
    const vendors = await User.find({ role: 'Staff' });
    if (!vendors || vendors.length === 0) {
      console.warn("⚠️ No vendors available for auto-assignment.");
      complaint.is_auto_assigned = false;
      complaint.assignment_history.push({
        old_staff_id: null,
        new_staff_id: null,
        old_staff_name: 'Unassigned',
        new_staff_name: 'Unassigned',
        timestamp: new Date(),
        admin_id: null,
        admin_name: 'System Engine',
        reason: 'Auto-Assignment Failed: No available or qualified contractors found.',
      });
      await complaint.save();
      return null;
    }

    const complaintLocation = String(complaint.location || '').toLowerCase();
    const candidateScores = [];

    for (const vendor of vendors) {
      // 1. Workload Score (Max 40 points)
      let workloadScore = 40;
      const activeCases = Number(vendor.activeComplaints || 0);
      if (activeCases > 5 && activeCases <= 10) {
        workloadScore = 20;
      } else if (activeCases > 10) {
        workloadScore = 5;
      }

      // 2. Performance Score (Max 25 points)
      const perfScore = ((vendor.performanceScore || 100) / 100) * 25;

      // 3. SLA Compliance (Max 20 points)
      const slaScore = ((vendor.slaComplianceRate || 100) / 100) * 20;

      // 4. Citizen Rating (Max 15 points)
      const rating = Number(vendor.citizenRating || 5);
      const ratingScore = ((rating - 1) / 4) * 15;

      let totalScore = workloadScore + perfScore + slaScore + ratingScore;

      // 5. Ward match bonus (+50 points)
      // Check if any assigned ward matches the complaint location
      const hasWardMatch = (vendor.assignedWards || []).some(ward =>
        complaintLocation.includes(String(ward).toLowerCase())
      );
      if (hasWardMatch) {
        totalScore += 50;
      }

      // 6. Overloaded penalty
      if (vendor.availabilityStatus === 'Overloaded') {
        totalScore -= 100;
      }

      candidateScores.push({ vendor, score: totalScore });
    }

    // Sort candidates descending by score
    candidateScores.sort((a, b) => b.score - a.score);
    const bestMatch = candidateScores[0];

    if (bestMatch && bestMatch.vendor) {
      const vendor = bestMatch.vendor;

      complaint.staff_id = vendor._id;
      complaint.assigned_to = vendor.name;
      complaint.is_auto_assigned = true;
      complaint.status = 'IN_PROGRESS';
      await complaint.save();

      // Recalculate workloads and availability for the vendor
      await updateStaffWorkloadAndAvailability(vendor._id);

      // Asynchronously trigger AI to explain the assignment recommendation
      setImmediate(async () => {
        try {
          const explanationPrompt = `
            Explain briefly in 1-2 friendly sentences why the vendor "${vendor.name}" was selected automatically to resolve Complaint #${complaint._id} (${complaint.category}).
            Stats of vendor:
            - Performance Score: ${vendor.performanceScore || 100}/100
            - SLA Compliance: ${vendor.slaComplianceRate || 100}%
            - Rating: ${vendor.citizenRating || 5}/5
            - Active cases: ${vendor.activeComplaints || 0}
            - Ward coverage match: ${bestMatch.score > 80 ? "Yes" : "No"}
            
            Keep the tone professional and concise. Direct response only.
          `;
          const explanation = await callGemini(explanationPrompt, "You are a smart city supervisor focused on transparent automated decisions.");
          await Complaint.updateOne({ _id: complaint._id }, { $set: { recommendation_explanation: explanation } });
        } catch (aiErr) {
          console.error("AI Recommendation Explanation failed:", aiErr);
        }
      });

      console.log(`[Auto Assignment] Complaint ${complaintId} auto-routed to vendor: ${vendor.name} (Score: ${bestMatch.score})`);
      return bestMatch.vendor;
    } else {
      complaint.is_auto_assigned = false;
      complaint.assignment_history.push({
        old_staff_id: null,
        new_staff_id: null,
        old_staff_name: 'Unassigned',
        new_staff_name: 'Unassigned',
        timestamp: new Date(),
        admin_id: null,
        admin_name: 'System Engine',
        reason: 'Auto-Assignment Failed: No available or qualified contractors found.',
      });
      await complaint.save();
    }

    return null;
  } catch (err) {
    console.error("Auto-assignment engine error:", err);
    return null;
  }
};

/**
 * 👤 Administrative Override / Manual Reassignment
 * Changes the vendor manually, logs the swap in history, and triggers workload recalculations.
 */
export const adminOverrideAssignment = async (complaintId, newVendorId, adminUser, reason) => {
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) throw new Error('Complaint not found.');

    const oldVendorId = complaint.staff_id;
    const oldVendorName = complaint.assigned_to || 'Unassigned';

    let newVendor = null;
    if (newVendorId) {
      newVendor = await User.findById(newVendorId);
      if (!newVendor) throw new Error('Selected vendor not found.');
    }

    // Record override history
    complaint.assignment_history.push({
      old_staff_id: oldVendorId || null,
      new_staff_id: newVendor ? newVendor._id : null,
      old_staff_name: oldVendorName,
      new_staff_name: newVendor ? newVendor.name : 'Unassigned',
      timestamp: new Date(),
      admin_id: adminUser.user_id,
      admin_name: adminUser.name,
      reason: reason || 'Administrative Override',
    });

    // Update assignment details
    complaint.staff_id = newVendor ? newVendor._id : undefined;
    complaint.assigned_to = newVendor ? newVendor.name : undefined;
    complaint.is_auto_assigned = false;
    complaint.status = newVendor ? 'IN_PROGRESS' : 'NEW';

    await complaint.save();

    // Update availability workloads
    if (oldVendorId) {
      await updateStaffWorkloadAndAvailability(oldVendorId);
    }
    if (newVendorId) {
      await updateStaffWorkloadAndAvailability(newVendorId);
    }

    return complaint;
  } catch (err) {
    console.error("Admin override error:", err);
    throw err;
  }
};
