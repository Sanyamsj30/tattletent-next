import express from "express"
import upload, { compressImage } from "../middlewares/upload.middleware.js";
import { createComplaint, updateComplaintStatus,updateComplaintPriority, deleteComplaint, fetchComplaintCounts, getComplaints,escalateComplaints, getHeatmapData } from "../controllers/complaint.controllers.js";
import { protect, staffOrAdmin } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/", protect, upload.single("photo"), compressImage, createComplaint);
router.put("/status/:id", protect, staffOrAdmin, updateComplaintStatus);
router.put("/priority/:id", protect, staffOrAdmin, updateComplaintPriority);
router.delete("/:id", protect, staffOrAdmin, deleteComplaint);
router.get('/counts', fetchComplaintCounts);
router.get('/search', getComplaints);
router.post("/escalate", protect, staffOrAdmin, escalateComplaints); // manual trigger route
router.get("/heatmap", getHeatmapData);

export default router;
