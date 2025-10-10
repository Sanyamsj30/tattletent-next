import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { motion } from "framer-motion";
import { FiRefreshCcw } from "react-icons/fi";
import Logo from "./Logo"; // ✅ Uncomment if you have it
import { useNavigate } from "react-router-dom";

// HeatmapLayer Component
const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Scale intensity by duplicate points
    const pointCounts = {};
    points.forEach((p) => {
      const key = `${p.latitude},${p.longitude}`;
      pointCounts[key] = (pointCounts[key] || 0) + 1;
    });

    const heatPoints = points.map((p) => {
      const key = `${p.latitude},${p.longitude}`;
      return [p.latitude, p.longitude, Math.min(pointCounts[key], 5)]; // cap intensity at 5
    });

    const heat = L.heatLayer(heatPoints, {
      radius: 25, // more visible spread
      blur: 25,   // smooth edges
      maxZoom: 12 // max zoom for intensity effect
    }).addTo(map);

    if (points.length > 1) {
      const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    } else {
      map.setView([22.9734, 78.6569], 17);
    }

    return () => map.removeLayer(heat);
  }, [map, points]);

  return null;
};

// Main Heatmap Component
const LeafletHeatmap = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [viewMode, setViewMode] = useState("satellite");
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/complaints/heatmap");
      const data = await res.json();
      setPoints(data);
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

  const tileLayerUrl = useMemo(
    () =>
      viewMode === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    [viewMode]
  );

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 w-full h-24 flex items-center justify-between px-8 bg-white shadow-md z-[1000]">
        <Logo />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-semibold text-gray-800">Admin</p>
          </div>
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-3 py-2 transition duration-200"
          >
            My Dashboard
          </button>
          <button
            onClick={() => navigate("/")}
            className="rounded-full bg-[#d55d1f] hover:bg-[#b54a16] text-white px-5 py-2 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-[#FCF5EE] flex flex-col items-center pt-32 px-6 relative"
      >
        {/* Page Header */}
        <div className="max-w-5xl w-full text-center mb-10">
          <h1 className="text-4xl font-bold text-[#d55d1f] mb-3">Community Heatmap</h1>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            Explore complaint density and hotspots across the city. Each glowing area represents
            regions where citizens have actively reported issues through TattleTent.
          </p>
        </div>

        {/* Map Container */}
        <div className="w-full max-w-6xl shadow-xl border border-[#e6d9cc] rounded-3xl overflow-hidden relative">
          <MapContainer
            center={userLocation || [22.9734, 78.6569]} // Center of India
            zoom={5}
            minZoom={4}
            maxZoom={18}
            style={{ height: "calc(100vh - 8rem)", width: "100%" }}
            className="rounded-3xl"
            zoomControl={false}
          >
            <TileLayer url={tileLayerUrl} />
            <HeatmapLayer points={points} />
          </MapContainer>

          {/* Floating Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-3 z-[600]">
            <button
              onClick={fetchPoints}
              disabled={loading}
              className="bg-white/90 hover:bg-white text-[#d55d1f] border border-[#d55d1f] rounded-full p-3 shadow-md hover:shadow-lg transition"
              title="Refresh Data"
            >
              <FiRefreshCcw className={`text-lg ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() =>
                setViewMode(viewMode === "satellite" ? "street" : "satellite")
              }
              className="bg-white/90 hover:bg-white text-[#d55d1f] border border-[#d55d1f] rounded-full p-3 shadow-md hover:shadow-lg transition"
              title="Toggle View"
            >
              {viewMode === "satellite" ? "🗺️" : "🛰️"}
            </button>
          </div>
        </div>

        {/* Footer Caption */}
        <div className="mt-6 text-center pb-10">
          {loading ? (
            <p className="text-sm text-gray-500 italic animate-pulse">
              Updating heatmap data...
            </p>
          ) : (
            <p className="text-xs text-gray-500 italic">
              Last updated: {lastUpdated || "just now"}
              <br />
              © {new Date().getFullYear()} TattleTent. All rights reserved.
            </p>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default LeafletHeatmap;
