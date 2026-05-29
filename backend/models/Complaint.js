import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    location: { type: String, required: true, trim: true, index: true },

    status: {
      type: String,
      enum: ['NEW', 'IN_PROGRESS', 'RESOLVED'],
      default: 'NEW',
      index: true,
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low', index: true },

    photo: { type: String },

    dept_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    assigned_to: { type: String },

    latitude: { type: Number },
    longitude: { type: Number },
    geolocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined }, // [lon, lat]
    },

    sla_deadline: { type: Date, index: true },
    temp_points: { type: Number, default: 3 },
    
    // AI governance extensions
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low', index: true },
    is_duplicate: { type: Boolean, default: false, index: true },
    duplicate_of: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', index: true },
    escalation_explanation: { type: String },
  },
  { timestamps: { createdAt: 'submitted_at', updatedAt: 'updated_at' } }
);

complaintSchema.index({ geolocation: '2dsphere' });
complaintSchema.index({ user_id: 1, submitted_at: -1 });
complaintSchema.index({ staff_id: 1, status: 1, submitted_at: -1 });
complaintSchema.index({ status: 1, submitted_at: -1 });
complaintSchema.index({ submitted_at: -1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;

