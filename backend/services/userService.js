import User from '../models/User.js';

export const searchUsers = async (filters) => {
  let { user_id, searchText, email, role, page, limit, sortBy, order } = filters;

  const query = {};
  if (searchText) query.name = new RegExp(String(searchText), 'i');
  if (user_id) query._id = user_id;
  if (email) query.email = String(email).toLowerCase().trim();
  if (role) query.role = role;

  const validSort = ['created_at', 'email', 'role'];
  const sortColumn = validSort.includes(sortBy) ? sortBy : 'created_at';
  const sortOrder = String(order || 'asc').toLowerCase() === 'desc' ? -1 : 1;
  const sort = { [sortColumn]: sortOrder };

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 50;
  const skip = (page - 1) * limit;

  const users = await User.find(query).sort(sort).skip(skip).limit(limit).lean();

  return users.map((u) => ({
    user_id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    created_at: u.created_at,
  }));
};
