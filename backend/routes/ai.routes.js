import express from 'express';
import { askChatbot, getReport, getRecommendations } from '../controllers/ai.controllers.js';
import { protect, staffOrAdmin, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Chatbot assistant
router.post('/chatbot', protect, askChatbot);

// Auto report (Admin Only)
router.get('/report', protect, adminOnly, getReport);

// Recommendation (Staff and Admins only)
router.get('/recommendation/:complaintId', protect, staffOrAdmin, getRecommendations);

export default router;
