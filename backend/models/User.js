import mongoose from 'mongoose';
import normalizeRole from '../utils/normalizeRole.js';

const userSchema = new mongoose.Schema(
  {
    google_id: { type: String, index: true, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    password_hash: { type: String },
    role: {
      type: String,
      enum: ['Citizen', 'Staff', 'Ringmaster', 'Groundmaster', 'Admin', 'citizen', 'staff', 'ringmaster', 'groundmaster', 'admin'],
      default: 'Citizen',
      index: true,
    },
    is_verified: { type: Boolean, default: false, index: true },
    must_change_password: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

userSchema.pre('validate', function () {
  this.role = normalizeRole(this.role);
});

const User = mongoose.model('User', userSchema);

export default User;
