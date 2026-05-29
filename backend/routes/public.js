import express from 'express';
import {
  getComplaintCounts,
  fetchHeatmapData,
  searchComplaints,
} from '../services/complaint.service.js';
import { getFeedbacksFromDB } from '../services/feedback.service.js';

const router = express.Router();

router.get('/complaints/counts', async (req, res) => {
  try {
    const counts = await getComplaintCounts();
    res.status(200).json(counts);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/complaints/search', async (req, res) => {
  try {
    const filters = {
      user_id: undefined, // public should not allow user filtering
      searchText: req.query.q,
      category: req.query.category,
      status: req.query.status,
      location: req.query.location,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      order: req.query.order,
      staff_id: undefined,
    };
    const complaints = await searchComplaints(filters);
    // Basic redaction for public portal
    const redacted = complaints.map((c) => ({
      complaint_id: c.complaint_id,
      title: c.title,
      description: c.description,
      category: c.category,
      location: c.location,
      priority: c.priority,
      status: c.status,
      photo: c.photo,
      submitted_at: c.submitted_at,
      updated_at: c.updated_at,
    }));
    res.status(200).json(redacted);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/complaints/heatmap', async (req, res) => {
  try {
    const points = await fetchHeatmapData();
    res.status(200).json(points);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

router.get('/feedback', async (req, res) => {
  try {
    const feedback = await getFeedbacksFromDB();
    // public: do not expose user_id
    const redacted = feedback.map((f) => ({
      rating: f.rating,
      comment: f.comment,
      name: f.name || 'Citizen',
    }));
    res.status(200).json({ data: redacted });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

export default router;
