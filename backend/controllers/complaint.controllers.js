import asynchandler from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  saveComplaintToDB,
  updateComplaintInDB,
  deleteComplaintFromDB,
  searchComplaints,
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

// search and filter
const getComplaints = async (req, res) => {
  try {
    const filters = {
      searchText: req.query.q,
      category: req.query.category,
      status: req.query.status,
      location: req.query.location,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      order: req.query.order
    };

    const complaints = await searchComplaints(filters);
    res.status(200).json(complaints);
  } catch (err) {
    console.error('Error in getComplaints:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};


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


export { createComplaint, updateComplaint, deleteComplaint ,getComplaints,escalateComplaints};
