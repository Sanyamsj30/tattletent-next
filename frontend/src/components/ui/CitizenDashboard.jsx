import { useState } from "react";
import React from "react";
import Logo from "./Logo";
import AppButton from "./app-button";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CitizenDashboard = () => {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const navigate = useNavigate(); 
  const user = JSON.parse(localStorage.getItem("user"));

  const complaints = [
    { id: 1, category: "Water Leak", status: "Submitted", description: "Leak near Tent #5, pipe burst", date: "2025-10-02" },
    { id: 2, category: "Pathway Damage", status: "Resolved", description: "Broken tiles in Sector C repaired", date: "2025-09-28" },
    { id: 3, category: "Garbage", status: "In Progress", description: "Overflowing bin near park", date: "2025-10-01" },
  ];

  <div className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-8 bg-white shadow-md z-50">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex items-center">
          <button
            onClick={() => navigate("/")} // 👈 Redirect to Home page
            className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2 transition duration-200"
          >
            <span className="text-xl">Logout</span>
          </button>
        </div>
      </div>


  const getStatusBadge = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Submitted":
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const handleNewComplaint = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token || !user) {
        alert("You must be logged in to submit a complaint.");
        return;
      }

      // Create a FormData object to handle text + image together
      const formData = new FormData(e.target);

      // Add logged-in user ID automatically
      formData.append("user_id", user.user_id);

      const response = await axios.post(
        "http://localhost:5000/api/complaints",  // 👈 your backend route
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        alert("Complaint submitted successfully!");
        e.target.reset();
        setIsSubmitOpen(false);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert(error.response?.data?.message || "Failed to submit complaint.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF5EE] font-sans">
      {/* Navbar */}
<div className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-8 bg-white shadow-md z-50">
  <div className="flex items-center">
    <Logo />
  </div>
  <div className="flex items-center">
    <button
      onClick={() => navigate("/")} // 👈 this now works properly
      className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2 transition duration-200"
    >
      <span className="text-xl">Logout</span>
    </button>
  </div>
</div>


      {/* Main */}
    <main className="container mx-auto px-4 py-12 space-y-12 max-w-6xl pt-32">
  {/* I've increased space-y from 10 to 12 for more separation between sections */}

  {/* 1. Welcome Section (No box) */}
  <div className="space-y-5 py-10 font-serif">
  <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-orange-700 via-amber-600 to-yellow-500 bg-clip-text text-transparent leading-tight tracking-tight">
    👋 Welcome, {user.name}!
  </h1>
  
  <p className="text-2xl text-gray-700 mt-4 italic">
    Your portal for transparency and action in local governance.
  </p>
  
  <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
    Effortlessly submit new complaints, track their status, and see how your feedback is improving our community.
  </p>
  
  <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
    We value your input and are committed to resolving every issue promptly.
  </p>
</div>

  
  <hr className="border-gray-200" /> 
  
  {/* 2. Stats Section - No outer box, but cards have internal padding (py-8) */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8"> {/* Increased gap for better spacing */}
    {[
      { title: "Total Complaints", count: 42 },
      { title: "Resolved", count: 20 },
      { title: "Awaiting Action", count: 22 },
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

  {/* 3. Quick Actions Section - Cleaned up nesting and ensured correct white background */}
  <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"> 
    {/* Header: Title and Button side-by-side */}
    <div className="flex items-start justify-between mb-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
        ⚡ Quick Actions
      </h2>

      <button
        onClick={() => setIsSubmitOpen(true)}
        className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2 whitespace-nowrap text-base font-semibold transition duration-200"
      >
        + New Complaint
      </button>
    </div>
  
    {/* Description */}
    <p className="text-gray-500 mb-6 text-lg">Common complaint categories</p>

    {/* Category Buttons Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { icon: "🚧", label: "Pathway Damage" },
        { icon: "💧", label: "Water Leak" },
        { icon: "🗑️", label: "Garbage" },
        { icon: "⚡", label: "Electrical" },
      ].map((cat) => (
        <button
          key={cat.label}
          onClick={() => setIsSubmitOpen(true)}
          className="h-28 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all shadow-sm"
        >
          <span className="text-4xl">{cat.icon}</span>
          <span className="text-sm font-medium text-gray-700">{cat.label}</span>
        </button>
      ))}
    </div>
  </div>

  {/* 4. Complaint History - Switched colors to match new request */}
 <div 
  // Custom background color for a paper look, soft shadow, and a red margin line
  className="bg-[#fdf7e8] rounded-2xl shadow-inner-soft p-8 border border-gray-300 border-l-4 border-l-red-400" 
  // You might need to add this custom style if your Tailwind config doesn't have an inner-soft shadow:
  // style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
> 
    {/* Title - Changed color to look like dark ink */}
    <h2 className="text-2xl font-bold mb-6 text-gray-900 font-mono">📋 Your Complaint History</h2> 
    
    <div className="overflow-x-auto rounded-lg border border-gray-300"> 
      <table className="min-w-full divide-y divide-blue-200"> {/* Blue divider for 'ruled paper' effect */}
        <thead className="bg-white"> {/* White header background */}
          <tr>
            {/* Headers - Using slightly smaller font for a printed look */}
            <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Category</th> 
            <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Status</th>
            <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Details</th>
            <th className="p-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">Date</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        {/* Body - Plain white background, blue dividers */}
        <tbody className="divide-y divide-blue-200 bg-white"> 
          {complaints.map((c) => (
            <tr key={c.id} className="hover:bg-blue-50 transition"> {/* Subtle blue hover */}
              <td className="p-4 text-gray-900 font-medium font-mono">{c.category}</td> {/* Dark 'ink' color */}
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(c.status)}`}>
                  {c.status}
                </span>
              </td>
              <td className="p-4 text-gray-700 font-mono">{c.description}</td> 
              <td className="p-4 text-gray-600 text-sm font-mono">{c.date}</td> 
              <td className="p-4 text-right">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium font-mono">View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* View All button - Changed to a blue button to match the notebook theme */}
    <div className="flex justify-center mt-8">
      <button className="px-6 py-3 rounded-xl bg-orange-600 text-white font-semibold shadow-md hover:bg-orange-700 transition">
        View All Complaints
      </button>
    </div>
</div>
</main>

      {/* Modal (unchanged) */}
      {isSubmitOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsSubmitOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-orange-600 mb-6 border-b pb-2">Submit New Complaint</h3>
            <form 
              onSubmit={handleNewComplaint}
              className="space-y-5 bg-white p-6 rounded-2xl shadow-lg"
            >
  {/* Category */}
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      Complaint Category <span className="text-red-500">*</span>
    </label>
    <select
      name="category"
      required
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition shadow-inner appearance-none bg-white"
    >
      <option value="">Select Category</option>
      <option>Pathway Damage</option>
      <option>Water Leak</option>
      <option>Garbage</option>
      <option>Electrical</option>
    </select>
  </div>

  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      Title <span className="text-red-500">*</span>
    </label>
    <input
      name="title"
      type="text"
      required
      placeholder="e.g., Tent #12, Sector C"
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition shadow-inner"
    />
  </div>

  {/* Location */}
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      Location / Address <span className="text-red-500">*</span>
    </label>
    <input
      name="location"
      type="text"
      required
      placeholder="e.g., Tent #12, Sector C"
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition shadow-inner"
    />
  </div>

  {/* Description */}
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      Detailed Description <span className="text-red-500">*</span>
    </label>
    <textarea
      name="description"
      required
      placeholder="What is the issue?"
      rows={4}
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition shadow-inner resize-none"
    ></textarea>
  </div>

  {/* Photo Upload */}
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      Upload Photo (optional but recommended)
    </label>
    <input
      name="photo"
      type="file"
      accept="image/*"
      className="w-full p-2 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
    />
  </div>

  {/* Buttons */}
  <div className="flex justify-end gap-3 pt-4">
    <button
      type="button"
      className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition shadow-md font-semibold"
      onClick={() => setIsSubmitOpen(false)}
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-6 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition shadow-lg font-semibold"
    >
      Submit
    </button>
  </div>
</form>

          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
