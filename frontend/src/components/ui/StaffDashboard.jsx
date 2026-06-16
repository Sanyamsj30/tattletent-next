import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiCheckCircle, FiClock, FiActivity, FiTrendingUp, 
  FiExternalLink, FiImage, FiArrowLeft, FiArrowRight, FiSliders 
} from "react-icons/fi";
import AppLayout from "./AppLayout";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { API_BASE_URL } from "../../api/axiosInstance";
import { useAuthSession } from "../../hooks/useAuthSession";
import {
  fetchComplaintCounts,
  searchComplaints,
  updateComplaintStatus
} from "../../api/complaint.api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const StaffDashboard = () => {
  const { user: sessionUser, userId } = useAuthSession();
  const user = sessionUser || { name: "Guest" };
  const [counts, setCounts] = useState({ resolved: 0, pending: 0, in_progress: 0 });

  const [showPerformance, setShowPerformance] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [complaints, setComplaints] = useState([]);
  const [newComplaints, setNewComplaints] = useState([]);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);

  // Pagination states
  const complaintsPerPage = 3;
  const [currentNewPage, setCurrentNewPage] = useState(1);
  const [currentResolvedPage, setCurrentResolvedPage] = useState(1);

  const fetchCounts = async () => {
    try {
      const data = await fetchComplaintCounts();
      setCounts(data);
    } catch (err) {
      console.warn("Failed to fetch counts from backend");
    }
  };

  const fetchComplaintsByUser = async () => {
    try {
      if (!userId) return;
  
      const queryParams = new URLSearchParams({ staff_id: userId }).toString();
      const data = await searchComplaints(queryParams);
      setComplaints(data.map(c => ({
        id: c.complaint_id,
        category: c.category,
        status: c.status,
        description: c.description,
        location: c.location,
        priority: c.priority,
        title: c.title,
        assignedTo: c.assigned_to,
        staff_id: c.staff_id,
        photo: c.photo,
        subdate: new Date(c.submitted_at).toLocaleDateString(),
        update: new Date(c.updated_at).toLocaleDateString()
      })));
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setComplaints([]);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCounts();
      fetchComplaintsByUser();
    }
  }, [userId]);

  useEffect(() => {
    setNewComplaints(complaints.filter((c) => c.status === "IN_PROGRESS" || c.status === "RESOLVED_PENDING"));
    setResolvedComplaints(complaints.filter((c) => c.status === "RESOLVED"));
  }, [complaints]);

  const handleResolvedComplaints = (complaint) => {
    updateComplaintStatus(complaint.id, {
      status: "Resolved",
    }).then(() => {
      fetchCounts();
      fetchComplaintsByUser();
    }).catch(err => console.error(err));

    setComplaints(prevComplaints =>
      prevComplaints.map(c =>
        c.id === complaint.id ? { ...c, status: "RESOLVED_PENDING" } : c
      )
    );
  };

  const totalNewPages = Math.ceil(newComplaints.length / complaintsPerPage);
  const paginatedNewComplaints = newComplaints.slice(
    (currentNewPage - 1) * complaintsPerPage,
    currentNewPage * complaintsPerPage
  );

  const totalResolvedPages = Math.ceil(resolvedComplaints.length / complaintsPerPage);
  const paginatedResolvedComplaints = resolvedComplaints.slice(
    (currentResolvedPage - 1) * complaintsPerPage,
    currentResolvedPage * complaintsPerPage
  );

  const handleViewClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsViewOpen(true);
  };

  const performanceData = useMemo(() => {
    const resolvedCount = complaints.filter(
      (c) => c.status === "RESOLVED" && c.staff_id === userId
    ).length;

    const inProgressCount = complaints.filter(
      (c) => c.status === "IN_PROGRESS" && c.staff_id === userId
    ).length;

    return [
      { name: "Resolved", count: resolvedCount },
      { name: "In Progress", count: inProgressCount },
    ];
  }, [complaints, userId]);

  return (
    <AppLayout requiredRole="Staff">
      <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-10">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8 mt-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Workload Hub
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Review assigned municipal tasks, execute resolution hand-offs, and track performance.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowPerformance(true)}
            >
              <FiTrendingUp className="mr-2" /> Performance Chart
            </Button>
          </div>
        </div>

        {/* Dynamic Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card variant="glass" className="bg-[#fcfcff] border border-primary-100">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-bold text-slate-550 uppercase tracking-widest">Assigned Reports</p>
                <p className="text-4xl font-black text-slate-800 mt-1">
                  {(parseInt(counts.resolved, 10) || 0) + (parseInt(counts.in_progress, 10) || 0) + (parseInt(counts.pending, 10) || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center text-xl shadow-sm border border-primary-200/20">
                👷
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="bg-[#fcfcff] border border-amber-100">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-bold text-slate-550 uppercase tracking-widest">In Progress</p>
                <p className="text-4xl font-black text-amber-600 mt-1">{counts.in_progress}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl shadow-sm border border-amber-200/20">
                🔄
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="bg-[#fcfcff] border border-rose-100">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-bold text-slate-550 uppercase tracking-widest">Pending Review</p>
                <p className="text-4xl font-black text-rose-600 mt-1">{counts.pending}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl shadow-sm border border-rose-200/20">
                ⏳
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Grievances Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-l-4 border-primary-500 pl-3">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">🚨 Active Assigned Tasks</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedNewComplaints.length > 0 ? (
              paginatedNewComplaints.map((c) => (
                <Card key={c.id} className="saas-hover-lift">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {c.category}
                        </span>
                        <h4 className="text-base font-bold text-slate-800 leading-tight line-clamp-1">{c.title}</h4>
                      </div>
                      <Badge variant={c.status === "RESOLVED_PENDING" ? "warning" : "info"}>
                        {c.status === "RESOLVED_PENDING" ? "Pending Confirm" : "Active"}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <p>📍 <span className="font-semibold text-slate-650">{c.location}</span></p>
                      <p>📅 <span className="font-semibold">{c.subdate}</span></p>
                    </div>

                    <div className="flex gap-3 mt-2 border-t border-slate-50 pt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewClick(c)}
                      >
                        Open Details
                      </Button>
                      {c.status !== "RESOLVED_PENDING" && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleResolvedComplaints(c)}
                        >
                          Mark Fixed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-slate-400 italic bg-white border border-slate-200/80 rounded-3xl">
                No active complaints assigned to your queue.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalNewPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6 text-sm">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentNewPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentNewPage === 1}
              >
                <FiArrowLeft className="mr-1.5" /> Previous
              </Button>
              <span className="font-bold text-slate-600">
                Page {currentNewPage} of {totalNewPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentNewPage((prev) => (prev < totalNewPages ? prev + 1 : prev))}
                disabled={currentNewPage === totalNewPages}
              >
                Next <FiArrowRight className="ml-1.5" />
              </Button>
            </div>
          )}
        </section>

        {/* Resolved Complaints Queue */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-l-4 border-success-500 pl-3">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">✅ My Resolved Audit Queue</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedResolvedComplaints.length > 0 ? (
              paginatedResolvedComplaints.map((c) => (
                <Card key={c.id} className="saas-hover-lift border border-success-100">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] bg-success-50 text-success-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {c.category}
                        </span>
                        <h4 className="text-base font-bold text-slate-800 leading-tight line-clamp-1">{c.title}</h4>
                      </div>
                      <Badge variant="success">Resolved</Badge>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <p>📍 <span className="font-semibold text-slate-650">{c.location}</span></p>
                      <p>📅 <span className="font-semibold">{c.update}</span></p>
                    </div>

                    <div className="flex gap-3 mt-2 border-t border-slate-50 pt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewClick(c)}
                      >
                        Open Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-slate-400 italic bg-white border border-slate-200/80 rounded-3xl">
                No resolved history on record.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalResolvedPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6 text-sm">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentResolvedPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentResolvedPage === 1}
              >
                <FiArrowLeft className="mr-1.5" /> Previous
              </Button>
              <span className="font-bold text-slate-600">
                Page {currentResolvedPage} of {totalResolvedPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentResolvedPage((prev) => (prev < totalResolvedPages ? prev + 1 : prev))}
                disabled={currentResolvedPage === totalResolvedPages}
              >
                Next <FiArrowRight className="ml-1.5" />
              </Button>
            </div>
          )}
        </section>

      </div>

      {/* Complaint Details Modal */}
      <AnimatePresence>
        {isViewOpen && selectedComplaint && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsViewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-3xl h-[85vh] relative overflow-y-auto p-7 sm:p-9 flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition text-lg font-bold"
                onClick={() => setIsViewOpen(false)}
              >
                ✕
              </button>

              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  Grievance Task #{selectedComplaint.id}
                </span>
                <h2 className="text-2xl font-black text-slate-800 mt-2.5">
                  {selectedComplaint.category}: {selectedComplaint.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Details side cards */}
                <div className="md:col-span-1 flex flex-col gap-5 text-xs text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-400">Lodged Address</p>
                    <p className="font-extrabold text-slate-700 mt-0.5 leading-relaxed">{selectedComplaint.location}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Current Status</p>
                    <p className="font-extrabold text-slate-700 mt-0.5">{selectedComplaint.status === "RESOLVED_PENDING" ? "Verification Pending" : selectedComplaint.status}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Urgency Priority</p>
                    <p className="font-extrabold text-slate-750 mt-0.5">{selectedComplaint.priority || "Standard"}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Assigned To</p>
                    <p className="font-extrabold text-slate-700 mt-0.5">{selectedComplaint.assignedTo || "You"}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Lodge Date</p>
                    <p className="font-extrabold text-slate-700 mt-0.5">{selectedComplaint.subdate}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Last Audited</p>
                    <p className="font-extrabold text-slate-700 mt-0.5">{selectedComplaint.update}</p>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-1">Detailed Description</h3>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      {selectedComplaint.description}
                    </p>
                  </div>

                  {selectedComplaint.photo && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-1 flex items-center gap-1.5">
                        <FiImage /> Evidence Image
                      </h3>
                      <div className="flex justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <img
                          src={`${API_BASE_URL}${selectedComplaint.photo}`}
                          alt="Grievance context"
                          className="max-w-full max-h-[220px] rounded-xl object-contain shadow-sm"
                        />
                      </div>
                    </div>
                  )}

                  {selectedComplaint.status !== "RESOLVED" && selectedComplaint.status !== "RESOLVED_PENDING" && (
                    <div className="pt-4 border-t border-slate-50 flex gap-3">
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => {
                          handleResolvedComplaints(selectedComplaint);
                          setIsViewOpen(false);
                        }}
                      >
                        ✓ Mark Resolution Complete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Performance Modal */}
      <AnimatePresence>
        {showPerformance && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPerformance(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-7 sm:p-9 rounded-3xl shadow-strong max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-black text-slate-800 mb-6 text-center flex items-center justify-center gap-2">
                <FiSliders className="text-primary-500" />
                Performance Metrics
              </h2>
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => setShowPerformance(false)}
                  className="px-8"
                >
                  Close Metrics
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default StaffDashboard;
