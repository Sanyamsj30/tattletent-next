import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    location: { type: String, required: true, trim: true, index: true },

    status: {
      type: String,
      enum: ['NEW', 'IN_PROGRESS', 'RESOLVED_PENDING', 'RESOLVED', 'DUPLICATE'],
      default: 'NEW',
      index: true,
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low', index: true },

    photo: { type: String },

    dept_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    assigned_to: { type: String },

    geolocation: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number], default: undefined }, // [lon, lat]
    },

    sla_deadline: { type: Date, index: true },
    is_deleted: { type: Boolean, default: false, index: true },
    supported_by: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [], index: true },
    
    // AI governance extensions
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low', index: true },
    is_duplicate: { type: Boolean, default: false, index: true },
    duplicate_of: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', index: true },
    escalation_explanation: { type: String },

    // Rules & Auto-assignment extensions
    priority_score: { type: Number, default: 0, index: true },
    priority_level: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low', index: true },
    escalation_count: { type: Number, default: 0 },
    is_auto_assigned: { type: Boolean, default: true },
    recommendation_explanation: { type: String },
    priority_breakdown: {
      severity: { type: Number, default: 0 },
      duplicates: { type: Number, default: 0 },
      escalations: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      age: { type: Number, default: 0 },
    },
    assignment_history: [
      {
        old_staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        new_staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        old_staff_name: { type: String },
        new_staff_name: { type: String },
        timestamp: { type: Date, default: Date.now },
        admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        admin_name: { type: String },
        reason: { type: String },
      }
    ],
  },
  { 
    timestamps: { createdAt: 'submitted_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

complaintSchema.virtual('latitude').get(function() {
  return this.geolocation?.coordinates?.[1];
}).set(function(lat) {
  if (!this.geolocation) {
    this.geolocation = { type: 'Point', coordinates: [0, Number(lat)] };
  } else {
    this.geolocation.coordinates[1] = Number(lat);
  }
});

complaintSchema.virtual('longitude').get(function() {
  return this.geolocation?.coordinates?.[0];
}).set(function(lon) {
  if (!this.geolocation) {
    this.geolocation = { type: 'Point', coordinates: [Number(lon), 0] };
  } else {
    this.geolocation.coordinates[0] = Number(lon);
  }
});

complaintSchema.index({ geolocation: '2dsphere' });
complaintSchema.index({ user_id: 1, submitted_at: -1 });
complaintSchema.index({ staff_id: 1, status: 1, submitted_at: -1 });
complaintSchema.index({ status: 1, submitted_at: -1 });
complaintSchema.index({ submitted_at: -1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
