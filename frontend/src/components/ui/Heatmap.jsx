import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

// Component to add heatmap layer
const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const heat = L.heatLayer(
      points.map((p) => [p.latitude, p.longitude, 0.5]), // [lat, lng, intensity]
      { radius: 25, blur: 15, maxZoom: 17 }
    ).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
};

const LeafletHeatmap = () => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    // Example: fetch from backend
    fetch("http://localhost:5000/api/complaints/heatmap")
      .then((res) => res.json())
      .then((data) => setPoints(data));
      
    // For testing, fallback points:
    // setPoints([
    //   { latitude: 28.6139, longitude: 77.2090 },
    //   { latitude: 19.0760, longitude: 72.8777 },
    //   { latitude: 13.0827, longitude: 80.2707 }
    // ]);
  }, []);

  return (
    <MapContainer
        center={[25.4358, 81.8463]} // Prayagraj
        zoom={12}                   // initial zoom level (city-level)
        minZoom={5}                 // allow zooming out to India-level
        maxZoom={18}                // maximum zoom in
        style={{ height: "80vh", width: "100%" }}
        >
        {/* <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}  {/* Simple Map */}        
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        {/* Satellite View */} 
        <HeatmapLayer points={points} />
    </MapContainer>
  );
};

export default LeafletHeatmap;
