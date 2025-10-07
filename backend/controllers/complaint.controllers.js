import asynchandler from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  saveComplaintToDB,
  getComplaintByIdFromDB,
  updateComplaintInDB,
  deleteComplaintFromDB,
  getComplaintsFromDB,
  escalateComplaintsByCategory,
} from "../services/complaint.service.js";





// ✅ Create a new complaint
const createComplaint = asynchandler(async (req, res) => {
  const { title, description, category, location } = req.body;

  if (!title || !description || !category || !location) {
    return res
      .status(400)
      .json(new ApiResponse(400, "All fields are required"));
  }

  // Create object
  const newComplaint = {
    title,
    description,
    category,
    location,
    photo: req.file ? `/temp/${req.file.filename}` : null,
    status: "New",
    // statusHistory: [
    //   {
    //     status: "OPEN",
    //     date: new Date().toISOString(),
    //     note: "Complaint submitted",
    //   },
    // ],
  };

  // Save complaint (currently mock, later DB)
  const savedComplaint = await saveComplaintToDB(newComplaint);

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Complaint submitted successfully", savedComplaint)
    );
});


// ✅ Get Complaint by ID
const getComplaintById = asynchandler(async (req, res) => {
  const { id } = req.params;
  const complaint = await getComplaintByIdFromDB(id);

  if (!complaint)
    return res
      .status(404)
      .json(new ApiResponse(404, "Complaint not found"));

  return res
    .status(200)
    .json(new ApiResponse(200, "Complaint fetched successfully", complaint));
});


// ✅ Update Complaint (status or details)
const updateComplaint = asynchandler(async (req, res) => {
  const { id } = req.params;
  const updates = [req.body.status, req.body.priority];
  const complaintId = parseInt(id, 10);
  const updatedComplaint = await updateComplaintInDB(complaintId, updates);

  if (!updatedComplaint)
    return res
      .status(404)
      .json(new ApiResponse(404, "Complaint not found"));

  return res
    .status(200)
    .json(new ApiResponse(200, "Complaint updated successfully", updatedComplaint));
});


// ✅ Delete Complaint
const deleteComplaint = asynchandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await deleteComplaintFromDB(id);

  if (!deleted)
    return res
      .status(404)
      .json(new ApiResponse(404, "Complaint not found"));

  return res
    .status(200)
    .json(new ApiResponse(200, "Complaint deleted successfully"));
});


const getAllComplaints = asynchandler(async (req, res) => {
  const { status, category, location, search, page = 1, limit = 10, sort = "newest" } = req.query;

  // Collect filters for your teammate’s DB query
  const filters = {
    status,
    category,
    location,
    search,
    page: Number(page),
    limit: Number(limit),
    sort
  };

  // Get filtered results from the DB
  const { complaints, totalCount } = await getComplaintsFromDB(filters);

    // ✅ if no complaints found → send 404 error
  if (!complaints || complaints.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No complaints found for the given search or filters"));
  }

  return res.status(200).json(
    new ApiResponse(200, "Complaints fetched successfully", {
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      complaints,
    })
  );
});


// ✅ Manual trigger endpoint (can run from Postman)
const escalateComplaints = asynchandler(async (req, res) => {
  const escalated = await escalateComplaintsByCategory();

  if (escalated.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No complaints needed escalation today"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Complaints escalated successfully", escalated));
});


export { createComplaint, getComplaintById,updateComplaint, deleteComplaint ,getAllComplaints,escalateComplaints};
