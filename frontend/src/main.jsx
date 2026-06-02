import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import L from "leaflet";
window.L = L;
import "./index.css";
import Home from "./Home";
import AuthSuccess from "./components/ui/AuthSuccess";
import CitizenDashboard from "./components/ui/CitizenDashboard";
import StaffDashboard from "./components/ui/StaffDashboard";
import AdminDashboard from "./components/ui/AdminDashboard";
import LearnMorePage from "./components/ui/LearnMorePage";
import AllComplaintsPage from "./components/ui/AllComplaintsPage";
import AssignStaffPage from "./components/ui/AssignStaffPage";
import Heatmap from "./components/ui/Heatmap";
import FeedbackPage from "./components/ui/FeedbackPage";
import AdminInviteStaff from "./components/ui/AdminInviteStaff";
import ChangePassword from "./components/ui/ChangePassword";
import ForgotPassword from "./components/ui/ForgotPassword";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth-success" element={<AuthSuccess />} /> {/* ✅ New */}
          <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/learn-more" element={<LearnMorePage />} />
          <Route path="/all-complaints" element={<AllComplaintsPage />} />
          <Route path="/assign-staff" element={<AssignStaffPage />} />
          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="/feedback-page" element={<FeedbackPage />} />
          <Route path="/invite-staff" element={<AdminInviteStaff />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
