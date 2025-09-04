# backend/main.py
import os
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Your analyzer modules (these should already exist in backend/analyzer/)
from analyzer.extractor import extract_text_bytes, normalize, guess_sections
from analyzer.skills import find_skills, fuzzy_fill
from analyzer.matcher import semantic_score, skill_scores, blended_score
from analyzer.advisor import quality_hints

ALLOWED_EXTS = {".pdf", ".doc", ".docx", ".txt"}
MAX_FILE_BYTES = 8 * 1024 * 1024  # 8 MB

app = FastAPI(title="TalentAlign Analyzer", version="0.1.0")

# CORS (adjust if you want to restrict to your frontend origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _ext_ok(filename: str) -> bool:
    _, ext = os.path.splitext(filename or "")
    return ext.lower() in ALLOWED_EXTS

def _pct(n: float) -> float:
    """Clamp to [0, 100] and round to 1 decimal."""
    try:
        return round(max(0.0, min(100.0, float(n))), 1)
    except Exception:
        return 0.0

@app.get("/health")
def health():
    return {"ok": True, "service": "talentalign-analyzer", "version": app.version}

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    job_description: str = Form(""),  # allow empty, we’ll still parse resume
):
    # ---- Basic validations
    if not _ext_ok(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_EXTS))}",
        )

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 8 MB).")

    # ---- Extract raw text
    try:
        resume_raw = extract_text_bytes(file.filename, data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not read file: {e}")

    jd_raw = job_description or ""

    # ---- Normalize for analysis
    resume_norm = normalize(resume_raw)
    jd_norm = normalize(jd_raw)

    # ---- Sections (for hints only)
    sections = guess_sections(resume_norm) or {}

    # ---- Skills (exact + conservative fuzzy)
    jd_skills_exact = find_skills(jd_norm)
    res_skills_exact = find_skills(resume_norm)

    # Conservative fuzzy (high threshold to avoid false positives)
    jd_skills = jd_skills_exact | fuzzy_fill(jd_norm, threshold=92)
    res_skills = res_skills_exact | fuzzy_fill(resume_norm, threshold=92)

    # ---- Scores
    sem = semantic_score(resume_norm, jd_norm) if jd_norm else 0.0               # 0..100
    overlap, matched, missing = skill_scores(jd_skills, res_skills) if jd_norm else (0.0, [], list(jd_skills))
    ats = blended_score(sem, overlap, w_sem=0.55)                                 # blended 0..100

    # ---- Suggestions
    suggestions = quality_hints(resume_norm, sections, set(missing))

    # ---- Response
    return {
        "filename": file.filename,
        "ats_score": _pct(ats),
        "semantic_score": _pct(sem),
        "skill_overlap": _pct(overlap),
        "matched_skills": sorted(list(set(matched))),
        "missing_skills": sorted(list(set(missing))),
        "sections_present": sorted(list(sections.keys())),
        "suggestions": suggestions,
        # optional echoes
        "has_job_description": bool(jd_raw.strip()),
    }

# Optional root for quick sanity check in a browser
@app.get("/")
def root():
    return {"message": "TalentAlign Analyzer is running. See /health or POST /analyze."}
