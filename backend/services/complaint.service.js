
import pool from '../db/db.js';


// ✅ Save complaint
export const saveComplaintToDB = async (newComplaint) => {
  const complaint = await pool.query(
    "INSERT INTO complaints (title, description, status, photo, category, location) VALUES ($1, $2, $3, $4, $5, $6) RETURNING complaint_id, title, description, photo, category, location",
    [newComplaint.title, newComplaint.description, newComplaint.status, newComplaint.photo, newComplaint.category, newComplaint.location]
  );
  return complaint.rows[0];
};

// ✅ Update complaint
export const updateComplaintInDB = async (id, updates) => {
  const complaintR = await pool.query(
    'SELECT complaint_id, status, priority FROM complaints WHERE complaint_id = $1',
    [id]
  );
  if (complaintR.rows.length === 0) return null;

  if(!updates[0]) updates[0] = complaintR.rows[0].status;
  if(!updates[1]) updates[1] = complaintR.rows[0].priority;

  // Update fields dynamically
  const upC = await pool.query(
    'UPDATE complaints SET status = $1, priority = $2 WHERE complaint_id = $3 RETURNING complaint_id, title, description, photo, location, category, status, priority', [updates[0], updates[1], id]
  );

  // If status changed, push to history
  // if (updates.status) {
  //   complaints[index].statusHistory.push({
  //     status: updates.status,
  //     date: new Date().toISOString(),
  //     note: "Status updated",
  //   });
  // }

  return upC.rows[0];
};

// ✅ Delete complaint
export const deleteComplaintFromDB = async (id) => {
  const ck = await pool.query(
    'SELECT * FROM complaints WHERE complaint_id = $1', [id]
  );
  if(ck.rows.length === 0) return false;
  await pool.query(
    'DELETE FROM complaints WHERE complaint_id = $1', [id]
  );
  return true; // true if deleted
};

// search and filter

export const searchComplaints = async (filters) => {
  let {
    searchText,
    category,
    status,
    location,
    fromDate,
    toDate,
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

  let query = 'SELECT * FROM complaints WHERE 1=1';
  const params = [];
  let idx = 1;

  // Text search
  if (searchText) {
    query += ` AND (title ILIKE $${idx} OR description ILIKE $${idx})`;
    params.push(`%${searchText}%`);
    idx++;
  }

  // Filters
  if (category) {
    query += ` AND category = $${idx}`;
    params.push(category);
    idx++;
  }
  if (status) {
    query += ` AND status = $${idx}`;
    params.push(status);
    idx++;
  }
  if (location) {
    query += ` AND location = $${idx}`;
    params.push(location);
    idx++;
  }
  if (fromDate) {
    query += ` AND created_at >= $${idx}`;
    params.push(fromDate);
    idx++;
  }
  if (toDate) {
    query += ` AND created_at <= $${idx}`;
    params.push(toDate);
    idx++;
  }

  // Sorting
  const validSort = ['submitted_at', 'status', 'category', 'sla_deadline'];
  const validOrder = ['asc', 'desc'];
  const sortColumn = validSort.includes(sortBy) ? sortBy : 'submitted_at';
  const sortOrder = validOrder.includes((order || '').toLowerCase()) ? order.toUpperCase() : 'DESC';
  query += ` ORDER BY ${sortColumn} ${sortOrder}`;

  // Pagination
  const offset = (page - 1) * limit;
  query += ` LIMIT $${idx} OFFSET $${idx + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};


export const escalateComplaintsByCategory = async () => {
  const now = new Date();
  const escalated = [];

  for (const c of complaints) {
    if (c.status === "RESOLVED") continue; // skip completed complaints

    const lastUpdate = new Date(c.updatedAt);
    const daysOld = (now - lastUpdate) / (1000 * 60 * 60 * 24);
    const threshold = categoryThresholds[c.category] || 3; // default 3 days

    if (daysOld > threshold && c.priority_level !== "Escalated") {
      c.priority_level = "Escalated";
      c.assigned_to = "supervisor";
      c.updatedAt = now.toISOString();
      c.statusHistory.push({
        status: c.status,
        date: now.toISOString(),
        note: `Escalated automatically after ${Math.floor(daysOld)} days (limit: ${threshold})`,
      });
      escalated.push(c);
    }
  }

  return escalated;
};
