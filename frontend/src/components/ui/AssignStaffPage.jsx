import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import Logo from "./Logo"
import axios from "axios";

const AssignStaffPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const { complaint } = location.state || {};
  const [staffList, setstaffList] = useState([]);

  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
const [selectedPriority, setSelectedPriority] = useState("Medium");
const [staffToAssign, setStaffToAssign] = useState(null);



  const handleAssign = (staffId) => {
    axios.put(`http://localhost:5000/api/complaints/status/${complaint.id}`, {
      status: "In Progress",
      staffId: staffId,
    }).then(() => {
      navigate("/admin-dashboard"); // go back after saving
    }).catch(err => console.error(err));
  };


  const fetchStaff = async () => {
    try {
      if (!user?.user_id) return;

      const queryParams = new URLSearchParams({ role: "Staff" }).toString();
      const response = await fetch(`http://localhost:5000/api/users/search?${queryParams}`);

      if (!response.ok) throw new Error("Failed to fetch staff");

      const data = await response.json();
      setstaffList(data.map(c => ({
        id: c.user_id,
        name: c.name,
        email: c.email,
        role: c.role,
      })));

    } catch (err) {
      console.error("Error fetching staff:", err);
      setstaffList([]); // fallback to empty array
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchStaff();
    }
  }, [user]);

  const [selectedStaff, setSelectedStaff] = useState(null);

  if (!complaint) {
    navigate("/admin-dashboard"); // fallback
  }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.length > 0 ? (
          staffList.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition">
              <div>
                <h3 className="text-xl font-semibold text-orange-600">{s.name}</h3>
                <p className="text-gray-600 mb-3">{s.email}</p>
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
                  onClick={() => setSelectedStaff(s)}
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
        <Modal title={`${selectedStaff.name} - Performance`} onClose={() => setSelectedStaff(null)}>
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
            axios.put(`http://localhost:5000/api/complaints/status/${complaint.id}`, {
              status: "In Progress",
              staffId: staffToAssign.id,
              priority: selectedPriority
            }).then(() => {
              setPriorityModalOpen(false);
              navigate("/admin-dashboard");
            }).catch(err => console.error(err));
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
