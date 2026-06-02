import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from '../models/Complaint.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TattleTent');
  console.log('Connected to DB');

  const complaints = await Complaint.find({}).lean();
  console.log('Total Complaints in DB:', complaints.length);
  complaints.forEach(c => {
    console.log(`- ID: ${c._id}, Title: "${c.title}", Status: ${c.status}, UserID: ${c.user_id}, StaffID: ${c.staff_id}, AssignedTo: "${c.assigned_to}", Deleted: ${c.is_deleted}`);
  });
  
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
