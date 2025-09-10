// src/config.js
const isLocalhost = window.location.hostname === "localhost";

export const API_BASE = isLocalhost
    ? "http://127.0.0.1:8000"              // local FastAPI
    : "https://talentalign.onrender.com";  // deployed backends
    
const runtimeApiBase =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8000"
        : process.env.REACT_APP_API_BASE || "https://talentalign.onrender.com";

export default runtimeApiBase;