import json, re, os
from rapidfuzz import fuzz

DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "skills_taxonomy.json"
)

with open(DATA_PATH, "r", encoding="utf-8") as f:
    TAXONOMY = json.load(f)

def generate_variants(alias: str) -> set[str]:
    """
    Generate common textual variants for a given alias:
    - dot/space/dash interchanges
    - remove dots (e.g., node.js → nodejs)
    - add space before suffixes like 'js'
    """
    alias = alias.lower()
    variants = {alias}

    # normalize separators
    base = alias.replace(".", " ").replace("-", " ").strip()
    variants.add(base)

    # compress spaces
    variants.add(base.replace(" ", ""))  # node js → nodejs
    variants.add(base.replace(" ", "."))  # node js → node.js
    variants.add(base.replace(" ", "-"))  # node js → node-js

    # special: js suffix
    if base.endswith("js") and not base.endswith(".js"):
        variants.add(base.replace("js", ".js"))
        variants.add(base.replace("js", " js"))

    return {v for v in variants if v}


# --- Build ALIASES dynamically ---
ALIASES = {}
for canon, aliases in TAXONOMY.items():
    canon_lc = canon.lower()
    for variant in generate_variants(canon_lc):
        ALIASES[variant] = canon
    for a in aliases:
        for variant in generate_variants(a):
            ALIASES[variant] = canon

# Regex patterns
PATTERNS = {
    alias: re.compile(
        rf"(?<![a-z0-9]){re.escape(alias)}(?![a-z0-9])",
        re.IGNORECASE,
    )
    for alias in ALIASES.keys()
}

def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[\u2010-\u2015]", "-", text)  # normalize dashes
    text = re.sub(r"[^a-z0-9\.\+#\- ]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def find_skills(text: str) -> set[str]:
    """
    Exact/regex-based skill matching.
    """
    text = normalize_text(text)
    found = set()
    for alias, pat in PATTERNS.items():
        if pat.search(text):
            found.add(ALIASES[alias])  # map to canonical
    return found


def fuzzy_fill(text: str, threshold: int = 92, max_hits: int = 3) -> set[str]:
    """
    Conservative fuzzy fallback for skills missed by regex.
    """
    text = normalize_text(text)
    tokens = set(re.findall(r"[a-z0-9\.\+#\-]{3,}", text))
    found = set()

    for alias, canon in ALIASES.items():
        if len(alias) < 4:  # skip too-short aliases like "js"
            continue
        matches = 0
        for w in tokens:
            if fuzz.ratio(alias, w) >= threshold:
                found.add(canon)
                matches += 1
                if matches >= max_hits:
                    break
    return found
