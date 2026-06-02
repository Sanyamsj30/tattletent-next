import asynchandler from '../utils/asynchandler.js';
import { ApiResponse } from '../utils/api-response.js';
import {
  saveFeedbackToDB,
  getFeedbacksFromDB,
  getFeedbacksForComplaintFromDB,
} from '../services/feedback.service.js';
import { logAuditEvent } from '../services/audit.service.js';

const createFeedback = asynchandler(async (req, res) => {
  const { complaint_id, rating, comment } = req.body;
  if (!complaint_id) {
    return res.status(400).json(new ApiResponse(400, null, 'Complaint ID is required'));
  }

  const feedback = await saveFeedbackToDB({
    complaint_id,
    rating,
    comment,
    user_id: req.user.user_id,
  });

  // Log audit event
  logAuditEvent({
    action: 'FEEDBACK_SUBMITTED',
    complaint_id: feedback.complaint_id,
    user: req.user,
    details: { rating, comment },
  });

  return res.status(201).json(new ApiResponse(201, feedback, 'Feedback submitted successfully'));
});

const getAllFeedbacks = asynchandler(async (req, res) => {
  const feedbacks = await getFeedbacksFromDB();
  if (feedbacks.length === 0)
    return res.status(404).json(new ApiResponse(404, [], 'No feedback found'));
  return res.status(200).json(new ApiResponse(200, feedbacks, 'Feedbacks fetched successfully'));
});

const getFeedbackForComplaint = asynchandler(async (req, res) => {
  const { id } = req.params;
  const feedback = await getFeedbacksForComplaintFromDB(id);
  if (feedback.length === 0)
    return res.status(404).json(new ApiResponse(404, [], 'No feedback for this complaint'));
  return res.status(200).json(new ApiResponse(200, feedback, 'Feedback fetched successfully'));
});

export { createFeedback, getAllFeedbacks, getFeedbackForComplaint };
