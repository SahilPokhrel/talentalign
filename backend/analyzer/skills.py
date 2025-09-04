import json, re, os
from rapidfuzz import fuzz

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "skills_taxonomy.json")

with open(DATA_PATH, "r", encoding="utf-8") as f:
    TAXONOMY = json.load(f)

# Pre-build alias → canonical map
ALIASES = {}
for canon, aliases in TAXONOMY.items():
    ALIASES[canon] = canon
    for a in aliases:
        ALIASES[a] = canon

# Build regex pattern for fast exact-ish matches (word boundaries)
PATTERNS = {alias: re.compile(rf"\b{re.escape(alias)}\b") for alias in ALIASES.keys()}

def find_skills(text: str) -> set[str]:
    found = set()
    for alias, pat in PATTERNS.items():
        if pat.search(text):
            found.add(ALIASES[alias])  # map to canonical
    return found

def fuzzy_fill(text: str, threshold: int = 90) -> set[str]:
    """Optional fuzzy top-up for aliases missed by regex (short names can be noisy)."""
    found = set()
    words = set(w for w in re.findall(r"[a-zA-Z0-9\.\+#\-]+", text))
    for alias, canon in ALIASES.items():
        # only try fuzzy for reasonably long tokens
        if len(alias) >= 4:
            for w in words:
                if fuzz.partial_ratio(alias, w) >= threshold:
                    found.add(canon)
                    break
    return found
