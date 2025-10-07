import express from "express";
import {
  createFeedback,
  getAllFeedbacks,
  getFeedbackForComplaint,
} from "../controllers/feedback.controllers.js";

const router = express.Router();

// ✅ Routes
router.post("/", createFeedback); // POST /api/feedback
router.get("/", getAllFeedbacks); // GET /api/feedback
router.get("/:id", getFeedbackForComplaint); // GET /api/feedback/:id (complaint ID)

export default router;
