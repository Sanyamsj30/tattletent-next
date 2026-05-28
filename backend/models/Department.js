import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    dept_name: { type: String, required: true, unique: true, trim: true, index: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Department = mongoose.model('Department', departmentSchema);

export default Department;
