from typing import List, Dict, Set
import re
from collections import Counter

import spacy
from rapidfuzz import process, fuzz
from sentence_transformers import SentenceTransformer, util

# --- Load NLP models (keep them module-level so they load once)
nlp = spacy.load("en_core_web_sm")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# --- Canonical skills dictionary (you can expand this)
# Map canonical -> variants/aliases
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

# Flat list of known skill terms (canonical + aliases)
CANONICAL = list(SKILL_ALIASES.keys())
ALIAS_TO_CANON: Dict[str, str] = {}
VOCAB: List[str] = []
for canon, aliases in SKILL_ALIASES.items():
    ALIAS_TO_CANON[canon] = canon
    for a in aliases:
        ALIAS_TO_CANON[a] = canon
VOCAB = list(ALIAS_TO_CANON.keys())

# --- Helpers

def normalize_text(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[\u2010-\u2015]", "-", s)          # normalize hyphens
    s = re.sub(r"[^a-z0-9.+#/\- ]+", " ", s)       # keep techy chars
    s = re.sub(r"\s+", " ", s).strip()
    return s

def extract_skill_candidates(text: str) -> Set[str]:
    """
    Use spaCy noun chunks + tokens + n-grams, then fuzzy-match to vocabulary.
    """
    text_norm = normalize_text(text)
    doc = nlp(text_norm)

    # collect unigrams + bigrams + noun chunks
    grams = set()
    toks = [t.text for t in doc if not t.is_stop]
    grams.update(toks)
    grams.update([" ".join(toks[i:i+2]) for i in range(len(toks)-1)])
    grams.update([chunk.text for chunk in doc.noun_chunks])

    # fuzzy map to our canonical vocabulary
    found: Set[str] = set()
    for g in grams:
        match, score, _ = process.extractOne(
            g, VOCAB, scorer=fuzz.token_set_ratio
        ) if g else (None, 0, None)
        if match and score >= 85:
            found.add(ALIAS_TO_CANON[match])
    return found

def semantic_similarity(a: str, b: str) -> float:
    if not a.strip() or not b.strip():
        return 0.0
    emb = embedder.encode([a, b], convert_to_tensor=True)
    sim = util.cos_sim(emb[0], emb[1]).item()
    return max(0.0, min(1.0, sim)) * 100

def quantify_issues(resume_text: str) -> Dict[str, int]:
    """
    Heuristics to vary suggestions:
      - counts bullets with numbers
      - action verbs
      - passive voice (very rough)
      - presence of key sections
    """
    txt = normalize_text(resume_text)
    bullets = [b for b in re.split(r"\n[-•*]\s*", resume_text) if b.strip()]
    with_numbers = sum(bool(re.search(r"\b\d+(\.\d+)?%?\b", b)) for b in bullets)

    action_verbs = [
        "built","delivered","optimized","designed","implemented","led",
        "launched","reduced","increased","improved","automated","migrated",
        "developed","refactored","deployed"
    ]
    verbs_found = sum(1 for v in action_verbs if re.search(rf"\b{re.escape(v)}\b", txt))

    passive_hits = len(re.findall(r"\b(was|were|been|being|is|are|be)\s+\w+ed\b", txt))

    sections_present = []
    for sec in ["summary","experience","work experience","projects","education","skills","certifications"]:
        if re.search(rf"\b{sec}\b", txt):
            sections_present.append(sec)

    return {
        "bullets_total": len(bullets),
        "bullets_with_numbers": with_numbers,
        "action_verb_hits": verbs_found,
        "passive_hits": passive_hits,
        "sections_ok": len(sections_present),
    }

def build_suggestions(resume_text: str, jd_text: str,
                      missing: List[str], semantic: float, overlap: float,
                      issues: Dict[str, int]) -> List[str]:
    sug = []
    # Missing skills -> targeted recommendations
    if missing:
        sug.append(
            f"Mirror the JD by adding these missing skills (where relevant): {', '.join(missing[:10])}."
        )

    # Quantification
    bullets = issues["bullets_total"]
    with_nums = issues["bullets_with_numbers"]
    if bullets and with_nums / bullets < 0.5:
        sug.append("Quantify more achievements (add numbers like %, $ or # to >50% of bullets).")

    # Action verbs
    if issues["action_verb_hits"] < 3:
        sug.append("Start bullets with strong action verbs (built, delivered, optimized, designed…).")

    # Passive voice
    if issues["passive_hits"] > 2:
        sug.append("Reduce passive voice; rewrite bullets in active voice for impact.")

    # Sections
    if issues["sections_ok"] < 4:
        sug.append("Check section structure (Summary, Work Experience, Skills, Education, Projects).")

    # Semantic alignment
    if semantic < 45:
        sug.append("Rephrase your summary/experience to align closer to the JD (use synonyms & JD phrases).")

    # Overlap
    if overlap < 70 and not missing:
        sug.append("Even matched skills are sparse in bullets—surface them earlier and more frequently.")

    if not sug:
        sug.append("Looks solid! Consider a final proofread and tailor the top bullets for the JD.")
    return sug
