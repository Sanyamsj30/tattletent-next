import React, { useState, useEffect } from "react";
import Logo from './Logo'
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";


const AllComplaintsPage = () => {

  const navigate=useNavigate();

  const [complaints, setComplaints] = useState([]);
 /*  const [complaints, setComplaints] = useState([
    { id: 1, category: "Water Leak", location: "Tent #5", status: "Pending", citizen: "John Doe", priority: null, description: "Leak near Tent #5, pipe burst", assignedTo: null },
    { id: 2, category: "Garbage", location: "Central Park", status: "In Progress", citizen: "Mike Johnson", priority: "Low", description: "Overflowing bin near park", assignedTo: "John Doe" },
    { id: 3, category: "Electrical", location: "Sector B", status: "Pending", citizen: "Sarah Lee", priority: null, description: "Street light not working", assignedTo: null },
    { id: 4, category: "Pathway Damage", location: "Sector C", status: "Resolved", citizen: "Jane Smith", priority: "Medium", description: "Broken tiles in Sector C repaired", assignedTo: "Mike Johnson", solution: "Tiles replaced" },
    // Add more complaints for testing pagination  
    { id: 5, category: "Garbage", location: "Sector D", status: "Pending", citizen: "Anna Lee", priority: null, description: "Trash not collected", assignedTo: null },
    { id: 6, category: "Water Leak", location: "Sector E", status: "Pending", citizen: "Bob Smith", priority: null, description: "Pipe leak near road", assignedTo: null },
    { id: 7, category: "Electrical", location: "Sector F", status: "Resolved", citizen: "Carol White", priority: "High", description: "Power outage fixed", assignedTo: "Jane Smith", solution: "Replaced transformer" },
    { id: 8, category: "Pathway Damage", location: "Sector G", status: "In Progress", citizen: "David Green", priority: "Medium", description: "Uneven pavement", assignedTo: "Mike Johnson" },
  ]);
 */
    const fetchComplaintsByUser = async () => {
    try {
  
      const response = await fetch(`http://localhost:5000/api/complaints/search`);
  
      if (!response.ok) throw new Error("Failed to fetch complaints");
  
      const data = await response.json();
      setComplaints(data.map(c => ({
        id: c.complaint_id,
        category: c.category,
        status: c.status,
        location: c.location,
        priority: c.priority,
        description: c.description,
        assignedTo: c.assigned_to,
        photo: c.photo,
        date: new Date(c.submitted_at).toLocaleDateString()
      })));
  
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setComplaints([]); // fallback to empty array
    }
  };
  
  useEffect(() => {
      fetchComplaintsByUser();
  }, []);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");


  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const complaintsPerPage = 5; // number of complaints per page

  //const staffList = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Lee"];

  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = filterStatus === "all" || c.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesCategory = filterCategory === "all" || c.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesSearch = searchTerm === "" || c.category.toLowerCase().includes(searchTerm.toLowerCase()) || c.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Pagination calculations
  const indexOfLast = currentPage * complaintsPerPage;
  const indexOfFirst = indexOfLast - complaintsPerPage;
  const currentComplaints = filteredComplaints.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredComplaints.length / complaintsPerPage);

 /* const handleAssign = (complaint) => setAssignStaff(complaint);
  const confirmAssign = (staffName) => {
    setComplaints(prev => prev.map(c => c.id === assignStaff.id ? { ...c, assignedTo: staffName, status: "In Progress" } : c));
    setAssignStaff(null);
  };

  const handleUpdate = (complaint) => setSelectedComplaint({ ...complaint });
  const saveUpdate = () => {
    setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? selectedComplaint : c));
    setSelectedComplaint(null);
  };*/

  const handleView = (complaint) => {
    setSelectedComplaint(complaint);
    setIsViewOpen(true);
  };

  const exportComplaintPDF = (complaint) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Complaint #${complaint.id}`, 14, 22);
  doc.setFontSize(12);
  doc.text(`Category: ${complaint.category}`, 14, 40);
  doc.text(`Location: ${complaint.location}`, 14, 50);
  doc.text(`Status: ${complaint.status}`, 14, 60);
  doc.text(`Priority: ${complaint.priority || "Not Set"}`, 14, 70);
  doc.text(`Reported by: ${complaint.citizen || "Unknown"}`, 14, 80);
  doc.text(`Date: ${complaint.date}`, 14, 90);
  doc.text(`Description: ${complaint.description}`, 14, 100, { maxWidth: 180 });
  if (complaint.solution) doc.text(`Solution: ${complaint.solution}`, 14, 120, { maxWidth: 180 });
  doc.save(`Complaint_${complaint.id}.pdf`);
};


  const exportCSV = () => {
    const csvContent = [
      ["ID", "Category", "Location", "Status", "Date", "Priority", "Assigned To", "Description"],
      ...complaints.map(c => [c.id, c.category, c.location, c.status, c.date, c.priority || "", c.assignedTo || "", c.description])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "all_complaints.csv";
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#FCF5EE] font-sans p-6 pt-32">
    <div className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-8 bg-white shadow-md z-50">
    <Logo/>
    <div className="flex items-center gap-4">
      <button className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2" onClick={() => navigate("/")}>
        Home
      </button>
      <button className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2" onClick={() => navigate("/admin-dashboard")}>
        My Dashboard
      </button>
    </div>
  </div>

 
  <div className="text-center mb-8">
    <h2 className="text-5xl font-bold text-orange-700 mb-2">All Complaints</h2>
    <p className="text-gray-700 text-lg">View and Export all complaints efficiently.</p>
  </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="Search by keyword..."
          className="px-4 py-2 border rounded-lg w-full lg:w-1/3 focus:ring-2 focus:ring-orange-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select
            className="px-4 py-2 border rounded-lg w-full sm:w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            className="px-4 py-2 border rounded-lg w-full sm:w-auto"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
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

          <button
            onClick={() => {
              setSearchTerm("");
              setFilterCategory("all");
              setFilterStatus("all");
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="min-w-full divide-y divide-blue-200">
          <thead className="bg-white">
            <tr>
              {["ID","Category","Location","Status","Date","Priority","Assigned To","View"].map(h=>(
                <th key={h} className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-200 bg-white">
            {currentComplaints.map(c=>(
              <tr key={c.id} className="hover:bg-blue-50 transition">
                <td className="p-4 font-bold">{c.id}</td>
                <td className="p-4">{c.category}</td>
                <td className="p-4">{c.location}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.status==="RESOLVED"?"bg-green-100 text-green-800":c.status==="IN_PROGRESS"?"bg-yellow-100 text-yellow-800":"bg-red-100 text-red-800"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-4">{c.date}</td>
                <td className="p-4">{c.priority || "Not Set"}</td>
                <td className="p-4">{c.assignedTo || "Unassigned"}</td>
                <td className="p-4 flex gap-2">
  <button
    className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition"
    onClick={() => handleView(c)}
  >
    OPEN
  </button>
  <button
    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
    onClick={() => exportComplaintPDF(c)}
  >
    PDF
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded-lg ${currentPage === i+1 ? "bg-orange-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
              onClick={() => setCurrentPage(i+1)}
            >
              {i+1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Assign Modal */}
      {/*{assignStaff && (
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
      {/*{selectedComplaint && (
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
      )}*/}

      {isViewOpen && selectedComplaint && (
  <div
    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    onClick={() => setIsViewOpen(false)}
  >
    <div
      className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] relative overflow-y-auto p-6"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        onClick={() => setIsViewOpen(false)}
      >
        ✕
      </button>

      {/* Complaint Details */}
      <h2 className="text-3xl font-bold text-orange-600 mb-4">
        Complaint #{selectedComplaint.id}: {selectedComplaint.category}
      </h2>

      <div className="space-y-3">
        <p><strong>Description:</strong> {selectedComplaint.description}</p>
        <p><strong>Location:</strong> {selectedComplaint.location}</p>
        <p><strong>Status:</strong> {selectedComplaint.status}</p>
        <p><strong>Priority:</strong> {selectedComplaint.priority}</p>
        <p><strong>Reported by:</strong> {selectedComplaint.citizen}</p>
        <p><strong>Date:</strong> {selectedComplaint.date}</p>
        {selectedComplaint.solution && (
          <p><strong>Solution:</strong> {selectedComplaint.solution}</p>
        )}
      </div>

      {/* Image below text */}
      {selectedComplaint.photo && (
        <div className="mt-6 flex justify-center">
          <img
            src={`http://localhost:5000${selectedComplaint.photo}`}
            alt={selectedComplaint.category}
            className="max-w-full max-h-[400px] rounded-lg shadow-md object-contain"
          />
        </div>
      )}
    </div>
  </div>
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
