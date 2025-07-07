import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css"; // optional CSS file

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <nav className="navbar">
        <div className="nav-left">
          <h2 className="logo">✈️ PlaneSight</h2>
        </div>
        <div className="nav-center">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#about">About Me</a>
        </div>
        <div className="nav-right">
          <button className="cta" onClick={() => navigate("/map")}>
            Try Now
          </button>
        </div>
      </nav>

      <header className="hero">
        <h1>Welcome to PlaneSight</h1>
        <p>Visualize real-time flights around you using live air traffic data.</p>
        <button onClick={() => navigate("/map")}>Start Exploring</button>
      </header>

      <section id="features">
        <h2>📦 Features</h2>
        <ul>
          <li>Real-time flight tracking</li>
          <li>Live heading, speed, and altitude data</li>
          <li>Geolocation based filtering</li>
        </ul>
      </section>

      <section id="how">
        <h2>⚙️ How It Works</h2>
        <p>
          PlaneSight uses your location to create a bounding box and fetches aircraft data
          from the OpenSky Network every 5 seconds. It maps planes on an interactive
          OpenStreetMap view using Leaflet.
        </p>
      </section>

      <section id="about">
        <h2>👨‍💻 About Me</h2>
        <p>
          I’m Anvith, a CSE grad with a love for aviation tech and real-time systems.
          This project blends both into a live air traffic visualizer.
        </p>
      </section>

      <footer>
        <p>© {new Date().getFullYear()} PlaneSight by Anvith Kashyap</p>
      </footer>
    </div>
  );
};

export default LandingPage;
