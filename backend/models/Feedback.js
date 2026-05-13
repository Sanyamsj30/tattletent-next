import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    complaint_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;

