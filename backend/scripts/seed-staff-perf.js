import dotenv from 'dotenv';
import connectMongo from '../db/mongo.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const MOCK_STAFF = [
  {
    name: 'Sector A & C Contractor (Roads/Pathways)',
    email: 'contractor.road@tattletent.com',
    role: 'Staff',
    assignedWards: ['Sector C', 'Sector A', 'Tent #5'],
    activeComplaints: 2,
    resolvedComplaints: 48,
    avgResolutionTime: 18,
    performanceScore: 95,
    slaComplianceRate: 96,
    citizenRating: 4.7,
    availabilityStatus: 'Available',
    isVerified: true
  },
  {
    name: 'Sector B Contractor (Water/Waste)',
    email: 'contractor.water@tattletent.com',
    role: 'Staff',
    assignedWards: ['Sector B', 'Sector E'],
    activeComplaints: 4,
    resolvedComplaints: 35,
    avgResolutionTime: 32,
    performanceScore: 82,
    slaComplianceRate: 85,
    citizenRating: 4.1,
    availabilityStatus: 'Busy',
    isVerified: true
  },
  {
    name: 'Municipal Electrical Vendor',
    email: 'contractor.electrical@tattletent.com',
    role: 'Staff',
    assignedWards: ['Sector D', 'Sector F', 'Sector C'],
    activeComplaints: 1,
    resolvedComplaints: 80,
    avgResolutionTime: 8,
    performanceScore: 100,
    slaComplianceRate: 100,
    citizenRating: 4.9,
    availabilityStatus: 'Available',
    isVerified: true
  }
];

const seed = async () => {
  try {
    await connectMongo();

    const hashedPassword = await bcrypt.hash('Temp@1234', 10);

    for (const data of MOCK_STAFF) {
      // Upsert mock staff based on email
      const existing = await User.findOne({ email: data.email });

      if (existing) {
        await User.updateOne(
          { _id: existing._id },
          { 
            $set: {
              assignedWards: data.assignedWards,
              activeComplaints: data.activeComplaints,
              resolvedComplaints: data.resolvedComplaints,
              avgResolutionTime: data.avgResolutionTime,
              performanceScore: data.performanceScore,
              slaComplianceRate: data.slaComplianceRate,
              citizenRating: data.citizenRating,
              availabilityStatus: data.availabilityStatus,
              isVerified: true,
              role: 'Staff'
            }
          }
        );
        console.log(`Updated performance fields for existing staff: ${data.name}`);
      } else {
        await User.create({
          ...data,
          password_hash: hashedPassword,
          is_verified: true
        });
        console.log(`Created new mock contractor user: ${data.name}`);
      }
    }

    console.log('✅ Staff performance seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
