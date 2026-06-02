import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCcw, FiFilter, FiMap, FiList, FiAlertTriangle, FiCheck } from "react-icons/fi";
import Logo from "./Logo";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../lib/api";

// MapController Component for smooth fly-to centering
const MapController = ({ flyToTarget }) => {
  const map = useMap();
  useEffect(() => {
    if (flyToTarget) {
      map.flyTo([flyToTarget.lat, flyToTarget.lng], 16, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [map, flyToTarget]);
  return null;
};

// HeatmapLayer Component with weighted glowing indicators
const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Aggregate weights of complaints at the exact same location
    const pointWeights = {};
    points.forEach((p) => {
      const key = `${p.latitude},${p.longitude}`;
      pointWeights[key] = (pointWeights[key] || 0) + (p.weight || 1.0);
    });

    const heatPoints = [];
    const seen = new Set();
    points.forEach((p) => {
      const key = `${p.latitude},${p.longitude}`;
      if (!seen.has(key)) {
        seen.add(key);
        // Cap accumulated point weight at 10.0 for visual balance
        heatPoints.push([p.latitude, p.longitude, Math.min(pointWeights[key], 10.0)]);
      }
    });

    const heat = L.heatLayer(heatPoints, {
      radius: 35,    // Wide glow radius for visual impact
      blur: 20,      // Smooth edges
      maxZoom: 13,   // Keep glow prominent at higher zoom
      gradient: {
        0.2: '#3b82f6', // Low urgency = Blue
        0.4: '#10b981', // Moderate = Green
        0.6: '#fbbf24', // Elevated = Yellow
        0.8: '#f97316', // High = Orange
        1.0: '#ef4444'  // Critical hot spot = Red
      }
    }).addTo(map);

    // Auto-fit bounds based on points
    if (points.length > 1) {
      const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 14);
    } else {
      map.setView([22.9734, 78.6569], 5);
    }

    return () => map.removeLayer(heat);
  }, [map, points]);

  return null;
};

