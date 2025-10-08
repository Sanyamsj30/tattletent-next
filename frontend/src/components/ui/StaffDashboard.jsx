import React, { useState, useEffect } from "react";
import Logo from "./Logo.jsx"
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StaffDashboard = () => {

  const navigate=useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  
    const [counts, setCounts] = useState({ resolved: 0, pending: 0, in_progress: 0 });

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

  const initialComplaints = [
    { id: 1, category: "Water Leak", status: "Pending", description: "Leak near Tent #5, pipe burst", location: "Tent #5, Sector A", date: "2025-10-02", citizen: "John Doe", priority: "" },
    { id: 2, category: "Pathway Damage", status: "Resolved", description: "Broken tiles in Sector C repaired", location: "Sector C, Main Road", date: "2025-09-28", citizen: "Jane Smith", priority: "Medium", solution: "Tiles replaced" },
    { id: 3, category: "Garbage", status: "In Progress", description: "Overflowing bin near park", location: "Central Park, Bin #7", date: "2025-10-01", citizen: "Mike Johnson", priority: "Low" },
    { id: 4, category: "Electrical", status: "Pending", description: "Street light not working", location: "Street 12, Sector B", date: "2025-10-03", citizen: "Sarah Wilson", priority: "" },
  ];

  const [complaints, setComplaints] = useState(initialComplaints);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const newComplaints = complaints.filter(c => c.status === "Pending");
  const assignedComplaints = complaints.filter(c => c.status !== "Pending");

   

  const getStatusBadge = (status) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      default: return "bg-red-100 text-red-800";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High": return "bg-red-50 text-red-700 border-red-200";
      case "Medium": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Low": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleUpdateClick = (complaint) => {
    setSelectedComplaint({ ...complaint }); // clone to edit
    setIsUpdateOpen(true);
  };

  const handleViewClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsViewOpen(true);
  };

  const handleSaveUpdate = () => {
    setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? selectedComplaint : c));
    setIsUpdateOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FCF5EE] font-sans">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-8 bg-white shadow-md z-50">
        <Logo/>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-semibold text-gray-800">Staff Member</p>
          </div>
          <button
            onClick={() => navigate("/")} // 👈 Redirect to Home page
            className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2 transition duration-200"
          >
            <span className="text-xl">Logout</span>
          </button>
        </div>
      </div> 


      {/* Welcome Bar */}
      {/* Welcome Bar */}
<div className="flex flex-col items-center justify-center text-center pt-36 px-6 sm:px-12 mb-12 space-y-6">
  <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-orange-700 via-amber-600 to-yellow-500 bg-clip-text text-transparent leading-tight tracking-tight">
    Welcome, {user.name} 👷
  </h1>
  <p className="text-2xl text-gray-700 mt-4 italic">
    Manage and resolve citizen complaints efficiently.
  </p>

  <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
    <div className="text-center px-6 py-4 bg-orange-100 rounded-xl shadow-md">
      <p className="text-sm text-gray-600">Total Complaints</p>
      <p className="text-2xl font-bold text-orange-700">{ (parseInt(counts.resolved, 10) || 0) + (parseInt(counts.in_progress, 10) || 0) + (parseInt(counts.pending, 10) || 0) }</p>
    </div>
    <div className="text-center px-6 py-4 bg-yellow-100 rounded-xl shadow-md">
      <p className="text-sm text-gray-600">In Progress</p>
      <p className="text-2xl font-bold text-yellow-700">{counts.in_progress}</p>
    </div>
    <div className="text-center px-6 py-4 bg-yellow-100 rounded-xl shadow-md">
      <p className="text-sm text-gray-600">Pending</p>
      <p className="text-2xl font-bold text-yellow-700">{counts.pending}</p>
    </div>
  </div>
</div>


      <main className="px-12 space-y-16">
        {/* New Complaints Section */}
        <section>
          <div className="flex justify-between items-center mb-6 border-l-4 border-red-400 pl-3">
            <h3 className="text-2xl font-bold text-gray-900">🆕 New Complaints</h3>
            <button className="text-sm text-red-500 font-semibold hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newComplaints.map(c => (
              <div key={c.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition">
                <div>
                  <h4 className="text-xl font-semibold text-gray-800">{c.category}</h4>
                  <p className="text-gray-600 mt-2">{c.location}</p>
                  <p className="text-gray-500 text-sm mt-1">Reported by: {c.citizen}</p>
                  <p className="text-gray-400 text-xs mt-1">{c.date}</p>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => handleViewClick(c)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Open</button>
                  <button onClick={() => handleUpdateClick(c)} className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition">Update</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Assigned Complaints Section */}
        <section>
          <div className="flex justify-between items-center mb-6 border-l-4 border-green-400 pl-3">
            <h3 className="text-2xl font-bold text-gray-900">📋 Assigned Complaints</h3>
            <button className="text-sm text-green-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedComplaints.map(c => (
              <div key={c.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-semibold text-gray-800">{c.category}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(c.status)}`}>{c.status}</span>
                    {c.priority && <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(c.priority)}`}>{c.priority}</span>}
                  </div>
                  <p className="text-gray-600 mt-2">{c.location}</p>
                  <p className="text-gray-500 text-sm mt-1">Reported by: {c.citizen}</p>
                  <p className="text-gray-400 text-xs mt-1">{c.date}</p>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => handleViewClick(c)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Open</button>
                  <button onClick={() => handleUpdateClick(c)} className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition">Update</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Update Modal */}
      {isUpdateOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsUpdateOpen(false)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-orange-600 mb-4">Update Complaint #{selectedComplaint.id}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label>Status</label>
                <select className="w-full p-3 border rounded-xl" value={selectedComplaint.status} onChange={e => setSelectedComplaint({...selectedComplaint, status: e.target.value})}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label>Priority</label>
                <select className="w-full p-3 border rounded-xl" value={selectedComplaint.priority} onChange={e => setSelectedComplaint({...selectedComplaint, priority: e.target.value})}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label>Solution / Notes</label>
              <textarea className="w-full p-3 border rounded-xl" rows={4} value={selectedComplaint.solution || ""} onChange={e => setSelectedComplaint({...selectedComplaint, solution: e.target.value})} />
            </div>
            <div className="flex justify-end gap-3">
              <button className="px-6 py-3 bg-gray-200 rounded-xl" onClick={() => setIsUpdateOpen(false)}>Cancel</button>
              <button className="px-6 py-3 bg-orange-600 text-white rounded-xl" onClick={handleSaveUpdate}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsViewOpen(false)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-orange-600 mb-4">{selectedComplaint.category}</h3>
            <p className="text-gray-600 mb-2"><strong>Location:</strong> {selectedComplaint.location}</p>
            <p className="text-gray-600 mb-2"><strong>Reported by:</strong> {selectedComplaint.citizen}</p>
            <p className="text-gray-600 mb-2"><strong>Status:</strong> {selectedComplaint.status}</p>
            {selectedComplaint.priority && <p className="text-gray-600 mb-2"><strong>Priority:</strong> {selectedComplaint.priority}</p>}
            <p className="text-gray-700 mt-4">{selectedComplaint.description}</p>
            {selectedComplaint.solution && <p className="text-gray-700 mt-4"><strong>Solution:</strong> {selectedComplaint.solution}</p>}
            <div className="flex justify-end mt-6">
              <button className="px-6 py-3 bg-gray-200 rounded-xl" onClick={() => setIsViewOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
