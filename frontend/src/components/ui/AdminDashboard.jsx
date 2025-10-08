import React, { useState } from "react";
import Logo from "./Logo";
import { useNavigate, useLocation } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Demo data
 

  const [complaints] = useState([
    { id: 1, category: "Water Leak", location: "Tent #5", status: "Pending", assignedTo: null },
    { id: 2, category: "Garbage", location: "Central Park", status: "In Progress", assignedTo: null },
    { id: 3, category: "Electrical", location: "Sector B", status: "Pending", assignedTo: null },
    { id: 4, category: "Road Damage", location: "Tent #10", status: "Pending", assignedTo: null },
    { id: 5, category: "Street Light", location: "Sector A", status: "Resolved", assignedTo: null },
    { id: 6, category: "Overflowing Dustbin", location: "Block 9", status: "Pending", assignedTo: null },
  ]);

  const [reviews] = useState([
    { id: 1, citizen: "Alice", comment: "Great service by staff!", rating: 5 },
    { id: 2, citizen: "Bob", comment: "Complaint resolved quickly.", rating: 4 },
    { id: 3, citizen: "Charlie", comment: "Staff were helpful and polite.", rating: 5 },
    { id: 4, citizen: "David", comment: "Good work, could be faster.", rating: 3 },
    { id: 5, citizen: "Ella", comment: "Impressed with how they handled it.", rating: 5 },
  ]);

  const handleAssignClick = (complaint) => {
    navigate("/assign-staff", { state: { complaint } });
  };

  // --- Pagination Logic for Complaints ---
  const complaintsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(complaints.length / complaintsPerPage);

  const paginatedComplaints = complaints.slice(
    (currentPage - 1) * complaintsPerPage,
    currentPage * complaintsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // --- Review Carousel ---
  const [currentReviewPage, setCurrentReviewPage] = useState(0);
  const reviewsPerPage = 4;
  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);

  const reviewSubset = reviews.slice(
    currentReviewPage * reviewsPerPage,
    (currentReviewPage + 1) * reviewsPerPage
  );

  return (
    <div className="min-h-screen bg-[#FCF5EE] font-sans flex flex-col justify-between">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-8 bg-white shadow-md z-50">
        <Logo />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-semibold text-gray-800">Admin</p>
          </div>
          <button
            className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2"
            onClick={() => navigate("/")}
          >
            Logout
          </button>
          <button
            className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2"
            onClick={() => navigate("/all-complaints")}
          >
            All Complaints
          </button>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12 max-w-7xl pt-32 space-y-12 flex-grow">
        {/* Welcome Section */}
        <div className="text-center">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-orange-700 via-amber-600 to-yellow-500 bg-clip-text text-transparent leading-tight tracking-tight">
            Welcome, Admin 🛡️
          </h2>
          <p className="text-gray-700 text-lg italic">
            Manage staff, assign complaints, and review citizen feedback.
          </p>
        </div>

        {/* Complaints Table */}
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
                {paginatedComplaints.map((c) => (
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Buttons */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Prev
            </button>
            <span className="text-lg font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Next
            </button>
          </div>
        </div>

        {/* Citizen Reviews Carousel */}
        <div className="relative">
          <h3 className="text-3xl font-bold text-gray-900 mb-6 ">
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

          {/* Review Dots */}
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
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 bg-white shadow-inner text-gray-600 text-sm">
        © {new Date().getFullYear()} TattleTent. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminDashboard;
