import express from "express"
import upload from "../middlewares/upload.middleware.js";
import { createComplaint, getComplaintById,updateComplaint, deleteComplaint ,getAllComplaints,escalateComplaints} from "../controllers/complaint.controllers.js";


const router = express.Router();

router.get("/", getAllComplaints);
router.post("/",upload.single("photo"),createComplaint);
router.get("/:id", getComplaintById);
router.put("/:id", updateComplaint);
router.delete("/:id", deleteComplaint);
router.post("/escalate", escalateComplaints); // manual trigger route

export default router;