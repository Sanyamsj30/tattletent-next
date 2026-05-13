import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    google_id: { type: String, index: true, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    password_hash: { type: String },
    role: {
      type: String,
      enum: ['Citizen', 'Staff', 'Ringmaster', 'Groundmaster', 'Admin'],
      default: 'Citizen',
      index: true,
    },
    is_verified: { type: Boolean, default: false, index: true },
    must_change_password: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const User = mongoose.model('User', userSchema);

export default User;

