import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiLayers, FiUsers, FiCheckCircle, FiActivity, FiArrowUp, 
  FiTrash, FiTrendingUp, FiCpu, FiUserCheck, FiClock, FiAlertTriangle 
} from "react-icons/fi";
import AppLayout from "./AppLayout";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import axios from "axios";
import { API_BASE_URL } from "../../lib/api";
import { useAuthSession } from "../../hooks/useAuthSession";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userId } = useAuthSession();
  const [counts, setCounts] = useState({ resolved: 0, pending: 0, in_progress: 0 });

  // Complaints states
  const [complaints, setComplaints] = useState([]);
  const [assignedComplaints, setAssignedComplaints] = useState([]);

  // Selected complaint for audit log and history breakdown
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);

  // Pagination states
  const [currentNewPage, setCurrentNewPage] = useState(1);
  const [currentAssignedPage, setCurrentAssignedPage] = useState(1);
  const complaintsPerPage = 10;

  const fetchCounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/complaints/counts`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCounts(data);
      }
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  const fetchComplaintsByUser = async () => {
    try {
      if (!userId) return;
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

  const fetchAssignedComplaints = async () => {
    try {
      if (!userId) return;
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
    if (userId) {
      fetchCounts();
      fetchComplaintsByUser();
      fetchAssignedComplaints();
    }
  }, [userId]);

  // Pagination bounds
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

  const handleAssignClick = (complaint) => {
    navigate("/assign-staff", { state: { complaint } });
  };

  const handleForceEscalate = async (complaintId) => {
    const reason = prompt("Enter a reason/note for forcing SLA escalation:") || "";
    if (reason === "") return;
    
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
      alert(err.response?.data?.message || "Failed to force escalation.");
    }
  };

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
      alert(err.response?.data?.message || "Failed to delete complaint.");
    }
  };

  const getPriorityBadge = (level) => {
    switch (level) {
      case "Critical":
        return "danger";
      case "High":
        return "warning";
      case "Medium":
        return "primary";
      case "Low":
      default:
        return "default";
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-50 text-red-700 border border-red-100 font-extrabold";
      case "High":
        return "bg-orange-50 text-orange-700 border border-orange-100 font-bold";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border border-yellow-100";
      case "Low":
      default:
        return "bg-blue-50 text-blue-700 border border-blue-100";
    }
  };

  // Modern Chart trend data (actual status counts)
  const chartData = useMemo(() => {
    return [
      { name: "Pending", count: counts.pending || 0 },
      { name: "In Progress", count: counts.in_progress || 0 },
      { name: "Resolved", count: counts.resolved || 0 },
    ];
  }, [counts]);

  return (
    <AppLayout requiredRole="Admin">
      <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8 mt-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Executive Console
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Oversee city-wide grievances, audit algorithmic priority routing, and manage staff personnel.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate("/heatmap")}>
              🛰️ Hotspot Map
            </Button>
            <Button onClick={() => navigate("/invite-staff")}>
              <FiUsers className="mr-2" /> Invite Personnel
            </Button>
          </div>
        </div>

        {/* Dashboard Executive Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card variant="glass" className="bg-[#fcfcff] border border-primary-100">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-bold text-slate-550 uppercase tracking-widest">Total Grievances</p>
                <p className="text-4xl font-black text-slate-800 mt-1">
                  {(parseInt(counts.resolved, 10) || 0) + (parseInt(counts.in_progress, 10) || 0) + (parseInt(counts.pending, 10) || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center text-xl shadow-sm border border-primary-200/20">
                🏢
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="bg-[#fcfcff] border border-emerald-100">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-bold text-slate-550 uppercase tracking-widest">Resolved Active</p>
                <p className="text-4xl font-black text-emerald-600 mt-1">{counts.resolved}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shadow-sm border border-emerald-200/20">
                ✅
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="bg-[#fcfcff] border border-amber-100">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-bold text-slate-550 uppercase tracking-widest">Pending SLA</p>
                <p className="text-4xl font-black text-amber-600 mt-1">{counts.pending}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl shadow-sm border border-amber-200/20">
                ⏳
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <Card variant="default">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Grievance Status Overview</h3>
                <p className="text-xs text-slate-400 font-semibold">Real-time breakdown of issues in the system</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Live Data
              </span>
            </div>
            <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-4">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => {
                      let color = "#8b5cf6"; // Pending: Violet
                      if (entry.name === "In Progress") color = "#f59e0b"; // In Progress: Amber
                      if (entry.name === "Resolved") color = "#10b981"; // Resolved: Emerald
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* New Complaints Table Section */}
        <Card variant="default">
          <CardContent className="p-0">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                New Unassigned Complaints Queue
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50/50">
                  <tr>
                    {["ID", "Category", "Priority Score", "Assignment Mode", "Location", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-2 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedNewComplaints.length > 0 ? (
                    paginatedNewComplaints.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-6 py-2 font-bold text-slate-700">
                          #{c.id}
                          {c.is_duplicate && (
                            <span className="block text-[9px] text-danger-700 bg-danger-50 border border-danger-100 rounded px-1.5 py-0.5 mt-1 font-bold w-max animate-pulse">
                              Duplicate
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-2 font-bold text-slate-650">
                          {c.category}
                          <span className={`block text-[9px] rounded px-1.5 py-0.5 mt-1 font-bold w-max ${getSeverityBadge(c.severity)}`}>
                            {c.severity || "Low"} Severity
                          </span>
                        </td>
                        <td className="px-6 py-2">
                          <Badge variant={getPriorityBadge(c.priority_level)}>
                            {c.priority_level} ({c.priority_score || 0})
                          </Badge>
                        </td>
                        <td className="px-6 py-2 text-[10px] font-bold text-slate-550">
                          {c.assignedTo ? (
                            c.is_auto_assigned ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                <FiCpu /> AI-Auto
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                                <FiUserCheck /> Override
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-450 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                <FiClock /> Unrouted
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-2 text-slate-500 font-bold">{c.location}</td>
                        <td className="px-6 py-2">
                          <div className="flex flex-wrap gap-2 justify-end">
                            <Button size="sm" variant="primary" onClick={() => handleAssignClick(c)}>
                              Assign
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setSelectedBreakdown(c)}>
                              Audit
                            </Button>
                            <Button size="sm" variant="accent" onClick={() => handleForceEscalate(c.id)}>
                              Escalate
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleDeleteComplaint(c.id)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400 italic font-medium">
                        No new unassigned complaints found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalNewPages > 1 && (
              <div className="p-4 border-t border-slate-50 flex justify-center items-center gap-4 text-xs font-semibold">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentNewPage((p) => Math.max(p - 1, 1))}
                  disabled={currentNewPage === 1}
                >
                  Prev
                </Button>
                <span className="font-bold text-slate-600">
                  Page {currentNewPage} of {totalNewPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentNewPage((p) => Math.min(p + 1, totalNewPages))}
                  disabled={currentNewPage === totalNewPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Complaints Table Section */}
        <Card variant="default">
          <CardContent className="p-0">
            <div className="p-6 border-b border-slate-100 bg-slate-50/20">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                📂 Assigned Complaints In Progress Queue
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50/50">
                  <tr>
                    {["ID", "Category", "Priority Score", "Assignment Mode", "Location", "Assigned Contractor", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-2 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedAssignedComplaints.length > 0 ? (
                    paginatedAssignedComplaints.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-6 py-2 font-bold text-slate-700">
                          #{c.id}
                          {c.is_duplicate && (
                            <span className="block text-[9px] text-danger-700 bg-danger-50 border border-danger-100 rounded px-1.5 py-0.5 mt-1 font-bold w-max animate-pulse">
                              Duplicate
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-2 font-bold text-slate-650">
                          {c.category}
                          <span className={`block text-[9px] rounded px-1.5 py-0.5 mt-1 font-bold w-max ${getSeverityBadge(c.severity)}`}>
                            {c.severity || "Low"} Severity
                          </span>
                        </td>
                        <td className="px-6 py-2">
                          <Badge variant={getPriorityBadge(c.priority_level)}>
                            {c.priority_level} ({c.priority_score || 0})
                          </Badge>
                        </td>
                        <td className="px-6 py-2 text-[10px] font-bold text-slate-550">
                          {c.assignedTo ? (
                            c.is_auto_assigned ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                <FiCpu /> AI-Auto
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                                <FiUserCheck /> Override
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-450 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                              <FiClock /> Unrouted
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-2 text-slate-500 font-bold">{c.location}</td>
                        <td className="px-6 py-2 font-bold text-slate-600 font-mono text-xs">{c.assignedTo}</td>
                        <td className="px-6 py-2">
                          <div className="flex flex-wrap gap-2 justify-end">
                            <Button size="sm" variant="primary" onClick={() => handleAssignClick(c)}>
                              Reassign
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setSelectedBreakdown(c)}>
                              Audit
                            </Button>
                            <Button size="sm" variant="accent" onClick={() => handleForceEscalate(c.id)}>
                              Escalate
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleDeleteComplaint(c.id)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400 italic font-medium">
                        No assigned complaints found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalAssignedPages > 1 && (
              <div className="p-4 border-t border-slate-50 flex justify-center items-center gap-4 text-xs font-semibold">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentAssignedPage((p) => Math.max(p - 1, 1))}
                  disabled={currentAssignedPage === 1}
                >
                  Prev
                </Button>
                <span className="font-bold text-slate-600">
                  Page {currentAssignedPage} of {totalAssignedPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentAssignedPage((p) => Math.min(p + 1, totalAssignedPages))}
                  disabled={currentAssignedPage === totalAssignedPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* 📊 Detailed Audit Logs & Priority Breakdown Modal */}
      <AnimatePresence>
        {selectedBreakdown && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBreakdown(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-3xl overflow-y-auto max-h-[90vh] p-8 shadow-strong relative space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition text-lg"
                onClick={() => setSelectedBreakdown(null)}
              >
                ✕
              </button>

              <div className="border-b pb-4">
                <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Civic Intelligence Audit</span>
                <h2 className="text-2xl font-black text-slate-800 mt-1">Complaint #{selectedBreakdown.id} Details</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Category Area: {selectedBreakdown.category} | Address: {selectedBreakdown.location}
                </p>
              </div>

              {/* AI Recommendation Justification */}
              {selectedBreakdown.recommendation_explanation && (
                <div className="bg-primary-50/30 border border-primary-100 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FiCpu /> Auto-Assignment Intelligence Reason
                  </span>
                  <p className="text-slate-700 italic text-xs mt-1.5 leading-relaxed bg-white p-3 rounded-xl border border-primary-100/50">
                    "{selectedBreakdown.recommendation_explanation}"
                  </p>
                </div>
              )}

              {/* Score Breakdown Section */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center border-b pb-1">
                  <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase tracking-wider text-[11px]">Priority score weights breakdown</h4>
                  <Badge variant={getPriorityBadge(selectedBreakdown.priority_level)}>
                    {selectedBreakdown.priority_level} ({selectedBreakdown.priority_score || 0} / 100)
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {[
                    { label: "Severity Level", score: selectedBreakdown.priority_breakdown?.severity || 0, max: 40 },
                    { label: "Duplicate Count", score: selectedBreakdown.priority_breakdown?.duplicates || 0, max: 20 },
                    { label: "Escalations", score: selectedBreakdown.priority_breakdown?.escalations || 0, max: 20 },
                    { label: "Critical Location", score: selectedBreakdown.priority_breakdown?.location || 0, max: 10 },
                    { label: "Days Pending", score: selectedBreakdown.priority_breakdown?.age || 0, max: 10 }
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50/55 border border-slate-200/60 rounded-xl p-3 text-center">
                      <span className="text-[10px] text-slate-450 block truncate font-bold leading-none">{item.label}</span>
                      <span className="text-lg font-black text-slate-750 block mt-2">{item.score} <span className="text-[10px] text-slate-400 font-normal">/{item.max}</span></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignment Override Audit Log History */}
              <div className="space-y-3.5">
                <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase tracking-wider text-[11px] border-b pb-1 flex items-center gap-2">
                  📜 Administrative Assignment History Log
                </h4>
                <div className="border border-slate-250/70 rounded-2xl overflow-hidden bg-slate-50/50 max-h-[220px] overflow-y-auto">
                  {selectedBreakdown.assignment_history && selectedBreakdown.assignment_history.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {selectedBreakdown.assignment_history.map((log, index) => (
                        <div key={index} className="p-4 space-y-1 bg-white">
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                            <span>Admin: {log.admin_name || "System"}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-1">
                            Reassigned from <span className="font-bold font-mono text-[10px]">{log.old_staff_name || "Unassigned"}</span> to <span className="font-bold font-mono text-[10px] text-primary-500">{log.new_staff_name || "Unassigned"}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 inline-block w-full mt-1.5">
                            💬 <strong>Reason:</strong> "{log.reason || "No reason provided."}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="p-6 text-center text-slate-400 italic text-xs">
                      No manual reassignments logged. Operating under deterministic AI auto-assignment.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-50">
                <Button
                  onClick={() => setSelectedBreakdown(null)}
                  className="px-8"
                >
                  Close Audit Log
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default AdminDashboard;
