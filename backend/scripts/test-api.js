import mongoose from 'mongoose';
import '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getComplaintCounts, searchComplaints } from '../services/complaint.service.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TattleTent');
  
  const counts = await getComplaintCounts();
  console.log('Counts:', counts);
  
  const newComplaints = await searchComplaints({ status: 'NEW' });
  console.log('NEW complaints count:', newComplaints.length);
  
  const inProgress = await searchComplaints({ status: 'IN_PROGRESS' });
  console.log('IN_PROGRESS complaints count:', inProgress.length);
  inProgress.forEach(c => {
    console.log(`- ID: ${c.complaint_id}, Status: ${c.status}, AssignedTo: ${c.assigned_to}`);
  });
  
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
