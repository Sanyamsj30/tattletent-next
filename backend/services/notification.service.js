import pool from "../db/db.js";
import sendEmail from "../utils/sendEmail.js";


/**
 * 🔔 Notify staff and citizen when a complaint's status is changed.
 */
export const notifyStatusChange = async (complaintId) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.complaint_id, c.title, c.category, c.priority,c.status,
        u1.name AS citizen_name, u1.email AS citizen_email
      FROM complaints c
      JOIN users u1 ON c.user_id = u1.user_id
      WHERE c.complaint_id = $1
    `, [complaintId]);

    if (result.rowCount === 0) return;
    const c = result.rows[0];

    // 🧠 Email to citizen
    await sendEmail({
        email: c.citizen_email,
        subject: `Update on Complaint #${c.complaint_id}: Status is now "${c.status}"`,
        html: `
            <h2>Complaint Status Updated</h2>
            <p>Hello,</p>
            <p>This is a notification that the status of your complaint has been changed.</p>
            
            <p><b>Complaint Title:</b> ${c.title}</p>
            <p><b>Reference ID:</b> #${c.complaint_id}</p>
            <p><b>New Status:</b> ${c.status}</p>

            <p>You can view full details and track the progress from your TattleTent dashboard.</p>
            <br/>
            <p>Regards,</p>
            <p>The TattleTent Team</p>
        `,
    });

    

    console.log(`📩 Status notification sent for complaint ${c.complaint_id}`);
  } catch (err) {
    console.error("❌ Error sending Status change notification:", err.message);
  }
};


/**
 * ⏰ Send reminder to staff if complaint is close to SLA deadline (e.g., within 1 day).
 */
export const notifyOverdueReminder = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        c.complaint_id, c.title, c.category, c.priority, c.sla_deadline,
        u.email AS staff_email, u.name AS staff_name
      FROM complaints c
      JOIN users u ON c.assigned_to = u.user_id
      WHERE c.status IN ('NEW', 'IN_PROGRESS')
      AND c.sla_deadline IS NOT NULL
      AND c.sla_deadline > NOW()
      AND c.sla_deadline < NOW() + INTERVAL '2 day';
    `);

    if (result.rowCount === 0) {
      console.log("✅ No upcoming SLA deadlines in next 2 days.");
      return;
    }

    for (const c of result.rows) {
      const hoursLeft = Math.round(
        (new Date(c.sla_deadline) - new Date()) / (1000 * 60 * 60)
      );

      await sendEmail({
        email: c.staff_email,
        subject: `⏰ SLA Reminder: Complaint #${c.complaint_id} due soon`,
        html: `
          <h2>SLA Deadline Approaching</h2>
          <p>Complaint "<b>${c.title}</b>" assigned to you is due in <b>${hoursLeft} hours</b>.</p>
          <p><b>Category:</b> ${c.category}</p>
          <p><b>Priority:</b> ${c.priority}</p>
          <p><b>Deadline:</b> ${new Date(c.sla_deadline).toLocaleString()}</p>
          <br/>
          <p>Please resolve it before the SLA deadline to avoid escalation.</p>
        `,
      });

      console.log(`📧 Reminder sent to ${c.staff_email} for complaint ${c.complaint_id}`);
    }
  } catch (err) {
    console.error("❌ Error sending SLA reminders:", err.message);
  }
};