import asynchandler from '../utils/asynchandler.js';
import { ApiResponse } from '../utils/api-response.js';
import { handleChatbotMessage } from '../agents/citizenChatbotAgent.js';
import { generateMunicipalReport } from '../agents/autoReportAgent.js';
import { getAssignmentRecommendation } from '../agents/assignmentRecommendationAgent.js';

// Chatbot controller
const askChatbot = asynchandler(async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json(new ApiResponse(400, null, 'Message content is required'));
  }

  const chatResponse = await handleChatbotMessage(req.user?.user_id, message);
  return res.status(200).json(new ApiResponse(200, { response: chatResponse }, 'Success'));
});

// Auto-report generation controller
const getReport = asynchandler(async (req, res) => {
  const { type } = req.query; // 'weekly' or 'monthly'
  const reportContent = await generateMunicipalReport(type || 'weekly');
  return res.status(200).json(new ApiResponse(200, { report: reportContent }, 'Success'));
});

// Smart assignment recommendations controller
const getRecommendations = asynchandler(async (req, res) => {
  const { complaintId } = req.params;

  if (!complaintId) {
    return res.status(400).json(new ApiResponse(400, null, 'Complaint ID is required'));
  }

  const result = await getAssignmentRecommendation(complaintId);
  if (!result.success) {
    return res.status(400).json(new ApiResponse(400, null, result.message));
  }

  return res.status(200).json(new ApiResponse(200, result, 'Recommendations calculated successfully'));
});

export { askChatbot, getReport, getRecommendations };
