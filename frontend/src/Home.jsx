"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppButton from "./components/ui/app-button";
import Logo from "./components/ui/Logo";
import { useNavigate } from "react-router-dom";
import { FaBars, FaGithub, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaGoogle } from "react-icons/fa";
import { FiX, FiCheckCircle, FiClock, FiActivity, FiLayers, FiShield, FiTrendingUp } from "react-icons/fi";
import axios from "axios";
import { API_BASE_URL } from "./lib/api";

const portals = [
  ["Citizen Console", "Lodge grievances, upload evidence, and verify resolutions in real-time.", "M12 4v16m8-8H4"],
  ["Authority Dashboard", "Review, assign, and resolve city grievances with SLA-governed workflows.", "M3 3h18v18H3z"],
  ["Smart GIS Heatmap", "Geospatial hotspot mapping for municipal resource allocation and city planning.", "M12 6v6l4 2"],
];

const features = [
  ["AI-Guided Duplicate Pre-Filter", "Identifies colocated semantic matches to boost priority score and prevent redundant contractor dispatches.", <FiLayers className="text-xl" />],
  ["SLA Escalate Engines", "Automated priority-score calculations based on severity, age, and citizen duplicate consensus.", <FiActivity className="text-xl" />],
  ["Citizen Verification Flow", "Resolutions go into a pending state, requiring the citizen's confirmation or reject-feedback loop.", <FiShield className="text-xl" />],
];

