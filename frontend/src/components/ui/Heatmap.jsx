import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCcw, FiFilter, FiMap, FiList, FiAlertTriangle, FiCheck, FiSliders } from "react-icons/fi";
import AppLayout from "./AppLayout";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
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
        0.2: '#6366f1', // Low urgency = Indigo
        0.4: '#10b981', // Moderate = Emerald
        0.6: '#f59e0b', // Elevated = Amber
        0.8: '#f43f5e', // High = Rose
        1.0: '#e11d48'  // Critical hot spot = Dark Red
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
    <AppLayout requiredRole="Admin">
      <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 mt-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Geospatial Hotspot Map
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Real-time weighted heat visualization representing active civic grievances to guide municipal planning.
            </p>
          </div>
          
          <Button
            onClick={fetchPoints}
            disabled={loading}
            variant="secondary"
            size="sm"
            className="gap-2 border border-slate-200"
          >
            <FiRefreshCcw className={loading ? "animate-spin" : ""} /> Refresh Map
          </Button>
        </div>

        {/* 3-Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Column 1: Sleek Filters & Map Legend (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Planning Filters Card */}
            <Card className="border border-slate-100 shadow-sm bg-white">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-850 flex items-center gap-2 border-b border-slate-50 pb-2.5">
                  <FiFilter className="text-primary-500" />
                  Planning Filters
                </h3>

                {/* Category Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Category Area
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none cursor-pointer transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "All" ? "📁 All Categories" : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Severity Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Urgency Level
                  </label>
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none cursor-pointer transition-all"
                  >
                    <option value="All">🚨 All Urgencies</option>
                    <option value="Critical">🔴 Critical Only</option>
                    <option value="High">🟠 High Urgency</option>
                    <option value="Medium">🟡 Medium Urgency</option>
                    <option value="Low">🔵 Low / Minor</option>
                  </select>
                </div>

                {/* Dynamic Stats Count */}
                <div className="bg-primary-50/30 border border-primary-100/50 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Filtered Spots</p>
                    <p className="text-2xl font-black text-primary-600 mt-0.5">
                      {filteredPoints.length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-primary-100/50 text-primary-600 rounded-xl flex items-center justify-center text-xl">
                    📍
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Glowing Map Legend */}
            <Card className="border border-slate-100 shadow-sm bg-white">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-850 flex items-center gap-2 border-b border-slate-50 pb-2.5">
                  <FiMap className="text-primary-500" />
                  Hotspot Legend
                </h3>
                
                {/* Vertical Color Scale */}
                <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                  <div className="flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#e11d48] animate-pulse border border-red-800 mt-0.5"></span>
                    <div>
                      <p className="font-bold text-slate-850 leading-tight">Critical Urgency</p>
                      <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">SLA Overdue / Duplicated</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#f43f5e] mt-0.5"></span>
                    <div>
                      <p className="font-bold text-slate-800 leading-tight">High Attention</p>
                      <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">Elevated active complaints</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] mt-0.5"></span>
                    <div>
                      <p className="font-bold text-slate-800 leading-tight">Moderate Level</p>
                      <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">Under investigation</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#6366f1] mt-0.5"></span>
                    <div>
                      <p className="font-bold text-slate-800 leading-tight">Standard Priority</p>
                      <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">Minor / Newly reported</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 2 & 3: Premium Map Container (6 cols) */}
          <div className="lg:col-span-6 shadow-xl border border-slate-100 rounded-3xl overflow-hidden relative min-h-[550px] bg-white flex flex-col">
            <MapContainer
              center={[22.9734, 78.6569]} // India Centroid
              zoom={5}
              minZoom={4}
              maxZoom={18}
              style={{ flex: 1, width: "100%", height: "100%", zIndex: 1 }}
              zoomControl={false}
            >
              <TileLayer url={tileLayerUrl} attribution="&copy; TattleTent Carto" />
              <HeatmapLayer points={filteredPoints} />
              <MapController flyToTarget={flyToTarget} />
            </MapContainer>

            {/* Floating Controls inside Map */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 z-[600]">
              
              {/* Floating Theme Selector Buttons */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/60 p-1 flex flex-col gap-1 shadow-lg">
                <button
                  onClick={() => setViewMode("dark")}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    viewMode === "dark" ? "bg-gradient-to-r from-primary-500 to-indigo-500 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
                  }`}
                  title="Dark Map Theme"
                >
                  🌑
                </button>
                <button
                  onClick={() => setViewMode("street")}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    viewMode === "street" ? "bg-gradient-to-r from-primary-500 to-indigo-500 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
                  }`}
                  title="Street Map Theme"
                >
                  🗺️
                </button>
                <button
                  onClick={() => setViewMode("satellite")}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    viewMode === "satellite" ? "bg-gradient-to-r from-primary-500 to-indigo-500 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
                  }`}
                  title="Satellite Map Theme"
                >
                  🛰️
                </button>
              </div>
            </div>
          </div>

          {/* Column 4: Top Planning Attention Areas Sidebar (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card className="border border-slate-100 shadow-sm bg-white flex flex-col flex-1 max-h-[600px] overflow-hidden">
              <CardContent className="p-5 flex flex-col flex-1 overflow-hidden">
                <h3 className="text-sm font-bold text-slate-850 flex items-center gap-2 border-b border-slate-50 pb-2.5 mb-3.5 flex-shrink-0">
                  <FiList className="text-primary-500" />
                  Planning Hotspots
                </h3>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {topAttentionHotspots.length === 0 ? (
                    <div className="text-center py-12 text-slate-450 italic font-semibold">
                      No active hotspots in selected scope.
                    </div>
                  ) : (
                    <AnimatePresence>
                      {topAttentionHotspots.map((item, idx) => (
                        <motion.div
                          key={item.complaint_id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => {
                            setFlyToTarget({ lat: item.latitude, lng: item.longitude });
                          }}
                          className="bg-slate-50 hover:bg-primary-50/30 border border-slate-100 hover:border-primary-100 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col gap-1.5 relative group overflow-hidden pl-5"
                        >
                          {/* Urgent Left border highlight */}
                          <span
                            className={`absolute left-0 top-0 h-full w-1.5 ${
                              item.weight > 6.0 ? "bg-[#e11d48]" : "bg-primary-500"
                            }`}
                          ></span>

                          {/* Title and Category */}
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-extrabold text-xs text-slate-800 leading-tight line-clamp-1 group-hover:text-primary-600 transition">
                              {item.title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-450 mt-1 uppercase tracking-wider">
                            <Badge variant="outline" className="px-1.5 py-0 px-2 py-0 text-[8px] bg-white text-slate-500">
                              {item.category}
                            </Badge>
                            
                            <span className="text-primary-600 font-extrabold font-mono">
                              ★ {item.weight.toFixed(1)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </AppLayout>
  );
};

export default LeafletHeatmap;
