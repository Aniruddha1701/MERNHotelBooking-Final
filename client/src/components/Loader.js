// Loader.js
import React, { useState, useEffect } from "react";
import { PacmanLoader, HashLoader, SyncLoader } from "react-spinners";
import "./Loader.css";

const loadingIcons = [<PacmanLoader />, <HashLoader />, <SyncLoader />];

function Loader({ loadingText = "", delay = 500 }) {
  const [loading, setLoading] = useState(false);
  const [selectedLoader, setSelectedLoader] = useState(loadingIcons[0]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const randomIndex = Math.floor(Math.random() * loadingIcons.length);
      setSelectedLoader(loadingIcons[randomIndex]);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`loader-container ${loading ? "fade-in" : ""}`}>
      <div className="sweet-loading">
        {selectedLoader}
        <p className="loading-text">{loadingText}</p>
      </div>
    </div>
  );
}

export default Loader;
