import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import React from "react";

export default function SignupForm({ onSignup }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;

    // Save user to localStorage (demo only – replace with API later)
    const user = { ...form, id: Date.now() };
    localStorage.setItem("grievance_app_citizen_user", JSON.stringify(user));

    onSignup(user);
  };

  <p className="text-sm text-center mt-4">
  Already have an account?{" "}
  <button
    type="button"
    className="text-primary-600 hover:underline"
    onClick={() => window.dispatchEvent(new CustomEvent("switchToLogin"))}
  >
    Login here
  </button>
</p>


  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">
          Citizen Sign Up
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Create a password"
              required
            />
          </div>

           <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Upload Document <span className="text-gray-500">(ID Proof)</span>
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
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, JPG, PNG
                </p>
              </div>

          <Button type="submit" variant="primary" className="w-full">
            Sign Up
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
