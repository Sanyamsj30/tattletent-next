"use client";
import React, { useState } from "react";

import { motion } from "framer-motion";
import AppButton from "./components/ui/app-button";
import Logo from "./components/ui/Logo"

const portals = [
  ["Citizen Portal", "Easily lodge complaints and track updates.", "M12 4v16m8-8H4"],
  ["Authority Dashboard", "Manage and resolve issues efficiently.", "M3 3h18v18H3z"],
  ["Mobile App", "Report problems instantly with your phone.", "M12 6v6l4 2"],
];

const features = [
  ["Real-Time Tracking", "Stay updated on the status of your complaints."],
  ["Transparency", "Ensure accountability with open updates."],
  ["Community Impact", "See how your reports improve the city."],
];

const categories = [
  ["Road Damage", "Potholes, cracks, and unsafe streets.", "M4 6h16M4 12h8m-8 6h16"],
  ["Waste Management", "Garbage collection and disposal issues.", "M3 3l18 18M4 6h16"],
  ["Water Supply", "Leakages, shortages, and contamination.", "M12 4v16m8-8H4"],
  ["Street Lights", "Report outages and faulty wiring.", "M12 3v18m9-9H3"],
  ["Public Transport", "Complaints about buses and local transport.", "M5 13l4 4L19 7"],
  ["Other Issues", "Any other civic concerns you face.", "M4 4h16v16H4z"],
];