const LeafletHeatmap = () => {
  const [rawPoints, setRawPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [viewMode, setViewMode] = useState("dark"); // Dark mode default for glowing hotspots
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [flyToTarget, setFlyToTarget] = useState(null);
  const navigate = useNavigate();

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/public/complaints/heatmap`);
      const data = await res.json();
      setRawPoints(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error fetching heatmap data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(rawPoints.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [rawPoints]);

  const filteredPoints = useMemo(() => {
    return rawPoints.filter((p) => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchSev = selectedSeverity === "All" || p.severity === selectedSeverity;
      return matchCat && matchSev;
    });
  }, [rawPoints, selectedCategory, selectedSeverity]);

  // Sort by calculated planning weight descending for quick attention
  const topAttentionHotspots = useMemo(() => {
    return [...filteredPoints].sort((a, b) => b.weight - a.weight).slice(0, 8);
  }, [filteredPoints]);

  const tileLayerUrl = useMemo(() => {
    if (viewMode === "satellite") {
      return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    } else if (viewMode === "dark") {
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"; // Dark theme for high-contrast glowing heat
    } else {
      return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }
  }, [viewMode]);

  return (
    <>
      {/* Premium Navigation Header */}
      <div className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-8 bg-white/95 backdrop-blur-md shadow-sm z-[1000] border-b border-orange-50">
        <Logo />
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="font-semibold text-gray-800 text-sm">Administrator</p>
          </div>
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-sm px-5 py-2.5 transition duration-300 shadow-md transform hover:scale-105 active:scale-95"
          >
            Dashboard Panel
          </button>
          <button
            onClick={() => navigate("/")}
            className="rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-5 py-2.5 transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#FCF5EE] flex flex-col items-center pt-28 px-4 sm:px-6 relative font-sans"
      >
        {/* Main Dashboard Header */}
        <div className="max-w-7xl w-full text-center mt-6 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#d55d1f] tracking-tight mb-2">
            Hotspot Planning & Decision Map
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Real-time visual priority map representing active city grievances. Dynamic heat weights
            scale based on severity score, duplicate volume, and SLA deadline status to guide rapid planning.
          </p>
        </div>

        {/* 3-Column Layout Grid */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch mb-10">
          
          {/* Column 1: Sleek Filters & Map Legend */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Glassmorphic Filter Card */}
            <div className="bg-white/95 rounded-3xl p-5 border border-orange-100 shadow-xl flex flex-col gap-5">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-orange-50 pb-2">
                <FiFilter className="text-orange-500" />
                Planning Filters
              </h3>

              {/* Category Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category Area
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-orange-50/50 border border-orange-100/80 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 font-medium focus:ring-2 focus:ring-orange-400 focus:outline-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "All" ? "📂 All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Urgency Level
                </label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="w-full bg-orange-50/50 border border-orange-100/80 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 font-medium focus:ring-2 focus:ring-orange-400 focus:outline-none cursor-pointer"
                >
                  <option value="All">🚨 All Urgencies</option>
                  <option value="Critical">🔴 Critical Only</option>
                  <option value="High">🟠 High Urgency</option>
                  <option value="Medium">🟡 Medium Urgency</option>
                  <option value="Low">🔵 Low / Minor</option>
                </select>
              </div>

              {/* Dynamic Stats count */}
              <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-4 mt-1 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500">Filtered Spots</p>
                  <p className="text-2xl font-extrabold text-[#d55d1f] mt-0.5">
                    {filteredPoints.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">
                  📍
                </div>
              </div>
            </div>

            {/* Glowing Map Legend */}
            <div className="bg-white/95 rounded-3xl p-5 border border-orange-100 shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-orange-50 pb-2">
                <FiMap className="text-orange-500" />
                Hotspot Legend
              </h3>
              
              {/* Vertical Color Scale */}
              <div className="flex flex-col gap-3.5 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-red-600 animate-pulse border border-red-800"></span>
                  <div>
                    <p className="font-bold text-red-700">Critical Priority (&gt; 7.0 weight)</p>
                    <p className="text-[10px] text-gray-500 leading-none">SLA Breached / Heavily Duplicated</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-orange-500"></span>
                  <div>
                    <p className="font-semibold text-orange-700">High Attention (4.0 - 7.0)</p>
                    <p className="text-[10px] text-gray-500 leading-none">Elevated Active Grievances</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
                  <div>
                    <p className="font-semibold text-yellow-700">Moderate Urgency (2.0 - 4.0)</p>
                    <p className="text-[10px] text-gray-500 leading-none">Investigating / Under Review</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-blue-500"></span>
                  <div>
                    <p className="font-semibold text-blue-700">Standard Priority (&lt; 2.0)</p>
                    <p className="text-[10px] text-gray-500 leading-none">Newly submitted requests</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Premium Map Container */}
          <div className="lg:col-span-2 shadow-2xl border border-orange-100 rounded-3xl overflow-hidden relative flex flex-col min-h-[550px] bg-white">
            <MapContainer
              center={[22.9734, 78.6569]} // India Centroid
              zoom={5}
              minZoom={4}
              maxZoom={18}
              style={{ flex: 1, width: "100%", height: "100%" }}
              zoomControl={false}
            >
              <TileLayer url={tileLayerUrl} attribution="&copy; TattleTent Carto" />
              <HeatmapLayer points={filteredPoints} />
              <MapController flyToTarget={flyToTarget} />
            </MapContainer>

            {/* Floating Controls inside Map */}
            <div className="absolute top-4 right-4 flex flex-col gap-3.5 z-[600]">
              <button
                onClick={fetchPoints}
                disabled={loading}
                className="bg-white/95 hover:bg-white text-orange-600 border border-orange-100 rounded-2xl p-3 shadow-lg hover:shadow-xl transition transform active:scale-95 duration-200"
                title="Refresh Map Data"
              >
                <FiRefreshCcw className={`text-base ${loading ? "animate-spin" : ""}`} />
              </button>

              {/* Floating Theme Selector Buttons */}
              <div className="bg-white/95 rounded-2xl border border-orange-100 p-1.5 flex flex-col gap-2 shadow-lg">
                <button
                  onClick={() => setViewMode("dark")}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition ${
                    viewMode === "dark" ? "bg-orange-500 text-white shadow-md" : "text-gray-600 hover:bg-orange-50"
                  }`}
                  title="Dark Map Theme"
                >
                  🌑
                </button>
                <button
                  onClick={() => setViewMode("street")}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition ${
                    viewMode === "street" ? "bg-orange-500 text-white shadow-md" : "text-gray-600 hover:bg-orange-50"
                  }`}
                  title="Street Map Theme"
                >
                  🗺️
                </button>
                <button
                  onClick={() => setViewMode("satellite")}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition ${
                    viewMode === "satellite" ? "bg-orange-500 text-white shadow-md" : "text-gray-600 hover:bg-orange-50"
                  }`}
                  title="Satellite Map Theme"
                >
                  🛰️
                </button>
              </div>
            </div>
          </div>

          {/* Column 4: Top Planning Attention Areas Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white/95 rounded-3xl p-5 border border-orange-100 shadow-xl flex flex-col flex-1 max-h-[600px] overflow-hidden">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-orange-50 pb-2 mb-3">
                <FiList className="text-orange-500" />
                Planning Hotspots
              </h3>

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin scrollbar-thumb-orange-100 scrollbar-track-transparent">
                {topAttentionHotspots.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-sm text-gray-400 italic">No critical hotspots in view.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {topAttentionHotspots.map((item, idx) => (
                      <motion.div
                        key={item.complaint_id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                          setFlyToTarget({ lat: item.latitude, lng: item.longitude });
                        }}
                        className="bg-orange-50/20 hover:bg-orange-50/70 border border-orange-100/60 hover:border-orange-200 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition duration-200 cursor-pointer flex flex-col gap-1.5 relative group overflow-hidden"
                      >
                        {/* Urgent Left border highlight */}
                        <span
                          className={`absolute left-0 top-0 h-full w-1.5 ${
                            item.weight > 6.0 ? "bg-red-500" : "bg-orange-400"
                          }`}
                        ></span>

                        {/* Title and Category */}
                        <div className="flex justify-between items-start gap-2 pl-1.5">
                          <h4 className="font-bold text-xs text-gray-800 leading-tight line-clamp-1 group-hover:text-[#d55d1f] transition">
                            {item.title}
                          </h4>
                          <span className="text-[10px] bg-white border border-orange-100 px-2 py-0.5 rounded-full text-gray-500 whitespace-nowrap leading-none font-medium">
                            {item.category}
                          </span>
                        </div>

                        {/* Badges & Weight */}
                        <div className="flex items-center justify-between pl-1.5 text-[10px] mt-1 text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full inline-block ${
                                item.severity === "Critical"
                                  ? "bg-red-500"
                                  : item.severity === "High"
                                  ? "bg-orange-500"
                                  : "bg-yellow-500"
                              }`}
                            ></span>
                            <span className="font-semibold text-gray-700 leading-none">
                              {item.severity} Urgency
                            </span>
                          </div>
                          <span className="font-extrabold text-[#d55d1f] bg-orange-100/50 border border-orange-200/50 px-2 py-0.5 rounded-lg text-xs leading-none">
                            ★ {item.weight.toFixed(1)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Updates Log */}
        <div className="text-center pb-12">
          {loading ? (
            <p className="text-sm text-gray-500 italic animate-pulse flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping"></span>
              Synchronizing Hotspot Data...
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Dashboard synchronized successfully at: {lastUpdated || "just now"}
              <br />
              © {new Date().getFullYear()} TattleTent Governance. All rights reserved.
            </p>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default LeafletHeatmap;
