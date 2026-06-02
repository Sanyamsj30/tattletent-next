import Feedback from '../models/Feedback.js';
import Complaint from '../models/Complaint.js';

export const saveFeedbackToDB = async ({ complaint_id, rating, comment, user_id }) => {
  try {
    const complaint = await Complaint.findById(complaint_id).select('user_id staff_id');
    if (!complaint) throw new Error(`No complaint found with ID: ${complaint_id}`);
    if (complaint.user_id.toString() !== user_id) {
      const err = new Error('You can only submit feedback for your own complaint.');
      err.statusCode = 403;
      throw err;
    }

    const existingFeedback = await Feedback.findOne({ complaint_id: complaint._id, user_id });
    if (existingFeedback) {
      const err = new Error('Feedback has already been submitted for this complaint.');
      err.statusCode = 409;
      throw err;
    }

    const feedback = await Feedback.create({
      complaint_id: complaint._id,
      user_id,
      staff_id: complaint.staff_id,
      rating,
      comment,
    });

    return { feedback_id: feedback._id.toString() };
  } catch (err) {
    console.error('❌ Error saving feedback:', err.message);
    throw err;
  }
};

export const getFeedbacksFromDB = async () => {
  const docs = await Feedback.find({})
    .populate('user_id', 'name')
    .select('rating comment user_id')
    .lean();

  return docs.map((f) => ({
    feedback_id: f._id.toString(),
    rating: f.rating,
    comment: f.comment,
    user_id: f.user_id?._id?.toString?.() || f.user_id,
    name: f.user_id?.name,
  }));
};

export const getFeedbacksForComplaintFromDB = async (complaint_id) => {
  const docs = await Feedback.find({ complaint_id })
    .populate('user_id', 'name')
    .select('rating comment user_id')
    .lean();

  return docs.map((f) => ({
    feedback_id: f._id.toString(),
    rating: f.rating,
    comment: f.comment,
    user_id: f.user_id?._id?.toString?.() || f.user_id,
    name: f.user_id?.name,
  }));
};
