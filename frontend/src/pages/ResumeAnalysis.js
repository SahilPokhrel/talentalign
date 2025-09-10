// src/pages/ResumeAnalysis.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import {
  Upload,
  CheckCircle,
  Sparkles,
  Gauge,
  ListChecks,
  AlertTriangle,
  Loader2,
  X,
  FileDown,
  Printer,
  RotateCcw,
  Clipboard,
  Download,
  FileText,
} from "lucide-react";

/* ---------- UI helpers ---------- */
const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
    {children}
  </span>
);

// Gradient score ring
const ScoreRing = ({ value = 0, size = 144 }) => {
  const pct = Math.max(0, Math.min(100, Number(value)));
  const deg = pct * 3.6;
  const ring = useMemo(
    () => ({
      width: size,
      height: size,
      background: `conic-gradient(#6366F1 ${deg}deg, #E5E7EB ${deg}deg 360deg)`,
      transition: "background 600ms ease",
    }),
    [deg, size]
  );
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full" style={ring} />
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6366F1]/10 to-[#14B8A6]/10" />
      <div className="absolute inset-2 rounded-full bg-white shadow flex items-center justify-center">
        <div className="text-center leading-none">
          <div
            className={`text-4xl font-extrabold ${pct >= 75 ? "text-emerald-500" : pct >= 50 ? "text-yellow-500" : "text-rose-500"
              }`}
          >
            {pct.toFixed(1)}
          </div>
          <div className="text-[10px] text-gray-500 tracking-wider mt-1">OVERALL</div>
        </div>
      </div>
    </div>
  );
};

