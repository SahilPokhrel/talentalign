from sentence_transformers import SentenceTransformer, util

# Load once (cached)
_model = None
def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def semantic_score(resume_text: str, jd_text: str) -> float:
    """
    Compute semantic similarity between resume and JD (0..100).
    """
    if not resume_text.strip() or not jd_text.strip():
        return 0.0

    m = get_model()
    e1 = m.encode(resume_text, convert_to_tensor=True)
    e2 = m.encode(jd_text, convert_to_tensor=True)
    sim = float(util.cos_sim(e1, e2).item())
    return round(max(0.0, min(1.0, sim)) * 100.0, 1)


def skill_scores(jd_skills, res_skills):
    """
    Compare JD and Resume skill sets.
    Returns: (overlap %, matched list, missing list)
    """
    if not jd_skills:
        return 0.0, [], []

    jd_skills = set(jd_skills)
    res_skills = set(res_skills)

    matched = sorted(jd_skills & res_skills)
    missing = sorted(jd_skills - res_skills)

    overlap = (len(matched) / len(jd_skills)) * 100 if jd_skills else 0.0

    # Debug logging (optional)
    print(f"[DEBUG matcher] JD skills={len(jd_skills)}, Resume skills={len(res_skills)}")
    print(f"[DEBUG matcher] Matched={matched}, Missing={missing}, Overlap={overlap:.1f}%")

    return overlap, matched, missing


def blended_score(sem: float, skill_overlap: float, w_sem: float = 0.55) -> float:
    """
    Blend semantic + skill overlap for a realistic ATS-like score.
    """
    w_skill = 1.0 - w_sem
    return round(sem * w_sem + skill_overlap * w_skill, 1)
