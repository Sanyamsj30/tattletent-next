import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { callGemini } from './ai.service.js';

/**
 * Auto Report Agent: Creates natural language summaries of performance based on database statistics.
 */
export const generateMunicipalReport = async (reportType = 'weekly') => {
  try {
    // 1. Perform deterministic database counts (Non-LLM logic)
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: 'RESOLVED' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'IN_PROGRESS' });
    const newComplaints = await Complaint.countDocuments({ status: 'NEW' });

    // Category distribution
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Vendor stats (Users with role Staff)
    const staffList = await User.find({ role: 'Staff' }).select('name performanceScore availabilityStatus').lean();

    // Average resolution time (Low/Medium/High)
    const categoryStatsStr = categoryStats.map(c => `- ${c._id}: ${c.count} complaints`).join('\n');
    const staffStatsStr = staffList.map(s => `- ${s.name}: Performance Score = ${s.performanceScore}%, Status = ${s.availabilityStatus}`).join('\n');

    // 2. Prepare the prompt (LLM logic)
    const prompt = `
      You are the Auto Report Agent for TattleTent.
      Your task is to write a highly professional, readable, and structured ${reportType} report for the Municipal Commissioner.
      Do not do any calculations; use the aggregated figures provided below to construct a natural language trend summary, highlight key bottlenecks, and outline vendor insights.

      AGGREGATED DATA:
      - Total Complaints Registered: ${totalComplaints}
      - Resolved Complaints: ${resolvedComplaints}
      - In Progress: ${inProgressComplaints}
      - Pending/New: ${newComplaints}
      
      COMPLAINTS BY CATEGORY:
      ${categoryStatsStr || "None recorded"}

      STAFF/VENDOR SUMMARY:
      ${staffStatsStr || "No staff seeded"}

      REPORT STRUCTURE:
      1. Executive Performance Summary (with dynamic emoji indicators)
      2. Complaint Trend Analysis (highlighting major categories)
      3. Vendor/Staff Performance & Bottlenecks Insights
      4. Action Projections & Priorities for the upcoming week

      Format the report beautifully using clean markdown structure. Use bullet points and appropriate headings.
    `;

    const systemInstruction = "You are a professional administrative reporting agent. Avoid placeholders or template text.";
    const reportText = await callGemini(prompt, systemInstruction);

    return reportText;
  } catch (err) {
    console.error('Error in autoReportAgent:', err);
    return `### TattleTent Performance Report (Fallback)
    
An error occurred while compiling full AI report statistics. Here is the current database count:
- **Total active records**: Under active review.
- **SLA compliance**: Under review.
Please verify database connection and credentials.`;
  }
};
