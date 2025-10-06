import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import Logo from "./Logo"

const AdminDashboard = () => {
  const [staffList, setStaffList] = useState([
    { id: 1, name: "John Doe", role: "Field Staff", performance: { Resolved: 10, "In Progress": 3, Pending: 2 } },
    { id: 2, name: "Jane Smith", role: "Field Staff", performance: { Resolved: 8, "In Progress": 4, Pending: 1 } },
    { id: 3, name: "Mike Johnson", role: "Field Staff", performance: { Resolved: 12, "In Progress": 2, Pending: 3 } },
    { id: 4, name: "Sarah Lee", role: "Field Staff", performance: { Resolved: 7, "In Progress": 5, Pending: 2 } },
  ]);

  const [complaints, setComplaints] = useState([
    { id: 1, category: "Water Leak", location: "Tent #5", status: "Pending", assignedTo: null },
    { id: 2, category: "Garbage", location: "Central Park", status: "In Progress", assignedTo: "John Doe" },
    { id: 3, category: "Electrical", location: "Sector B", status: "Pending", assignedTo: null },
  ]);

  const [reviews] = useState([
    { id: 1, citizen: "Alice", comment: "Great service by staff!", rating: 5 },
    { id: 2, citizen: "Bob", comment: "Complaint resolved quickly.", rating: 4 },
    { id: 3, citizen: "Charlie", comment: "Staff were helpful and polite.", rating: 5 },
  ]);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [assignStaff, setAssignStaff] = useState(null);

  const handleViewProfile = (staff) => {
    setSelectedStaff(staff);
    setShowProfile(true);
  };

  const handleViewPerformance = (staff) => {
    setSelectedStaff(staff);
    setShowPerformance(true);
  };

  const handleAssignComplaint = (complaint) => {
    setAssignStaff(complaint);
  };

  const handleAssignConfirm = (staffName) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === assignStaff.id ? { ...c, assignedTo: staffName, status: "In Progress" } : c
      )
    );
    setAssignStaff(null);
  };

  return (
    <div className="min-h-screen bg-[#FCF5EE] font-sans">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-8 bg-white shadow-md z-50">
        <Logo/>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-semibold text-gray-800">Admin</p>
          </div>
          <button className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2">
            Logout
          </button>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12 max-w-7xl pt-32 space-y-12">
        {/* Centered Welcome */}
        <div className="text-center">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-orange-700 via-amber-600 to-yellow-500 bg-clip-text text-transparent leading-tight tracking-tight">Welcome, Admin 🛡️</h2>
          <p className="text-gray-700 text-lg italic">Manage staff, assign complaints, and review citizen feedback.</p>
        </div>

        {/* Staff Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {staffList.map((staff) => (
            <div key={staff.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition">
              <div>
                <h4 className="text-xl font-semibold text-orange-600">{staff.name}</h4>
                <p className="text-gray-600 mb-3">{staff.role}</p>
                <div className="flex flex-wrap gap-2 text-gray-700 text-sm">
                  <span>Resolved: {staff.performance.Resolved}</span>
                  <span>In Progress: {staff.performance["In Progress"]}</span>
                  <span>Pending: {staff.performance.Pending}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition"
                  onClick={() => handleViewProfile(staff)}
                >
                  Profile
                </button>
                <button
                  className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition"
                  onClick={() => handleViewPerformance(staff)}
                >
                  Performance
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Complaints Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-3xl font-bold text-gray-900">All Complaints</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                Export CSV
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                Export PDF
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="min-w-full divide-y divide-blue-200">
              <thead className="bg-white">
                <tr>
                  {["ID","Category","Location","Status","Assigned To","Actions"].map(h => (
                    <th key={h} className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200 bg-white">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50 transition">
                    <td className="p-4 font-bold">{c.id}</td>
                    <td className="p-4">{c.category}</td>
                    <td className="p-4">{c.location}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.status==="Resolved"?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4">{c.assignedTo || "Unassigned"}</td>
                    <td className="p-4 flex gap-2">
                      <button
                        className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition"
                        onClick={() => handleAssignComplaint(c)}
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Citizen Reviews */}
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Citizen Reviews</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-2 hover:shadow-2xl transition">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-2xl text-gray-700">{r.citizen}</p>
                  <div className="flex gap-1">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <span key={i} className="text-3xl text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showProfile && selectedStaff && (
        <Modal title={`${selectedStaff.name} - Profile`} onClose={()=>setShowProfile(false)}>
          <p className="text-gray-600">Role: {selectedStaff.role}</p>
          <p className="text-gray-600 mt-2">Additional profile info can go here.</p>
        </Modal>
      )}

      {showPerformance && selectedStaff && (
        <Modal title={`${selectedStaff.name} - Performance`} onClose={()=>setShowPerformance(false)}>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[{ name: selectedStaff.name, ...selectedStaff.performance }]}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Resolved" stackId="a" fill="#22c55e" />
                <Bar dataKey="In Progress" stackId="a" fill="#facc15" />
                <Bar dataKey="Pending" stackId="a" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Modal>
      )}

      {assignStaff && (
        <Modal title={`Assign Complaint #${assignStaff.id}`} onClose={()=>setAssignStaff(null)}>
          <div className="space-y-3">
            {staffList.map(staff => (
              <button key={staff.id} className="w-full px-4 py-2 bg-orange-100 rounded-lg hover:bg-orange-200 transition" onClick={()=>handleAssignConfirm(staff.name)}>
                {staff.name}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

// Modal component
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6" onClick={(e)=>e.stopPropagation()}>
      <h3 className="text-2xl font-bold text-orange-600 mb-4">{title}</h3>
      {children}
      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 bg-gray-200 rounded-lg" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
