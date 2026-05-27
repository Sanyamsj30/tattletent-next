"use client";
import React, { useState } from "react";
import AppButton from "./app-button";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../lib/api";

export default function AdminInviteStaff() {
  const token = sessionStorage.getItem("token");
  const [staffName, setStaffName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/create-staff`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
         },
        body: JSON.stringify({ name: staffName, email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send invitation");

      setSuccess(true);
      setMessage("Invitation sent successfully!");
      setStaffName("");
      setEmail("");
    } catch (err) {
      setMessage(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF5EE] text-gray-900 flex flex-col items-center p-6 md:p-12">
      
      {/* Back Button */}
      <div className="self-start mb-6">
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="text-[#d55d1f] hover:text-[#b54a16] font-medium"
        >
          &larr; Back to Dashboard
        </button>
      </div>

      {/* Page Header */}
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#d55d1f] mb-4">
          Invite a Staff Member
        </h1>
        <p className="text-lg md:text-xl text-[#7a6f65]">
          Add a new staff member by sending an invitation to their email.
          They will receive instructions to create their account.
        </p>
      </div>

      {/* Invitation Form */}
      <form
        onSubmit={handleSendInvite}
        className="bg-white rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md"
      >
        {/* Success / Error Message */}
        {message && (
          <p
            className={`text-center mb-4 text-sm font-medium ${
              success ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        {/* Staff Name */}
        <div className="mb-4">
          <label htmlFor="staffName" className="block text-sm font-medium text-gray-700 mb-1">
            Staff Name <span className="text-red-500">*</span>
          </label>
          <input
            id="staffName"
            type="text"
            placeholder="e.g., John Doe"
            required
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#d55d1f] outline-none"
          />
        </div>

        {/* Staff Email */}
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="staff@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#d55d1f] outline-none"
          />
        </div>

        {/* Send Invite Button */}
        <AppButton
          type="submit"
          disabled={isLoading || !staffName || !email}
          className={`w-full py-3 rounded-lg text-white transition-colors duration-200 ${
            !staffName || !email
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#d55d1f] hover:bg-[#b54a16]"
          }`}
        >
          {isLoading ? "Sending..." : "Send Invitation"}
        </AppButton>
      </form>
    </div>
  );
}
