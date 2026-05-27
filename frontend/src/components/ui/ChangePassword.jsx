import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { API_BASE_URL } from "../../lib/api";

const ChangePassword = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !user) navigate("/");
  }, [token, user, navigate]);

  const goToDashboard = (role) => {
    const r = String(role || "").toLowerCase();
    if (r === "ringmaster" || r === "admin") return navigate("/admin-dashboard");
    if (r === "staff") return navigate("/staff-dashboard");
    return navigate("/citizen-dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");

      if (data.user) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
      }

      setMessage("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => goToDashboard((data.user || user).role), 700);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF5EE] flex flex-col">
      <div className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-8 bg-white shadow-md z-50">
        <Logo />
        <button
          onClick={() => navigate("/")}
          className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2 transition duration-200"
        >
          Home
        </button>
      </div>

      <div className="flex-1 pt-32 px-6 flex items-start justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-[#d55d1f] mb-2 text-center">Change Password</h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            For security reasons, please set a new password to continue.
          </p>

          {message && (
            <div className="mb-4 text-sm text-center text-gray-800 bg-orange-50 border border-orange-200 rounded-lg p-3">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#d55d1f] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#d55d1f] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#d55d1f] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#d55d1f] hover:bg-[#b54a16] text-white font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
