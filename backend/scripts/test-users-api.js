import mongoose from 'mongoose';
import '../models/User.js';
import dotenv from 'dotenv';
import { searchUsers } from '../services/user.service.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TattleTent');
  console.log('Connected to DB');
  const staff = await searchUsers({ role: 'Staff' });
  console.log('Staff count found:', staff.length);
  console.log('Staff list:');
  console.log(staff);
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
