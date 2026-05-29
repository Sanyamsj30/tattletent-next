import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import Logo from "./Logo"
import axios from "axios";
import { API_BASE_URL } from "../../lib/api";

const AssignStaffPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));

  const { complaint } = location.state || {};
  const [staffList, setstaffList] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [recLoading, setRecLoading] = useState(false);

  const fetchRecommendation = async () => {
    if (!complaint?.id) return;
    try {
      setRecLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/ai/recommendation/${complaint.id}`, {
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

  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("Low");
  const [staffToAssign, setStaffToAssign] = useState(null);

  const handleAssign = (staffId) => {
    const token = sessionStorage.getItem("token");
    return axios
      .put(`${API_BASE_URL}/api/complaints/status/${complaint.id}`, {
        status: "In Progress",
        staffId,
        priority: selectedPriority,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        navigate("/admin-dashboard"); // go back after saving
      })
      .catch((err) => console.error(err));
  };


  const fetchStaff = async () => {
    try {
      if (!user?.user_id) return;

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
      setstaffList([]); // fallback to empty array
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchStaff();
      fetchRecommendation();
    }
  }, [user?.user_id]);

  const [selectedStaff, setSelectedStaff] = useState(null);

  if (!complaint) {
    navigate("/admin-dashboard"); // fallback
  }

  const fetchStaffPerformance = async (staff) => {
  try {
    // ✅ Axios automatically parses JSON, so just send staff_id as query param
    const response = await axios.get(`${API_BASE_URL}/api/complaints/search?staff_id=${staff.id}`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    });

    const data = response.data;

    if (!Array.isArray(data)) {
      console.error("Unexpected data format:", data);
      return;
    }

    // ✅ Count complaints by status
    const resolvedCount = data.filter((c) => c.status === "RESOLVED").length;
    const inProgressCount = data.filter((c) => c.status === "IN_PROGRESS").length;
    const pendingCount = data.filter((c) => c.status === "NEW").length;

    // ✅ Update selected staff to show modal
    setSelectedStaff({
      ...staff,
      performance: {
        Resolved: resolvedCount,
        "In Progress": inProgressCount,
        Pending: pendingCount,
      },
    });
    console.log(resolvedCount);
    console.log(inProgressCount);
  } catch (err) {
    console.error("Error fetching performance:", err);
  }
};



 {/*} const handleAssign = (staffName) => {
    navigate("/admin-dashboard", { state: { assigned: { complaintId: complaint.id, staffName } } });
  };*/}

  return (
    <div className="min-h-screen bg-[#FCF5EE] p-6">
      <div className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-8 bg-white shadow-md z-50">
        <Logo />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-semibold text-gray-800">Admin</p>
          </div>
          <button className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2" onClick={() => navigate("/admin-dashboard")}>
            Back
          </button>
        </div>
      </div>
      <h2 className="pt-28 text-4xl font-bold mb-6 text-center">Assign Complaint #{complaint?.id}</h2>

      {/* AI Recommendation Panel */}
      {recLoading && (
        <div className="max-w-4xl mx-auto mb-8 p-6 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center gap-3 animate-pulse shadow-md">
          <span className="w-6 h-6 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
          <p className="text-orange-800 font-medium font-mono">TattleTent AI is analyzing workloads, ward mappings, and SLA rates to generate top assignment choice...</p>
        </div>
      )}

      {recommendation?.topChoice && (
        <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl p-1 shadow-2xl transform transition hover:scale-[1.01]">
          <div className="bg-white rounded-[22px] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider font-mono">AI Smart Recommendation</span>
                  <h3 className="text-2xl font-bold text-gray-900">{recommendation.topChoice.name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-gray-500 font-mono">Match Suitability</span>
                  <p className="text-2xl font-black text-orange-600">{recommendation.topChoice.score}/100</p>
                </div>
                <button
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-sm font-semibold shadow-md transition"
                  onClick={() => {
                    setStaffToAssign(staffList.find(s => s.id === recommendation.topChoice.staffId) || { id: recommendation.topChoice.staffId, name: recommendation.topChoice.name });
                    setPriorityModalOpen(true);
                  }}
                >
                  Quick Assign
                </button>
              </div>
            </div>

            {/* AI Explanation Sentence */}
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
              <p className="text-gray-800 italic leading-relaxed text-sm">
                💡 <strong>AI Reason:</strong> "{recommendation.aiJustification}"
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-gray-50 p-3.5 rounded-2xl text-center">
                <span className="text-xs text-gray-500 font-medium block">Availability</span>
                <span className={`text-sm font-bold inline-block mt-1 ${
                  recommendation.topChoice.availabilityStatus === "Available"
                    ? "text-green-600"
                    : recommendation.topChoice.availabilityStatus === "Busy"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}>
                  {recommendation.topChoice.availabilityStatus}
                </span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-2xl text-center">
                <span className="text-xs text-gray-500 font-medium block">Active Workload</span>
                <span className="text-sm font-bold text-gray-800">{recommendation.topChoice.activeComplaints} Active Cases</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-2xl text-center">
                <span className="text-xs text-gray-500 font-medium block">SLA Compliance</span>
                <span className="text-sm font-bold text-gray-800">{recommendation.topChoice.slaComplianceRate}%</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-2xl text-center">
                <span className="text-xs text-gray-500 font-medium block">Citizen Rating</span>
                <span className="text-sm font-bold text-yellow-600 font-mono">⭐ {recommendation.topChoice.citizenRating}/5</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.length > 0 ? (
          staffList.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-orange-600">{s.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    s.availabilityStatus === "Available"
                      ? "bg-green-100 text-green-800 animate-pulse"
                      : s.availabilityStatus === "Busy"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {s.availabilityStatus || "Available"}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{s.email}</p>
                <div className="space-y-1 text-sm text-gray-500 mb-3 font-mono">
                  <p>⭐ Rating: <span className="text-yellow-600 font-bold">{s.citizenRating || 5}/5</span></p>
                  <p>📊 SLA Rate: <span className="text-gray-800 font-bold">{s.slaComplianceRate || 100}%</span></p>
                  <p>💼 Workload: <span className="text-gray-800 font-bold">{s.activeComplaints || 0} active</span></p>
                  <p className="text-xs truncate">📍 Wards: {s.assignedWards?.join(", ") || "None"}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
  className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition flex-1"
  onClick={() => {
    setStaffToAssign(s);
    setPriorityModalOpen(true);
  }}
>
  Assign
</button>

                <button
                  className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition flex-1"
                  onClick={() => fetchStaffPerformance(s)}
                >
                  Performance
                </button>
              </div>
            </div>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center p-4 text-gray-500">
              No Staff found.
            </td>
          </tr>
        )}
      </div>

      {/* Performance Modal */}
      {selectedStaff && (
        <Modal
          title={`${selectedStaff.name} - Performance`}
          onClose={() => setSelectedStaff(null)}
        >
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { status: "Resolved", count: selectedStaff.performance.Resolved },
                  { status: "In Progress", count: selectedStaff.performance["In Progress"] },
                  { status: "Pending", count: selectedStaff.performance.Pending },
                ]}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#f97316" barSize={25} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Modal>
      )}

      {priorityModalOpen && staffToAssign && (
  <Modal
    title={`Assign Complaint #${complaint?.id} to ${staffToAssign.name}`}
    onClose={() => setPriorityModalOpen(false)}
  >
    <div className="space-y-4">
      <label className="block font-semibold">Select Priority:</label>
      <select
        className="w-full p-3 border rounded-xl"
        value={selectedPriority}
        onChange={(e) => setSelectedPriority(e.target.value)}
      >
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <div className="flex justify-end gap-3 mt-4">
        <button
          className="px-6 py-3 bg-gray-200 rounded-xl"
          onClick={() => setPriorityModalOpen(false)}
        >
          Cancel
        </button>
        <button
          className="px-6 py-3 bg-orange-600 text-white rounded-xl"
          onClick={() => {
            handleAssign(staffToAssign.id).finally(() => {
              setPriorityModalOpen(false);
            });
          }}
        >
          Assign
        </button>
      </div>
    </div>
  </Modal>
)}

    </div>
  );
};



// Modal component
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-2xl font-bold text-orange-600 mb-4">{title}</h3>
      {children}
      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 bg-gray-200 rounded-lg" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>

  
);

export default AssignStaffPage;
