import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

import Home from "./Home";
import CitizenDashboard from "./components/ui/CitizenDashboard";
import StaffDashboard from "./components/ui/StaffDashboard";
import AdminDashboard from "./components/ui/AdminDashboard";
import LearnMorePage from "./components/ui/LearnMorePage"
import AllComplaintsPage from "./components/ui/AllComplaintsPage"
import AssignStaffPage from "./components/ui/AssignStaffPage"
import Heatmap from "./components/ui/Heatmap"
import FeedbackPage from "./components/ui/FeedbackPage"


// Replace with your actual Google client ID
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/learn-more" element={<LearnMorePage />} />
          <Route path="/all-complaints" element={<AllComplaintsPage />} />
          <Route path="/assign-staff" element={<AssignStaffPage />} />
          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="/feedback-page" element={<FeedbackPage/>} />

        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
