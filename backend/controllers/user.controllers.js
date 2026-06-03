import { searchUsers } from '../services/user.service.js';

// search and filter
const getUsers = async (req, res) => {
  try {
    const filters = {
      user_id: req.query.user_id,
      searchText: req.query.q,
      email: req.query.email,
      role: req.query.role,
      must_change_password: req.query.must_change_password,
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      order: req.query.order,
    };

    const users = await searchUsers(filters);
    res.status(200).json(users);
  } catch (err) {
    console.error('Error in getUsers:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

export { getUsers };
