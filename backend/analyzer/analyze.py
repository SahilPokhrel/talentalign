from typing import List, Dict, Set
import re
from rapidfuzz import process, fuzz
from sentence_transformers import SentenceTransformer, util
import spacy

# -------------------------------------------------------------------
# Lazy-loading for heavy models (to prevent crashes at startup)
# -------------------------------------------------------------------
_nlp = None
_embedder = None

def get_nlp():
    global _nlp
    if _nlp is None:
        print("[DEBUG] Loading spaCy model...")
        try:
            _nlp = spacy.load("en_core_web_sm")
            print("[DEBUG] spaCy model loaded successfully")
        except OSError:
            print("[ERROR] spaCy model not found. Run: python -m spacy download en_core_web_sm")
            raise
    return _nlp

def get_embedder():
    global _embedder
    if _embedder is None:
        print("[DEBUG] Loading SentenceTransformer model...")
        try:
            _embedder = SentenceTransformer("all-MiniLM-L6-v2")
            print("[DEBUG] SentenceTransformer model loaded successfully")
        except Exception as e:
            print(f"[ERROR] Failed to load SentenceTransformer: {e}")
            raise
    return _embedder

# -------------------------------------------------------------------
# Skills dictionary + aliases
# -------------------------------------------------------------------
SKILL_ALIASES: Dict[str, List[str]] = {
    "react": ["react.js", "reactjs", "react js"],
    "javascript": ["js", "ecmascript"],
    "typescript": ["ts"],
    "tailwind css": ["tailwind", "tailwindcss"],
    "node.js": ["node", "nodejs", "node js"],
    "express": ["expressjs", "express.js"],
    "python": [],
    "django": [],
    "flask": [],
    "pandas": [],
    "numpy": [],
    "scikit-learn": ["sklearn", "scikit learn"],
    "tensorflow": ["tf"],
    "pytorch": [],
    "docker": [],
    "kubernetes": ["k8s"],
    "aws": ["amazon web services"],
    "azure": [],
    "gcp": ["google cloud", "google cloud platform"],
    "postgresql": ["postgres", "psql"],
    "mysql": [],
    "mongodb": ["mongo", "mongo db"],
    "graphql": [],
    "rest api": ["restful", "rest apis"],
    "ci/cd": ["cicd", "ci cd", "continuous integration", "continuous delivery"],
    "git": [],
    "jest": [],
    "cypress": [],
    "playwright": [],
    "html": ["html5"],
    "css": ["css3"],
    "redux": [],
    "next.js": ["nextjs", "next js"],
    "fastapi": [],
}

# Flatten dictionary
CANONICAL = list(SKILL_ALIASES.keys())
ALIAS_TO_CANON: Dict[str, str] = {}
for canon, aliases in SKILL_ALIASES.items():
    ALIAS_TO_CANON[canon] = canon
    for a in aliases:
        ALIAS_TO_CANON[a] = canon

VOCAB = list(ALIAS_TO_CANON.keys()) + CANONICAL

# -------------------------------------------------------------------
# Utility functions
# -------------------------------------------------------------------
def normalize_text(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[\u2010-\u2015]", "-", s)  # normalize hyphens
    s = re.sub(r"[^a-z0-9.+#/\- ]+", " ", s)  # keep techy chars
    s = re.sub(r"\s+", " ", s).strip()
    return s

def extract_skill_candidates(text: str, threshold: int = 92) -> Set[str]:
    print("[DEBUG] extract_skill_candidates called")
    text_norm = normalize_text(text)
    print(f"[DEBUG] Normalized text length = {len(text_norm)}")

    doc = get_nlp()(text_norm)
    print("[DEBUG] spaCy doc processed")

    grams = set()
    toks = [t.text for t in doc if not t.is_stop]
    grams.update(toks)
    grams.update([" ".join(toks[i:i + 2]) for i in range(len(toks) - 1)])
    grams.update([chunk.text for chunk in doc.noun_chunks])

    print(f"[DEBUG] Candidate grams generated = {len(grams)}")

    found: Set[str] = set()
    for g in grams:
        if not g:
            continue
        match, score, _ = process.extractOne(g, VOCAB, scorer=fuzz.token_set_ratio)
        if match and score >= threshold:
            found.add(ALIAS_TO_CANON[match])

    print(f"[DEBUG] Skills matched = {found}")
    return found

def semantic_similarity(a: str, b: str) -> float:
    print("[DEBUG] semantic_similarity called")
    if not a.strip() or not b.strip():
        print("[DEBUG] One of the inputs is empty")
        return 0.0
    emb = get_embedder().encode([a, b], convert_to_tensor=True)
    sim = util.cos_sim(emb[0], emb[1]).item()
    print(f"[DEBUG] Cosine similarity = {sim}")
    return max(0.0, min(1.0, sim)) * 100

def quantify_issues(resume_text: str) -> Dict[str, int]:
    print("[DEBUG] quantify_issues called")
    txt = normalize_text(resume_text)

    bullets = [b for b in re.split(r"\n[-•*]\s*", resume_text) if b.strip()]
    with_numbers = sum(bool(re.search(r"\b\d+(\.\d+)?%?\b", b)) for b in bullets)

    action_verbs = [
        "built", "delivered", "optimized", "designed", "implemented", "led",
        "launched", "reduced", "increased", "improved", "automated", "migrated",
        "developed", "refactored", "deployed"
    ]
    verbs_found = sum(1 for v in action_verbs if re.search(rf"\b{re.escape(v)}\b", txt))
    passive_hits = len(re.findall(r"\b(was|were|been|being|is|are|be)\s+\w+ed\b", txt))

    sections_present = []
    for sec in ["summary", "experience", "work experience", "projects", "education", "skills", "certifications"]:
        if re.search(rf"\b{sec}\b", txt):
            sections_present.append(sec)

    result = {
        "bullets_total": len(bullets),
        "bullets_with_numbers": with_numbers,
        "action_verb_hits": verbs_found,
        "passive_hits": passive_hits,
        "sections_ok": len(sections_present),
    }
    print(f"[DEBUG] quantify_issues result = {result}")
    return result

def build_suggestions(resume_text: str, jd_text: str,
                      missing: List[str], semantic: float, overlap: float,
                      issues: Dict[str, int]) -> List[str]:
    print("[DEBUG] build_suggestions called")
    sug = []
    if missing:
        sug.append(f"Mirror the JD by adding these missing skills (where relevant): {', '.join(missing[:10])}.")

    bullets = issues["bullets_total"]
    with_nums = issues["bullets_with_numbers"]
    if bullets and with_nums / bullets < 0.5:
        sug.append("Quantify more achievements (add numbers like %, $ or # to >50% of bullets).")

    if issues["action_verb_hits"] < 3:
        sug.append("Start bullets with strong action verbs (built, delivered, optimized, designed…).")

    if issues["passive_hits"] > 2:
        sug.append("Reduce passive voice; rewrite bullets in active voice for impact.")

    if issues["sections_ok"] < 4:
        sug.append("Check section structure (Summary, Work Experience, Skills, Education, Projects).")

    if semantic < 45:
        sug.append("Rephrase your summary/experience to align closer to the JD (use synonyms & JD phrases).")

    if overlap < 70 and not missing:
        sug.append("Even matched skills are sparse in bullets—surface them earlier and more frequently.")

    if not sug:
        sug.append("Looks solid! Consider a final proofread and tailor the top bullets for the JD.")

    print(f"[DEBUG] build_suggestions result = {sug}")
    return sug
