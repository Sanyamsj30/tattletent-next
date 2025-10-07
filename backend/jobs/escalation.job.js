import cron from "node-cron";
import { escalateComplaintsByCategory } from "../services/complaint.service.js";

// 🕒 Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running category-based escalation check...");

  const escalated = await escalateComplaintsByCategory();

  if (escalated.length > 0) {
    console.log(`⚡ Escalated ${escalated.length} complaints automatically`);
  } else {
    console.log("✅ No complaints needed escalation today");
  }
});
