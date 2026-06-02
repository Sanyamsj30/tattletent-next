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

    const staffList = await User.find({ role: 'Staff' }).lean();
    if (!staffList || staffList.length === 0) {
      return { success: false, message: 'No staff members found for recommendation.' };
    }

    const recommendations = [];

    for (const staff of staffList) {
      let score = 0;

      // 1. Ward / Location Match (30 pts)
      const wardMatch = staff.assignedWards?.some(ward => 
        complaint.location.toLowerCase().includes(ward.toLowerCase())
      );
      if (wardMatch) {
        score += 30;
      }

      // 2. SLA Compliance Rate (0.3 weight)
      const slaRate = staff.slaComplianceRate || 100;
      score += (slaRate * 0.3);

      // 3. Performance Score (0.2 weight)
      const perfScore = staff.performanceScore || 100;
      score += (perfScore * 0.2);

      // 4. Citizen Rating (Rating * 2 multiplier)
      const rating = staff.citizenRating || 5;
      score += (rating * 2);

      // 5. Workload status & Active Complaints Penalties
      const activeCount = staff.activeComplaints || 0;
      if (activeCount < 3) {
        score += 10; // Low workload / Available bonus
      } else if (activeCount > 5) {
        score -= 20; // High workload / Overloaded penalty
      }

      recommendations.push({
        staffId: staff._id.toString(),
        name: staff.name,
        email: staff.email,
        score: Math.round(score),
        activeComplaints: activeCount,
        slaComplianceRate: slaRate,
        citizenRating: rating,
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
