const ROLE_MAP = {
  citizen: 'Citizen',
  staff: 'Staff',
  ringmaster: 'Ringmaster',
  groundmaster: 'Groundmaster',
  admin: 'Admin',
};

const normalizeRole = (role) => {
  if (!role) return role;
  const key = String(role).trim().toLowerCase();
  return ROLE_MAP[key] || role;
};

export default normalizeRole;

