import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { searchUsers } from "../../api/user.api";
import { adminCreateStaff } from "../../api/auth.api";
import { FiUserPlus, FiMail, FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

export default function AdminInviteStaff() {
  const [staffName, setStaffName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const navigate = useNavigate();

  const fetchStaffList = async () => {
    try {
      setListLoading(true);
      const queryParams = new URLSearchParams({ role: "Staff" }).toString();
      const data = await searchUsers(queryParams);
      setStaffList(data);
    } catch (err) {
      console.error("Error fetching staff list:", err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const data = await adminCreateStaff({ name: staffName, email });

      setSuccess(true);
      setMessage(data.message || "Personnel invitation sent successfully!");
      setStaffName("");
      setEmail("");
      // Automatically refresh staff list
      fetchStaffList();
    } catch (err) {
      setSuccess(false);
      setMessage(err.response?.data?.message || err.message || "Network error. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout requiredRole="Admin">
      <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6 mt-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Invite Personnel
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Create official civic contractor roles by sending a secure onboarding invitation email.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/admin-dashboard")} className="gap-2">
            <FiArrowLeft /> Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Guidelines & Information */}
          <div className="md:col-span-5 space-y-6">
            <Card className="border border-slate-100">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase tracking-wider flex items-center gap-2">
                  🛡️ Security Guidelines
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Civic staff accounts grant override administrative routing rights, priority scoring access, and work status verification capabilities.
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-650">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500">✔</span>
                    <span>Link expires automatically in 48 hours</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500">✔</span>
                    <span>Role automatically bound to 'Staff' level</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500">✔</span>
                    <span>Deterministic password setup on first click</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invitation Form Card */}
          <div className="md:col-span-7">
            <Card className="border border-slate-100 shadow-sm bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                
                {/* Result Message Banner */}
                {message && (
                  <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    success 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                      : "bg-red-50 border-red-100 text-red-800"
                  }`}>
                    {success ? <FiCheckCircle className="text-base text-emerald-500 flex-shrink-0" /> : <FiAlertCircle className="text-base text-red-500 flex-shrink-0" />}
                    <p>{message}</p>
                  </div>
                )}

                <form onSubmit={handleSendInvite} className="space-y-5">
                  
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="staffName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Staff Member Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                      <input
                        id="staffName"
                        type="text"
                        placeholder="e.g., John Doe"
                        required
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                      <input
                        id="email"
                        type="email"
                        placeholder="e.g., staff@tattletent.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading || !staffName || !email}
                      className="w-full"
                      variant="primary"
                    >
                      {isLoading ? "Sending secure invitation..." : "Send Secure Invitation"}
                    </Button>
                  </div>

                </form>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Current Staff Directory */}
        <div className="space-y-4 pt-6 border-t border-slate-150">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                Current Staff Directory
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Overview of personnel currently registered in the system.
              </p>
            </div>
            <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 font-bold px-3 py-1">
              {staffList.length} Personnel
            </Badge>
          </div>

          <Card className="border border-slate-100 bg-white overflow-hidden shadow-sm rounded-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100">
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-450 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-450 uppercase tracking-wider">Email Address</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-450 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {listLoading ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-xs text-slate-450 font-medium">
                          <span className="inline-block w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2"></span>
                          Loading staff personnel directory...
                        </td>
                      </tr>
                    ) : staffList.length > 0 ? (
                      staffList.map((staff) => (
                        <tr key={staff.user_id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {staff.name ? staff.name[0].toUpperCase() : "S"}
                              </div>
                              <span className="text-sm font-bold text-slate-700">{staff.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-550">
                            {staff.email}
                          </td>
                          <td className="px-6 py-4">
                            {staff.must_change_password ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Pending Setup
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-10 text-center text-sm text-slate-400 font-medium italic">
                          No staff members found on current system.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}
