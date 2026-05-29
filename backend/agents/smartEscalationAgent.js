import Complaint from '../models/Complaint.js';
import { callGemini } from './ai.service.js';

/**
 * Smart Escalation Agent: Evaluates overdue complaints and generates natural language explanations of urgency and impact.
 */
export const analyzeEscalationUrgency = async (complaintId) => {
  try {
    const complaint = await Complaint.findById(complaintId).lean();
    if (!complaint) return "Complaint not found.";

    const prompt = `
      You are the Smart Escalation Agent for the city's grievance system TattleTent.
      An active complaint has breached its SLA deadline. Evaluate the civic impact and urgency of this issue:
      
      COMPLAINT DETAILS:
      Title: ${complaint.title}
      Category: ${complaint.category}
      Description: ${complaint.description}
      Location: ${complaint.location}
      Priority: ${complaint.priority}
      SLA Deadline: ${complaint.sla_deadline}
      
      Tasks:
      1. Interpret the severe consequences if this is left unresolved (e.g., health risks, safety, transit delays, infrastructure decay).
      2. Provide a 2-3 sentence professional urgency warning for the city administrators detailing why this complaint needs immediate manual reassignment.
      
      Respond with a direct natural language response. Do not use markdown headers, keep it concise.
    `;

    const explanation = await callGemini(prompt, "You are a smart city supervisor focused on public hazard and safety risks.");
    return explanation;
  } catch (err) {
    console.error('Error in smartEscalationAgent:', err);
    return "This complaint has breached its SLA deadline and requires immediate supervisor review to coordinate vendor reassignment.";
  }
};