const categories = [
  ["Sanitation & Waste", "Garbage overflow, civic cleanliness, and hazardous waste disposal.", "M3 3l18 18M4 6h16"],
  ["Water Infrastructure", "Leakages, quality contamination, and main pipe burst reports.", "M12 4v16m8-8H4"],
  ["Electricity & Lighting", "Public lighting blackouts, dangerous wiring, and solar grid issues.", "M12 3v18m9-9H3"],
  ["Road Damage & Streets", "Pothole clusters, broken curbs, and dangerous traffic signs.", "M4 6h16M4 12h8m-8 6h16"],
  ["Public Transits", "Civic guidelines violations, bus/train schedule irregularities, and safety concerns.", "M5 13l4 4L19 7"],
  ["Civic Overrides", "General municipal emergencies and all other standard concerns.", "M4 4h16v16H4z"],
];

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");

  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [signupMessage, setSignupMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, []);

  // ------------------- SIGNUP -------------------
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (password !== cpassword) return;

    try {
      setIsLoading(true);
      setSignupMessage("");
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setSignupMessage("An account with this email already exists. Please log in.");
        setSignupOpen(false);
        setLoginOpen(true);
        setLoginMessage("An account with this email already exists. Please log in.");
        return;
      }

      if (!res.ok) throw new Error(data.message);
      setOtpOpen(true);
    } catch (err) {
      setSignupMessage(err.message || "Signup failed. Try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------- VERIFY OTP -------------------
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setSignupMessage("");
      const registerRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          otp,
        }),
      });

      const registerData = await registerRes.json();

      if (registerRes.status === 409) {
        setSignupMessage("An account with this email already exists. Please log in.");
        setOtpOpen(false);
        setSignupOpen(false);
        setLoginOpen(true);
        setLoginMessage("An account with this email already exists. Please log in.");
        return;
      }

      if (registerRes.ok) {
        sessionStorage.setItem("token", registerData.token);
        sessionStorage.setItem("user", JSON.stringify(registerData.user));
        setUser(registerData.user);
        setOtpOpen(false);
        setSignupOpen(false);
        setFullName("");
        setEmail("");
        setPassword("");
        setCPassword("");
        setOtp("");
      } else {
        setSignupMessage(registerData.message);
      }
    } catch (err) {
      setSignupMessage("OTP Verify Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------- LOGIN -------------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setLoginMessage("");

      const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        if (loginRes.status === 401 && loginData.message.includes("Invalid credentials")) {
          try {
            const emailCheck = await fetch(`${API_BASE_URL}/api/auth/check-email?email=${encodeURIComponent(email)}`);
            const emailExists = await emailCheck.json();

            if (!emailCheck.ok || !emailExists.exists) {
              setLoginOpen(false);
              setSignupOpen(true);
              setSignupMessage("No account found with this email. Please sign up.");
            } else {
              setLoginMessage("Incorrect password. Please try again.");
            }
          } catch (emailErr) {
            setLoginMessage("Unable to verify email. Please try again later.");
          }
        } else {
          setLoginMessage(loginData.message);
        }
        return;
      }

      sessionStorage.setItem("token", loginData.token);
      sessionStorage.setItem("user", JSON.stringify(loginData.user));
      setUser(loginData.user);

      setLoginOpen(false);
      setEmail("");
      setPassword("");

      if (loginData.must_change_password) {
        navigate("/change-password");
        return;
      }

      const role = String(loginData.user.role || "").toLowerCase();
      if (role === "ringmaster" || role === "admin" || role==="Admin") navigate("/admin-dashboard");
      else if (loginData.user.role === "Staff") navigate("/staff-dashboard");
      else navigate("/citizen-dashboard");

    } catch (err) {
      setLoginMessage("Login Unsuccessful: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const [avgResolutionTime, setAvgResolutionTime] = useState(0);

  const fetchComplaints = async () => {
    try {  
      const queryParams = new URLSearchParams({ status: "Resolved" }).toString();
      const response = await fetch(`${API_BASE_URL}/api/public/complaints/search?${queryParams}`);
  
      if (!response.ok) throw new Error("Failed to fetch complaints");
  
      const data = await response.json();
      
      if (data.length > 0) {
        const totalHours = data.reduce((acc, complaint) => {
          const submitted = new Date(complaint.submitted_at);
          const updated = new Date(complaint.updated_at);
          const diffHours = (updated - submitted) / (1000 * 60 * 60);
          return acc + diffHours;
        }, 0);

        const avgHours = totalHours / data.length;
        setAvgResolutionTime(Math.round(avgHours));
      }
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  };
  
  useEffect(() => {
    fetchComplaints();
  }, []);

  const [counts, setCounts] = useState({ resolved: 0, pending: 0, in_progress: 0 });

  const fetchCounts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/public/complaints/counts`);
      setCounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const [reviews, setReviews] = useState([]);

  const fetchFeedback = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/public/feedback`);
      setReviews((res.data.data || []).map(c => ({
        name: c.name,
        rating: c.rating,
        comment: c.comment
      })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 font-sans relative overflow-x-hidden min-h-screen">
      {/* Visual SaaS Mesh BG */}
      <div className="absolute inset-0 grid-mesh-bg opacity-40 pointer-events-none -z-10"></div>
      
      {/* Elegant Header Navbar */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col sm:flex-row justify-between items-center py-5 px-6 sm:px-12 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100/80 shadow-sm"
      >
        <div className="w-full flex items-center justify-between">
          <Logo />
          <button
            className="sm:hidden p-2.5 rounded-xl bg-slate-50 border border-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FaBars size={20} className="text-slate-800" />
          </button>
        </div>

        <div className={`sm:flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0 items-center w-full sm:w-auto ${menuOpen ? "flex" : "hidden"}`}>
          {user ? (
            <>
              <AppButton
                onClick={() => {
                  const role = String(user.role || "").toLowerCase();
                  if (role === "citizen") navigate("/citizen-dashboard");
                  else if (role === "staff") navigate("/staff-dashboard");
                  else navigate("/admin-dashboard");
                }}
                className="w-full sm:w-auto"
              >
                Go to Dashboard
              </AppButton>
              <AppButton
                variant="outline"
                onClick={() => {
                  sessionStorage.removeItem("user");
                  sessionStorage.removeItem("token");
                  setUser(null);
                  navigate("/");
                }}
                className="w-full sm:w-auto"
              >
                Logout
              </AppButton>
            </>
          ) : (
            <>
              <button
                onClick={() => setLoginOpen(true)}
                className="text-sm font-bold text-slate-600 hover:text-slate-900 transition px-4 py-2 w-full sm:w-auto text-center"
              >
                Sign In
              </button>
              <AppButton
                onClick={() => setSignupOpen(true)}
                className="w-full sm:w-auto px-6"
              >
                Register Console
              </AppButton>
            </>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="text-center pt-28 pb-20 px-6 max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100/50 rounded-full px-4 py-1.5 mb-6 shadow-sm select-none"
        >
          <span className="w-2 h-2 bg-primary-500 rounded-full animate-ping"></span>
          <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">
            AI-Governed Municipal Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight leading-[1.1] text-slate-900"
        >
          Speak Up, Get Heard,<br />
          <span className="gradient-text-indigo font-black">Transform Your Community</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          TattleTent empowers citizens to report civic grievances, tracks resolutions under strict SLA timelines,
          and utilizes semantic duplicate AI to prevent municipal redundancies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <AppButton
            size="lg"
            onClick={() => {
              if (user) {
                const role = String(user.role || "").toLowerCase();
                if (role === "citizen") navigate("/citizen-dashboard");
                else if (role === "staff") navigate("/staff-dashboard");
                else navigate("/admin-dashboard");
              } else {
                setSignupOpen(true);
              }
            }}
          >
            Get Started Free
          </AppButton>
          <AppButton
            variant="outline"
            size="lg"
            onClick={() => navigate("/learn-more")}
          >
            How it Works
          </AppButton>
        </motion.div>

        {/* Premium Dashboard Preview Widget */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="mt-16 w-full rounded-3xl border border-slate-200/80 shadow-strong bg-white p-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 to-indigo-500/5 opacity-40"></div>
          <div className="h-6 flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider ml-2">TattleTent Civic Analytics Widget</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left">
              <p className="text-xs font-semibold text-slate-400 uppercase">SLA Compliance Rate</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-1">98.4%</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left">
              <p className="text-xs font-semibold text-slate-400 uppercase">Average Resolution</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-1">14.2 Hrs</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left">
              <p className="text-xs font-semibold text-slate-400 uppercase">Active Citizens</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-1">12,480+</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Transparency Portal Insights Grid */}
      <section className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 bg-success-50 text-success-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <FiTrendingUp /> Live Transparency Portal
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Real-Time Community Insights
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
              Every citizen deserves a completely open, audited view of civic progress. No hidden escalations or closed resolutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-r from-primary-50/50 via-indigo-50/50 to-primary-50/50 border border-primary-100/50 rounded-3xl p-8 flex flex-col items-center justify-center saas-hover-lift text-primary-700 text-center">
              <div className="text-5xl font-black tracking-tight">
                {(parseInt(counts.resolved, 10) || 0) +
                  (parseInt(counts.in_progress, 10) || 0) +
                  (parseInt(counts.pending, 10) || 0)}
              </div>
              <div className="mt-3 font-bold text-sm text-slate-600 uppercase tracking-widest">Total Reports Lodged</div>
            </div>

            <div className="bg-gradient-to-r from-success-50/50 via-emerald-50/50 to-success-50/50 border border-success-100/50 rounded-3xl p-8 flex flex-col items-center justify-center saas-hover-lift text-success-700 text-center">
              <div className="text-5xl font-black tracking-tight">
                {avgResolutionTime || 24} Hrs
              </div>
              <div className="mt-3 font-bold text-sm text-slate-600 uppercase tracking-widest">Average Time to Resolve</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-emerald-50/20 border border-emerald-100/60 rounded-3xl p-7 text-center flex flex-col items-center saas-hover-lift">
              <div className="text-3xl font-extrabold text-emerald-600">{counts.resolved}</div>
              <div className="mt-2 font-bold text-xs text-slate-500 uppercase tracking-wider">Resolved Issues</div>
            </div>
            <div className="bg-amber-50/20 border border-amber-100/60 rounded-3xl p-7 text-center flex flex-col items-center saas-hover-lift">
              <div className="text-3xl font-extrabold text-amber-600">{counts.in_progress}</div>
              <div className="mt-2 font-bold text-xs text-slate-500 uppercase tracking-wider">In Progress</div>
            </div>
            <div className="bg-rose-50/20 border border-rose-100/60 rounded-3xl p-7 text-center flex flex-col items-center saas-hover-lift">
              <div className="text-3xl font-extrabold text-rose-600">{counts.pending}</div>
              <div className="mt-2 font-bold text-xs text-slate-500 uppercase tracking-wider">Pending Audit</div>
            </div>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="py-20 bg-slate-50 relative z-10 border-b border-slate-100">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-extrabold text-slate-900 mb-4">Unified SaaS Access Portals</h3>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">Different visual workflows tailored for every segment of the municipality.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          {portals.map(([title, desc], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm saas-hover-lift"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-6 shadow-sm border border-primary-100/30 text-lg font-bold">
                🚀
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">{title}</h4>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Key Architectural Features */}
      <section className="py-20 bg-white">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-extrabold text-slate-900 mb-4">Advanced Governance Features</h3>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">SaaS infrastructure built to ensure absolute resolution accountability.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          {features.map(([title, desc, icon], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              viewport={{ once: true }}
              className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm saas-hover-lift flex-1"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 mb-5">
                {icon}
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-3">{title}</h4>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Category Icons Grid */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="text-center mb-14">
          <h3 className="text-3xl font-extrabold text-slate-900 mb-3">Structured Civic Categories</h3>
          <p className="text-slate-500 text-sm">Targeted reporting channels to route alerts dynamically.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          {categories.map(([title, desc], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm saas-hover-lift"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm border border-indigo-100/20 text-lg font-bold">
                📁
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-2">{title}</h4>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* User Reviews */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="text-center mb-14">
          <h3 className="text-3xl font-extrabold text-slate-900 mb-4">What Citizens Are Saying</h3>
          <p className="text-slate-500 text-sm">Transparency builds deep trust across our communities.</p>
        </div>

        <motion.div
          className="flex gap-6 overflow-x-auto px-6 pb-6 max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {Array.isArray(reviews) && reviews.length > 0 ? (
            reviews.map((review, idx) => (
              <motion.div
                key={idx}
                className="min-w-[280px] bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm flex-shrink-0 saas-hover-lift"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 120 }}
              >
                <div className="flex items-center mb-3">
                  {[...Array(review.rating || 0)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                  {[...Array(5 - (review.rating || 0))].map((_, i) => (
                    <span key={i} className="text-slate-200 text-lg">★</span>
                  ))}
                </div>
                <p className="text-slate-600 text-xs sm:text-sm italic mb-4 leading-relaxed">"{review.comment || ''}"</p>
                <p className="text-xs font-bold text-slate-800">- {review.name || 'Anonymous'}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-slate-400 italic text-center w-full">No active reviews recorded yet.</p>
          )}
        </motion.div>
      </section>

      {/* Modern Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-slate-900 text-slate-400 pt-16 border-t border-slate-850 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h4 className="text-white font-bold text-lg mb-4">About TattleTent</h4>
            <p className="text-sm leading-relaxed text-slate-400">
              TattleTent provides automated, AI-governed municipal platforms to optimize civic grievances and establish complete transparency.
            </p>
            <div className="flex gap-3.5 mt-5">
              {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-primary-500 hover:text-white transition"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/" className="hover:text-primary-400 transition">Home Console</a></li>
              <li><a href="/all-complaints" className="hover:text-primary-400 transition">Transparency Ledger</a></li>
              <li><a href="/heatmap" className="hover:text-primary-400 transition">Civic Heatmap</a></li>
              <li><a href="/faq" className="hover:text-primary-400 transition">FAQ Help</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">Legal Framework</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/terms" className="hover:text-primary-400 transition">Terms of Service</a></li>
              <li><a href="/privacy" className="hover:text-primary-400 transition">Privacy Policy</a></li>
              <li><a href="/help" className="hover:text-primary-400 transition">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">Contributed By</h4>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              Open-source civic planning architecture. Click to view developers on GitHub.
            </p>
            <div className="flex justify-start gap-4">
              {[
                { name: "Yamini Pal", url: "https://github.com/YaminiPal" },
                { name: "Yug Shah", url: "https://github.com/yugshah7777" },
                { name: "Sanyam Jain", url: "https://github.com/Sanyamsj30" },
              ].map((repo, idx) => (
                <a
                  key={idx}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-8 h-8 rounded-full bg-slate-800 hover:bg-primary-500 text-slate-300 hover:text-white flex items-center justify-center shadow-lg hover:shadow-2xl transition transform hover:scale-105 relative"
                  style={{ zIndex: 10 - idx }}
                >
                  <FaGithub size={18} />
                  <span className="absolute -bottom-8 w-max opacity-0 group-hover:opacity-100 bg-white text-slate-900 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-lg transition">
                    {repo.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 py-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} TattleTent. Developed under standard SaaS governance frameworks.
        </div>
      </motion.footer>

      {/* Authentic Glassmorphic Login Modal */}
      <AnimatePresence>
        {loginOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-[100] px-4"
            onClick={() => setLoginOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-7 sm:p-9 rounded-3xl shadow-strong max-w-md w-full border border-slate-100 relative"
            >
              <button
                onClick={() => setLoginOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
              >
                <FiX size={20} />
              </button>

              <form onSubmit={handleLoginSubmit}>
                <h2 className="text-2xl font-black text-slate-850 tracking-tight text-center mb-1">Welcome Back</h2>
                <p className="text-xs text-slate-400 font-semibold text-center mb-6 uppercase tracking-wider">Access TattleTent Console</p>

                {loginMessage && (
                  <p className="text-danger-700 bg-danger-50 border border-danger-100 rounded-2xl py-3 px-4 text-xs font-semibold mb-5 text-center">
                    {loginMessage}
                  </p>
                )}
                
                <div className="mb-4">
                  <label htmlFor="loginEmail" className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="loginEmail"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="loginPassword" className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="loginPassword"
                    type="password"
                    placeholder="Your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
                  />
                </div>

                <AppButton type="submit" disabled={isLoading} className="w-full justify-center">
                  {isLoading ? "Verifying Access..." : "Sign In to Dashboard"}
                </AppButton>

                <div className="flex items-center justify-center my-5">
                  <div className="h-px bg-slate-100 flex-grow"></div>
                  <span className="px-3.5 text-slate-450 text-[10px] font-bold uppercase tracking-widest">OR</span>
                  <div className="h-px bg-slate-100 flex-grow"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-3 transition shadow-sm"
                >
                  <FaGoogle className="text-red-500" /> Continue with Google
                </button>

                <div className="flex items-center justify-between text-xs mt-6 border-t border-slate-50 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginOpen(false);
                      setForgotPassword(true);
                    }}
                    className="text-primary-500 hover:text-primary-600 font-semibold"
                  >
                    Forgot Password?
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginOpen(false);
                      setSignupOpen(true);
                    }}
                    className="text-slate-500 hover:text-slate-800 font-bold"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-[100] px-4"
            onClick={() => setForgotPassword(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-7 sm:p-9 rounded-3xl shadow-strong max-w-md w-full border border-slate-100 relative"
            >
              <button
                onClick={() => setForgotPassword(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
              >
                <FiX size={20} />
              </button>

              <h2 className="text-xl font-extrabold text-slate-850 text-center tracking-tight mb-1">
                Reset Password
              </h2>
              <p className="text-xs text-slate-400 font-semibold text-center mb-6 uppercase tracking-wider">Recover your TattleTent Access</p>

              {loginMessage && (
                <p className="text-danger-700 bg-danger-50 border border-danger-100 rounded-2xl py-3 px-4 text-xs font-semibold mb-5 text-center">
                  {loginMessage}
                </p>
              )}

              {!otpOpen ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    setLoginMessage("");
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/auth/send-reset-otp`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.message);
                      setOtpOpen(true);
                    } catch (err) {
                      setLoginMessage(err.message || "Failed to send OTP");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <div className="mb-6">
                    <label htmlFor="forgotEmail" className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="forgotEmail"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
                    />
                  </div>

                  <AppButton type="submit" disabled={isLoading} className="w-full justify-center">
                    {isLoading ? "Sending Code..." : "Send Verification Code"}
                  </AppButton>
                </form>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    setLoginMessage("");
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, otp, password }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.message);
                      setForgotPassword(false);
                      setOtpOpen(false);
                      setPassword("");
                      setOtp("");
                      setLoginOpen(true);
                      setLoginMessage("Password reset successful. Please log in.");
                    } catch (err) {
                      setLoginMessage(err.message || "Failed to reset password");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <div className="mb-4">
                    <label htmlFor="resetOtp" className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      OTP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="resetOtp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-Digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-lg tracking-widest focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition font-bold"
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="newPassword" className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
                    />
                  </div>

                  <AppButton
                    type="submit"
                    disabled={otp.length !== 6 || password.length < 8 || isLoading}
                    className="w-full justify-center"
                  >
                    {isLoading ? "Resetting Password..." : "Submit Reset"}
                  </AppButton>
                </form>
              )}

              <p className="text-xs text-center mt-6 text-slate-500 border-t border-slate-50 pt-4 font-semibold">
                Remember your password?{" "}
                <button
                  onClick={() => {
                    setForgotPassword(false);
                    setLoginOpen(true);
                  }}
                  className="text-primary-500 hover:underline font-bold"
                >
                  Sign In
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signup Modal */}
      <AnimatePresence>
        {signupOpen && !otpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-[100] px-4"
            onClick={() => setSignupOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-7 sm:p-9 rounded-3xl shadow-strong max-w-md w-full border border-slate-100 relative"
            >
              <button
                onClick={() => setSignupOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
              >
                <FiX size={20} />
              </button>

              <h2 className="text-2xl font-black text-slate-850 text-center tracking-tight mb-1">Create Account</h2>
              <p className="text-xs text-slate-400 font-semibold text-center mb-6 uppercase tracking-wider">Start reporting grievances</p>
              
              {signupMessage && (
                <p className="text-danger-700 bg-danger-50 border border-danger-100 rounded-2xl py-3 px-4 text-xs font-semibold mb-5 text-center">
                  {signupMessage}
                </p>
              )}

              <form onSubmit={handleSignupSubmit}>
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Jane Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="cpassword" className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cpassword"
                    type="password"
                    placeholder="Confirm your password"
                    required
                    minLength={8}
                    value={cpassword}
                    onChange={(e) => setCPassword(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary-500/20
                      ${cpassword && password !== cpassword ? 'border-danger-500 focus:border-danger-500' : 'border-slate-200 focus:border-primary-500'}`}
                  />
                  {cpassword && password !== cpassword && (
                    <p className="text-danger-600 text-xs font-semibold mt-1.5 pl-1">Passwords do not match</p>
                  )}
                </div>

                <AppButton
                  type="submit"
                  disabled={!password || password !== cpassword}
                  className="w-full justify-center"
                >
                  Verify Verification OTP
                </AppButton>
              </form>

              <div className="flex items-center justify-center my-4">
                <div className="h-px bg-slate-100 flex-grow"></div>
                <span className="px-3.5 text-slate-450 text-[10px] font-bold uppercase tracking-widest">OR</span>
                <div className="h-px bg-slate-100 flex-grow"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-3 transition shadow-sm"
              >
                <FaGoogle className="text-red-500" /> Continue with Google
              </button>

              <p className="text-xs text-center mt-6 text-slate-500 border-t border-slate-50 pt-4 font-semibold">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setSignupOpen(false);
                    setLoginOpen(true);
                  }}
                  className="text-primary-500 hover:underline font-bold"
                >
                  Sign In
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP MODAL */}
      <AnimatePresence>
        {otpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-[100] px-4"
            onClick={() => setOtpOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-7 sm:p-9 rounded-3xl shadow-strong max-w-md w-full border border-slate-100 relative text-center"
            >
              <button
                onClick={() => setOtpOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
              >
                <FiX size={20} />
              </button>

              <h2 className="text-xl font-extrabold text-slate-850 tracking-tight mb-1">
                Verify Your Email
              </h2>
              <p className="text-xs text-slate-400 font-semibold mb-6 uppercase tracking-wider">Verification OTP Code Sent</p>
              
              <p className="text-slate-500 text-sm mb-6">
                Please enter the 6-digit confirmation code sent to <span className="font-bold text-slate-800">{email}</span>
              </p>

              {signupMessage && (
                <p className="text-danger-700 bg-danger-50 border border-danger-100 rounded-2xl py-3 px-4 text-xs font-semibold mb-5 text-center">
                  {signupMessage}
                </p>
              )}

              <form onSubmit={handleVerifyOtpSubmit}>
                <div className="mb-6">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition font-extrabold"
                  />
                </div>

                <AppButton
                  type="submit"
                  disabled={otp.length !== 6 || isLoading}
                  className="w-full justify-center"
                >
                  {isLoading ? "Verifying code..." : "Submit OTP Verification"}
                </AppButton>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
