import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlus, FiCompass, FiUploadCloud, FiCheck, FiCheckCircle, 
  FiClock, FiAlertCircle, FiTrendingUp, FiExternalLink, FiImage, FiMapPin 
} from "react-icons/fi";
import AppLayout from "./AppLayout";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Input, TextArea } from "./input";
import ChatbotWidget from "./ChatbotWidget";
import { API_BASE_URL } from "../../lib/api";

const CitizenDashboard = () => {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [counts, setCounts] = useState({ resolved: 0, pending: 0, in_progress: 0 });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const userId = user?.user_id || user?.id || user?._id;

  // Form step wizard states
  const [formStep, setFormStep] = useState(1);
  const [quickMode, setQuickMode] = useState(false);
  const [formCategory, setFormCategory] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [geoCaptured, setGeoCaptured] = useState(false);
  const [geoCoords, setGeoCoords] = useState({ lat: null, lon: null });

  const fetchComplaintsByUser = async () => {
    try {
      if (!userId) return;
      const queryParams = new URLSearchParams({ user_id: userId }).toString();
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

  useEffect(() => {
    if (userId) {
      fetchComplaintsByUser();
      fetchCounts();
    }
  }, [userId]);

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
      setIsViewOpen(false);
    } catch (err) {
      console.error("Failed to confirm resolution:", err);
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
      setIsViewOpen(false);
    } catch (err) {
      console.error("Failed to reject resolution:", err);
    }
  };

  // Capture GPS coordinates reactively
  const captureLocation = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        const lat = parseFloat(position.coords.latitude);
        const lon = parseFloat(position.coords.longitude);
        setGeoCoords({ lat, lon });
        setGeoCaptured(true);
      } catch (err) {
        console.warn("Geolocation failed:", err.message);
      }
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleNewComplaintSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token || !user) {
        alert("You must be logged in to submit a complaint.");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("category", formCategory);
      formData.append("title", formTitle);
      formData.append("location", formLocation);
      formData.append("description", formDescription);
      formData.append("user_id", userId);

      if (geoCaptured && geoCoords.lat != null) {
        formData.append("latitude", geoCoords.lat);
        formData.append("longitude", geoCoords.lon);
      }

      if (photoFile) {
        formData.append("photo", photoFile);
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
        resetForm();
        setIsSubmitOpen(false);
        fetchComplaintsByUser();
        fetchCounts();
      } else {
        const errorData = await response.json();
        alert(errorData?.message || "Failed to submit complaint.");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormStep(1);
    setQuickMode(false);
    setFormCategory("");
    setFormTitle("");
    setFormLocation("");
    setFormDescription("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setGeoCaptured(false);
    setGeoCoords({ lat: null, lon: null });
  };

  return (
    <AppLayout requiredRole="Citizen">
      <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-10">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8 mt-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Console Dashboard
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Submit new grievances, review resolution audits, and track active workloads.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => {
              resetForm();
              setIsSubmitOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            <FiPlus className="mr-2 text-base" /> New Grievance Report
          </Button>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card variant="glass" className="bg-[#fcfcff] border border-primary-100">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Reports</p>
                <p className="text-4xl font-black text-slate-800 mt-1">
                  {(parseInt(counts.resolved, 10) || 0) + (parseInt(counts.in_progress, 10) || 0) + (parseInt(counts.pending, 10) || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center text-xl shadow-sm border border-primary-200/20">
                📋
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="bg-[#fcfcff] border border-emerald-100">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resolved</p>
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
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">In Progress</p>
                <p className="text-4xl font-black text-amber-600 mt-1">{counts.in_progress}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl shadow-sm border border-amber-200/20">
                🔄
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Category Launchers */}
        <Card variant="default">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Lodge Category GRIEVANCES</h3>
              <p className="text-xs text-slate-400 font-semibold">Select a fast-reporting template to populate metadata instantly</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "🚧", label: "Pathway Damage" },
                { icon: "💧", label: "Water Leak" },
                { icon: "🗑️", label: "Garbage" },
                { icon: "⚡", label: "Electrical" },
              ].map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => {
                    resetForm();
                    setFormCategory(cat.label);
                    setFormStep(2);
                    setIsSubmitOpen(true);
                  }}
                  className="h-28 flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200/80 hover:border-primary-500 hover:bg-primary-50/20 saas-hover-lift shadow-sm cursor-pointer"
                >
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-xs font-bold text-slate-650">{cat.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Complaints Lists */}
        <div className="space-y-6">
          
          {/* Active Complaints Table */}
          <Card variant="default">
            <CardContent className="p-0">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse"></span>
                  Active Grievances
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Category</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Status</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Title Summary</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Subdate</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {complaints.filter(c => c.status === "NEW" || c.status === "IN_PROGRESS" || c.status === "RESOLVED_PENDING").length > 0 ? (
                      complaints.filter(c => c.status === "NEW" || c.status === "IN_PROGRESS" || c.status === "RESOLVED_PENDING").map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/40 transition">
                          <td className="px-6 py-4 font-bold text-slate-700">{c.category}</td>
                          <td className="px-6 py-4">
                            <Badge variant={c.status === "RESOLVED_PENDING" ? "warning" : (c.status === "IN_PROGRESS" ? "info" : "danger")}>
                              {c.status === "RESOLVED_PENDING" ? "Verification Pending" : c.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-semibold">{c.title}</td>
                          <td className="px-6 py-4 text-slate-400 font-bold">{c.subdate}</td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-3.5">
                            {c.status === "RESOLVED_PENDING" && (
                              <div className="flex gap-2">
                                <button
                                  className="px-3 py-1.5 bg-success-500 hover:bg-success-600 text-white text-xs font-bold rounded-xl shadow-sm transition"
                                  onClick={() => handleConfirmFix(c)}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="px-3 py-1.5 bg-danger-500 hover:bg-danger-600 text-white text-xs font-bold rounded-xl shadow-sm transition"
                                  onClick={() => handleRejectFix(c)}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            <button
                              className="text-primary-500 hover:text-primary-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                              onClick={() => {
                                setSelectedComplaint(c);
                                setIsViewOpen(true);
                              }}
                            >
                              Details <FiExternalLink />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-slate-400 italic font-medium">
                          No active complaints lodged.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Resolved Ledger Section */}
          {complaints.some(c => c.status === "RESOLVED" && !c.is_duplicate) && (
            <Card variant="default" className="border border-success-200/60">
              <CardContent className="p-0">
                <div className="p-6 border-b border-slate-100 bg-success-50/20">
                  <h3 className="text-lg font-bold text-success-800 tracking-tight flex items-center gap-2">
                    <FiCheckCircle className="text-success-500 animate-bounce" />
                    Resolved Audits Ledger
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Category</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Title Summary</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Subdate</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {complaints.filter(c => c.status === "RESOLVED" && !c.is_duplicate).map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/40 transition">
                          <td className="px-6 py-4 font-bold text-slate-700">{c.category}</td>
                          <td className="px-6 py-4 text-slate-650 font-semibold">{c.title}</td>
                          <td className="px-6 py-4 text-slate-400 font-bold">{c.subdate}</td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-3.5">
                            <button
                              className="text-primary-500 hover:text-primary-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                              onClick={() => {
                                setSelectedComplaint(c);
                                setIsViewOpen(true);
                              }}
                            >
                              Details <FiExternalLink />
                            </button>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => navigate("/feedback-page", { state: { complaint: c } })}
                            >
                              Give Feedback
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Merged Duplicate Grid */}
          {complaints.some(c => c.status === "DUPLICATE" || c.is_duplicate) && (
            <Card variant="default" className="border border-indigo-200/60">
              <CardContent className="p-0">
                <div className="p-6 border-b border-slate-100 bg-indigo-50/20">
                  <h3 className="text-lg font-bold text-indigo-800 tracking-tight flex items-center gap-2">
                    📍 Linked Duplicate Grievances
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Category</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Title Summary</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Subdate</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Status</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {complaints.filter(c => c.status === "DUPLICATE" || c.is_duplicate).map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/40 transition">
                          <td className="px-6 py-4 font-bold text-slate-700">{c.category}</td>
                          <td className="px-6 py-4 text-slate-650 font-semibold">{c.title}</td>
                          <td className="px-6 py-4 text-slate-400 font-bold">{c.subdate}</td>
                          <td className="px-6 py-4">
                            <Badge variant="info">Merged</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              className="text-primary-500 hover:text-primary-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                              onClick={() => {
                                setSelectedComplaint(c);
                                setIsViewOpen(true);
                              }}
                            >
                              Details <FiExternalLink />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Multi-Step Submit Wizard Modal */}
      <AnimatePresence>
        {isSubmitOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setIsSubmitOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-strong overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Wizard Progress bar */}
              <div className="h-2 w-full bg-slate-100 relative">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 to-indigo-500"
                  animate={{ width: quickMode ? "100%" : `${(formStep / 5) * 100}%` }}
                  transition={{ duration: 0.3 }}
                ></motion.div>
              </div>

              <div className="p-7 sm:p-9 space-y-6">
                
                {/* Header wizard step description */}
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Lodge New Grievance</h3>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setQuickMode(!quickMode)}
                      className="text-xs font-bold text-primary-500 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-wider hover:bg-primary-100 transition select-none"
                    >
                      {quickMode ? "✨ Wizard Mode" : "⚡ Quick File Mode"}
                    </button>
                    {!quickMode && (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                        Step {formStep} of 5
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick File Mode Form */}
                {quickMode && (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-550 uppercase tracking-wide">Category Area *</label>
                      <select
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      >
                        <option value="">-- Select Category --</option>
                        <option value="Electrical">⚡ Electrical</option>
                        <option value="Water Leak">💧 Water Leak</option>
                        <option value="Pathway Damage">🚧 Pathway Damage</option>
                        <option value="Garbage">🗑️ Garbage</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-550 uppercase tracking-wide">Report Title *</label>
                      <Input
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g., Water main burst, street light out"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-550 uppercase tracking-wide">Civic Address / Location *</label>
                      <Input
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="e.g., Sector C near grocery store"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-550 uppercase tracking-wide">Detailed Description *</label>
                      <TextArea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Please write down explicit details, landmarks..."
                        required
                      />
                    </div>

                    {/* Compact Map Coordinates Block */}
                    <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                          <FiMapPin className="text-primary-500" />
                          GPS Coordinate Attachment
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          {geoCaptured 
                            ? `Lat: ${geoCoords.lat.toFixed(4)}, Lng: ${geoCoords.lon.toFixed(4)}` 
                            : "Attach live GPS coordinates to accelerate routing."}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={geoCaptured ? "success" : "secondary"}
                        onClick={captureLocation}
                        className="py-1 px-3 text-xs"
                      >
                        {geoCaptured ? "✓ Attached" : "🗺️ Get GPS"}
                      </Button>
                    </div>

                    {/* Compact Image File Upload */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-550 uppercase tracking-wide">Evidence Photo Upload (optional)</label>
                      <div className="border-2 border-dashed border-slate-200 hover:border-primary-400 bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-4 transition flex flex-col items-center justify-center text-center relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {photoPreview ? (
                          <div className="space-y-2 flex flex-col items-center">
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="max-h-[80px] rounded-lg object-contain border border-slate-200 shadow-sm"
                            />
                            <p className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer relative z-20" onClick={(e) => {
                              e.stopPropagation();
                              setPhotoFile(null);
                              setPhotoPreview(null);
                            }}>
                              Remove Attachment
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FiUploadCloud className="text-xl text-slate-450" />
                            <span className="text-xs font-semibold text-slate-700">Browse photo evidence</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Category Selection Grid */}
                {!quickMode && formStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Complaint Area Area *</p>
                    <div className="grid grid-cols-2 gap-3.5">
                      {[
                        { key: "Electrical", icon: "⚡" },
                        { key: "Water Leak", icon: "💧" },
                        { key: "Pathway Damage", icon: "🚧" },
                        { key: "Garbage", icon: "🗑️" }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            setFormCategory(item.key);
                            setFormStep(2);
                          }}
                          className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2.5 transition select-none cursor-pointer ${
                            formCategory === item.key
                              ? "border-primary-500 bg-primary-50/20 text-primary-750 font-extrabold"
                              : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 bg-white"
                          }`}
                        >
                          <span className="text-3xl">{item.icon}</span>
                          <span className="text-xs font-bold text-slate-700">{item.key}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Title Summary & Details */}
                {!quickMode && formStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-550 uppercase tracking-wide">Short Title Summary *</label>
                      <Input
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Broken street lantern, leaking water pipe etc..."
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-550 uppercase tracking-wide">Detailed Grievance Description *</label>
                      <TextArea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Please write down explicit details, landmarks, and duration of the problem..."
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Location / Map Placement */}
                {!quickMode && formStep === 3 && (
                  <div className="space-y-5">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-550 uppercase tracking-wide">Civic Address / Description *</label>
                      <Input
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="e.g., Sector C near grocery store"
                        required
                      />
                    </div>

                    <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <FiMapPin className="text-primary-500" />
                          GPS Coordinate Attachment
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          {geoCaptured 
                            ? `Lat: ${geoCoords.lat.toFixed(4)}, Lng: ${geoCoords.lon.toFixed(4)}` 
                            : "Attach live location to speed up dispatched contractors."}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={geoCaptured ? "success" : "secondary"}
                        onClick={captureLocation}
                      >
                        {geoCaptured ? "✓ Attached" : "🗺️ Get GPS"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Photo Attachment */}
                {!quickMode && formStep === 4 && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-550 uppercase tracking-wide">Evidence Photo Upload (optional)</p>
                    
                    <div className="border-2 border-dashed border-slate-200 hover:border-primary-400 bg-slate-50/50 hover:bg-slate-50 rounded-3xl p-8 transition flex flex-col items-center justify-center text-center relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {photoPreview ? (
                        <div className="space-y-3 flex flex-col items-center">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="max-h-[140px] rounded-xl object-contain border border-slate-200 shadow-sm"
                          />
                          <p className="text-[10px] font-bold text-danger-500 hover:underline cursor-pointer relative z-20" onClick={(e) => {
                            e.stopPropagation();
                            setPhotoFile(null);
                            setPhotoPreview(null);
                          }}>
                            Remove Attachment
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <FiUploadCloud className="text-3xl text-slate-400 group-hover:text-primary-500 transition mb-3" />
                          <p className="text-xs font-semibold text-slate-700">Drag & drop photo or click to browse</p>
                          <p className="text-[10px] text-slate-400 mt-1">Supports JPEG, PNG up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: Final Review & Submission */}
                {!quickMode && formStep === 5 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest border-b pb-1 mb-2">Grievance Summary</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-4.5 rounded-2xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-400">Category Area</p>
                        <p className="font-extrabold text-slate-700 mt-0.5">{formCategory}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-400">Report Title</p>
                        <p className="font-extrabold text-slate-700 mt-0.5 truncate">{formTitle}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-bold text-slate-400">Address Location</p>
                        <p className="font-extrabold text-slate-700 mt-0.5">{formLocation}</p>
                      </div>
                      {geoCaptured && (
                        <div className="col-span-2">
                          <p className="font-bold text-slate-400">GPS Position</p>
                          <p className="font-extrabold text-slate-700 mt-0.5">Attached ✓</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex justify-between items-center border-t border-slate-50 pt-4.5">
                  {!quickMode && formStep > 1 ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setFormStep(formStep - 1)}
                    >
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsSubmitOpen(false)}
                    >
                      Cancel
                    </Button>

                    {quickMode ? (
                      <Button
                        type="button"
                        variant="primary"
                        disabled={isSubmitting || !formCategory || !formTitle || !formLocation || !formDescription}
                        onClick={handleNewComplaintSubmit}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Grievance"}
                      </Button>
                    ) : formStep < 5 ? (
                      <Button
                        type="button"
                        variant="primary"
                        disabled={
                          (formStep === 2 && (!formTitle || !formDescription)) ||
                          (formStep === 3 && !formLocation)
                        }
                        onClick={() => setFormStep(formStep + 1)}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="primary"
                        disabled={isSubmitting}
                        onClick={handleNewComplaintSubmit}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Grievance"}
                      </Button>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Linear-style Timeline Details Modal */}
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
              className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] relative overflow-y-auto p-7 sm:p-9 flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition text-lg"
                onClick={() => setIsViewOpen(false)}
              >
                ✕
              </button>

              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    Complaint ID #{selectedComplaint.id}
                  </span>
                  <Badge variant={selectedComplaint.status === "RESOLVED_PENDING" ? "warning" : (selectedComplaint.status === "RESOLVED" ? "success" : "info")}>
                    {selectedComplaint.status === "RESOLVED_PENDING" ? "Verification Pending" : selectedComplaint.status}
                  </Badge>
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-2.5">
                  {selectedComplaint.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
                {/* Left Side: Summary Metadata details */}
                <div className="md:col-span-1 flex flex-col gap-6 text-xs text-slate-650 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-400">Category Area</p>
                    <p className="font-extrabold text-slate-700 mt-0.5">{selectedComplaint.category}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Grievance Status</p>
                    <p className="font-extrabold text-slate-700 mt-0.5">{selectedComplaint.status}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Severity Level</p>
                    <p className="font-extrabold text-slate-700 mt-0.5">{selectedComplaint.severity || "Low"}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Address Address</p>
                    <p className="font-extrabold text-slate-750 mt-0.5 leading-relaxed">{selectedComplaint.location}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Assigned Personnel</p>
                    <p className="font-extrabold text-slate-700 mt-0.5">{selectedComplaint.assignedTo || "Unassigned / Pending routing"}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Lodge Date</p>
                    <p className="font-extrabold text-slate-700 mt-0.5">{selectedComplaint.subdate}</p>
                  </div>
                </div>

                {/* Right Side: Timeline and Description */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Detailed descriptions */}
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase tracking-wider text-[11px] border-b pb-1">Detailed Description</h3>
                    <p className="text-xs text-slate-550 leading-relaxed bg-slate-50/30 p-4 rounded-xl border border-slate-100">
                      {selectedComplaint.description}
                    </p>
                  </div>

                  {/* Evidence Images */}
                  {selectedComplaint.photo && (
                    <div className="space-y-2.5">
                      <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase tracking-wider text-[11px] border-b pb-1 flex items-center gap-1.5">
                        <FiImage /> Evidence Media
                      </h3>
                      <div className="flex justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <img
                          src={`${API_BASE_URL}${selectedComplaint.photo}`}
                          alt="Evidence complaint"
                          className="max-w-full max-h-[220px] rounded-xl object-contain shadow-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Linear-style interactive timeline */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase tracking-wider text-[11px] border-b pb-1">Lifecycle Activity History</h3>
                    
                    <div className="relative border-l border-slate-100 pl-6 space-y-5 text-xs text-slate-500 font-medium">
                      
                      {/* Lodged Event */}
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full bg-primary-100 text-primary-600 border border-primary-200 flex items-center justify-center text-[10px] font-bold">
                          1
                        </span>
                        <div>
                          <p className="font-extrabold text-slate-750">Grievance report filed successfully</p>
                          <p className="text-[10px] text-slate-400">{selectedComplaint.subdate}</p>
                        </div>
                      </div>

                      {/* AI Governance check */}
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full bg-indigo-100 text-indigo-600 border border-indigo-200 flex items-center justify-center text-[10px] font-bold">
                          2
                        </span>
                        <div>
                          <p className="font-extrabold text-slate-750">AI Governance System Audited</p>
                          {selectedComplaint.is_duplicate ? (
                            <p className="text-[10px] text-purple-600 font-semibold leading-relaxed mt-0.5">
                              ⚠️ Duplicate matched. Grievance linked to master ticket #{selectedComplaint.duplicate_of || "active ticket"} to optimize priority weight.
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Unique report verified. Geospatial priority coordinates generated.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* SLA Escalation alerts */}
                      {selectedComplaint.escalation_explanation && (
                        <div className="relative">
                          <span className="absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center text-[10px] font-bold">
                            🔥
                          </span>
                          <div>
                            <p className="font-bold text-amber-700">Forced SLA Escalation triggered</p>
                            <p className="text-[10px] text-amber-600 leading-relaxed mt-0.5">{selectedComplaint.escalation_explanation}</p>
                          </div>
                        </div>
                      )}

                      {/* Work In Progress / Assign */}
                      <div className="relative">
                        <span className="absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full bg-amber-100 text-amber-650 border border-amber-200 flex items-center justify-center text-[10px] font-bold">
                          3
                        </span>
                        <div>
                          <p className="font-extrabold text-slate-750">
                            {selectedComplaint.assignedTo 
                              ? `Assigned to contractor: ${selectedComplaint.assignedTo}` 
                              : "Pending Contractor dispatch"}
                          </p>
                          <p className="text-[10px] text-slate-400">{selectedComplaint.update}</p>
                        </div>
                      </div>

                      {/* Resolution actions inside timeline */}
                      {selectedComplaint.status === "RESOLVED_PENDING" && (
                        <div className="relative">
                          <span className="absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center text-[10px] font-bold">
                            ⏳
                          </span>
                          <div className="bg-amber-50/40 p-4 border border-amber-100/60 rounded-2xl flex flex-col gap-2 mt-1">
                            <p className="font-extrabold text-amber-800">Resolution Completed: Verification Required</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              The contractor has completed resolutions. Please confirm or reject the fix below:
                            </p>
                            <div className="flex gap-2.5 mt-1.5">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleConfirmFix(selectedComplaint)}
                              >
                                Confirm & Close Ticket
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleRejectFix(selectedComplaint)}
                              >
                                Reject & Send Back
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ChatbotWidget />
    </AppLayout>
  );
};

export default CitizenDashboard;
