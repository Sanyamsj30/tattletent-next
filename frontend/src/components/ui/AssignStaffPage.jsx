import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import AppLayout from "./AppLayout";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import axios from "axios";
import { API_BASE_URL } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { FiCpu, FiUser, FiBarChart2, FiArrowLeft, FiActivity, FiStar, FiMail, FiMap } from "react-icons/fi";
import { useAuthSession } from "../../hooks/useAuthSession";

const AssignStaffPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userId } = useAuthSession();

  const { complaint } = location.state || {};
  
  const complaintId = complaint?.id || complaint?.complaint_id || complaint?._id;

  // Safe redirect hook
  useEffect(() => {
    if (!complaintId) {
      navigate("/admin-dashboard");
    }
  }, [complaintId, navigate]);

  const [staffList, setstaffList] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("Low");
  const [staffToAssign, setStaffToAssign] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const fetchRecommendation = async () => {
    if (!complaintId) return;
    try {
      setRecLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/ai/recommendation/${complaintId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (res.data?.success) {
        setRecommendation(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch recommendation:", err);
    } finally {
      setRecLoading(false);
    }
  };

  const handleAssign = async (staffId) => {
    const reason = prompt("Enter a brief reason/note for this override assignment:") || "";
    const token = sessionStorage.getItem("token");
    try {
      // 1. Reassign vendor (override)
      await axios.put(`${API_BASE_URL}/api/complaints/reassign/${complaintId}`, {
        staffId,
        reason,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Update priority if it's different or requested
      if (selectedPriority) {
        await axios.put(`${API_BASE_URL}/api/complaints/priority/${complaintId}`, {
          priority: selectedPriority,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      navigate("/admin-dashboard");
    } catch (err) {
      console.error("Manual assignment failed:", err);
      alert("Failed to assign staff: " + (err.response?.data?.message || err.message));
    }
  };

  const fetchStaff = async () => {
    try {
      if (!userId) return;
      const queryParams = new URLSearchParams({ role: "Staff" }).toString();
      const response = await fetch(`${API_BASE_URL}/api/users/search?${queryParams}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch staff");
      const data = await response.json();
      setstaffList(data.map(c => ({
        id: c.user_id,
        name: c.name,
        email: c.email,
        role: c.role,
        assignedWards: c.assignedWards || [],
        activeComplaints: c.activeComplaints || 0,
        resolvedComplaints: c.resolvedComplaints || 0,
        avgResolutionTime: c.avgResolutionTime || 0,
        performanceScore: c.performanceScore || 100,
        slaComplianceRate: c.slaComplianceRate || 100,
        citizenRating: c.citizenRating || 5,
        availabilityStatus: c.availabilityStatus || 'Available'
      })));
    } catch (err) {
      console.error("Error fetching staff:", err);
      setstaffList([]);
    }
  };

  useEffect(() => {
    if (userId && complaintId) {
      fetchStaff();
      fetchRecommendation();
    }
  }, [userId, complaintId]);

  if (!complaintId) return null;

  const fetchStaffPerformance = async (staff) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/complaints/search?staff_id=${staff.id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      const data = response.data;
      if (!Array.isArray(data)) {
        console.error("Unexpected data format:", data);
        return;
      }
      const resolvedCount = data.filter((c) => c.status === "RESOLVED").length;
      const inProgressCount = data.filter((c) => c.status === "IN_PROGRESS").length;
      const pendingCount = data.filter((c) => c.status === "NEW").length;

      setSelectedStaff({
        ...staff,
        performance: {
          Resolved: resolvedCount,
          "In Progress": inProgressCount,
          Pending: pendingCount,
        },
      });
    } catch (err) {
      console.error("Error fetching performance:", err);
    }
  };

  return (
    <AppLayout requiredRole="Admin">
      <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6 mt-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Routing override panel
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Review algorithmic suggestion profiles or manually target vendor assignment for complaint <strong className="text-slate-800">#{complaintId}</strong>.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/admin-dashboard")} className="gap-2">
            <FiArrowLeft /> Back to Overview
          </Button>
        </div>

        {/* Selected Complaint Target summary */}
        <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Active Target Grievance</span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">Complaint #{complaintId}: {complaint.category}</h2>
              </div>
              <Badge variant="outline" className="text-indigo-300 border-indigo-500/30 font-bold uppercase">
                Location: {complaint.location}
              </Badge>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">Narration & Description:</span>
              <p className="text-sm text-slate-300 leading-relaxed max-w-4xl italic">
                "{complaint.description || "No description provided."}"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI smart recommendation block */}
        {recLoading && (
          <div className="p-6 bg-primary-50/50 border border-primary-100 rounded-3xl flex items-center justify-center gap-3 animate-pulse shadow-sm">
            <span className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></span>
            <p className="text-primary-800 font-bold text-xs tracking-wide">
              🤖 TattleTent Intelligent routing algorithm is auditing ward maps and performance metrics...
            </p>
          </div>
        )}

        {!recLoading && recommendation?.topChoice && (
          <div className="bg-gradient-to-r from-primary-500 via-indigo-500 to-violet-500 rounded-3xl p-0.5 shadow-xl">
            <div className="bg-white rounded-[22px] p-6 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-500 text-white flex items-center justify-center text-xl shadow-md">
                    <FiCpu />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider font-mono">TattleTent AI Recommendation</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight mt-0.5">{recommendation.topChoice.name}</h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Suitability Rating</span>
                    <span className="text-2xl font-black text-primary-500">{recommendation.topChoice.score} <span className="text-xs text-slate-400 font-normal">/100</span></span>
                  </div>
                  <Button
                    onClick={() => {
                      setStaffToAssign(staffList.find(s => s.id === recommendation.topChoice.staffId) || { id: recommendation.topChoice.staffId, name: recommendation.topChoice.name });
                      setPriorityModalOpen(true);
                    }}
                    variant="primary"
                    size="sm"
                    className="shadow-md hover:scale-102 transition"
                  >
                    Quick Route
                  </Button>
                </div>
              </div>

              {/* Justification explanation */}
              <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl">
                <p className="text-slate-650 italic text-xs leading-relaxed">
                  💡 <strong>AI Justification Reason:</strong> "{recommendation.aiJustification}"
                </p>
              </div>

              {/* Match suit metric sub-grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-2">
                {[
                  { label: "Contractor Status", val: recommendation.topChoice.availabilityStatus, color: recommendation.topChoice.availabilityStatus === "Available" ? "text-emerald-600" : "text-amber-500" },
                  { label: "Active Workload", val: `${recommendation.topChoice.activeComplaints} Active` },
                  { label: "SLA Adherence Rate", val: `${recommendation.topChoice.slaComplianceRate}%` },
                  { label: "Citizen Rating", val: `⭐ ${recommendation.topChoice.citizenRating}/5` },
                  { label: "AI Audit Score", val: `${recommendation.topChoice.performanceScore || 100}/100` },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-200/40 p-3 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 block font-bold tracking-wider uppercase">{stat.label}</span>
                    <span className={`text-xs font-black block mt-1.5 ${stat.color || "text-slate-800"}`}>{stat.val}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* All Available Personnel list */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Available Contractor Directory</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.length > 0 ? (
              staffList.map((s) => (
                <Card key={s.id} className="border border-slate-100 hover:shadow-xl transition duration-300 flex flex-col justify-between overflow-hidden">
                  <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center font-bold text-sm">
                            {s.name[0]}
                          </div>
                          <h4 className="font-bold text-slate-800 truncate" title={s.name}>{s.name}</h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                          s.availabilityStatus === "Available"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : s.availabilityStatus === "Busy"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                          {s.availabilityStatus}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <FiMail /> {s.email}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-500 font-semibold font-mono bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                        <div className="flex items-center gap-1"><FiStar className="text-amber-400" /> {s.citizenRating || 5}/5 Rating</div>
                        <div className="flex items-center gap-1"><FiActivity className="text-indigo-400" /> {s.slaComplianceRate || 100}% SLA</div>
                        <div className="flex items-center gap-1">💼 {s.activeComplaints || 0} active</div>
                        <div className="flex items-center gap-1">🏁 {s.resolvedComplaints || 0} solved</div>
                      </div>

                      <div className="mt-3 text-[10px] text-slate-450 flex items-center gap-1 font-semibold">
                        <FiMap className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">Wards: {s.assignedWards?.join(", ") || "None"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-5">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setStaffToAssign(s);
                            setSelectedPriority(complaint.priority_level || "Medium");
                            setPriorityModalOpen(true);
                          }}
                          className="flex-1 py-2 text-xs rounded-lg"
                        >
                          Route With Setup
                        </Button>

                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to instantly assign ${s.name}?`)) {
                              handleAssign(s.id);
                            }
                          }}
                          className="flex-1 py-2 text-xs rounded-lg font-bold"
                        >
                          ⚡ Instant Assign
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => fetchStaffPerformance(s)}
                        className="w-full py-1.5 text-xs rounded-lg border border-slate-200"
                      >
                        <FiBarChart2 className="mr-1" /> View Metrics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 bg-white rounded-2xl border border-dashed text-center text-slate-400 font-medium">
                No active staff personnel records found on current system.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Performance detailed dialog Modal */}
      <AnimatePresence>
        {selectedStaff && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedStaff(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-strong relative space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition text-lg"
                onClick={() => setSelectedStaff(null)}
              >
                ✕
              </button>

              <div className="border-b pb-3">
                <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Active Contractor Performance</span>
                <h3 className="text-xl font-black text-slate-800 mt-0.5">{selectedStaff.name}</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">{selectedStaff.email}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Historical Status Breakdown</h4>
                
                <div style={{ width: "100%", height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { status: "Resolved", count: selectedStaff.performance.Resolved },
                        { status: "In Progress", count: selectedStaff.performance["In Progress"] },
                        { status: "Pending", count: selectedStaff.performance.Pending },
                      ]}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="status" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" barSize={18} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-50">
                <Button
                  onClick={() => setSelectedStaff(null)}
                  className="px-6"
                  variant="secondary"
                >
                  Close Metrics
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Priority override confirmation Modal */}
      <AnimatePresence>
        {priorityModalOpen && staffToAssign && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setPriorityModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-strong relative space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition text-lg"
                onClick={() => setPriorityModalOpen(false)}
              >
                ✕
              </button>

              <div className="border-b pb-3">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Routing Override Setup</span>
                <h3 className="text-xl font-black text-slate-800 mt-0.5">Route to {staffToAssign.name}</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Define case severity override options below.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Priority Classification Tier</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                  >
                    <option value="Critical">🚨 Critical</option>
                    <option value="High">⚠️ High</option>
                    <option value="Medium">⚡ Medium</option>
                    <option value="Low">⏳ Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-50">
                <Button
                  variant="secondary"
                  onClick={() => setPriorityModalOpen(false)}
                  className="px-5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleAssign(staffToAssign.id).finally(() => {
                      setPriorityModalOpen(false);
                    });
                  }}
                  className="px-6"
                >
                  Confirm Routing
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AppLayout>
  );
};

export default AssignStaffPage;
