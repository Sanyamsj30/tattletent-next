import express from "express"
import upload from "../middlewares/upload.middleware.js";
import { createComplaint, updateComplaintStatus,updateComplaintPriority, deleteComplaint, fetchComplaintCounts, getComplaints,escalateComplaints} from "../controllers/complaint.controllers.js";


const router = express.Router();

router.post("/",upload.single("photo"),createComplaint);
router.put("/status/:id", updateComplaintStatus);
router.put("/priority/:id", updateComplaintPriority);
router.delete("/:id", deleteComplaint);
router.get('/counts', fetchComplaintCounts);
router.get('/search', getComplaints);
router.post("/escalate", escalateComplaints); // manual trigger route

export default router;