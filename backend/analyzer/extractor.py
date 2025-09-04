import io
import re
import pdfplumber
import docx

SUPPORT = (".pdf", ".docx", ".doc")

def extract_text_bytes(filename: str, data: bytes) -> str:
    name = filename.lower()

    if name.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            pages = [(p.extract_text() or "") for p in pdf.pages]
            return "\n".join(pages)

    if name.endswith((".docx", ".doc")):
        doc = docx.Document(io.BytesIO(data))
        return "\n".join(p.text for p in doc.paragraphs)

    raise ValueError("Unsupported file type")

def normalize(text: str) -> str:
    text = text.lower()
    # compact whitespace
    text = re.sub(r"\s+", " ", text)
    return text

SECTION_HEADERS = [
    "summary","professional summary","experience","work experience",
    "projects","education","skills","certifications","awards"
]

def guess_sections(text: str) -> dict:
    """Very simple section splitter to power heuristics."""
    sections = {}
    lower = text.lower()

    # find indices of headers
    indices = []
    for h in SECTION_HEADERS:
        for m in re.finditer(rf"\b{re.escape(h)}\b", lower):
            indices.append((m.start(), h))
    indices.sort()

    # slice sections
    for i, (start, header) in enumerate(indices):
        end = indices[i+1][0] if i+1 < len(indices) else len(text)
        sections[header] = text[start:end].strip()

    return sections
