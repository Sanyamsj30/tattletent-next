import mongoose from 'mongoose';
import '../models/Complaint.js';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TattleTent');
  console.log('Connected to DB');
  const count = await mongoose.model('Complaint').countDocuments({});
  console.log('Total Complaints in DB:', count);
  const active = await mongoose.model('Complaint').find({}).lean();
  active.forEach(c => {
    console.log(`- ID: ${c._id}, Status: ${c.status}, Geoloc: ${JSON.stringify(c.geolocation)}, Deleted: ${c.is_deleted}`);
  });
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
