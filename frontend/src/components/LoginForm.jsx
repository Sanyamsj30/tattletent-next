import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });

<p className="text-sm text-center mt-4">
  New here?{" "}
  <button
    type="button"
    className="text-primary-600 hover:underline"
    onClick={() => window.dispatchEvent(new CustomEvent("switchToSignup"))}
  >
    Create an account
  </button>
</p>


 const handleSubmit = (e) => {
  e.preventDefault();
  if (!form.email || !form.password) return;

  const savedUser = JSON.parse(localStorage.getItem("grievance_app_citizen_user"));

  if (savedUser && savedUser.email === form.email && savedUser.password === form.password) {
    onLogin(savedUser);
  } else {
    alert("Invalid email or password. Please try again or sign up.");
  }
};


  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">
          Citizen Login
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Enter password"
              required
            />
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
