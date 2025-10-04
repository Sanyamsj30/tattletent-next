import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { FaGoogle, FaFacebookF, FaLinkedinIn } from "react-icons/fa";

export default function SignupForm({ onSignup }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    document: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.document) {
      alert("All fields are required!");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const user = { ...form, id: Date.now() };
    localStorage.setItem("grievance_app_citizen_user", JSON.stringify(user));
    onSignup(user);
  };

  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    alert(`Logging in with ${provider} (demo)`);
  };

  return (
    <Card className="max-w-md mx-auto shadow-xl border border-cyan-200 rounded-2xl bg-gray-50 p-6">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-cyan-800">
          Citizen Sign Up
        </CardTitle>
        <p className="text-center text-sm text-black-600">
          Create your account securely
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-cyan-800">Full Name</label>
            <Input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
              required
              className="rounded-lg"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-black-800">Email</label>
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
            <label className="block text-sm font-medium mb-1 text-cyan-800">Password</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Create a password"
              required
              className="rounded-lg"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-cyan-800">Confirm Password</label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Re-enter your password"
              required
              className="rounded-lg"
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium mb-1 text-cyan-800">
              Upload Document <span className="text-cyan-500">(ID Proof)</span>
            </label>
            <Input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={(e) =>
                setForm({ ...form, document: e.target.files[0] || null })
              }
              required
              className="rounded-lg cursor-pointer"
            />
            <p className="text-xs text-cyan-500 mt-1">
              Accepted formats: PDF, JPG, PNG
            </p>
          </div>

          {/* Sign Up Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full py-2 rounded-xl bg-cyan-600 text-white font-medium shadow-md hover:bg-cyan-700 transition"
          >
            Sign Up
          </Button>
        </form>

        {/* Social Sign Up */}
        <div className="mt-6 text-center">
          <p className="text-sm mb-3 text-cyan-600">Or sign up with</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleSocialLogin("Google")}
              className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 hover:shadow-md transition duration-150"
            >
              <FaGoogle className="text-red-500" />
              <span>Sign up with Google</span>
            </button>

            <button
              onClick={() => handleSocialLogin("Facebook")}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition duration-150"
            >
              <FaFacebookF />
              <span>Sign up with Facebook</span>
            </button>

            <button
              onClick={() => handleSocialLogin("LinkedIn")}
              className="flex items-center justify-center gap-2 bg-blue-700 text-white rounded-lg py-2 hover:bg-blue-800 transition duration-150"
            >
              <FaLinkedinIn />
              <span>Sign up with LinkedIn</span>
            </button>
          </div>
        </div>

        {/* Switch to Login */}
        <p className="text-sm text-center mt-4 text-cyan-700">
          Already have an account?{" "}
          <button
            type="button"
            className="font-semibold hover:underline"
            onClick={() => window.dispatchEvent(new CustomEvent("switchToLogin"))}
          >
            Login here
          </button>
        </p>
      </CardContent>
    </Card>
  );
}
