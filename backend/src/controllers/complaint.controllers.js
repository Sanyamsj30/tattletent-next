import { asynchandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import Complaint from "../models/Complaint.js";

// ✅ Create a Complaint
const createComplaint = asynchandler(async (req, res) => {
  const { title, description, category, location } = req.body;

  if (!title || !description || !category || !location) {
    return res.status(400).json(new ApiResponse(400, "All fields are required"));
  }

  const complaint = await Complaint.create({
    title,
    description,
    category,
    location,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Complaint submitted successfully", complaint));
});

// ✅ Update Complaint (status or details)
const updateComplaint = asynchandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body; // { status: "Resolved" } or { title: "new title" }

  const complaint = await Complaint.findByIdAndUpdate(id, updates, { new: true });

  if (!complaint) {
    return res.status(404).json(new ApiResponse(404, "Complaint not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Complaint updated successfully", complaint));
});

// ✅ Delete Complaint
const deleteComplaint = asynchandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await Complaint.findByIdAndDelete(id);

  if (!complaint) {
    return res.status(404).json(new ApiResponse(404, "Complaint not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Complaint deleted successfully"));
});

export { createComplaint, updateComplaint, deleteComplaint };