export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <div className="bg-[#FCF5EE] text-gray-900">
      {/* Floating background shapes */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden -z-10">
        <motion.div
          className="absolute w-72 h-72 bg-[#ffe0d0] rounded-full mix-blend-multiply filter blur-2xl opacity-30"
          animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
          transition={{ repeat: Infinity, duration: 12 }}
        />
        <motion.div
          className="absolute right-20 top-20 w-96 h-96 bg-[#ffeed9] rounded-full mix-blend-multiply filter blur-2xl opacity-40"
          animate={{ x: [0, -60, 0], y: [0, 80, 0] }}
          transition={{ repeat: Infinity, duration: 15 }}
        />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="flex justify-between items-center py-6 px-8 bg-[#fffaf6]/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
      >
       <Logo/>

        <div className="flex gap-5">
          <AppButton
            onClick={() => setLoginOpen(true)}
            className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2">
            Login
          </AppButton>
          <AppButton 
          onClick={() => setSignupOpen(true)}
          className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2">
            Sign Up
          </AppButton>
        </div>
      </motion.nav>
     

      {/* Hero Section */}
      <section className="text-center py-28 relative">
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight"
        >
          Speak Up, Get Heard,
          <span className="text-[#d55d1f]"> Transform Your City</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-lg md:text-xl text-[#7a6f65] max-w-2xl mx-auto mb-10"
        >
          TattleTent empowers citizens to report civic issues easily and ensures swift action by authorities.
          Together, let’s make our communities smarter and safer.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="flex justify-center gap-5"
        >
          <AppButton className="bg-[#d55d1f] hover:bg-[#b54a16] text-white rounded-full shadow-lg hover:shadow-xl px-8 py-4 text-lg">
            View all Complaints
          </AppButton>
          <AppButton className=" border border-[#8B4513] !bg-[#8B4513] 
             hover:!bg-[#A0522D]  hover:text-white 
             font-medium py-3 rounded-full transition-all duration-300"
          >Learn More
          </AppButton>
        </motion.div>
      </section>

      {/* Portals Section */}
      <section className="py-20 bg-white relative z-10">
        <div className="text-center mb-14">
          <h3 className="text-3xl font-bold mb-4">Portals for Everyone</h3>
          <p className="text-[#7a6f65] text-base">
            Multiple platforms to make civic engagement seamless.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          {portals.map(([title, desc, path], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-2xl p-8 bg-gradient-to-br from-[#fff7f3] to-[#fdfdfd] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#fff2e8] mb-6 shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-[#d55d1f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-[#222] mb-2">{title}</h4>
              <p className="text-[#555] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20">
        <div className="text-center mb-14">
          <h3 className="text-3xl font-bold mb-4">Key Features</h3>
          <p className="text-[#7a6f65] text-base">Everything you need to report issues effectively.</p>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-10 max-w-5xl mx-auto px-6">
          {features.map(([title, desc], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.7 }}
              viewport={{ once: true }}
              className="rounded-2xl p-8 bg-gradient-to-br from-[#fff7f3] to-[#fdfdfd] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex-1"
            >
              <h4 className="text-xl font-semibold text-[#222] mb-3">{title}</h4>
              <p className="text-[#555]">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Complaint Categories */}
      <section className="py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-3">Common Complaint Categories</h3>
          <p className="text-[#7a6f65] text-base">Fast-start templates to capture the right data.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          {categories.map(([title, desc, path], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-2xl p-8 bg-gradient-to-br from-[#fff7f3] to-[#fdfdfd] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#fff2e8] mb-6 shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-[#d55d1f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#222] mb-2">{title}</h4>
              <p className="text-[#555] font-medium leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-[#FCF5EE] text-black text-center py-16 mt-10 border-t border-[#e6d9cc]"
      >
        <h3 className="text-2xl md:text-3xl font-semibold mb-3 text-[#3b2c20]">Ready to Make a Difference?</h3>
        <p className="text-sm md:text-base text-[#555] mb-8 max-w-xl mx-auto">
          Join thousands of citizens working together to improve our city. Every report counts towards a cleaner, safer, smarter community.
        </p>
        <div className="flex flex-wrap justify-center gap-5">
          {["Submit Complaint", "Learn More"].map((text, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <AppButton className=" border border-[#d55d1f] text-[#d55d1f] hover:!bg-[#d55d1f] hover:text-white font-medium py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                {text}
              </AppButton>
            </motion.div>
          ))}
        </div>
        <p className="mt-10 text-xs text-[#777] font-medium">
          © {new Date().getFullYear()} TattleTent. All rights reserved.
        </p>
      </motion.footer>

      {/* Login Modal */}
      {loginOpen && (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center bg-black/40 z-[100]"
        onClick={() => setLoginOpen(false)}
    >
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
        >
            {!forgotPassword ? (
                // --- Login Form ---
                <form>
                    <h2 className="text-2xl font-bold text-[#d55d1f] mb-6">Login</h2>
                    
                    {/* Email Field */}
                    <div className="mb-4">
                        <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="loginEmail"
                            type="email"
                            placeholder="you@example.com"
                            required // 👈 REQUIRED
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#d55d1f] outline-none"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="mb-6"> {/* Increased bottom margin for better spacing before the button */}
                        <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="loginPassword"
                            type="password"
                            placeholder="Your password"
                            required // 👈 REQUIRED
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#d55d1f] outline-none"
                        />
                    </div>

                    <AppButton type="submit" className="w-full bg-[#d55d1f] hover:bg-[#b54a16] text-white py-3 rounded-lg">
                        Login
                    </AppButton>
                    <p className="text-sm text-center mt-4">
                        <button
                            onClick={() => setForgotPassword(true)}
                            type="button" // Use type="button" to prevent form submission on click
                            className="text-[#d55d1f] hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </p>
                </form>
            ) : (
                // --- Forgot Password Form ---
                <form>
                    <h2 className="text-2xl font-bold text-[#d55d1f] mb-6">
                        Forgot Password
                    </h2>
                    
                    {/* Email Field for Reset */}
                    <div className="mb-6">
                        <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                            Enter your email <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="resetEmail"
                            type="email"
                            placeholder="Enter your email"
                            required // 👈 REQUIRED
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#d55d1f] outline-none"
                        />
                    </div>

                    <AppButton type="submit" className="w-full bg-[#d55d1f] hover:bg-[#b54a16] text-white py-3 rounded-lg">
                        Send Reset Link
                    </AppButton>
                    <p className="text-sm text-center mt-4">
                        <button
                            onClick={() => setForgotPassword(false)}
                            type="button" // Use type="button" to prevent form submission on click
                            className="text-gray-500 hover:underline"
                        >
                            Back to Login
                        </button>
                    </p>
                </form>
            )}
        </motion.div>
    </motion.div>
)}
      {/* Assuming you have state: const [signupOpen, setSignupOpen] = useState(false); */}
{/* Assuming you have state: const [signupOpen, setSignupOpen] = useState(false); */}
{signupOpen && (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center bg-black/40 z-[100]"
        onClick={() => setSignupOpen(false)}
    >
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
        >
            <h2 className="text-2xl font-bold text-[#A0522D] mb-6 text-center">Create Your Account</h2>

            {/* Sign Up with Google Button */}
            <AppButton 
                className="w-full border border-gray-300 text-[#A0522D] bg-white hover:bg-gray-50 py-3 rounded-lg flex items-center justify-center mb-6"
            >
                {/* Google Icon SVG */}
                <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
                    <path fill="#4285F4" d="M24 9.5c3.27 0 5.86 1.18 7.6 2.76l5.77-5.77C33.4 3.73 28.98 2 24 2 15.68 2 8.5 6.7 4.97 14.18l6.32 4.92C12.44 14.7 17.7 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M4.97 14.18c-.8.95-1.2 2.1-1.2 3.32s.4 2.37 1.2 3.32l6.32 4.92c-.3-1.03-.47-2.1-.47-3.32s.17-2.29.47-3.32L4.97 14.18z"/>
                    <path fill="#FBBC04" d="M24 35.5c-5.83 0-10.7-3.9-12.43-9.15l-6.32 4.92c3.53 7.48 10.71 12.18 19.15 12.18s15.62-4.7 19.15-12.18l-6.32-4.92c-1.73 5.25-6.6 9.15-12.83 9.15z"/>
                    <path fill="#EA4335" d="M43.7 24.5c0-1.58-.15-3.07-.4-4.5H24v7.75h11.84c-.5 3.32-2.09 5.85-4.5 7.42l6.32 4.92c3.78-3.53 5.74-8.7 5.74-13.88z"/>
                </svg>
                Sign Up with Google
            </AppButton>
            
            {/* Divider */}
            <div className="relative flex items-center justify-center mb-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Form for Email/Password Sign Up */}
            <form>
                {/* Full Name */}
                <div className="mb-4">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        placeholder="e.g., Jane Doe"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A0522D] outline-none"
                    />
                </div>
                
                {/* Email */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A0522D] outline-none"
                    />
                </div>
                
                {/* Password */}
                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Min. 8 characters"
                        required
                        minLength={8}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A0522D] outline-none"
                    />
                </div>

                <AppButton type="submit" className="w-full bg-[#A0522D] hover:bg-[#8B4513] text-white py-3 rounded-lg">
                    Sign Up
                </AppButton>
            </form>
            {/* End Form */}

            <p className="text-sm text-center mt-4 text-gray-600">
                Already have an account?{" "}
                <button
                    onClick={() => {
                        setSignupOpen(false); // Close signup
                         setLoginOpen(true);  // Uncomment this if you want to switch to login
                    }}
                    className="text-[#A0522D] hover:underline font-medium"
                >
                    Log In
                </button>
            </p>
        </motion.div>
    </motion.div>
)}
    </div>
  );
}
