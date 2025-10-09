import pool from '../db/db.js';

// search and filter

export const searchUsers = async (filters) => {
  let {
    user_id,
    searchText,
    email,
    role,
    page,
    limit,
    sortBy,
    order
  } = filters;

  // Ensure page & limit are valid integers
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  let query = 'SELECT * FROM users WHERE 1=1';
  const params = [];
  let idx = 1;

  // Text search
  if (searchText) {
    query += ` AND name ILIKE $${idx}`;
    params.push(`%${searchText}%`);
    idx++;
  }

  if (user_id) {
    query += ` AND user_id = $${idx}`;
    params.push(user_id);
    idx++;
  }

  // Filters
  if (email) {
    query += ` AND email = $${idx}`;
    params.push(email);
    idx++;
  }
  if (role) {
    query += ` AND role = $${idx}`;
    params.push(role);
    idx++;
  }

  // Sorting
  const validSort = ['created_at', 'email', 'role'];
  const validOrder = ['asc', 'desc'];
  const sortColumn = validSort.includes(sortBy) ? sortBy : 'created_at';
  const sortOrder = validOrder.includes((order || '').toLowerCase()) ? order.toUpperCase() : 'ASC';
  query += ` ORDER BY ${sortColumn} ${sortOrder}`;

  // Pagination
  // const offset = (page - 1) * limit;
  // query += ` LIMIT $${idx} OFFSET $${idx + 1}`;
  // params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};