// Tiny confetti (no deps)
const Confetti = ({ show }) => {
  if (!show) return null;
  const bits = Array.from({ length: 50 });
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {bits.map((_, i) => (
        <span
          key={i}
          className="absolute block w-2 h-2 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            background: ["#6366F1", "#14B8A6", "#F59E0B", "#EF4444", "#22C55E"][i % 5],
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `fall ${2 + Math.random() * 2}s linear ${Math.random()}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(110vh) rotate(720deg); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};

export default function ResumeAnalysis() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDescription, setJobDescription] = useState(() => localStorage.getItem("ta_job_desc") || "");

  const [resumeFile, setResumeFile] = useState(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [showIntro, setShowIntro] = useState(false);

  // for “copy suggestions”
  const [copied, setCopied] = useState(false);

  // last score delta badge
  const [lastScore, setLastScore] = useState(() => {
    const v = localStorage.getItem("ta_last_score");
    return v ? Number(v) : null;
  });

  // nav guard state
  const [navGuardOpen, setNavGuardOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState(null);

  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // Faux loader animation
  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(98, p + Math.ceil(Math.random() * 8));
      setProgress(p);
    }, 160);
    return () => clearInterval(id);
  }, [loading]);

  // Guard activation condition
  const guardActive = step === 3 && !!analysis;

  // Intercept tab close / refresh
  useEffect(() => {
    if (!guardActive) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [guardActive]);

  // Called by Navbar when user tries to navigate away
  const handleNavAttempt = (href) => {
    if (guardActive) {
      setPendingHref(href);
      setNavGuardOpen(true);
    } else {
      window.location.href = href;
    }
  };

  // Download PDF (simple print view)
  const handleDownloadPdf = () => {
    if (!analysis) return;

    const w = window.open("", "_blank");
    const css = `
      body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial; padding:24px; color:#0F172A}
      h1{font-size:22px; margin:0 0 12px;}
      h2{font-size:16px; margin:16px 0 8px;}
      .box{border:1px solid #E5E7EB; border-radius:12px; padding:16px; margin:12px 0;}
      .muted{color:#6B7280}
      ul{margin:8px 0 0 18px}
      .row{display:flex; gap:12px; margin-top:8px}
      .pill{background:#EEF2FF; color:#3730A3; padding:2px 8px; border-radius:999px; font-size:12px}
      .score{font-size:32px; font-weight:800}
    `;
    const html = `
      <html>
        <head><title>TalentAlign – Analysis Report</title><style>${css}</style></head>
        <body>
          <h1>TalentAlign – Resume Analysis</h1>
          <div class="box">
            <div class="score">ATS Score: ${analysis.ats_score}</div>
            <div class="row">
              <span class="pill">Semantic: ${analysis.semantic_score}%</span>
              <span class="pill">Skill overlap: ${analysis.skill_overlap}%</span>
              <span class="pill">Missing skills: ${analysis.missing_skills.length}</span>
            </div>
            <p class="muted">Generated on ${new Date().toLocaleString()}</p>
          </div>

          <div class="box">
            <h2>Matched Skills</h2>
            ${analysis.matched_skills.length
        ? `<ul>${analysis.matched_skills.map((s) => `<li>${s}</li>`).join("")}</ul>`
        : "<p class='muted'>None detected.</p>"
      }
          </div>

          <div class="box">
            <h2>Missing Skills</h2>
            ${analysis.missing_skills.length
        ? `<ul>${analysis.missing_skills.map((s) => `<li>${s}</li>`).join("")}</ul>`
        : "<p class='muted'>No major skills missing.</p>"
      }
          </div>

          <div class="box">
            <h2>AI Suggestions</h2>
            ${analysis.suggestions.length
        ? `<ul>${analysis.suggestions.map((s) => `<li>${s}</li>`).join("")}</ul>`
        : "<p class='muted'>No suggestions available.</p>"
      }
          </div>
        </body>
      </html>
    `;
    w.document.write(html);
    w.document.close();
    w.onload = () => {
      w.focus();
      w.print();
      w.close();
    };
  };

  // Persist JD
  useEffect(() => {
    localStorage.setItem("ta_job_desc", jobDescription || "");
  }, [jobDescription]);

  // Create & revoke preview URL when file changes
  useEffect(() => {
    if (!resumeFile) {
      if (resumePreviewUrl) URL.revokeObjectURL(resumePreviewUrl);
      setResumePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(resumeFile);
    setResumePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeFile]);

  // Drag & drop listeners
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onDrop = (e) => {
      prevent(e);
      const f = e.dataTransfer.files?.[0];
      if (f) {
        setResumeFile(f);
        handleUpload(true);
      }
      el.classList.remove("ring-2", "ring-[#6366F1]");
    };
    const onEnter = (e) => {
      prevent(e);
      el.classList.add("ring-2", "ring-[#6366F1]");
    };
    const onLeave = (e) => {
      prevent(e);
      el.classList.remove("ring-2", "ring-[#6366F1]");
    };
    ["dragenter", "dragover"].forEach((t) => el.addEventListener(t, onEnter));
    ["dragleave", "drop"].forEach((t) => el.addEventListener(t, onLeave));
    el.addEventListener("drop", onDrop);
    return () => {
      ["dragenter", "dragover"].forEach((t) => el.removeEventListener(t, onEnter));
      ["dragleave", "drop"].forEach((t) => el.removeEventListener(t, onLeave));
      el.removeEventListener("drop", onDrop);
    };
  }, []);

  const handleUpload = (fromDrop = false) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, fromDrop ? 350 : 800);
  };

  // Define this once at the top of your component/file
  const API_BASE =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://talentalign.onrender.com";

  const handleScan = async () => {
  if (!resumeFile) {
    alert("Please upload your resume first.");
    return;
  }
  if (!jobDescription.trim()) {
    alert("Please paste a job description or select a sample.");
    return;
  }

  setLoading(true);
  setAnalysis(null);

  const formData = new FormData();
  formData.append("file", resumeFile);
  formData.append("job_description", jobDescription);

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setAnalysis(data);
    setStep(3);
    setShowIntro(true);
    if (typeof data?.ats_score === "number") {
      localStorage.setItem("ta_last_score", String(data.ats_score));
      setLastScore(data.ats_score);
    }
  } catch (e) {
    console.error(e);
    alert("Error analyzing resume.");
  } finally {
    setLoading(false);
    setProgress(100);
    setTimeout(() => setProgress(0), 500);
  }
};


  const startOver = () => {
    setStep(1);
    setAnalysis(null);
    setSelectedJob(null);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(analysis || {}, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "talentalign-analysis.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySuggestions = async () => {
    const txt = (analysis?.suggestions || []).join("\n• ");
    try {
      await navigator.clipboard.writeText(txt ? `• ${txt}` : "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };

  const sampleJobs = {
    "Frontend Developer":
      "Looking for a Frontend Developer skilled in React, Tailwind CSS, and modern JavaScript frameworks.",
    "Backend Developer":
      "Seeking a Backend Developer experienced with Node.js, Express, databases (SQL/NoSQL), and APIs.",
    "Fullstack Developer":
      "Hiring a Fullstack Developer comfortable with React, Node.js, databases, and deployment workflows.",
    "Data Scientist":
      "We need a Data Scientist with expertise in Python, Machine Learning, and statistical analysis.",
    "Machine Learning Engineer":
      "Looking for ML Engineer with TensorFlow, PyTorch, and production model deployment experience.",
    "AI Engineer":
      "Seeking an AI Engineer skilled in NLP, computer vision, and building scalable AI applications.",
    "DevOps Engineer":
      "DevOps Engineer role requiring CI/CD, Docker, Kubernetes, and cloud platforms like AWS/Azure.",
    "Cloud Architect":
      "Hiring Cloud Architect with experience in cloud infrastructure design and security best practices.",
    "Cybersecurity Analyst":
      "Looking for Cybersecurity Analyst skilled in threat detection, penetration testing, and SIEM tools.",
    "Product Manager":
      "Seeking Product Manager experienced in Agile, product roadmaps, and stakeholder collaboration.",
    "UI/UX Designer": "We need a UI/UX Designer with Figma, Adobe XD, and user research experience.",
    "Mobile App Developer":
      "Hiring Mobile App Developer skilled in React Native or Flutter for cross-platform apps.",
    "Software Engineer":
      "Software Engineer with strong problem-solving skills, algorithms, and scalable systems knowledge.",
    "Business Analyst":
      "Seeking Business Analyst experienced in requirements gathering, data analysis, and reporting.",
    "Database Administrator":
      "Database Administrator with SQL, NoSQL, and database optimization expertise.",
    "QA Engineer": "QA Engineer skilled in automated testing, Selenium, and ensuring software quality.",
    "Project Manager": "Project Manager with Agile/Scrum experience and strong leadership skills.",
    "Systems Analyst": "Systems Analyst needed to design and optimize IT systems and workflows.",
    "Network Engineer":
      "Looking for Network Engineer with networking protocols, firewalls, and troubleshooting expertise.",
    "Blockchain Developer":
      "Hiring Blockchain Developer skilled in smart contracts, Solidity, and decentralized apps.",
  };

  const barColor = (n) => (n >= 75 ? "bg-emerald-500" : n >= 50 ? "bg-yellow-500" : "bg-rose-500");
  const scoreDelta =
    typeof analysis?.ats_score === "number" && typeof lastScore === "number"
      ? analysis.ats_score - lastScore
      : null;

  const isPdf =
    resumeFile?.type === "application/pdf" || /\.pdf$/i.test(resumeFile?.name || "");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar hideCta={true} guardNavigation={guardActive} onNavAttempt={handleNavAttempt} />

      <Confetti
        show={typeof analysis?.ats_score === "number" && analysis.ats_score >= 75 && showIntro}
      />

      <div className="pt-24 px-6 max-w-7xl mx-auto">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-6">
            {[
              { id: 1, label: "Upload Resume" },
              { id: 2, label: "Add Job" },
              { id: 3, label: "View Results" },
            ].map((s, i, arr) => (
              <div className="flex items-center" key={s.id} title={s.label}>
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${step >= s.id
                    ? "bg-[#6366F1] text-white border-[#6366F1]"
                    : "bg-white text-gray-500 border-gray-300"
                    }`}
                >
                  {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
                </div>
                {i < arr.length - 1 && (
                  <div className="w-20 h-1 mx-3 rounded-full bg-gray-200">
                    <div
                      className="h-1 rounded-full bg-[#6366F1] transition-all"
                      style={{ width: step > s.id ? "100%" : step === s.id ? "50%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {loading && (
            <div className="mt-4">
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-1 bg-[#6366F1] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">Analyzing… {progress}%</p>
            </div>
          )}
        </div>

        {/* Main card */}
        <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Upload Your Resume</h2>
              <p className="text-gray-600 mb-6">Upload your file here (.pdf or .docx)</p>

              <div
                ref={dropRef}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#6366F1] rounded-xl p-10 hover:bg-indigo-50 transition cursor-pointer"
              >
                <Upload className="w-12 h-12 text-[#6366F1] mx-auto mb-4" />
                <p className="text-gray-500">
                  <span className="font-medium text-[#0F172A]">Upload your file here</span> — click
                  or drag & drop
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setResumeFile(f);
                      handleUpload();
                    }
                  }}
                />
              </div>

              {resumeFile && (
                <div className="mt-5 flex flex-col items-center gap-3">
                  <p className="text-sm text-gray-600">
                    Selected:{" "}
                    <span className="font-medium">
                      {resumeFile.name}{" "}
                      <span className="text-gray-400">
                        ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="bg-[#6366F1] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#4F46E5]"
                    >
                      Continue with this file
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2 rounded-lg border hover:bg-gray-50 text-[#0F172A]"
                    >
                      Replace file
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Add Job Description</h2>
              <p className="text-gray-600 mb-6">Paste a job description or select a sample on the right.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description here..."
                  className="w-full border rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-[#6366F1] focus:outline-none min-h-[260px]"
                />

                <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[#0F172A]">Sample Jobs</h3>
                    {selectedJob && <Badge className="bg-[#E0E7FF] text-[#4F46E5]">Selected</Badge>}
                  </div>

                  <div className="max-h-72 overflow-y-auto pr-2">
                    <ul className="space-y-2 text-gray-700">
                      {Object.keys(sampleJobs).map((job) => (
                        <li
                          key={job}
                          onClick={() => {
                            setSelectedJob(job);
                            setJobDescription(sampleJobs[job]);
                          }}
                          className={`cursor-pointer px-3 py-2 rounded-lg transition ${selectedJob === job ? "bg-[#6366F1] text-white font-semibold" : "hover:bg-indigo-100"
                            }`}
                        >
                          {job}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border text-[#0F172A] hover:bg-gray-50">
                  Back
                </button>
                <button
                  onClick={handleScan}
                  className="bg-[#14B8A6] text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 inline-flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Scan & Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — split view */}
          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT: analytics */}
              <div className="lg:col-span-2">
                {/* header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                  <ScoreRing value={analysis?.ats_score ?? 0} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-bold text-[#0F172A]">Your Results</h2>
                      {scoreDelta !== null && (
                        <Badge
                          className={`${scoreDelta >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            }`}
                        >
                          {scoreDelta >= 0 ? "▲" : "▼"} {Math.abs(scoreDelta).toFixed(1)} vs last run
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">Here’s your score and prioritized fixes to boost your interview chances.</p>

                    {/* actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                      >
                        <Printer className="w-4 h-4" /> Print / Save PDF
                      </button>
                      <button onClick={exportJson} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-gray-50">
                        <FileDown className="w-4 h-4" /> Export JSON
                      </button>
                      <button
                        onClick={copySuggestions}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                        title="Copy all suggestions"
                      >
                        <Clipboard className="w-4 h-4" /> {copied ? "Copied!" : "Copy suggestions"}
                      </button>
                      <button onClick={startOver} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-gray-50">
                        <RotateCcw className="w-4 h-4" /> Start over
                      </button>
                    </div>
                  </div>
                </div>

                {/* ATS card */}
                <div className="p-4 rounded-xl bg-indigo-50 mb-6">
                  <h4 className="font-semibold text-[#4F46E5] mb-1">ATS Score</h4>
                  <p className="text-gray-600 mb-3">
                    Your resume matches <span className="font-semibold">{analysis?.matched_skills?.length ?? 0}</span>{" "}
                    keywords from the job description.
                  </p>
                  <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                    <div className={`h-2 ${barColor(analysis?.ats_score || 0)} rounded-full`} style={{ width: `${analysis?.ats_score || 0}%` }} />
                  </div>
                </div>

                {/* Semantic vs skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white border">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-[#0F172A]">Semantic Similarity</h5>
                      <Badge className="bg-indigo-100 text-indigo-700">{analysis?.semantic_score ?? 0}%</Badge>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-[#6366F1] rounded-full" style={{ width: `${analysis?.semantic_score || 0}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Measures how closely your content aligns with the JD (synonyms, context).</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-[#0F172A]">Skill Overlap</h5>
                      <Badge className="bg-teal-100 text-teal-700">{analysis?.skill_overlap ?? 0}%</Badge>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-[#14B8A6] rounded-full" style={{ width: `${analysis?.skill_overlap || 0}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Exact/alias matches of core skills required by the JD.</p>
                  </div>
                </div>

                {/* Missing + Matched */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-teal-50">
                    <h5 className="font-semibold text-[#0F172A] mb-2">Missing Skills</h5>
                    {analysis?.missing_skills?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {analysis.missing_skills.map((s, i) => (
                          <Badge key={i} className="bg-white text-[#0F172A] border">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No major skills missing 🎉</p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50">
                    <h5 className="font-semibold text-[#0F172A] mb-2">Matched Skills</h5>
                    {analysis?.matched_skills?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {analysis.matched_skills.map((s, i) => (
                          <Badge key={i} className="bg-white text-[#0F172A] border">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">None detected yet.</p>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="p-4 rounded-xl bg-white border">
                  <h5 className="font-semibold text-[#0F172A] mb-2">AI Suggestions</h5>
                  <ul className="list-disc ml-5 text-gray-700 space-y-1">
                    {(analysis?.suggestions || []).map((s, i) => (
                      <li key={i}>
                        <span className="font-semibold text-indigo-600">[{s.category}]</span> {s.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* RIGHT: resume preview (sticky) */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-[#6366F1]" />
                        <span className="text-sm font-medium truncate">
                          {resumeFile?.name || "Resume preview"}
                        </span>
                      </div>
                      {resumePreviewUrl && (
                        <a
                          href={resumePreviewUrl}
                          download={resumeFile?.name || "resume"}
                          className="inline-flex items-center gap-1 text-sm text-[#6366F1] hover:underline"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" /> Download
                        </a>
                      )}
                    </div>

                    <div className="h-[70vh] bg-gray-50">
                      {resumePreviewUrl ? (
                        isPdf ? (
                          <iframe title="Resume PDF Preview" src={resumePreviewUrl} className="w-full h-full" />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center px-4">
                            <p className="text-gray-600">
                              Preview for <strong>.doc/.docx</strong> isn’t supported here.
                            </p>
                            <p className="text-gray-500 text-sm mt-1">You can still download and open it locally.</p>
                            <a
                              href={resumePreviewUrl}
                              download={resumeFile?.name || "resume"}
                              className="mt-4 inline-flex items-center gap-2 bg-[#6366F1] text-white px-4 py-2 rounded-lg hover:bg-[#4F46E5]"
                            >
                              <Download className="w-4 h-4" /> Download resume
                            </a>
                          </div>
                        )
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">No file selected</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav-guard modal */}
      {navGuardOpen && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
              onClick={() => setNavGuardOpen(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#0F172A]">Leave this page?</h3>
            <p className="text-gray-600 mt-2">
              You’re viewing an analysis. Would you like to keep viewing it, or download it as a PDF before leaving?
            </p>

            <div className="mt-5 flex flex-wrap gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg border text-[#0F172A] hover:bg-gray-50"
                onClick={() => {
                  setNavGuardOpen(false);
                  setPendingHref(null);
                }}
              >
                Keep viewing
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[#6366F1] text-white hover:bg-[#4F46E5]"
                onClick={handleDownloadPdf}
              >
                Download PDF
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                onClick={() => {
                  setNavGuardOpen(false);
                  const href = pendingHref;
                  setPendingHref(null);
                  if (href && href !== "BACK") {
                    window.location.href = href;
                  } else if (href === "BACK") {
                    window.history.back();
                  }
                }}
              >
                Leave anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* First-result modal */}
      {showIntro && analysis && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative">
            <button
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
              onClick={() => setShowIntro(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-[#0F172A]">
              Your resume scored {analysis.ats_score} out of 100.
            </h3>
            <p className="text-gray-600 mt-3">
              Nice work—there’s still headroom. A few targeted edits could lift your score significantly. Let’s walk
              through them.
            </p>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowIntro(false)}
                className="inline-flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-lg font-semibold"
              >
                Let’s dive in <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
