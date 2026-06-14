import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppLayout from "./AppLayout";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { API_BASE_URL } from "../../lib/api";
import { FiLock, FiCheckCircle, FiAlertCircle, FiShield, FiKey } from "react-icons/fi";

import { useAuthSession } from "../../hooks/useAuthSession";

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, updateUser } = useAuthSession();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      navigate("/");
      return;
    }
    if (location.state?.alert) {
      setMessage(location.state.alert);
      setSuccess(false);
    }
  }, [token, user, navigate, location.state]);

  const goToDashboard = (role) => {
    const r = String(role || "").toLowerCase();
    if (r === "ringmaster" || r === "admin") return navigate("/admin-dashboard");
    if (r === "staff") return navigate("/staff-dashboard");
    return navigate("/citizen-dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirmation fields do not match.");
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
        updateUser(data.user);
      }

      setSuccess(true);
      setMessage("Password updated successfully! Transitioning...");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => goToDashboard((data.user || user).role), 1000);
    } catch (err) {
      setSuccess(false);
      setMessage(err.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
        
        {/* Header Title Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6 mt-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Security Console
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Manage account credentials and update cryptographic keys for security purposes.
            </p>
          </div>
          {!user?.must_change_password && (
            <Button variant="secondary" onClick={() => goToDashboard(user?.role)} className="gap-1 text-xs">
              Cancel Update
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Instructions and tips panel */}
          <div className="md:col-span-5 space-y-6">
            <Card className="border border-slate-100 bg-slate-900 border-slate-800 text-white shadow-lg">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-bold tracking-tight uppercase tracking-wider flex items-center gap-2 text-indigo-400">
                  <FiShield /> Strength Standards
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Protect your workspace by setting a highly secure, modern password. Standard accounts should enforce complex keys:
                </p>
                <div className="space-y-2.5 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>At least 8 characters in length</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>Includes at least one alphanumeric token</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>Distinct from your previous five history keys</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form container */}
          <div className="md:col-span-7">
            <Card className="border border-slate-100 shadow-sm bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                
                {/* Visual state message banner */}
                {message && (
                  <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 border ${
                    success 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                      : "bg-red-50 border-red-100 text-red-800"
                  }`}>
                    {success ? <FiCheckCircle className="text-base text-emerald-500 flex-shrink-0" /> : <FiAlertCircle className="text-base text-red-500 flex-shrink-0" />}
                    <span>{message}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Old Password Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Current Account Password</label>
                    <div className="relative">
                      <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* New Password Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Confirm New Password Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button Row */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Saving credentials..." : "Update Security Credentials"}
                    </Button>
                  </div>

                </form>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </AppLayout>
  );
};

export default ChangePassword;
