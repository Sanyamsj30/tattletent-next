import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { API_BASE_URL } from "../../lib/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=send OTP, 2=reset password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/send-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setMessage("OTP sent. Check your email.");
      setStep(2);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
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
      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/"), 900);
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
          <h1 className="text-3xl font-bold text-[#d55d1f] mb-2 text-center">Forgot Password</h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            {step === 1 ? "We’ll send an OTP to your email." : "Enter OTP and set a new password."}
          </p>

          {message && (
            <div className="mb-4 text-sm text-center text-gray-800 bg-orange-50 border border-orange-200 rounded-lg p-3">
              {message}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#d55d1f] outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#d55d1f] hover:bg-[#b54a16] text-white font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#d55d1f] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
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
                  minLength={8}
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
                  minLength={8}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#d55d1f] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#d55d1f] hover:bg-[#b54a16] text-white font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 text-sm text-[#d55d1f] hover:underline"
              >
                Back to send OTP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
