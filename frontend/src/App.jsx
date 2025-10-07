import { Routes, Route } from "react-router-dom";
import LandingPage from "./Home"; // or wherever LandingPage is
import CitizenDashboard from "./components/ui/CitizenDashboard";
import StaffDashboard from "./components/ui/StaffDashboard";
import AdminDashboard from "./components/ui/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
      <Route path="/staff-dashboard" element={<StaffDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
