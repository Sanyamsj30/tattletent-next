import React, { useState } from "react";

const AllComplaintsPage = () => {
  const [complaints, setComplaints] = useState([
    { id: 1, category: "Water Leak", location: "Tent #5", status: "Pending", citizen: "John Doe", priority: null, description: "Leak near Tent #5, pipe burst", assignedTo: null },
    { id: 2, category: "Garbage", location: "Central Park", status: "In Progress", citizen: "Mike Johnson", priority: "Low", description: "Overflowing bin near park", assignedTo: "John Doe" },
    { id: 3, category: "Electrical", location: "Sector B", status: "Pending", citizen: "Sarah Lee", priority: null, description: "Street light not working", assignedTo: null },
    { id: 4, category: "Pathway Damage", location: "Sector C", status: "Resolved", citizen: "Jane Smith", priority: "Medium", description: "Broken tiles in Sector C repaired", assignedTo: "Mike Johnson", solution: "Tiles replaced" },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignStaff, setAssignStaff] = useState(null);

  const staffList = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Lee"];

  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = filterStatus === "all" || c.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesCategory = filterCategory === "all" || c.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesStatus && matchesCategory;
  });

  const handleAssign = (complaint) => setAssignStaff(complaint);

  const confirmAssign = (staffName) => {
    setComplaints(prev => prev.map(c => c.id === assignStaff.id ? { ...c, assignedTo: staffName, status: "In Progress" } : c));
    setAssignStaff(null);
  };

  const handleUpdate = (complaint) => setSelectedComplaint({ ...complaint });

  const saveUpdate = () => {
    setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? selectedComplaint : c));
    setSelectedComplaint(null);
  };

  const exportCSV = () => {
    const csvContent = [
      ["ID", "Category", "Location", "Status", "Citizen", "Priority", "Assigned To", "Description"],
      ...complaints.map(c => [c.id, c.category, c.location, c.status, c.citizen, c.priority || "", c.assignedTo || "", c.description])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "all_complaints.csv";
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#FCF5EE] font-sans p-6">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-orange-700 mb-2">All Complaints</h2>
        <p className="text-gray-700 text-lg">View, assign, and update all complaints efficiently.</p>
      </div>

      {/* Filter & Category */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {["all","pending","in progress","resolved"].map(f => (
            <button
              key={f}
              onClick={()=>setFilterStatus(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${filterStatus===f?"bg-orange-600 text-white":"bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"}`}
            >
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>

        <select
          className="px-4 py-2 border rounded-lg w-full sm:w-1/3"
          value={filterCategory}
          onChange={(e)=>setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="pathway damage">Pathway Damage</option>
          <option value="water leak">Water Leak</option>
          <option value="garbage">Garbage</option>
          <option value="electrical">Electrical</option>
        </select>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Export CSV
        </button>
      </div>

      {/* Complaints Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="min-w-full divide-y divide-blue-200">
          <thead className="bg-white">
            <tr>
              {["ID","Category","Location","Status","Citizen","Priority","Assigned To","Actions"].map(h=>(
                <th key={h} className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-200 bg-white">
            {filteredComplaints.map(c=>(
              <tr key={c.id} className="hover:bg-blue-50 transition">
                <td className="p-4 font-bold">{c.id}</td>
                <td className="p-4">{c.category}</td>
                <td className="p-4">{c.location}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.status==="Resolved"?"bg-green-100 text-green-800":c.status==="In Progress"?"bg-yellow-100 text-yellow-800":"bg-red-100 text-red-800"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-4">{c.citizen}</td>
                <td className="p-4">{c.priority || "Not Set"}</td>
                <td className="p-4">{c.assignedTo || "Unassigned"}</td>
                <td className="p-4 flex gap-2">
                  <button className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition" onClick={()=>handleAssign(c)}>Assign</button>
                  <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition" onClick={()=>handleUpdate(c)}>Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Modal */}
      {assignStaff && (
        <Modal title={`Assign Complaint #${assignStaff.id}`} onClose={()=>setAssignStaff(null)}>
          <div className="space-y-3">
            {staffList.map(staff=>(
              <button key={staff} className="w-full px-4 py-2 bg-orange-100 rounded-lg hover:bg-orange-200 transition" onClick={()=>confirmAssign(staff)}>
                {staff}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Update Modal */}
      {selectedComplaint && (
        <Modal title={`Update Complaint #${selectedComplaint.id}`} onClose={()=>setSelectedComplaint(null)}>
          <div className="space-y-4">
            <label className="block text-sm font-semibold">Status</label>
            <select className="w-full p-3 border rounded-xl" value={selectedComplaint.status} onChange={e=>setSelectedComplaint({...selectedComplaint,status:e.target.value})}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <label className="block text-sm font-semibold">Priority</label>
            <select className="w-full p-3 border rounded-xl" value={selectedComplaint.priority || ""} onChange={e=>setSelectedComplaint({...selectedComplaint,priority:e.target.value})}>
              <option value="">Not Set</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <label className="block text-sm font-semibold">Description</label>
            <textarea className="w-full p-3 border rounded-xl" rows={4} value={selectedComplaint.description} readOnly />

            <label className="block text-sm font-semibold">Solution / Notes</label>
            <textarea className="w-full p-3 border rounded-xl" rows={3} value={selectedComplaint.solution || ""} onChange={e=>setSelectedComplaint({...selectedComplaint,solution:e.target.value})} />

            <div className="flex justify-end gap-3">
              <button className="px-6 py-3 bg-gray-200 rounded-xl" onClick={()=>setSelectedComplaint(null)}>Cancel</button>
              <button className="px-6 py-3 bg-orange-600 text-white rounded-xl" onClick={saveUpdate}>Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6" onClick={e=>e.stopPropagation()}>
      <h3 className="text-2xl font-bold text-orange-600 mb-4">{title}</h3>
      {children}
    </div>
  </div>
);

export default AllComplaintsPage;
