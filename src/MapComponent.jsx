import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

// Delete default icon mapping for Leaflet
delete L.Icon.Default.prototype._getIconUrl;

// Setup marker icon defaults
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const planeMap = new Map();

const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [radius, setRadius] = useState(10);
  const circleRef = useRef(null); // 🪄 useRef instead of useState for circle

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        const mapContainer = document.getElementById("map");
        if (mapContainer._leaflet_id != null) {
          mapContainer._leaflet_id = null;
        }

        const mapInstance = L.map("map").setView([latitude, longitude], 10);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 18,
        }).addTo(mapInstance);

        L.marker([latitude, longitude])
          .addTo(mapInstance)
          .bindPopup("📍 You are here!")
          .openPopup();

        setMap(mapInstance);
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (!map || !userCoords) return;

    // Remove old circle if exists
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    // Add new circle
    const newCircle = L.circle([userCoords.lat, userCoords.lng], {
      color: "blue",
      fillColor: "#30a3ec",
      fillOpacity: 0.2,
      radius: radius * 1000,
    }).addTo(map);

    circleRef.current = newCircle;

    const seenPlanes = new Set();

    const intervalId = setInterval(() => {
      fetch(`http://localhost:5001/api/flights?lat=${userCoords.lat}&lon=${userCoords.lng}&radius=${radius}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.states || data.states.length === 0) {
            console.warn("No flights found in this area.");
            return;
          }

          data.states.forEach((flight) => {
            const [icao24, callsign, originCountry, , , lon, lat, geoAlt, , , heading] = flight;
            if (!lat || !lon) return;

            seenPlanes.add(icao24);

            if (planeMap.has(icao24)) {
              const marker = planeMap.get(icao24);
              marker.setLatLng([lat, lon]);

              const iconEl = marker.getElement()?.querySelector("i");
              if (iconEl && heading != null) {
                iconEl.style.transform = `rotate(${heading}deg)`;
              }
            } else {
              const rotatedIcon = L.divIcon({
              className: 'custom-div-icon',
              html: `
                <div style="width: 30px; height: 30px; display: flex; justify-content: center; align-items: center;">
                  <i class="fas fa-plane" 
                    style="
                      display: inline-block; 
                      font-size: 24px; 
                      color: red; 
                      transform: rotate(${(heading || 0) - 90}deg); 
                      transform-origin: center center;">
                  </i>
                </div>
              `,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            });



              const marker = L.marker([lat, lon], { icon: rotatedIcon }).bindPopup(`
                <b>✈️ ${callsign?.trim() || "N/A"}</b><br>
                Country: ${originCountry}<br>
                Altitude: ${Math.round(geoAlt || 0)} m<br>
                Heading: ${heading || "N/A"}°
              `);

              planeMap.set(icao24, marker);
              marker.addTo(map);
            }
          });

          // Remove planes that exited the radius
          for (const [icao24, marker] of planeMap.entries()) {
            if (!seenPlanes.has(icao24)) {
              map.removeLayer(marker);
              planeMap.delete(icao24);
            }
          }
        })
        .catch((err) => console.error("❌ Error:", err));
    }, 5000);

    return () => clearInterval(intervalId);
  }, [radius, userCoords, map]);

  return (
    <div>
      <h2>This React app locates you!</h2>
      <label>Select Radius: </label>
      <select onChange={(e) => setRadius(Number(e.target.value))} value={radius}>
        <option value="5">5 KM</option>
        <option value="10">10 KM</option>
        <option value="100">100 KM</option>
        <option value="500">500 KM</option>
      </select>

      <div id="map" style={{ height: "70vh", width: "100%" }}></div>
    </div>
  );
};

export default MapComponent;
