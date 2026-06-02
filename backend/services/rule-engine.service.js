import User from '../models/User.js';

/**
 * 🎯 Deterministic Severity Calculation (No LLM)
 * Factors: category, location keywords, duplicate count, escalation count.
 */
export const calculateDeterministicSeverity = (complaintData, duplicateCount = 0) => {
  const category = String(complaintData.category || '').toLowerCase().trim();
  const title = String(complaintData.title || '').toLowerCase();
  const description = String(complaintData.description || '').toLowerCase();
  const location = String(complaintData.location || '').toLowerCase();
  const escalationCount = Number(complaintData.escalation_count || 0);

  let severity = 'Low';

  // 1. Base Severity by Category keywords
  const mergedText = `${title} ${description} ${category}`;
  if (
    mergedText.includes('spark') ||
    mergedText.includes('fire') ||
    mergedText.includes('emergency') ||
    mergedText.includes('hazard') ||
    mergedText.includes('shock') ||
    mergedText.includes('live wire') ||
    mergedText.includes('short circuit')
  ) {
    severity = 'Critical';
  } else if (
    mergedText.includes('burst') ||
    mergedText.includes('leak') ||
    mergedText.includes('drainage') ||
    mergedText.includes('sewage') ||
    mergedText.includes('overflow')
  ) {
    severity = 'High';
  } else if (
    mergedText.includes('broken') ||
    mergedText.includes('pathway') ||
    mergedText.includes('tile') ||
    mergedText.includes('pothole') ||
    mergedText.includes('road') ||
    mergedText.includes('garbage') ||
    mergedText.includes('trash') ||
    mergedText.includes('bin') ||
    mergedText.includes('electrical')
  ) {
    severity = 'Medium';
  }

  // 2. Location Importance modifier (Critical places elevate tier)
  const isCriticalLocation =
    location.includes('hospital') ||
    location.includes('clinic') ||
    location.includes('medical') ||
    location.includes('school') ||
    location.includes('nursery') ||
    location.includes('station') ||
    location.includes('hq');

  if (isCriticalLocation) {
    if (severity === 'Low') severity = 'Medium';
    else if (severity === 'Medium') severity = 'High';
    else if (severity === 'High' || severity === 'Critical') severity = 'Critical';
  }

  // 3. Duplicate complaints count modifier
  if (duplicateCount >= 5) {
    if (severity === 'Low') severity = 'Medium';
    else if (severity === 'Medium') severity = 'High';
    else if (severity === 'High') severity = 'Critical';
  }

  // 4. Escalation count modifier
  if (escalationCount >= 2) {
    if (severity === 'Low') severity = 'Medium';
    else if (severity === 'Medium') severity = 'High';
    else if (severity === 'High') severity = 'Critical';
  }

  return severity;
};

/**
 * 📊 Deterministic Priority Score Calculation (0-100 range)
 * Factors: Severity, Duplicates, Days pending, Escalations, Location importance.
 */
export const calculateDeterministicPriority = (complaint, duplicateCount = 0) => {
  const severity = complaint.severity || 'Low';
  const escalationCount = Number(complaint.escalation_count || 0);
  const location = String(complaint.location || '').toLowerCase();
  
  // 1. Severity component (Max 40 points)
  let severityScore = 10;
  if (severity === 'Medium') severityScore = 20;
  if (severity === 'High') severityScore = 30;
  if (severity === 'Critical') severityScore = 40;

  // 2. Duplicates component (Max 20 points)
  const duplicatesScore = Math.min(duplicateCount * 5, 20);

  // 3. Escalations component (Max 20 points)
  const escalationsScore = Math.min(escalationCount * 10, 20);

  // 4. Location significance component (Max 10 points)
  const isCriticalLocation =
    location.includes('hospital') ||
    location.includes('clinic') ||
    location.includes('medical') ||
    location.includes('school') ||
    location.includes('nursery');
  const locationScore = isCriticalLocation ? 10 : 0;

  // 5. Age component / Days pending (Max 10 points)
  let ageScore = 0;
  if (complaint.submitted_at) {
    const daysPending = Math.max(
      0,
      Math.floor((Date.now() - new Date(complaint.submitted_at).getTime()) / (1000 * 60 * 60 * 24))
    );
    ageScore = Math.min(daysPending * 2, 10);
  }

  // Total Priority Score (0-100)
  const priorityScore = severityScore + duplicatesScore + escalationsScore + locationScore + ageScore;

  // Priority Level mapping
  let priorityLevel = 'Low';
  if (priorityScore > 25 && priorityScore <= 50) priorityLevel = 'Medium';
  if (priorityScore > 50 && priorityScore <= 75) priorityLevel = 'High';
  if (priorityScore > 75) priorityLevel = 'Critical';

  return {
    priority_score: priorityScore,
    priority_level: priorityLevel,
    breakdown: {
      severity: severityScore,
      duplicates: duplicatesScore,
      escalations: escalationsScore,
      location: locationScore,
      age: ageScore,
    },
  };
};

/**
 * 👷 Vendor Performance Scoring Formula (0-100 range)
 * Factors: SLA Compliance (40%), Rating (30%), Average Resolution Speed (20%), Escalation rate (10%).
 */
export const calculateVendorPerformanceScore = (vendor) => {
  const slaRate = Number(vendor.slaComplianceRate ?? 100);
  const rating = Number(vendor.citizenRating ?? 5);
  const avgTime = Number(vendor.avgResolutionTime ?? 24); // in hours
  const escalations = Number(vendor.totalEscalations ?? 0);
  const resolved = Number(vendor.resolvedComplaints ?? 0);
  const active = Number(vendor.activeComplaints ?? 0);

  // SLA Compliance Component (Max 40 points)
  const slaComp = (slaRate / 100) * 40;

  // Citizen Rating Component (Max 30 points, maps 1-5 rating to 30 max points)
  const ratingComp = ((rating - 1) / 4) * 30; // rating 1 -> 0 pts, 5 -> 30 pts

  // Resolution Speed Component (Max 20 points)
  // <= 12 hrs -> 20 pts, >= 72 hrs -> 0 pts, linear in between
  let speedComp = 20;
  if (avgTime > 12 && avgTime < 72) {
    speedComp = 20 - ((avgTime - 12) / 60) * 20;
  } else if (avgTime >= 72) {
    speedComp = 0;
  }

  // Escalation Rate Component (Max 10 points)
  // escalation rate relative to active + resolved workload
  const totalWorkload = resolved + active;
  const escRate = totalWorkload > 0 ? (escalations / totalWorkload) * 100 : 0;
  const escComp = Math.max(0, 10 - escRate * 0.1); // deduct points as escalation rate increases

  const finalScore = Math.min(100, Math.round(slaComp + ratingComp + speedComp + escComp));
  return isNaN(finalScore) ? 100 : finalScore;
};

/**
 * Recalculate and update vendor availability status automatically from active caseload.
 */
export const recalculateVendorAvailability = (activeComplaints) => {
  if (activeComplaints <= 5) return 'Available';
  if (activeComplaints <= 10) return 'Busy';
  return 'Overloaded';
};
