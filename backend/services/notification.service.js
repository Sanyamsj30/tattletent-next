import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

export const notifyStatusChange = async (complaintId) => {
  try {
    const complaint = await Complaint.findById(complaintId).populate('user_id', 'name email').lean();
    if (!complaint) return;

    const citizenEmail = complaint.user_id?.email;
    if (!citizenEmail) return;

    const feedbackUrl = `http://localhost:5173/feedback-page?complaintId=${complaint._id.toString()}`;

    const feedbackContent =
      complaint.status === 'RESOLVED'
        ? `
          <p>The TattleTent team is pleased to inform you that your complaint is now fully resolved!</p>
          <p>To help us improve our service, please take a moment to provide feedback on your experience:</p>
          <p style="text-align: center; margin: 20px 0;">
              <a href="${feedbackUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">
                  Leave Feedback Now
              </a>
          </p>
        `
        : '';

    await sendEmail({
      email: citizenEmail,
      subject: `Update on Complaint #${complaint._id.toString()}: Status is now "${complaint.status}"`,
      html: `
        <h2>Complaint Status Updated</h2>
        <p>Hello ${complaint.user_id?.name || ''},</p>
        <p>This is a notification that the status of your complaint has been changed.</p>

        <p><b>Complaint Title:</b> ${complaint.title}</p>
        <p><b>Reference ID:</b> #${complaint._id.toString()}</p>
        <p><b>New Status:</b> <span style="font-weight: bold; color: #007bff;">${complaint.status}</span></p>

        ${feedbackContent}

        <p>You can view full details and track the progress from your TattleTent dashboard.</p>
        <br/>
        <p>Regards,</p>
        <p>The TattleTent Team</p>
      `,
    });
  } catch (err) {
    console.error('❌ Error sending status change notification:', err);
  }
};

export const notifyOverdueReminder = async () => {
  try {
    const now = new Date();
    const twoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    const complaints = await Complaint.find({
      status: { $in: ['NEW', 'IN_PROGRESS'] },
      sla_deadline: { $ne: null, $gt: now, $lt: twoDays },
      staff_id: { $ne: null },
    })
      .populate('staff_id', 'email name')
      .lean();

    for (const c of complaints) {
      const staffEmail = c.staff_id?.email;
      if (!staffEmail) continue;

      const hoursLeft = Math.round((new Date(c.sla_deadline) - new Date()) / (1000 * 60 * 60));

      await sendEmail({
        email: staffEmail,
        subject: `⏰ SLA Reminder: Complaint #${c._id.toString()} due soon`,
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
    }
  } catch (err) {
    console.error('❌ Error sending SLA reminders:', err);
  }
};

export const notifyAdminForManualReassignment = async (complaintId) => {
  const admins = await User.find({ role: 'Ringmaster' }).select('email').lean();
  const emails = admins.map((a) => a.email).filter(Boolean);
  if (!emails.length) return;

  const complaint = await Complaint.findById(complaintId).select('title priority').lean();
  if (!complaint) return;

  for (const email of emails) {
    await sendEmail({
      email,
      subject: `⚠️ Complaint #${complaintId} Escalation Limit Reached`,
      html: `
        <h2>Manual Reassignment Required</h2>
        <p>Complaint "<b>${complaint.title}</b>" (Priority: ${complaint.priority}) has reached its maximum escalation limit.</p>
        <p>Please review and assign a new staff member manually.</p>
      `,
    });
  }
};

