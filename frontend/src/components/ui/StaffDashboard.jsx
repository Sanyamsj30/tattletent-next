import React, { useState, useEffect } from "react";
import Logo from "./Logo.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user")) || { name: "Guest" };
  const [counts, setCounts] = useState({ resolved: 0, pending: 0, in_progress: 0 });

  const [showPerformance, setShowPerformance] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchCounts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/complaints/counts");
      setCounts(res.data);
    } catch {
      console.warn("Backend not connected, using demo data");
    }
  };

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
      if (user && JSON.parse(user).role !== "Staff") {
          navigate("/"); // Or a specific Unauthorized page
      }
      
    }, [navigate]);

  useEffect(() => {
    fetchCounts();
  }, []);

  const [complaints, setComplaints] = useState([]);
  const [newComplaints, setNewComplaints] = useState([]);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);

  /* const initialComplaints = [
    {
      id: 1,
      category: "Water Leak",
      status: "In Progress",
      description: "Leak near Tent #5",
      location: "Tent #5, Sector A",
      date: "2025-10-02",
      citizen: "John Doe",
      priority: "High",
      photo: "https://via.placeholder.com/400x250?text=Leak+Photo",
    },
    {
      id: 2,
      category: "Pathway Damage",
      status: "Resolved",
      description: "Broken tiles repaired",
      location: "Sector C",
      date: "2025-09-28",
      citizen: "Jane Smith",
      priority: "Medium",
      solution: "Tiles replaced",
      photo: "https://via.placeholder.com/400x250?text=Pathway",
    },
    {
      id: 3,
      category: "Garbage",
      status: "In Progress",
      description: "Overflowing bin near park",
      location: "Central Park",
      date: "2025-10-01",
      citizen: "Mike Johnson",
      priority: "Low",
      photo: "https://via.placeholder.com/400x250?text=Garbage",
    },
    {
      id: 4,
      category: "Electrical",
      status: "Resolved",
      description: "Street light not working",
      location: "Street 12",
      date: "2025-10-03",
      citizen: "Sarah Wilson",
      priority: "Medium",
     // photo: "https://via.placeholder.com/400x250?text=Electrical",
    },
    {
      id: 5,
      category: "Drainage",
      status: "Resolved",
      description: "Drainage clog cleared",
      location: "Sector D",
      date: "2025-09-22",
      citizen: "Aman Verma",
      priority: "High",
      photo: "https://via.placeholder.com/400x250?text=Drainage",
    },
  ]; */

  const fetchComplaintsByUser = async () => {
    try {
      if (!user?.user_id) return;
  
      const queryParams = new URLSearchParams({ staff_id: user.user_id }).toString();
      const response = await fetch(`http://localhost:5000/api/complaints/search?${queryParams}`);
  
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
        assignedTo: c.assigned_to,
        subdate: new Date(c.submitted_at).toLocaleDateString(),
        update: new Date(c.updated_at).toLocaleDateString()
      })));
  
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setComplaints([]); // fallback to empty array
    }
  };
  
  useEffect(() => {
      fetchComplaintsByUser();
  }, []);

  useEffect(() => {
    setNewComplaints(complaints.filter((c) =>  c.status === "IN_PROGRESS" ));
    setResolvedComplaints(complaints.filter((c) => c.status === "Resolved"));
  }, [complaints]);

  const handleResolvedComplaints = (complaint) => {
    axios.put(`http://localhost:5000/api/complaints/status/${complaint.id}`, {
      status: "Resolved",
    }).catch(err => console.error(err));

    setComplaints(prevComplaints =>
      prevComplaints.map(c =>
        c.id === complaint.id ? { ...c, status: "Resolved" } : c
      )
    );
  }

  const complaintsPerPage = 3;

  // Pagination for new complaints
  const [currentNewPage, setCurrentNewPage] = useState(1);
  const totalNewPages = Math.ceil(newComplaints.length / complaintsPerPage);
  const paginatedNewComplaints = newComplaints.slice(
    (currentNewPage - 1) * complaintsPerPage,
    currentNewPage * complaintsPerPage
  );

  // Pagination for resolved complaints
  const [currentResolvedPage, setCurrentResolvedPage] = useState(1);
  const totalResolvedPages = Math.ceil(
    resolvedComplaints.length / complaintsPerPage
  );
  const paginatedResolvedComplaints = resolvedComplaints.slice(
    (currentResolvedPage - 1) * complaintsPerPage,
    currentResolvedPage * complaintsPerPage
  );

  const handleViewClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsViewOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border border-red-300";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border border-yellow-300";
      case "Low":
        return "bg-blue-50 text-blue-700 border border-blue-300";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-300";
    }
  };

  const performanceData = [
    { name: "Resolved", count: counts.resolved || 0 },
    { name: "In Progress", count: counts.in_progress || 0 },
    { name: "Pending", count: counts.pending || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#FCF5EE] font-sans flex flex-col justify-between">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-8 bg-white shadow-md z-50">
        <Logo />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-semibold text-gray-800">Staff Member</p>
          </div>
          <button
            onClick={() => setShowPerformance(true)}
            className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-3 py-2 transition duration-200"
          >
            Performance
          </button>
          <button
            onClick={handleLogout}
            className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Welcome */}
      <div className="flex flex-col items-center justify-center text-center pt-36 px-6 mb-12 space-y-6">
        <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-orange-700 via-amber-600 to-yellow-500 bg-clip-text text-transparent">
          Welcome, {user.name} 👷
        </h1>
        <p className="text-2xl text-gray-700 mt-4 italic">
          Manage and resolve citizen complaints efficiently.
        </p>
      </div>

        <hr className="border-gray-200" /> 

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 p-6 sm:p-10"> {/* Added padding */}
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


      {/* Complaints Section */}
      <main className="px-12 space-y-16">
        {/* Active Complaints */}
        <section>
          <div className="flex justify-between items-center mb-6 border-l-4 border-red-400 pl-3">
            <h3 className="text-2xl font-bold text-gray-900">🚨 Assigned Complaints</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedNewComplaints.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-semibold text-gray-800">{c.category}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(c.status)}`}>{c.status}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(c.priority)}`}>{c.priority}</span>
                </div>
                <p className="text-gray-600 mt-2">{c.location}</p>
                <p className="text-gray-500 text-sm mt-1">{c.subdate}</p>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => handleViewClick(c)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    Open
                  </button>
                  <button
                    onClick={() => handleResolvedComplaints(c) }
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentNewPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentNewPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Prev
            </button>
            <span className="text-lg font-semibold">
              Page {currentNewPage} of {totalNewPages}
            </span>
            <button
              onClick={() =>
                setCurrentNewPage((prev) => (prev < totalNewPages ? prev + 1 : prev))
              }
              disabled={currentNewPage === totalNewPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Next
            </button>
          </div>
        </section>

        {/* Resolved Complaints */}
        <section>
          <div className="flex justify-between items-center mb-6 border-l-4 border-green-400 pl-3">
            <h3 className="text-2xl font-bold text-gray-900">✅ Resolved Complaints</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedResolvedComplaints.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-semibold text-gray-800">{c.category}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(c.status)}`}>{c.status}</span>
                </div>
                <p className="text-gray-600 mt-2">{c.location}</p>
                <p className="text-gray-500 text-sm mt-1">{c.update}</p>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => handleViewClick(c)}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() =>
                setCurrentResolvedPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={currentResolvedPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Prev
            </button>
            <span className="text-lg font-semibold">
              Page {currentResolvedPage} of {totalResolvedPages}
            </span>
            <button
              onClick={() =>
                setCurrentResolvedPage((prev) =>
                  prev < totalResolvedPages ? prev + 1 : prev
                )
              }
              disabled={currentResolvedPage === totalResolvedPages}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Next
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 mt-16 text-gray-600 text-sm border-t border-gray-300">
        © {new Date().getFullYear()} Tattle Tent | All rights reserved.
      </footer>

      {/* Complaint Details Modal */}
      {isViewOpen && selectedComplaint && (
  <div
    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    onClick={() => setIsViewOpen(false)}
  >
    <div
      className={`bg-white rounded-2xl w-full max-w-4xl h-[85vh] relative flex overflow-hidden`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left Side - Photo (conditionally) */}
      {selectedComplaint.photo && (
        <div className="w-1/2 h-full bg-gray-50 flex items-center justify-center p-4 border-r">
          <img
            src={selectedComplaint.photo}
            alt={selectedComplaint.category}
            className="rounded-xl object-cover h-full w-full"
          />
        </div>
      )}

      {/* Right Side - Scrollable Details */}
      <div
        className={`h-full overflow-y-auto p-6 relative ${
          selectedComplaint.photo ? "w-1/2" : "w-full"
        }`}
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

        <div className="space-y-3 pr-2">
          <p><strong>Title:</strong> {selectedComplaint.title}</p>
          <p><strong>Description:</strong> {selectedComplaint.description}</p>
          <p><strong>Location:</strong> {selectedComplaint.location}</p>
          <p><strong>Status:</strong> {selectedComplaint.status}</p>
          <p><strong>Priority:</strong> {selectedComplaint.priority}</p>
          <p><strong>Assigned To:</strong> {selectedComplaint.assignedTo}</p>
          <p><strong>Submit Date:</strong> {selectedComplaint.subdate}</p>
          <p><strong>Last Update</strong> {selectedComplaint.update}</p>
        </div>
      </div>
    </div>
  </div>
)}


      {/* Performance Modal */}
      {showPerformance && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPerformance(false)}
        >
          <div
            className="bg-white p-8 rounded-2xl max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">
              📊 My Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#d55d1f" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center mt-6">
              <button
                className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700"
                onClick={() => setShowPerformance(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
