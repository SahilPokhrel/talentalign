// src/config.js
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE = isLocalhost
  ? "http://127.0.0.1:8000"                  // local FastAPI
  : process.env.REACT_APP_API_BASE || "https://talentalign.onrender.com"; // deployed backend

export default API_BASE;
