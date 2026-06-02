import { useState, useEffect } from "react";
import React from "react";
import Logo from "./Logo";
import AppButton from "./app-button";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../../lib/api";
import ChatbotWidget from "./ChatbotWidget";

const CitizenDashboard = () => {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate(); 
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const [counts, setCounts] = useState({ resolved: 0, pending: 0, in_progress: 0 });

  const demoComplaints = [
    { id: 1, category: "Water Leak", status: "Submitted", description: "Leak near Tent #5, pipe burst", date: "2025-10-02" },
    { id: 2, category: "Pathway Damage", status: "Resolved", description: "Broken tiles in Sector C repaired", date: "2025-09-28" },
    { id: 3, category: "Garbage", status: "In Progress", description: "Overflowing bin near park", date: "2025-10-01" }
  ];

  const handleDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setIsViewOpen(true);
  };

  const fetchComplaintsByUser = async () => {
    try {
      if (!user?.user_id) return;

      const queryParams = new URLSearchParams({ user_id: user.user_id }).toString();
      const response = await fetch(`${API_BASE_URL}/api/complaints/search?${queryParams}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Failed to fetch complaints");

      const data = await response.json();
      setComplaints(data.map(c => ({
        id: c.complaint_id,
        category: c.category,
        status: c.status,
        description: c.description,
        location: c.location,
        priority: c.priority,
        title: c.title,
        photo: c.photo,
        assignedTo: c.assigned_to,
        subdate: new Date(c.submitted_at).toLocaleDateString(),
        update: new Date(c.updated_at).toLocaleDateString(), 
        severity: c.severity, 
        is_duplicate: c.is_duplicate, 
        duplicate_of: c.duplicate_of, 
        escalation_explanation: c.escalation_explanation
      })));

    } catch (err) {
      console.error("Error fetching complaints:", err);
      setComplaints(demoComplaints);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchComplaintsByUser();
    }
  }, [user?.user_id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "RESOLVED_PENDING":
        return "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "NEW":
      default:
        return "bg-red-100 text-red-800";
    }
  };
  
  const fetchCounts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints/counts`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCounts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmFix = async (complaint) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints/status/${complaint.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "RESOLVED" })
      });
      if (!res.ok) throw new Error("Failed to confirm fix");
      alert("Resolution confirmed! Thank you for your feedback.");
      fetchComplaintsByUser();
      fetchCounts();
    } catch (err) {
      console.error("Failed to confirm resolution:", err);
      alert("Failed to confirm resolution.");
    }
  };

  const handleRejectFix = async (complaint) => {
    const reason = prompt("Enter a brief reason/feedback for rejecting the contractor's fix:") || "";
    if (reason === "") return;
    const token = sessionStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints/status/${complaint.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "IN_PROGRESS" })
      });
      if (!res.ok) throw new Error("Failed to reject fix");
      alert("Resolution rejected. The complaint has been returned to the contractor's active queue.");
      fetchComplaintsByUser();
      fetchCounts();
    } catch (err) {
      console.error("Failed to reject resolution:", err);
      alert("Failed to reject resolution.");
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);
  

  const handleNewComplaint = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token || !user) {
        alert("You must be logged in to submit a complaint.");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData(e.target);
      formData.append("user_id", user.user_id);

      let lat = null, lon = null;

      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = parseFloat(position.coords.latitude);
          lon = parseFloat(position.coords.longitude);

          formData.append("latitude", lat);
          formData.append("longitude", lon);
        } catch (geoErr) {
          console.warn("Geolocation permission denied or timed out:", geoErr.message);
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/complaints`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        alert("Complaint submitted successfully!");
        e.target.reset();
        setIsSubmitOpen(false);
        fetchComplaintsByUser();
        fetchCounts();
      } else {
        const errorData = await response.json();
        alert(errorData?.message || "Failed to submit complaint.");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to submit complaint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/"); 
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userSession = sessionStorage.getItem("user");
    
    if (!token || !userSession) {
      navigate("/"); 
      return;
    } 
    
    if (userSession && JSON.parse(userSession).role !== "Citizen") {
      navigate("/"); 
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#FCF5EE] font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="flex items-center justify-between h-24 px-6 sm:px-8">
          <Logo />
          <button
            className="sm:hidden p-2 rounded-md bg-gray-100 hover:bg-gray-200"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FaBars size={22} className="text-gray-800" />
          </button>
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold text-gray-800">Citizen</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2 transition duration-200"
            >
              <span className="text-xl">Logout</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="flex flex-col items-center gap-3 pb-4 sm:hidden bg-white shadow-md border-t">
            <div className="text-center">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold text-gray-800">Citizen</p>
            </div>
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-11/12 rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-4 py-2 transition duration-200"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main */}
      <main className="container mx-auto px-4 py-12 space-y-12 max-w-6xl pt-32">
        <div className="space-y-5 py-10 font-serif">
          <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-orange-700 via-amber-600 to-yellow-500 bg-clip-text text-transparent leading-tight tracking-tight">
            👋 Welcome, {user?.name}!
          </h1>
          <p className="text-2xl text-gray-700 mt-4 italic">
            Your portal for transparency and action in local governance.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
            Effortlessly submit new complaints, track their status, and see how your feedback is improving our community.
          </p>
        </div>

        <hr className="border-gray-200" /> 
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { title: "Total Complaints", count: (parseInt(counts.resolved, 10) || 0) + (parseInt(counts.in_progress, 10) || 0) + (parseInt(counts.pending, 10) || 0) },
            { title: "Resolved", count: counts.resolved },
            { title: "In Progress", count: counts.in_progress },
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

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"> 
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              ⚡ Quick Actions
            </h2>
            <button
              onClick={() => setIsSubmitOpen(true)}
              className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2 whitespace-nowrap text-base font-semibold transition duration-200"
            >
              + New Complaint
            </button>
          </div>
          <p className="text-gray-500 mb-6 text-lg">Common complaint categories</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🚧", label: "Pathway Damage" },
              { icon: "💧", label: "Water Leak" },
              { icon: "🗑️", label: "Garbage" },
              { icon: "⚡", label: "Electrical" },
            ].map((cat) => (
              <button
                key={cat.label}
                onClick={() => setIsSubmitOpen(true)}
                className="h-28 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all shadow-sm"
              >
                <span className="text-4xl">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Complaints List */}
        <div className="bg-[#fdf7e8] rounded-2xl shadow-inner-soft p-8 border border-gray-300 border-l-4 border-l-red-400"> 
          <h2 className="text-2xl font-bold mb-6 text-gray-900 font-mono">📋 Your Complaint History</h2> 
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="min-w-full divide-y divide-blue-200">
                <thead className="bg-white sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Category</th> 
                    <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Status</th>
                    <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Title</th>
                    <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Date</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-200 bg-white">
                  {complaints.length > 0 ? (
                    complaints.filter(c => c.status === "NEW" || c.status === "IN_PROGRESS" || c.status === "RESOLVED_PENDING").map(c => (
                      <tr key={c.id} className="hover:bg-blue-50 transition">
                        <td className="p-4 text-gray-900 font-medium font-mono">{c.category}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(c.status)}`}>
                            {c.status === "RESOLVED_PENDING" ? "Verification Pending" : c.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-900 font-medium font-mono">{c.title}</td>
                        <td className="p-4 text-gray-900 font-medium font-mono">{c.subdate}</td>
                        <td className="p-4 text-right text-gray-600 text-sm font-mono flex items-center gap-2 justify-end">
                          {c.status === "RESOLVED_PENDING" && (
                            <div className="flex gap-2 mr-2">
                              <button
                                className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                                onClick={() => handleConfirmFix(c)}
                              >
                                Confirm Fix
                              </button>
                              <button
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                                onClick={() => handleRejectFix(c)}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium font-mono" 
                            onClick={()=>(handleDetails(c))}>
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-4 text-gray-500">
                        No active complaints found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Resolved Complaints Section */}
        {complaints.some(c => c.status === "RESOLVED" && !c.is_duplicate) && (
          <div className="bg-[#e6f6ed] rounded-2xl shadow-inner-soft p-8 border border-gray-300 border-l-4 border-l-green-400">
            <h2 className="text-2xl font-bold mb-6 text-green-800 font-mono">✅ Resolved Complaints</h2>
            <div className="overflow-hidden rounded-lg border border-gray-300">
              <div className="max-h-[300px] overflow-y-auto">
                <table className="min-w-full divide-y divide-blue-200">
                  <thead className="bg-white sticky top-0 z-10">
                    <tr>
                      <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Category</th>
                      <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Title</th>
                      <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Date</th>
                      <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Details</th>
                      <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-200 bg-white">
                    {complaints.filter(c => c.status === "RESOLVED" && !c.is_duplicate).map(c => (
                      <tr key={c.id} className="hover:bg-blue-50 transition">
                        <td className="p-4 text-gray-900 font-medium font-mono">{c.category}</td>
                        <td className="p-4 text-gray-900 font-medium font-mono">{c.title}</td>
                        <td className="p-4 text-gray-900 font-medium font-mono">{c.subdate}</td>
                        <td className="p-4 text-gray-600 text-sm font-mono">
                          <button
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium font-mono"
                            onClick={() => handleDetails(c)}
                          >
                            View Details
                          </button>
                        </td>
                        <td>
                          <button
                            className="px-3 py-1 rounded-full bg-green-600 text-white text-sm hover:bg-green-700 transition"
                            onClick={() => navigate("/feedback-page", { state: { complaint: c } })}
                          >
                            Give Feedback
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Merged & Duplicate Reports Section */}
        {complaints.some(c => c.status === "DUPLICATE" || c.is_duplicate) && (
          <div className="bg-[#f3effa] rounded-2xl shadow-inner-soft p-8 border border-gray-300 border-l-4 border-l-purple-400">
            <h2 className="text-2xl font-bold mb-6 text-purple-800 font-mono">🔗 Merged & Duplicate Reports</h2>
            <div className="overflow-hidden rounded-lg border border-gray-300">
              <div className="max-h-[300px] overflow-y-auto">
                <table className="min-w-full divide-y divide-blue-200">
                  <thead className="bg-white sticky top-0 z-10">
                    <tr>
                      <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Category</th>
                      <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Title</th>
                      <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Date</th>
                      <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Status</th>
                      <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-200 bg-white">
                    {complaints.filter(c => c.status === "DUPLICATE" || c.is_duplicate).map(c => (
                      <tr key={c.id} className="hover:bg-blue-50 transition">
                        <td className="p-4 text-gray-900 font-medium font-mono">{c.category}</td>
                        <td className="p-4 text-gray-900 font-medium font-mono">{c.title}</td>
                        <td className="p-4 text-gray-900 font-medium font-mono">{c.subdate}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                            Merged
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 text-sm font-mono">
                          <button
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium font-mono"
                            onClick={() => handleDetails(c)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Submit Modal */}
      {isSubmitOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsSubmitOpen(false)}
        >
          <div className="overflow-hidden bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-orange-600 mb-6 border-b pb-2">Submit New Complaint</h3>
            <form onSubmit={handleNewComplaint} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Complaint Category *</label>
                <select
                  name="category"
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition shadow-inner bg-white"
                >
                  <option value="">Select Category</option>
                  <option>Electrical</option>
                  <option>Water Leak</option>
                  <option>Pathway Damage</option>
                  <option>Garbage</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Title *</label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Short summary of issue"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Location / Address *</label>
                <input
                  name="location"
                  type="text"
                  required
                  placeholder="e.g., Sector C near school"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Detailed Description *</label>
                <textarea
                  name="description"
                  required
                  placeholder="Details of the issue..."
                  rows={3}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition shadow-inner resize-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Upload Photo (optional)</label>
                <input
                  name="photo"
                  type="file"
                  accept="image/*"
                  className="w-full text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setIsSubmitOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewOpen && selectedComplaint && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setIsViewOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] relative overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setIsViewOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold text-orange-600 mb-4">
              Complaint #{selectedComplaint.id}: {selectedComplaint.category}
            </h2>

            <div className="space-y-3">
              {selectedComplaint.is_duplicate && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-800 text-sm font-medium flex flex-col gap-1 mb-4">
                  <div className="flex items-center gap-2 font-bold">
                    <span>⚠️ Duplicate (Merged)</span>
                  </div>
                  <span>This issue has already been reported and is currently active. Your report has been merged to help prioritize it.</span>
                </div>
              )}
              {selectedComplaint.escalation_explanation && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium mb-4">
                  🔥 <strong>SLA Escalation:</strong> {selectedComplaint.escalation_explanation}
                </div>
              )}
              <p><strong>Title:</strong> {selectedComplaint.title}</p>
              <p><strong>Description:</strong> {selectedComplaint.description}</p>
              <p><strong>Location:</strong> {selectedComplaint.location}</p>
              <p><strong>Status:</strong> {selectedComplaint.is_duplicate ? "Duplicate (Merged)" : (selectedComplaint.status === "RESOLVED_PENDING" ? "Verification Pending" : selectedComplaint.status)}</p>
              <p><strong>Priority:</strong> {selectedComplaint.priority}</p>
              <p>
                <strong>Severity:</strong>{" "}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  selectedComplaint.severity === "High"
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : selectedComplaint.severity === "Medium"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}>
                  {selectedComplaint.severity || "Low"}
                </span>
              </p>
              <p><strong>Assigned To:</strong> {selectedComplaint.assignedTo || "Unassigned"}</p>
              <p><strong>Submit Date:</strong> {selectedComplaint.subdate}</p>
              <p><strong>Last Update:</strong> {selectedComplaint.update}</p>
            </div>

            {selectedComplaint.photo && (
              <div className="mt-6 flex justify-center">
                <img
                  src={`${API_BASE_URL}${selectedComplaint.photo}`}
                  alt="Complaint"
                  className="max-w-full max-h-[400px] rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <ChatbotWidget />
      <footer className="text-center py-4 bg-white shadow-inner text-gray-600 text-sm">
        © {new Date().getFullYear()} TattleTent. All rights reserved.
      </footer>
    </div>
  );
};

export default CitizenDashboard;
