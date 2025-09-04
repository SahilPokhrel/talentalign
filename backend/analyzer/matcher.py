from sentence_transformers import SentenceTransformer, util

# Load once (cached)
_model = None
def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def semantic_score(resume_text: str, jd_text: str) -> float:
    """0..100 semantic similarity."""
    m = get_model()
    e1 = m.encode(resume_text, convert_to_tensor=True)
    e2 = m.encode(jd_text, convert_to_tensor=True)
    sim = float(util.cos_sim(e1, e2).item())
    return round(max(0.0, min(1.0, sim)) * 100.0, 1)

def skill_scores(jd_skills: set[str], res_skills: set[str]) -> tuple[float, list[str], list[str]]:
    if not jd_skills:
        return 0.0, [], []
    matched = sorted(list(jd_skills & res_skills))
    missing = sorted(list(jd_skills - res_skills))
    score = round(len(matched) / len(jd_skills) * 100.0, 1)
    return score, matched, missing

def blended_score(sem: float, skill_overlap: float, w_sem: float = 0.55) -> float:
    """Blend semantic + skill overlap for a realistic ATS-like score."""
    w_skill = 1.0 - w_sem
    return round(sem * w_sem + skill_overlap * w_skill, 1)
