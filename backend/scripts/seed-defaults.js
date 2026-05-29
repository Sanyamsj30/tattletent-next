import dotenv from 'dotenv';
import connectMongo from '../db/mongo.js';
import Department from '../models/Department.js';
import SlaRule from '../models/SlaRule.js';

dotenv.config();

const DEFAULT_DEPARTMENTS = [
  'Road Damage',
  'Waste Management',
  'Water Supply',
  'Street Lights',
  'Public Transport',
  'Other Issues',
];

const DEFAULT_SLA_HOURS = {
  Low: 72,
  Medium: 48,
  High: 24,
};

const run = async () => {
  await connectMongo();

  for (const deptName of DEFAULT_DEPARTMENTS) {
    const dept =
      (await Department.findOne({ dept_name: new RegExp(`^${deptName}$`, 'i') })) ||
      (await Department.create({ dept_name: deptName }));

    for (const [priority, hours] of Object.entries(DEFAULT_SLA_HOURS)) {
      await SlaRule.updateOne(
        { dept_id: dept._id, priority },
        { $set: { time_limit_hours: hours } },
        { upsert: true }
      );
    }
  }

  console.log('✅ Seeded departments and SLA rules.');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
