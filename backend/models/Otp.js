import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['register', 'reset'],
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
      expires: 300, // Automatic MongoDB TTL index: expires in 5 minutes (300 seconds)
    },
  },
  { versionKey: false }
);

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
