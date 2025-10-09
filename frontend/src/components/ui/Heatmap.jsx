import React, { useEffect, useRef } from "react";

const Heatmap = () => {
  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const heatmap = useRef(null);

  useEffect(() => {
    const initMap = async () => {
      const response = await fetch("http://localhost:5000/api/complaints/heatmap");
      const points = await response.json();

      const center = { lat: 20.5937, lng: 78.9629 }; // center of India

      googleMap.current = new window.google.maps.Map(mapRef.current, {
        zoom: 5,
        center,
      });

      const heatmapData = points.map(
        (p) => new window.google.maps.LatLng(p.latitude, p.longitude)
      );

      heatmap.current = new window.google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: googleMap.current,
        radius: 20,
      });
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=visualization`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "80vh" }} />;
};

export default Heatmap;
