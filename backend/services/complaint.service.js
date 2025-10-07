// 🧠 TEMPORARY MOCK FUNCTION

let complaints = []; // 🧠 temporary in-memory storage

const categoryThresholds = {
  "Roads & Infrastructure": 3,
  "Water & Sanitation": 2,
  "Public Safety": 1,
  "Waste Management": 4,
};

// ✅ Save complaint
export const saveComplaintToDB = async (newComplaint) => {
  const complaint = { id: Date.now().toString(), ...newComplaint };
  complaints.push(complaint);
  return complaint;
};

// ✅ Get complaint by ID
export const getComplaintByIdFromDB = async (id) => {
  return complaints.find((c) => c.id === id) || null;
};

// ✅ Update complaint
export const updateComplaintInDB = async (id, updates) => {
  const index = complaints.findIndex((c) => c.id === id);
  if (index === -1) return null;

  // Update fields dynamically
  complaints[index] = {
    ...complaints[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // If status changed, push to history
  if (updates.status) {
    complaints[index].statusHistory.push({
      status: updates.status,
      date: new Date().toISOString(),
      note: "Status updated",
    });
  }

  return complaints[index];
};

// ✅ Delete complaint
export const deleteComplaintFromDB = async (id) => {
  const initialLength = complaints.length;
  complaints = complaints.filter((c) => c.id !== id);
  return complaints.length < initialLength; // true if deleted
};

// This lets you test filters, pagination, etc. without connecting to the real database

export const getComplaintsFromDB = async (filters) => {
  const {
    status,
    category,
    location,
    search,
    page = 1,
    limit = 10,
    sort = "newest",
  } = filters;

  // ✅ Dummy complaints list (you can expand this)
  const mockComplaints = [
    { id: 1, title: "Pothole near park", category: "Roads", status: "OPEN", location: "Sector 9", created_at: "2025-10-04T10:00:00Z" },
    { id: 2, title: "Streetlight broken", category: "Infrastructure", status: "IN_PROGRESS", location: "Sector 12", created_at: "2025-10-03T08:00:00Z" },
    { id: 3, title: "Garbage overflow", category: "Waste Management", status: "RESOLVED", location: "Sector 7", created_at: "2025-10-02T15:00:00Z" },
    { id: 4, title: "Water leakage", category: "Water & Sanitation", status: "OPEN", location: "Sector 5", created_at: "2025-10-01T12:00:00Z" },
    { id: 5, title: "Broken signboard", category: "Infrastructure", status: "OPEN", location: "Sector 10", created_at: "2025-09-30T09:00:00Z" },
  ];

  // 🧩 1️⃣ Apply filters
  let filtered = [...mockComplaints];

  if (status) filtered = filtered.filter((c) => c.status === status);
  if (category) filtered = filtered.filter((c) => c.category === category);
  if (location) filtered = filtered.filter((c) => c.location.toLowerCase().includes(location.toLowerCase()));
  if (search)
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
    );


   if (search)
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
    );

  // 🧩 2️⃣ Sort by date
  filtered.sort((a, b) => {
    if (sort === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // 🧩 3️⃣ Pagination logic
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  // 🧩 4️⃣ Return simulated DB result
  return {
    complaints: paginated,
    totalCount: filtered.length,
  };
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
