import re
from typing import List, Dict, Union

# Strong action verbs that recruiters like
ACTION_VERBS = {
    "built", "created", "designed", "developed", "engineered", "implemented",
    "launched", "led", "migrated", "optimized", "reduced", "improved",
    "automated", "architected", "delivered", "scaled", "streamlined",
    "initiated", "enhanced"
}

# Standard resume headings we expect
HEADINGS = {
    "summary", "experience", "work experience", "projects", "education",
    "skills", "certifications"
}


def quality_hints(
    resume_text: str,
    sections: dict,
    missing_skills: Union[List[str], set]
) -> List[Dict[str, str]]:
    """
    Generate heuristic suggestions for improving a resume.
    Returns categorized tips instead of plain strings.
    Categories: metrics, verbs, structure, length, skills, general
    """
    tips: List[Dict[str, str]] = []

    # ✅ Normalize missing_skills to list
    missing_skills = list(missing_skills) if missing_skills else []

    # --- Quantifiable metrics
    numbers = re.findall(r"\b\d+(\.\d+)?%?\b", resume_text)
    if len(numbers) < 3:
        tips.append({
            "category": "metrics",
            "message": "Add quantifiable metrics (e.g., 'reduced load time by 35%', 'handled 1M+ requests/day')."
        })

    # --- Action verbs
    verbs_found = sum(1 for v in ACTION_VERBS if re.search(rf"\b{v}\b", resume_text))
    if verbs_found < 5:
        tips.append({
            "category": "verbs",
            "message": "Use more strong action verbs at the start of bullets (built, optimized, delivered, automated, scaled)."
        })

    # --- Section structure
    missing_heads = [h for h in HEADINGS if h not in resume_text]
    if missing_heads:
        tips.append({
            "category": "structure",
            "message": f"Add or standardize sections: {', '.join(missing_heads[:4])}."
        })

    # --- Length check (rough estimate)
    words = len(resume_text.split())
    if words < 250:
        tips.append({
            "category": "length",
            "message": "Resume seems short; add 3–5 bullets per recent role with impact & technologies."
        })
    elif words > 1000:
        tips.append({
            "category": "length",
            "message": "Resume is long; trim older roles and keep bullets concise (1–2 lines)."
        })

    # --- Missing skills
    if missing_skills:
        tips.append({
            "category": "skills",
            "message": "Emphasize missing role-specific skills: " + ", ".join(missing_skills[:6]) + "."
        })

    # --- Final fallback
    if not tips:
        tips.append({
            "category": "general",
            "message": "Great alignment. Mirror top JD keywords in your top bullets and add 2–3 hard metrics."
        })

    return tips
