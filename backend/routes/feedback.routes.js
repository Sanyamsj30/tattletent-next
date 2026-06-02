import express from 'express';
import {
  createFeedback,
  getAllFeedbacks,
  getFeedbackForComplaint,
} from '../controllers/feedback.controllers.js';
import { protect, staffOrAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ✅ Routes
router.post('/', protect, createFeedback); // POST /api/feedback
router.get('/', protect, staffOrAdmin, getAllFeedbacks); // GET /api/feedback (staff/admin)
router.get('/:id', protect, staffOrAdmin, getFeedbackForComplaint); // GET /api/feedback/:id (complaint ID)

export default router;
