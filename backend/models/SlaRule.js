import mongoose from 'mongoose';

const slaRuleSchema = new mongoose.Schema(
  {
    dept_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true, index: true },
    time_limit_hours: { type: Number, required: true }, // e.g., 72 = 72 hours
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

slaRuleSchema.index({ dept_id: 1, priority: 1 }, { unique: true });

const SlaRule = mongoose.model('SlaRule', slaRuleSchema);

export default SlaRule;
