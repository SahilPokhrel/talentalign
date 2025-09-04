import re

ACTION_VERBS = {
    "built","created","designed","developed","engineered","implemented","launched","led",
    "migrated","optimized","reduced","improved","automated","architected","delivered","scaled"
}
HEADINGS = {"summary","experience","work experience","projects","education","skills","certifications"}

def quality_hints(resume_text: str, sections: dict, missing_skills: list[str]) -> list[str]:
    tips = []

    # numbers/metrics
    numbers = re.findall(r"\b\d+(\.\d+)?%?\b", resume_text)
    if len(numbers) < 3:
        tips.append("Add quantifiable metrics (e.g., “reduced load time by 35%”, “handled 1M+ requests/day”).")

    # action verbs
    verbs = sum(1 for v in ACTION_VERBS if re.search(rf"\b{v}\b", resume_text))
    if verbs < 5:
        tips.append("Start bullets with strong action verbs (built, optimized, delivered, automated, scaled).")

    # structure
    missing_heads = [h for h in HEADINGS if h not in resume_text]
    if missing_heads:
        tips.append(f"Add or standardize sections: {', '.join(missing_heads[:4])}.")

    # length (very rough)
    words = len(resume_text.split())
    if words < 250:
        tips.append("Resume seems short; add 3–5 bullets per recent role with impact & technologies.")
    elif words > 1000:
        tips.append("Resume is long; trim older roles and keep bullets concise (1–2 lines).")

    # skill gaps
    if missing_skills:
        tips.append("Emphasize missing role-specific skills: " + ", ".join(missing_skills[:6]) + ".")

    if not tips:
        tips.append("Great alignment. Mirror top JD keywords in your top bullets and add 2–3 hard metrics.")
    return tips
