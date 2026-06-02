import dotenv from 'dotenv';
import connectMongo from '../db/mongo.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Feedback from '../models/Feedback.js';
import AuditLog from '../models/AuditLog.js';
import Otp from '../models/Otp.js';

dotenv.config();

const purge = async () => {
  try {
    await connectMongo();

    console.log('🧹 Starting database purge to fresh state...');

    // 1. Delete all non-admin users
    const userDeleteResult = await User.deleteMany({
      role: { $nin: ['Admin', 'Ringmaster', 'admin', 'ringmaster'] },
    });
    console.log(`👤 Deleted ${userDeleteResult.deletedCount} non-admin users (Citizen/Staff).`);

    // 2. Delete all complaints
    const complaintDeleteResult = await Complaint.deleteMany({});
    console.log(`📝 Deleted ${complaintDeleteResult.deletedCount} complaints.`);

    // 3. Delete all feedbacks
    const feedbackDeleteResult = await Feedback.deleteMany({});
    console.log(`💬 Deleted ${feedbackDeleteResult.deletedCount} feedback entries.`);

    // 4. Delete all audit logs
    const auditDeleteResult = await AuditLog.deleteMany({});
    console.log(`📂 Deleted ${auditDeleteResult.deletedCount} audit log records.`);

    // 5. Delete all OTPs
    const otpDeleteResult = await Otp.deleteMany({});
    console.log(`🔑 Deleted ${otpDeleteResult.deletedCount} pending OTP tokens.`);

    console.log('✅ Database successfully purged! Admin accounts have been preserved.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database purge failed:', err);
    process.exit(1);
  }
};

purge();
