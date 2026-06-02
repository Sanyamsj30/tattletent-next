import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import AppLayout from "./AppLayout";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { FiArrowLeft, FiInfo, FiLayers, FiCheckCircle, FiShield, FiHeart, FiSettings, FiActivity } from "react-icons/fi";

const LearnMoreContent = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-12">
      {/* Title block */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <Badge variant="info">PLATFORM INFORMATION</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          How TattleTent Secures <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500">Your Neighborhood</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium">
          TattleTent is a next-generation city-level grievance orchestration engine. Discover how automated AI dispatch, geolocation mappings, and SLA routing timelines work together.
        </p>
      </div>

      {/* Core values block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[
          { icon: "📋", title: "1. Citizen Reporting", text: "Citizens log local complaints including descriptions, optional geolocation markers, and photo evidence." },
          { icon: "⚡", title: "2. AI Dispatch Routing", text: "TattleTent's AI engine instantly analyzes details, identifies duplicates, calculates priority scores, and dispatches personnel." },
          { icon: "✅", title: "3. Verified SLA Completion", text: "Civic staff resolve assignments. Once updated, citizens confirm resolutions, driving real-time public transparency indexes." },
        ].map((item, idx) => (
          <Card key={idx} className="border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition duration-300">
            <CardContent className="p-6 text-center space-y-3">
              <span className="text-4xl block">{item.icon}</span>
              <h3 className="font-extrabold text-slate-800 text-lg">{item.title}</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Core services detailed list */}
      <div className="space-y-6 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-black text-slate-850 text-center">Grievance Category Services</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "🧹", label: "Garbage Outflow", desc: "Refuse bins, trash spills, and illegal waste dumping alerts." },
            { icon: "💡", label: "Electrical Outages", desc: "Broken street lamps, exposed cables, and community power disruptions." },
            { icon: "🚰", label: "Plumbing & Leaks", desc: "Pipe bursts, open drains, and sewage leak incidents." },
            { icon: "🚧", label: "Pathway Damage", desc: "Broken street tiles, potholes, and public pathway disruptions." },
          ].map((item, idx) => (
            <Card key={idx} className="border border-slate-100/80 bg-slate-50/50">
              <CardContent className="p-5 text-center space-y-2">
                <span className="text-3xl block">{item.icon}</span>
                <h4 className="font-bold text-slate-800 text-sm">{item.label}</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Join details block */}
      <Card className="max-w-4xl mx-auto bg-slate-905 border-slate-850 text-white text-center shadow-xl bg-[#0f172a]">
        <CardContent className="p-8 sm:p-10 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black">Help Us Improve Our City Today</h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
            By filing reports, providing accurate location markers, and responding to resolution feedback, you directly enable faster public infrastructure repairs.
          </p>
          <div className="pt-2">
            <Button variant="primary" onClick={() => navigate("/")} className="px-8 py-3">
              Go to Home Screen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const LearnMorePage = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const userStr = sessionStorage.getItem("user");
  const isLoggedIn = !!(token && userStr);

  if (isLoggedIn) {
    return (
      <AppLayout>
        <div className="p-6 sm:p-10 max-w-7xl mx-auto pb-16">
          <LearnMoreContent />
        </div>
      </AppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans pb-16">
      {/* Visual background grids */}
      <div className="absolute inset-0 grid-mesh-bg opacity-30 pointer-events-none z-0"></div>
      
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 w-full h-20 flex items-center justify-between px-6 sm:px-10 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-extrabold text-lg text-slate-800 tracking-tight">TattleTent</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate("/")} className="gap-1">
          <FiArrowLeft /> Back to Home
        </Button>
      </div>

      <div className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <LearnMoreContent />
      </div>
    </div>
  );
};

export default LearnMorePage;
