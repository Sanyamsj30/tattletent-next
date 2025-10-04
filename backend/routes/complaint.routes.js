import express from "express"
import upload from "../middlewares/upload.middleware.js";
import { createComplaint, getComplaintById,updateComplaint, deleteComplaint } from "../controllers/complaint.controllers.js";


const router = express.Router();

router.post("/",upload.single("photo"),createComplaint);
router.get("/:id", getComplaintById);
router.put("/:id", updateComplaint);
router.delete("/:id", deleteComplaint);

export default router;