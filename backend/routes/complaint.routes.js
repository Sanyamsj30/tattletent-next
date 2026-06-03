import express from "express"
import upload, { compressImage } from "../middlewares/upload.middleware.js";
import { createComplaint, updateComplaintStatus,updateComplaintPriority, deleteComplaint, fetchComplaintCounts, getComplaints,escalateComplaints, getHeatmapData, reassignComplaint, forceEscalateComplaint, fetchNearbyComplaints, supportComplaint, getMapMarkersData } from "../controllers/complaint.controllers.js";
import { protect, staffOrAdmin, adminOnly } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.post("/", protect, upload.single("photo"), compressImage, createComplaint);
router.get("/nearby", protect, fetchNearbyComplaints);
router.post("/support/:id", protect, supportComplaint);
router.get("/map-markers", protect, getMapMarkersData);
router.put("/status/:id", protect, updateComplaintStatus);
router.put("/priority/:id", protect, adminOnly, updateComplaintPriority);
router.delete("/:id", protect, adminOnly, deleteComplaint);
router.get('/counts', protect, fetchComplaintCounts);
router.get('/search', protect, getComplaints);
router.post("/escalate", protect, staffOrAdmin, escalateComplaints); // manual trigger route
router.get("/heatmap", getHeatmapData);
router.put("/reassign/:id", protect, adminOnly, reassignComplaint);
router.post("/force-escalate/:id", protect, adminOnly, forceEscalateComplaint);

export default router;
