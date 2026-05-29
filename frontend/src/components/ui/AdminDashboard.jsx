import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../lib/api";
import { FaBars, FaTimes, FaRobot, FaUserAlt, FaArrowUp, FaHistory, FaTrash } from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [counts, setCounts] = useState({ resolved: 0, pending: 0, in_progress: 0 });

  const [menuOpen, setMenuOpen] = useState(false);

  // Complaints state
  const [complaints, setComplaints] = useState([]);
  const [assignedComplaints, setAssignedComplaints] = useState([]);

  // Selected complaint for breakdown and reassignment history modal
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);

  // Pagination states
  const [currentNewPage, setCurrentNewPage] = useState(1);
  const [currentAssignedPage, setCurrentAssignedPage] = useState(1);
  const complaintsPerPage = 5;

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/"); 
  };
    
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = sessionStorage.getItem("user");
    
    if (!token || !user) {
      navigate("/"); 
    } 
    
    if (user && !["ringmaster", "admin"].includes(String(JSON.parse(user).role || "").toLowerCase())) {
        navigate("/");
    }
  }, [navigate]);

  const fetchCounts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/complaints/counts`);
      setCounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  // Fetch complaints by status "NEW"
  const fetchComplaintsByUser = async () => {
    try {
      if (!user?.user_id) return;

      const queryParams = new URLSearchParams({ status: "NEW" }).toString();
      const response = await fetch(`${API_BASE_URL}/api/complaints/search?${queryParams}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Failed to fetch complaints");

      const data = await response.json();
      setComplaints(data.map(c => ({
        id: c.complaint_id,
        category: c.category,
        location: c.location,
        status: c.status,
        assignedTo: c.assigned_to,
        staff_id: c.staff_id, 
        severity: c.severity, 
        is_duplicate: c.is_duplicate,
        priority_score: c.priority_score,
        priority_level: c.priority_level,
        is_auto_assigned: c.is_auto_assigned,
        recommendation_explanation: c.recommendation_explanation,
        priority_breakdown: c.priority_breakdown,
        assignment_history: c.assignment_history,
        description: c.description,
      })));

    } catch (err) {
      console.error("Error fetching complaints:", err);
      setComplaints([]);
    }
  };

  useEffect(() => {
    if (user?.user_id) fetchComplaintsByUser();
  }, [user?.user_id]);

  // Fetch assigned complaints "IN_PROGRESS"
  const fetchAssignedComplaints = async () => {
    try {
      if (!user?.user_id) return;

      const queryParams = new URLSearchParams({ status: "IN_PROGRESS" }).toString();
      const response = await fetch(`${API_BASE_URL}/api/complaints/search?${queryParams}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Failed to fetch complaints");

      const data = await response.json();
      setAssignedComplaints(data.map(c => ({
        id: c.complaint_id,
        category: c.category,
        location: c.location,
        status: c.status,
        assignedTo: c.assigned_to,
        staff_id: c.staff_id, 
        severity: c.severity, 
        is_duplicate: c.is_duplicate,
        priority_score: c.priority_score,
        priority_level: c.priority_level,
        is_auto_assigned: c.is_auto_assigned,
        recommendation_explanation: c.recommendation_explanation,
        priority_breakdown: c.priority_breakdown,
        assignment_history: c.assignment_history,
        description: c.description,
      })));

    } catch (err) {
      console.error("Error fetching assigned complaints:", err);
      setAssignedComplaints([]);
    }
  };

  useEffect(() => {
    if (user?.user_id) fetchAssignedComplaints();
  }, [user?.user_id]);

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

  // Handle assign/reassign override button
  const handleAssignClick = (complaint) => {
    navigate("/assign-staff", { state: { complaint } });
  };

  // Trigger Forced Escalation API call
  const handleForceEscalate = async (complaintId) => {
    const reason = prompt("Enter a reason/note for forcing SLA escalation:") || "";
    if (reason === null) return; // cancelled
    
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/complaints/force-escalate/${complaintId}`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        alert("Complaint escalated successfully! Recalculated severity & priorities.");
        fetchComplaintsByUser();
        fetchAssignedComplaints();
        fetchCounts();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to force escalation.");
    }
  };

  // Handle Delete Complaint (soft delete)
  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm("Are you sure you want to delete this complaint? This will perform an audit-logged soft delete.")) return;
    
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/complaints/${complaintId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Complaint deleted successfully!");
      fetchComplaintsByUser();
      fetchAssignedComplaints();
      fetchCounts();
    } catch (err) {
      console.error("Error deleting complaint:", err);
      alert(err.response?.data?.message || "Failed to delete complaint.");
    }
  };

  const getPriorityBadge = (level) => {
    switch (level) {
      case "Critical":
        return "bg-red-800 text-white font-extrabold border border-red-900";
      case "High":
        return "bg-red-100 text-red-800 border border-red-200 font-semibold";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Low":
      default:
        return "bg-blue-100 text-blue-800 border border-blue-200";
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-purple-100 text-purple-800 border border-purple-200 font-extrabold";
      case "High":
        return "bg-red-100 text-red-700 border border-red-200 font-bold";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "Low":
      default:
        return "bg-blue-100 text-blue-700 border border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF5EE] font-sans flex flex-col justify-between">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full h-24 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 bg-white shadow-md z-50">
        <div className="w-full sm:w-auto flex items-center justify-between">
          <Logo />

          {/* Hamburger menu for small screens */}
          <div className="sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md focus:outline-none bg-gray-100 hover:bg-gray-200"
            >
              <FaBars size={22} className="text-gray-800" />
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
            Manage staff, audit priorities, reassign complaints, and review citizen feedback.
          </p>
        </div>

        <hr className="border-gray-200" /> 

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-bold text-gray-900">New Complaints</h3>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="min-w-full divide-y divide-blue-200">
              <thead className="bg-white">
                <tr>
                  {["ID", "Category", "Priority Score", "Assignment", "Location", "Status", "Assigned To", "Actions"].map((h) => (
                    <th key={h} className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200 bg-white">
                {paginatedNewComplaints.length > 0 ? (
                  paginatedNewComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50 transition">
                      <td className="p-4 font-bold">
                        {c.id}
                        {c.is_duplicate && (
                          <span className="block text-[10px] text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 mt-1 font-semibold w-max animate-pulse">
                            ⚠️ Duplicate
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {c.category}
                        <span className={`block text-[10px] rounded px-1.5 py-0.5 mt-1 font-semibold w-max ${getSeverityBadge(c.severity)}`}>
                          {c.severity || "Low"} Severity
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityBadge(c.priority_level)}`}>
                          {c.priority_level} ({c.priority_score || 0})
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold">
                        {c.assignedTo ? (
                          c.is_auto_assigned ? (
                            <span className="flex items-center gap-1 text-green-700 bg-green-50 p-1 rounded w-max border border-green-200">
                              <FaRobot /> Auto-Assigned
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-orange-700 bg-orange-50 p-1 rounded w-max border border-orange-200">
                              <FaUserAlt /> Override
                            </span>
                          )
                        ) : (
                          <span className="flex items-center gap-1 text-gray-500 bg-gray-50 p-1 rounded w-max border border-gray-200">
                            ⏳ Unassigned
                          </span>
                        )}
                      </td>
                      <td className="p-4">{c.location}</td>
                      <td className="p-4">{c.status === "RESOLVED_PENDING" ? "Verification Pending" : c.status}</td>
                      <td className="p-4 font-mono text-sm">{c.assignedTo || "Unassigned"}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs transition"
                            onClick={() => handleAssignClick(c)}
                          >
                            Assign / Override
                          </button>
                          <button
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs transition flex items-center gap-1"
                            onClick={() => setSelectedBreakdown(c)}
                            title="Audit Log / History"
                          >
                            <FaHistory /> Audit Details
                          </button>
                          <button
                            className="px-2 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 text-xs transition flex items-center gap-1"
                            onClick={() => handleForceEscalate(c.id)}
                            title="Force Escalation"
                          >
                            <FaArrowUp /> Escalate
                          </button>
                          <button
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs transition flex items-center gap-1"
                            onClick={() => handleDeleteComplaint(c.id)}
                            title="Delete Complaint"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center p-4 text-gray-500">
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
              Page {currentNewPage} of {totalNewPages || 1}
            </span>
            <button
              onClick={() => setCurrentNewPage((p) => Math.min(p + 1, totalNewPages))}
              disabled={currentNewPage === totalNewPages || totalNewPages === 0}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Next
            </button>
          </div>
        </div>

        {/* Assigned Complaints Table */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-bold text-gray-900">Assigned Complaints</h3>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="min-w-full divide-y divide-blue-200">
              <thead className="bg-white">
                <tr>
                  {["ID", "Category", "Priority Score", "Assignment", "Location", "Status", "Assigned To", "Actions"].map((h) => (
                    <th key={h} className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200 bg-white">
                {paginatedAssignedComplaints.length > 0 ? (
                  paginatedAssignedComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50 transition">
                      <td className="p-4 font-bold">
                        {c.id}
                        {c.is_duplicate && (
                          <span className="block text-[10px] text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 mt-1 font-semibold w-max animate-pulse">
                            ⚠️ Duplicate
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {c.category}
                        <span className={`block text-[10px] rounded px-1.5 py-0.5 mt-1 font-semibold w-max ${getSeverityBadge(c.severity)}`}>
                          {c.severity || "Low"} Severity
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityBadge(c.priority_level)}`}>
                          {c.priority_level} ({c.priority_score || 0})
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold">
                        {c.assignedTo ? (
                          c.is_auto_assigned ? (
                            <span className="flex items-center gap-1 text-green-700 bg-green-50 p-1 rounded w-max border border-green-200">
                              <FaRobot /> Auto-Assigned
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-orange-700 bg-orange-50 p-1 rounded w-max border border-orange-200">
                              <FaUserAlt /> Override
                            </span>
                          )
                        ) : (
                          <span className="flex items-center gap-1 text-gray-500 bg-gray-50 p-1 rounded w-max border border-gray-200">
                            ⏳ Unassigned
                          </span>
                        )}
                      </td>
                      <td className="p-4">{c.location}</td>
                      <td className="p-4">{c.status === "RESOLVED_PENDING" ? "Verification Pending" : c.status}</td>
                      <td className="p-4 font-mono text-sm">{c.assignedTo}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs transition"
                            onClick={() => handleAssignClick(c)}
                          >
                            Reassign / Override
                          </button>
                          <button
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs transition flex items-center gap-1"
                            onClick={() => setSelectedBreakdown(c)}
                            title="Audit Log / History"
                          >
                            <FaHistory /> Audit Details
                          </button>
                          <button
                            className="px-2 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 text-xs transition flex items-center gap-1"
                            onClick={() => handleForceEscalate(c.id)}
                            title="Force Escalation"
                          >
                            <FaArrowUp /> Escalate
                          </button>
                          <button
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs transition flex items-center gap-1"
                            onClick={() => handleDeleteComplaint(c.id)}
                            title="Delete Complaint"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center p-4 text-gray-500">
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
              Page {currentAssignedPage} of {totalAssignedPages || 1}
            </span>
            <button
              onClick={() => setCurrentAssignedPage((p) => Math.min(p + 1, totalAssignedPages))}
              disabled={currentAssignedPage === totalAssignedPages || totalAssignedPages === 0}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {/* 📊 Detailed Audit Logs & Priority Breakdown Modal */}
      {selectedBreakdown && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBreakdown(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-3xl overflow-y-auto max-h-[90vh] p-8 shadow-2xl relative space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedBreakdown(null)}
            >
              <FaTimes size={22} />
            </button>

            <div className="border-b pb-4">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest font-mono">Civic Intelligence Audit</span>
              <h2 className="text-3xl font-black text-gray-900 mt-1">Complaint #{selectedBreakdown.id} Details</h2>
              <p className="text-sm text-gray-600 mt-1"><strong>Category:</strong> {selectedBreakdown.category} | <strong>Location:</strong> {selectedBreakdown.location}</p>
            </div>

            {/* AI Recommendation Justification */}
            {selectedBreakdown.recommendation_explanation && (
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl">
                <span className="text-xs font-bold text-orange-700 uppercase tracking-wider font-mono">🤖 Auto-Assignment Reason</span>
                <p className="text-gray-800 italic text-sm mt-1 leading-relaxed">
                  "{selectedBreakdown.recommendation_explanation}"
                </p>
              </div>
            )}

            {/* Score Breakdown Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-gray-900">Priority Score Breakdown</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-extrabold ${getPriorityBadge(selectedBreakdown.priority_level)}`}>
                  {selectedBreakdown.priority_level} ({selectedBreakdown.priority_score || 0} / 100)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {[
                  { label: "Severity Level", score: selectedBreakdown.priority_breakdown?.severity || 0, max: 40 },
                  { label: "Duplicate Count", score: selectedBreakdown.priority_breakdown?.duplicates || 0, max: 20 },
                  { label: "Escalations", score: selectedBreakdown.priority_breakdown?.escalations || 0, max: 20 },
                  { label: "Critical Location", score: selectedBreakdown.priority_breakdown?.location || 0, max: 10 },
                  { label: "Days Pending", score: selectedBreakdown.priority_breakdown?.age || 0, max: 10 }
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                    <span className="text-xs text-gray-500 block truncate leading-none">{item.label}</span>
                    <span className="text-xl font-extrabold text-orange-600 block mt-2">{item.score} <span className="text-xs text-gray-400 font-normal">/{item.max}</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment Override Audit Log History */}
            <div className="space-y-3">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaHistory /> Administrative Assignment History Log
              </h4>
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 max-h-[250px] overflow-y-auto">
                {selectedBreakdown.assignment_history && selectedBreakdown.assignment_history.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {selectedBreakdown.assignment_history.map((log, index) => (
                      <div key={index} className="p-4 space-y-1 hover:bg-gray-100 transition">
                        <div className="flex justify-between text-xs text-gray-400 font-mono">
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                          <span>Admin: {log.admin_name || "System"}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800">
                          Reassigned from <span className="font-bold font-mono text-xs">{log.old_staff_name || "Unassigned"}</span> to <span className="font-bold font-mono text-xs text-orange-600">{log.new_staff_name || "Unassigned"}</span>
                        </p>
                        <p className="text-xs text-gray-500 italic bg-white p-2 rounded-lg border inline-block w-full mt-1">
                          💬 <strong>Reason:</strong> "{log.reason || "No reason provided."}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-6 text-center text-gray-500 italic text-sm">
                    No manual reassignments logged. Vendor is operating under deterministic AI auto-assignment.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                className="px-5 py-2.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-xl font-bold transition text-sm"
                onClick={() => setSelectedBreakdown(null)}
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4 bg-white shadow-inner text-gray-600 text-sm">
        © {new Date().getFullYear()} TattleTent. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminDashboard;
