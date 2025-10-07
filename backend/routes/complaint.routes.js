import express from "express"
import upload from "../middlewares/upload.middleware.js";
import { createComplaint, updateComplaint, deleteComplaint ,getComplaints,escalateComplaints} from "../controllers/complaint.controllers.js";


const router = express.Router();

router.post("/",upload.single("photo"),createComplaint);
router.put("/:id", updateComplaint);
router.delete("/:id", deleteComplaint);
router.get('/search', getComplaints);
router.post("/escalate", escalateComplaints); // manual trigger route

export default router;