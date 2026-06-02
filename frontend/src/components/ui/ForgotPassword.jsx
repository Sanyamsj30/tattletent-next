import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { API_BASE_URL } from "../../lib/api";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { FiMail, FiLock, FiKey, FiArrowLeft, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=send OTP, 2=reset password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/send-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setSuccess(true);
      setMessage("Verification code sent successfully. Check your email inbox.");
      setStep(2);
    } catch (err) {
      setSuccess(false);
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      setSuccess(true);
      setMessage("Password updated successfully! Redirecting to dashboard...");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setSuccess(false);
      setMessage(err.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans flex flex-col justify-center items-center p-4">
      {/* Visual background grids */}
      <div className="absolute inset-0 grid-mesh-bg opacity-30 pointer-events-none z-0"></div>
      
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 w-full h-20 flex items-center justify-between px-6 sm:px-10 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-extrabold text-lg text-slate-800 tracking-tight">TattleTent</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate("/")} className="gap-1">
          <FiArrowLeft /> Back to Home
        </Button>
      </div>

      {/* Main card */}
      <Card className="w-full max-w-md border border-slate-100 shadow-xl bg-white relative z-10 mt-12">
        <CardContent className="p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <Badge variant="warning">ACCOUNT RECOVERY</Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Forgot Password</h1>
            <p className="text-xs text-slate-400 font-semibold px-4">
              {step === 1 
                ? "Enter your registered email address and we'll dispatch a verification code." 
                : "A secure verification code has been dispatched. Enter it below with your new credentials."}
            </p>
          </div>

          {/* Success / Error banner */}
          {message && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 border ${
              success 
                ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                : "bg-red-50 border-red-100 text-red-800"
            }`}>
              {success 
                ? <FiCheckCircle className="text-base text-emerald-500 flex-shrink-0" /> 
                : <FiAlertCircle className="text-base text-red-500 flex-shrink-0" />}
              <span>{message}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g., citizen@tattletent.com"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Sending verification..." : "Send Verification Code"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Confirm your email address"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Verification OTP Code</label>
                <div className="relative">
                  <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    placeholder="6-digit code"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">New Secure Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

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
                    placeholder="Retype password to confirm"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full animate-pulse-subtle"
                >
                  {loading ? "Updating credentials..." : "Confirm & Reset Password"}
                </Button>
                
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="w-full border border-slate-200 text-slate-500"
                >
                  Back to Send OTP
                </Button>
              </div>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
