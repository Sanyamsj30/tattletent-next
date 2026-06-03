import React, { useState, useEffect, useMemo } from "react";
import Logo from './Logo';
import { useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { useAuthSession } from "../../hooks/useAuthSession";
import { jsPDF } from "jspdf";
import { API_BASE_URL } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiSliders, FiDownload, FiRefreshCw, FiExternalLink, FiFileText, FiMapPin, FiCalendar, FiUser, FiInfo, FiTag, FiFile } from "react-icons/fi";
import { Button } from "./button";
import { Badge } from "./badge";
import { Card, CardContent } from "./card";

const AllComplaintsPage = () => {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const complaintsPerPage = 6;

  // Determine login state and user details for smart navigation
  const { token, user, isLoggedIn } = useAuthSession();

  const getDashboardUrl = () => {
    if (!isLoggedIn) return "/";
    const role = String(user?.role || "").toLowerCase();
    if (role === "admin" || role === "ringmaster") return "/admin-dashboard";
    if (role === "staff") return "/staff-dashboard";
    return "/citizen-dashboard";
  };

  const fetchComplaintsByUser = async () => {
    try {
      let isAdminOrStaff = false;
      if (isLoggedIn && user) {
        const role = String(user.role || "").toLowerCase();
        if (role === "admin" || role === "ringmaster" || role === "staff") {
          isAdminOrStaff = true;
        }
      }

      const endpoint = isAdminOrStaff
        ? `${API_BASE_URL}/api/complaints/search`
        : `${API_BASE_URL}/api/public/complaints/search`;

      const headers = {};
      if (isAdminOrStaff && token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, { headers });
      if (!response.ok) throw new Error("Failed to fetch complaints");
      const data = await response.json();
      setComplaints(data.map(c => ({
        id: c.complaint_id,
        category: c.category,
        status: c.status,
        location: c.location,
        priority: c.priority_level || c.priority,
        severity: c.severity || "Low",
        description: c.description,
        assignedTo: c.assigned_to,
        photo: c.photo,
        solution: c.solution,
        citizen: c.citizen_name || "Civic Citizen",
        date: new Date(c.submitted_at).toLocaleDateString(),
        is_duplicate: c.is_duplicate || false,
        duplicate_of: c.duplicate_of
      })));
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setComplaints([]);
    }
  };

  useEffect(() => {
    fetchComplaintsByUser();
  }, []);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesStatus = filterStatus === "all" || c.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesCategory = filterCategory === "all" || c.category.toLowerCase() === filterCategory.toLowerCase();
      const matchesSearch = searchTerm === "" || 
        c.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toString().includes(searchTerm) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = 
        filterType === "all" ||
        (filterType === "unique" && !c.is_duplicate) ||
        (filterType === "duplicate" && c.is_duplicate);
      return matchesStatus && matchesCategory && matchesSearch && matchesType;
    });
  }, [complaints, filterStatus, filterCategory, searchTerm, filterType]);

  // Pagination calculations
  const indexOfLast = currentPage * complaintsPerPage;
  const indexOfFirst = indexOfLast - complaintsPerPage;
  const currentComplaints = filteredComplaints.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredComplaints.length / complaintsPerPage);

  const handleView = (complaint) => {
    setSelectedComplaint(complaint);
    setIsViewOpen(true);
  };

  const exportComplaintPDF = (complaint) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("TATTLE TENT", 14, 25);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Official Civic Grievance Transparency Ledger", 14, 30);
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(14, 35, 196, 35);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(99, 102, 241); // indigo-500
    doc.text(`Complaint Record #${complaint.id}`, 14, 45);

    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85); // slate-700
    
    const details = [
      ["Category", complaint.category],
      ["Location", complaint.location],
      ["Status", complaint.status],
      ["Severity Level", complaint.severity || "Low"],
      ["Priority Tier", complaint.priority || "Standard"],
      ["Report Date", complaint.date],
      ["Assigned Contractor", complaint.assignedTo || "AI Auto-Assigned"]
    ];

    let currentY = 55;
    details.forEach(([label, val]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 14, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(String(val), 60, currentY);
      currentY += 8;
    });

    currentY += 4;
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY, 196, currentY);
    currentY += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Grievance Description", 14, currentY);
    currentY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const splitDesc = doc.splitTextToSize(complaint.description, 180);
    doc.text(splitDesc, 14, currentY);
    currentY += splitDesc.length * 5 + 10;

    if (complaint.solution) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text("Official Resolution Report", 14, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const splitSol = doc.splitTextToSize(complaint.solution, 180);
      doc.text(splitSol, 14, currentY);
    }

    doc.save(`TattleTent_Complaint_${complaint.id}.pdf`);
  };

  const exportCSV = () => {
    const csvContent = [
      ["ID", "Category", "Location", "Status", "Date", "Priority", "Severity", "Assigned To", "Description"],
      ...complaints.map(c => [
        c.id, 
        c.category, 
        `"${c.location.replace(/"/g, '""')}"`, 
        c.status, 
        c.date, 
        c.priority || "Not Set", 
        c.severity || "Low",
        c.assignedTo || "AI Auto-Assigned", 
        `"${c.description.replace(/"/g, '""')}"`
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tattletent_ledger_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const getStatusBadgeVariant = (status) => {
    switch (String(status).toUpperCase()) {
      case "RESOLVED":
        return "success";
      case "IN_PROGRESS":
        return "warning";
      case "PENDING":
      case "NEW":
      default:
        return "primary";
    }
  };

  const pageContent = (
    <>
        {/* Title Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="info">CIVIC TRANSPARENCY</Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Public Transparency Ledger
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Explore live public grievance tracking, verified SLA performance, and certified community resolutions in real-time.
          </p>
        </div>

        {/* Search & Advanced Filters */}
        <Card className="border border-slate-100 shadow-sm">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Keyword Search Input */}
              <div className="md:col-span-5 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="text"
                  placeholder="Search complaints by ID, category, or location..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Status Select Filter */}
              <div className="md:col-span-2.5">
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">🚦 All Statuses</option>
                  <option value="new">🆕 New</option>
                  <option value="in_progress">⚙️ In Progress</option>
                  <option value="resolved">✅ Resolved</option>
                </select>
              </div>

              {/* Category Select Filter */}
              <div className="md:col-span-2.5">
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">📁 All Categories</option>
                  <option value="pathway damage">🛣️ Pathway Damage</option>
                  <option value="water leak">💧 Water Leak</option>
                  <option value="garbage">🚮 Garbage Outflow</option>
                  <option value="electrical">⚡ Electrical</option>
                </select>
              </div>

              {/* Export Button & Action Buttons */}
              <div className="md:col-span-2 flex gap-2">
                <Button
                  onClick={exportCSV}
                  variant="success"
                  size="sm"
                  className="flex-1 text-xs py-3 h-full gap-2 rounded-xl"
                  title="Export Transparency Data to CSV"
                >
                  <FiDownload className="text-sm" /> CSV
                </Button>

                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterCategory("all");
                    setFilterStatus("all");
                    setCurrentPage(1);
                  }}
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs py-3 h-full gap-1.5 rounded-xl border border-slate-200"
                  title="Reset Search Filters"
                >
                  <FiRefreshCw className="text-xs" /> Reset
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Statistics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-slate-100 shadow-xs bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Ledger Grievances</p>
                <h3 className="text-2xl font-black text-slate-800 mt-2">{complaints.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-lg">
                📋
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 shadow-xs bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Unique Incidents</p>
                <h3 className="text-2xl font-black text-success-700 mt-2">{complaints.filter(c => !c.is_duplicate).length}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-success-50 text-success-600 flex items-center justify-center text-lg">
                🛡️
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 shadow-xs bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Linked Duplicates</p>
                <h3 className="text-2xl font-black text-indigo-700 mt-2">{complaints.filter(c => c.is_duplicate).length}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                🔗
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ledger Tabs */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => { setFilterType("all"); setCurrentPage(1); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              filterType === "all"
                ? "border-primary-500 text-primary-600 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-650"
            }`}
          >
            📋 All Grievances
          </button>
          <button
            onClick={() => { setFilterType("unique"); setCurrentPage(1); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              filterType === "unique"
                ? "border-success-500 text-success-600 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-650"
            }`}
          >
            🛡️ Unique Complaints Only
          </button>
          <button
            onClick={() => { setFilterType("duplicate"); setCurrentPage(1); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              filterType === "duplicate"
                ? "border-indigo-500 text-indigo-600 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-650"
            }`}
          >
            🔗 Linked Duplicates
          </button>
        </div>

        {/* Complaints Table Ledger List */}
        <Card className="border border-slate-100 overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/50">
                <tr>
                  {["ID", "Grievance Category", "Address / Location", "Status", "Date Filed", "Assigned Actioner", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-2.5 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {currentComplaints.length > 0 ? (
                  currentComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/40 transition">
                      <td className="px-6 py-2 font-bold text-slate-700">
                        #{c.id}
                      </td>
                      <td className="px-6 py-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{c.category}</span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">
                            Severity: {c.severity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-2 font-semibold text-slate-600">
                        {c.location}
                      </td>
                      <td className="px-6 py-2">
                        <Badge variant={getStatusBadgeVariant(c.status)}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-2 text-slate-400 font-bold text-xs">
                        {c.date}
                      </td>
                      <td className="px-6 py-2">
                        <span className="text-slate-600 font-bold font-mono text-xs bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                          {c.assignedTo || "AI Auto-Assigned"}
                        </span>
                      </td>
                      <td className="px-6 py-2">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => handleView(c)}
                            className="text-xs px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900"
                          >
                            <FiExternalLink className="mr-1 text-xs" /> View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => exportComplaintPDF(c)}
                            className="text-xs px-3 py-0.5 bg-transparent hover:bg-primary-50 rounded-lg"
                          >
                            <FiFileText className="mr-1 text-xs" /> PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-slate-400 italic font-semibold">
                      No transparency records match the selected filter query criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/20 text-xs font-semibold">
              <div className="text-slate-400">
                Showing <span className="font-bold text-slate-700">{indexOfFirst + 1}</span> to <span className="font-bold text-slate-700">{Math.min(indexOfLast, filteredComplaints.length)}</span> of <span className="font-bold text-slate-700">{filteredComplaints.length}</span> results
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-lg text-xs"
                >
                  Prev
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className="w-8 h-8 rounded-lg text-xs p-0 flex items-center justify-center font-bold"
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-lg text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Details Lightbox Modal View */}
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
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-strong relative space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition text-lg w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
                onClick={() => setIsViewOpen(false)}
              >
                ✕
              </button>

              {/* Modal Header */}
              <div className="border-b border-slate-100 pb-4 space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant={getStatusBadgeVariant(selectedComplaint.status)}>
                    {selectedComplaint.status}
                  </Badge>
                  <span className="text-xs font-bold text-slate-400">Record ID: #{selectedComplaint.id}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                  {selectedComplaint.category}
                </h2>
                <p className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <FiCalendar /> Reported on {selectedComplaint.date}
                </p>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Meta details list */}
                <div className="md:col-span-5 space-y-4 bg-slate-50/50 border border-slate-100 p-5 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-3">Audit Details</h4>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100/50">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5"><FiMapPin /> Location</span>
                      <span className="text-slate-700 font-bold text-right">{selectedComplaint.location}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100/50">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5">⚖️ Severity</span>
                      <span className="text-slate-700 font-bold uppercase">{selectedComplaint.severity}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100/50">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5"><FiTag /> Priority Tier</span>
                      <span className="text-slate-700 font-bold">{selectedComplaint.priority || "Standard"}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100/50">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5"><FiUser /> Submitter</span>
                      <span className="text-slate-700 font-bold">{selectedComplaint.citizen}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5">🛠️ Assignee</span>
                      <span className="text-slate-700 font-bold font-mono text-[10px]">{selectedComplaint.assignedTo || "AI Auto-Assigned"}</span>
                    </div>
                  </div>
                </div>

                {/* Main complaint body */}
                <div className="md:col-span-7 space-y-6">
                  {selectedComplaint.is_duplicate && (
                    <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                      <span className="text-base">ℹ️</span>
                      <div>
                        <h4 className="text-xs font-black text-indigo-800 uppercase tracking-wide leading-none">Linked Duplicate Grievance</h4>
                        <p className="text-xs text-indigo-700 font-semibold leading-relaxed mt-2">
                          This grievance is a duplicate and is linked to the primary master ticket <span className="font-mono bg-indigo-100/70 border border-indigo-200/50 px-1.5 py-0.5 rounded text-indigo-900 font-bold">#{selectedComplaint.duplicate_of || "active ticket"}</span>. The contractor shown is resolving the original ticket.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FiInfo className="text-primary-500" /> Narrative Details
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-2xl whitespace-pre-line font-medium">
                      {selectedComplaint.description}
                    </p>
                  </div>

                  {/* Resolution Report */}
                  {selectedComplaint.solution && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                        ✅ Resolution Work Summary
                      </h3>
                      <p className="text-emerald-800 text-sm leading-relaxed bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl whitespace-pre-line font-semibold">
                        {selectedComplaint.solution}
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Large Image Showcase */}
              {selectedComplaint.photo && (
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-sm font-bold text-slate-850 mb-3 flex items-center gap-1.5">
                    <FiFile className="text-indigo-500" /> Attached Photo Evidence
                  </h4>
                  <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 flex justify-center overflow-hidden">
                    <img
                      src={`${API_BASE_URL}${selectedComplaint.photo}`}
                      alt={selectedComplaint.category}
                      className="max-w-full max-h-[360px] rounded-xl shadow-md object-contain transition-transform duration-300 hover:scale-[1.01]"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-slate-100">
                <Button
                  onClick={() => exportComplaintPDF(selectedComplaint)}
                  variant="secondary"
                  className="gap-2 border border-slate-200 text-slate-600 hover:text-slate-900"
                >
                  <FiFileText /> Save Official PDF
                </Button>
                <Button
                  onClick={() => setIsViewOpen(false)}
                  className="px-8"
                >
                  Close Record
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <AppLayout requiredRole="StaffOrAdmin">
      <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 relative z-10">
        {pageContent}
      </div>
    </AppLayout>
  );
};

export default AllComplaintsPage;
