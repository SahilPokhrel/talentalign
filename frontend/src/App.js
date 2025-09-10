import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/resume" element={<ResumeAnalysis />} />
    </Routes>
  );
}

export default App;
