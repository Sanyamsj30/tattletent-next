import asynchandler from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/api-response.js";
// import Complaint from "../models/Complaint.js";

// Mock DB (in-memory)
let complaints = [];

// ✅ Create a Complaint
const createComplaint = asynchandler(async (req, res) => {
  const { title, description, category, location } = req.body;

  if (!title || !description || !category || !location) {
    return res.status(400).json(new ApiResponse(400, "All fields are required"));
  }

  const newComplaint = {
    id: Date.now().toString(),
    title,
    description,
    category,
    location,
    photo: req.file ? `/temp/${req.file.filename}` : null,
    status: "OPEN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [
      { status: "OPEN", date: new Date().toISOString(), note: "Complaint submitted" }
    ]
  };

  complaints.push(newComplaint);

  return res
    .status(201)
    .json(new ApiResponse(201, "Complaint submitted successfully", newComplaint));
});


// Get Complaint by ID (Track Complaint)
const getComplaintById = asynchandler(async (req, res) => {
  const complaint = complaints.find((c) => c.id === req.params.id);
  if (!complaint) return res.status(404).json(new ApiResponse(404, "Complaint not found"));
  return res.json(new ApiResponse(200, "Complaint fetched", complaint));
});

// ✅ Update Complaint (status or details)
const updateComplaint = asynchandler(async (req, res) => {
  const complaint = complaints.find((c) => c.id === req.params.id);
  if (!complaint) return res.status(404).json(new ApiResponse(404, "Complaint not found"));

  const { status, title, description } = req.body;
  if (status) {
    complaint.status = status;
    complaint.statusHistory.push({ status, date: new Date().toISOString(), note: "Status updated" });
  }
  if (title) complaint.title = title;
  if (description) complaint.description = description;
  complaint.updatedAt = new Date().toISOString();

  return res.json(new ApiResponse(200, "Complaint updated", complaint));
});

// ✅ Delete Complaint
const deleteComplaint = asynchandler(async (req, res) => {
  complaints = complaints.filter((c) => c.id !== req.params.id);
  return res.json(new ApiResponse(200, "Complaint deleted"));
});

export { createComplaint, getComplaintById,updateComplaint, deleteComplaint };
