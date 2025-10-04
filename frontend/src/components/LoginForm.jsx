import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "", document: null });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.document) {
      alert("All fields including document are required!");
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem("grievance_app_citizen_user"));

    if (
      savedUser &&
      savedUser.email === form.email &&
      savedUser.password === form.password
    ) {
      onLogin(savedUser);
    } else {
      alert("Invalid email or password. Please try again or sign up.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-sky-800 to-cyan-600 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          {/* Logo + Brand */}
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png" // replace with your TattleTent logo path
              alt="TattleTent Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold text-white tracking-wide">
              TattleTent
            </span>
          </div>

          {/* Home Button */}
          <Button
            variant="secondary"
            className="rounded-lg text-sm font-medium bg-white text-blue-700 hover:bg-gray-100"
            onClick={() => (window.location.href = "/")}
          >
            Home
          </Button>
        </div>
      </nav>

      {/* Main Section */}
      <div className="flex flex-grow items-center justify-center px-6 py-12 bg-blue-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl w-full bg-blue-50">
          {/* Left: Login Form */}
          <Card className="shadow-xl border border-cyan-200 rounded-2xl ">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-3xl font-bold text-sky-800">
                Citizen Login
              </CardTitle>
              <p className="text-center text-sm text-black-600">
                Access your account securely
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-black-900">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    className="rounded-lg"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-black-900">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter password"
                    required
                    className="rounded-lg"
                  />
                  <p className="text-xs text-right mt-1">
                    <button
                      type="button"
                      className="text-blue-600 hover:underline font-medium"
                      onClick={() =>
                        window.dispatchEvent(new CustomEvent("forgotPassword"))
                      }
                    >
                      Forgot password?
                    </button>
                  </p>
                </div>


                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-2 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 transition"
                >
                  Login
                </Button>
              </form>

              {/* Switch to Signup */}
              <p className="text-sm text-center mt-6 text-black-700">
                New here?{" "}
                <button
                  type="button"
                  className="text-blue-700 font-semibold hover:underline"
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent("switchToSignup"))
                  }
                >
                  Create an account
                </button>
              </p>
            </CardContent>
          </Card>

          {/* Right: Image + Text */}
          <div className="flex flex-col items-center justify-center text-center">
            <img
              src="/future.jpg" // replace with your inspirational image
              alt="Future Vision"
              className="rounded-2xl shadow-lg max-h-96 object-cover"
            />
            <h2 className="mt-6 text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-sky-800 to-cyan-600 bg-clip-text text-transparent tracking-tight">
              Thriving for a Better Future
            </h2>

            <p className="mt-2 text-gray-600 text-sm md:text-base max-w-sm">
              Together we build transparency, trust, and progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
