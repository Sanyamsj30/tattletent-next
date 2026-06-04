import { Router } from 'express';
import { escalateComplaintsByCategory } from '../services/complaint.service.js';
import { notifyOverdueReminder } from '../services/notification.service.js';
import { ApiResponse } from '../utils/api-response.js';

const router = Router();

// Lightweight ping endpoint for cron-job.org to keep Render service awake without executing database/email operations
router.get('/ping', (req, res) => {
  return res.status(200).json(new ApiResponse(200, null, 'TattleTent service is awake'));
});

// Secure webhook to run SLA escalations and keep Render server awake
router.post('/escalate', async (req, res) => {
  const cronKey = req.headers['x-cron-key'];
  const expectedKey = process.env.CRON_API_KEY || 'default-tattletent-cron-key-123';

  if (!cronKey || cronKey !== expectedKey) {
    return res.status(401).json(new ApiResponse(401, null, 'Unauthorized Cron Trigger'));
  }

  console.log('⏰ Secure Webhook SLA escalation and keep-alive triggered...');
  
  try {
    const escalated = await escalateComplaintsByCategory();
    
    // Also run daily overdue alerts
    try {
      await notifyOverdueReminder();
    } catch (reminderErr) {
      console.error('SLA reminders failed in webhook:', reminderErr.message);
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        { count: escalated.length, escalated },
        'SLA Escalation and keep-alive successfully processed'
      )
    );
  } catch (err) {
    console.error('❌ SLA Escalation webhook failed:', err.message);
    return res.status(500).json(new ApiResponse(500, null, 'SLA Escalation hook execution failed'));
  }
});

export default router;
