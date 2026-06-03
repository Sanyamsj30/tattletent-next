import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import { callGroq } from '../services/ai.service.js';

/**
 * Intelligent Assignment Recommendation Agent:
 * 1. Runs a deterministic scoring formula for all staff.
 * 2. Identifies the best staff member.
 * 3. Generates a personalized AI justification for the top choice.
 */
export const getAssignmentRecommendation = async (complaintId) => {
  try {
    const complaint = await Complaint.findById(complaintId).lean();
    if (!complaint) {
      return { success: false, message: 'Complaint not found.' };
    }

    const staffList = await User.find({ role: 'Staff', must_change_password: { $ne: true } }).lean();
    if (!staffList || staffList.length === 0) {
      return { success: false, message: 'No staff members found for recommendation.' };
    }

    const recommendations = [];

    for (const staff of staffList) {
      let score = 0;

      // Bayesian Credibility Weighting (Cold Start Protection)
      const credibilityLimit = 5; 
      const resolvedCount = staff.resolvedComplaints || 0;
      const weight = Math.min(resolvedCount / credibilityLimit, 1.0); 
      
      // Neutral baseline averages for new/inexperienced staff
      const baseSla = 85;      // 85% SLA baseline
      const basePerf = 80;     // 80/100 baseline performance
      const baseRating = 4.0;  // 4.0/5 baseline rating
      
      const effectiveSla = (weight * (staff.slaComplianceRate || 100)) + ((1 - weight) * baseSla);
      const effectivePerf = (weight * (staff.performanceScore || 100)) + ((1 - weight) * basePerf);
      const effectiveRating = (weight * (staff.citizenRating || 5)) + ((1 - weight) * baseRating);

      // 1. SLA Compliance Rate (0.4 weight - Max 40 points)
      score += (effectiveSla * 0.4);

      // 2. Performance Score (0.3 weight - Max 30 points)
      score += (effectivePerf * 0.3);

      // 3. Citizen Rating (Rating * 3 multiplier - Max 15 points)
      score += (effectiveRating * 3);

      // 4. Workload status & Active Complaints Penalties (Continuous Scale - Max 15 points)
      const activeCount = staff.activeComplaints || 0;
      let workloadScore = 0;
      if (activeCount === 0) workloadScore = 15;
      else if (activeCount === 1) workloadScore = 12;
      else if (activeCount === 2) workloadScore = 9;
      else if (activeCount === 3) workloadScore = 6;
      else if (activeCount === 4) workloadScore = 0;
      else if (activeCount === 5) workloadScore = -15;
      else workloadScore = -30; // Overloaded
      score += workloadScore;

      recommendations.push({
        staffId: staff._id.toString(),
        name: staff.name,
        email: staff.email,
        score: Math.round(score),
        activeComplaints: activeCount,
        resolvedComplaints: resolvedCount,
        slaComplianceRate: staff.slaComplianceRate || 100,
        citizenRating: staff.citizenRating || 5,
        availabilityStatus: staff.availabilityStatus || 'Available',
        performanceScore: staff.performanceScore || 100
      });
    }

    // Sort by descending score
    recommendations.sort((a, b) => b.score - a.score);
    const topChoice = recommendations[0];

    // Use LLM to write a custom recommendation explanation
    const prompt = `
      You are the Assignment Recommendation Agent for TattleTent.
      Write a concise, 1-sentence administrative justification for why the following vendor is recommended for assignment:
      
      VENDOR DETAILS:
      Name: ${topChoice.name}
      Suitability Score: ${topChoice.score}/100
      Active Workload: ${topChoice.activeComplaints} active cases
      SLA Compliance: ${topChoice.slaComplianceRate}%
      Citizen Rating: ${topChoice.citizenRating}/5
      
      COMPLAINT DETAILS:
      Title: ${complaint.title}
      Location: ${complaint.location}
      Category: ${complaint.category}

      Respond with a single professional sentence explaining their match suitability.
    `;

    const aiJustification = await callGroq(prompt, "You are a senior workflow manager providing a direct vendor recommendation.");

    return {
      success: true,
      topChoice,
      aiJustification,
      allRecommendations: recommendations
    };
  } catch (err) {
    console.error('Error in assignmentRecommendationAgent:', err);
    return { success: false, message: 'Failed to generate recommendation.' };
  }
};
