import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaBars } from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [counts, setCounts] = useState({ resolved: 0, pending: 0, in_progress: 0 });

  const [menuOpen, setMenuOpen] = useState(false);

  // Complaints state
  const [complaints, setComplaints] = useState([]);
  const [assignedComplaints, setAssignedComplaints] = useState([]);

  // Pagination states
  const [currentNewPage, setCurrentNewPage] = useState(1);
  const [currentAssignedPage, setCurrentAssignedPage] = useState(1);
  const complaintsPerPage = 5;

  // Demo data for New Complaints
  // const demoNewComplaints = [
  //   { id: 101, category: "Water Leak", location: "Tent #12", status: "New", assignedTo: null },
  //   { id: 102, category: "Electrical", location: "Sector 5", status: "New", assignedTo: null },
  //   { id: 103, category: "Garbage Overflow", location: "Park Zone", status: "New", assignedTo: null },
  //   { id: 104, category: "Pathway Damage", location: "Street 3", status: "New", assignedTo: null },
  //   { id: 105, category: "Noise Complaint", location: "Sector 7", status: "New", assignedTo: null },
  //   { id: 106, category: "Drainage Issue", location: "Sector 2", status: "New", assignedTo: null },
  // ];

  // // Demo data for Assigned Complaints
  // const demoAssignedComplaints = [
  //   { id: 201, category: "Water Leak", location: "Tent #9", status: "In Progress", assignedTo: "Staff A" },
  //   { id: 202, category: "Electrical", location: "Street 5", status: "In Progress", assignedTo: "Staff B" },
  //   { id: 203, category: "Garbage Overflow", location: "Park Zone 2", status: "In Progress", assignedTo: "Staff C" },
  //   { id: 204, category: "Pathway Damage", location: "Sector 4", status: "In Progress", assignedTo: "Staff D" },
  //   { id: 205, category: "Noise Complaint", location: "Sector 6", status: "In Progress", assignedTo: "Staff E" },
  //   { id: 206, category: "Drainage Issue", location: "Sector 8", status: "In Progress", assignedTo: "Staff F" },
  // ];

  const handleLogout = () => {
        // 1. Clear session data (must match what you used in LandingPage!)
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        
        // 2. Redirect to the home page, which will now show Login/Sign Up buttons
        navigate("/"); 
      };
    
     useEffect(() => {
        const token = sessionStorage.getItem("token");
        const user = sessionStorage.getItem("user");
        
        // Check if authenticated
        if (!token || !user) {
          // Redirect to login/home page if no session is found
          navigate("/"); 
        } 
        
        // 💡 Add Role Check (Crucial for security and correct routing!)
        if (user && !["ringmaster", "admin"].includes(String(JSON.parse(user).role || "").toLowerCase())) {
            navigate("/"); // Or a specific Unauthorized page
        }
        
      }, [navigate]);

  const fetchCounts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/complaints/counts');
      setCounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  // Fetch complaints by user (with demo fallback)
  const fetchComplaintsByUser = async () => {
    try {
      if (!user?.user_id) return;

      const queryParams = new URLSearchParams({ status: "New" }).toString();
      const response = await fetch(`http://localhost:5000/api/complaints/search?${queryParams}`);

      if (!response.ok) throw new Error("Failed to fetch complaints");

      const data = await response.json();
      setComplaints(data.map(c => ({
        id: c.complaint_id,
        category: c.category,
        location: c.location,
        status: c.status,
        assignedTo: c.assigned_to,
        staff_id: c.staff_id,
      })));

    } catch (err) {
      console.error("Error fetching complaints:", err);
      setComplaints(demoNewComplaints); // fallback to demo
    }
  };

  useEffect(() => {
    if (user?.user_id) fetchComplaintsByUser();
  }, [user]);

  // Fetch assigned complaints (with demo fallback)
  const fetchAssignedComplaints = async () => {
    try {
      if (!user?.user_id) return;

      const queryParams = new URLSearchParams({ status: "IN_PROGRESS" }).toString();
      const response = await fetch(`http://localhost:5000/api/complaints/search?${queryParams}`);

      if (!response.ok) throw new Error("Failed to fetch complaints");

      const data = await response.json();
      setAssignedComplaints(data.map(c => ({
        id: c.complaint_id,
        category: c.category,
        location: c.location,
        status: c.status,
        assignedTo: c.assigned_to,
        staff_id: c.staff_id,
      })));

    } catch (err) {
      console.error("Error fetching assigned complaints:", err);
      setAssignedComplaints(demoAssignedComplaints); // fallback to demo
    }
  };

  useEffect(() => {
    if (user?.user_id) fetchAssignedComplaints();
  }, [user]);

  // Pagination slices
  const totalNewPages = Math.ceil(complaints.length / complaintsPerPage);
  const paginatedNewComplaints = complaints.slice(
    (currentNewPage - 1) * complaintsPerPage,
    currentNewPage * complaintsPerPage
  );

  const totalAssignedPages = Math.ceil(assignedComplaints.length / complaintsPerPage);
  const paginatedAssignedComplaints = assignedComplaints.slice(
    (currentAssignedPage - 1) * complaintsPerPage,
    currentAssignedPage * complaintsPerPage
  );

  // Handle assign button
  const handleAssignClick = (complaint) => {
    navigate("/assign-staff", { state: { complaint } });
  };

  // Demo reviews (unchanged)
  /* const [reviews] = useState([
    { id: 1, citizen: "Alice", comment: "Great service by staff!", rating: 5 },
    { id: 2, citizen: "Bob", comment: "Complaint resolved quickly.", rating: 4 },
    { id: 3, citizen: "Charlie", comment: "Staff were helpful and polite.", rating: 5 },
    { id: 4, citizen: "David", comment: "Good work, could be faster.", rating: 3 },
    { id: 5, citizen: "Ella", comment: "Impressed with how they handled it.", rating: 5 },
  ]); */

  // --- Review Carousel ---
 /*  const [currentReviewPage, setCurrentReviewPage] = useState(0);
  const reviewsPerPage = 4;
  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);
  const reviewSubset = reviews.slice(
    currentReviewPage * reviewsPerPage,
    (currentReviewPage + 1) * reviewsPerPage
  ); */

  return (
    <div className="min-h-screen bg-[#FCF5EE] font-sans flex flex-col justify-between">
      {/* Navbar */}
      {/* <div className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-8 bg-white shadow-md z-50">
        <Logo />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-semibold text-gray-800">Admin</p>
          </div>
          
          <button
            className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2"
            onClick={() => navigate("/heatmap")}
          >
            Heatmap
          </button>
          <button
            className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2"
            onClick={() => navigate("/all-complaints")}
          >
            All Complaints
          </button>
          <button
            className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2"
            onClick={() => navigate("/invite-staff")}
          >
            Invite Staff
          </button>
          <button
            className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div> */}

      <div className="fixed top-0 left-0 w-full h-24 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 bg-white shadow-md z-50">
  <div className="w-full sm:w-auto flex items-center justify-between">
    <Logo />

    {/* Hamburger menu for small screens */}
    <div className="sm:hidden">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 rounded-md focus:outline-none bg-gray-100 hover:bg-gray-200"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  </div>

  {/* Menu buttons */}
  <div
    className={`w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4 mt-4 sm:mt-0 ${
      menuOpen ? "block" : "hidden sm:flex"
    }`}
  >
    <div className="text-center sm:text-right">
      <p className="text-sm text-gray-600">Logged in as</p>
      <p className="font-semibold text-gray-800">Admin</p>
    </div>

    <button
      className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2"
      onClick={() => navigate("/heatmap")}
    >
      Heatmap
    </button>
    <button
      className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2"
      onClick={() => navigate("/all-complaints")}
    >
      All Complaints
    </button>
    <button
      className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2"
      onClick={() => navigate("/invite-staff")}
    >
      Invite Staff
    </button>
    <button
      className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2"
      onClick={handleLogout}
    >
      Logout
    </button>
  </div>
</div>


      <main className="container mx-auto px-6 py-12 max-w-7xl pt-32 space-y-12 flex-grow">
        {/* Welcome Section */}
        <div className="text-center">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-orange-700 via-amber-600 to-yellow-500 bg-clip-text text-transparent leading-tight tracking-tight">
            Welcome, {user.name} 🛡️
          </h2>
          <p className="text-gray-700 text-lg italic">
            Manage staff, assign complaints, and review citizen feedback.
          </p>
        </div>

        <hr className="border-gray-200" /> 

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8"> {/* Increased gap for better spacing */}
          {[
            { title: "Total Complaints", count: (parseInt(counts.resolved, 10) || 0) + (parseInt(counts.in_progress, 10) || 0) + (parseInt(counts.pending, 10) || 0) },
            { title: "In Progress", count: counts.in_progress },
            { title: "Pending", count: counts.pending },
          ].map((s) => (
            <div
              key={s.title}
              className="rounded-2xl px-3 py-8 shadow-xl flex flex-col items-center 
                bg-gradient-to-r from-orange-100 via-amber-50 to-orange-100
                transform transition duration-500 hover:scale-[1.02] text-orange-700"
            >
              <div className="text-4xl font-extrabold">{s.count}</div>
              <div className="mt-2 font-semibold text-lg text-center">{s.title}</div>
            </div>
          ))}
        </div>

        {/* New Complaints Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-3xl font-bold text-gray-900">New Complaints</h3>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="min-w-full divide-y divide-blue-200">
              <thead className="bg-white">
                <tr>
                  {["ID", "Category", "Location", "Status", "Assigned To", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200 bg-white">
                {paginatedNewComplaints.length > 0 ? (
                  paginatedNewComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50 transition">
                      <td className="p-4 font-bold">{c.id}</td>
                      <td className="p-4">{c.category}</td>
                      <td className="p-4">{c.location}</td>
                      <td className="p-4">{c.status}</td>
                      <td className="p-4">{c.assignedTo || "Unassigned"}</td>
                      <td className="p-4">
                        <button
                          className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition"
                          onClick={() => handleAssignClick(c)}
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for New Complaints */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentNewPage((p) => Math.max(p - 1, 1))}
              disabled={currentNewPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Prev
            </button>
            <span className="text-lg font-semibold">
              Page {currentNewPage} of {totalNewPages}
            </span>
            <button
              onClick={() => setCurrentNewPage((p) => Math.min(p + 1, totalNewPages))}
              disabled={currentNewPage === totalNewPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Next
            </button>
          </div>
        </div>

        {/* Assigned Complaints Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-3xl font-bold text-gray-900">Assigned Complaints</h3>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="min-w-full divide-y divide-blue-200">
              <thead className="bg-white">
                <tr>
                  {["ID", "Category", "Location", "Status", "Assigned To"].map((h) => (
                    <th
                      key={h}
                      className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200 bg-white">
                {paginatedAssignedComplaints.length > 0 ? (
                  paginatedAssignedComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50 transition">
                      <td className="p-4 font-bold">{c.id}</td>
                      <td className="p-4">{c.category}</td>
                      <td className="p-4">{c.location}</td>
                      <td className="p-4">{c.status}</td>
                      <td className="p-4">{c.assignedTo }</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for Assigned Complaints */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentAssignedPage((p) => Math.max(p - 1, 1))}
              disabled={currentAssignedPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Prev
            </button>
            <span className="text-lg font-semibold">
              Page {currentAssignedPage} of {totalAssignedPages}
            </span>
            <button
              onClick={() => setCurrentAssignedPage((p) => Math.min(p + 1, totalAssignedPages))}
              disabled={currentAssignedPage === totalAssignedPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Next
            </button>
          </div>
        </div>

        {/* Citizen Reviews Carousel */}
        {/*<div className="relative">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Citizen Reviews
          </h3>

          <div className="flex justify-center gap-6 overflow-hidden">
            {reviewSubset.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-2 w-80 hover:shadow-2xl transition"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-2xl text-gray-700">{r.citizen}</p>
                  <div className="flex gap-1">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <span key={i} className="text-3xl text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>

          
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalReviewPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentReviewPage(index)}
                className={`w-3 h-3 rounded-full ${
                  currentReviewPage === index ? "bg-orange-600" : "bg-gray-400"
                }`}
              ></button>
            ))}
          </div>
        </div>*/}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 bg-white shadow-inner text-gray-600 text-sm">
        © {new Date().getFullYear()} TattleTent. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminDashboard;
