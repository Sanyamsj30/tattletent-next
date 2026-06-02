import AuditLog from '../models/AuditLog.js';

export const logAuditEvent = async ({ action, complaint_id, user, details }) => {
  try {
    const auditData = {
      action,
      complaint_id,
      details,
    };

    if (user) {
      auditData.user_id = user.user_id || user._id;
      auditData.user_name = user.name;
      auditData.user_role = user.role;
    }

    const logEntry = await AuditLog.create(auditData);
    return logEntry;
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
};
