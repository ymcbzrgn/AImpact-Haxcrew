"""
Deck Analyzer Service
- Text extraction from PDF/PPTX/Images
- Gemini 3 Pro for deck analysis
"""

import fitz  # PyMuPDF
from pptx import Presentation
import pytesseract
from PIL import Image
import io
import json
import re
from typing import List, Dict, Optional, Any
from datetime import datetime


async def extract_text_from_pdf(file_bytes: bytes) -> List[Dict]:
    """Extract text from PDF file"""
    slides = []
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    for page_num, page in enumerate(doc):
        text = page.get_text()

        # If no text found, try OCR
        if not text.strip():
            pix = page.get_pixmap()
            img = Image.open(io.BytesIO(pix.tobytes()))
            text = pytesseract.image_to_string(img)

        slides.append({
            "slide_number": page_num + 1,
            "content": text.strip()
        })

    doc.close()
    return slides


async def extract_text_from_pptx(file_bytes: bytes) -> List[Dict]:
    """Extract text from PPTX file"""
    slides = []
    prs = Presentation(io.BytesIO(file_bytes))

    for slide_num, slide in enumerate(prs.slides):
        text_parts = []
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                text_parts.append(shape.text)

        slides.append({
            "slide_number": slide_num + 1,
            "content": "\n".join(text_parts).strip()
        })

    return slides


async def extract_text_from_image(file_bytes: bytes) -> List[Dict]:
    """Extract text from image file (PNG/JPG) using OCR"""
    img = Image.open(io.BytesIO(file_bytes))
    text = pytesseract.image_to_string(img)

    return [{
        "slide_number": 1,
        "content": text.strip()
    }]


async def extract_slides(file_bytes: bytes, file_ext: str) -> List[Dict]:
    """Route to correct extractor based on file extension"""
    ext = file_ext.lower()

    if ext == ".pdf":
        return await extract_text_from_pdf(file_bytes)
    elif ext in [".pptx", ".ppt"]:
        return await extract_text_from_pptx(file_bytes)
    elif ext in [".png", ".jpg", ".jpeg"]:
        return await extract_text_from_image(file_bytes)
    else:
        raise ValueError(f"Unsupported file format: {file_ext}")


def _clean_json_response(response: str) -> str:
    """Clean JSON response from potential markdown or extra text"""
    text = response.strip()

    # Remove markdown code blocks
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first line (```json or ```)
        lines = lines[1:]
        # Remove last line if it's just ```
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)

    # Find JSON object boundaries
    start_idx = text.find("{")
    end_idx = text.rfind("}")

    if start_idx != -1 and end_idx != -1:
        text = text[start_idx:end_idx + 1]

    return text.strip()


def _validate_analysis_schema(data: Dict) -> bool:
    """Validate that the analysis has required fields"""
    required_top_level = [
        "analysis_metadata",
        "executive_summary",
        "scores",
        "categories"
    ]

    for field in required_top_level:
        if field not in data:
            return False

    # Check scores
    if "overall_score" not in data.get("scores", {}):
        return False

    # Check at least some categories exist
    categories = data.get("categories", {})
    expected_categories = [
        "problem", "solution", "market", "business_model",
        "traction", "team", "financials", "competitive_advantage", "scalability"
    ]
    if not any(cat in categories for cat in expected_categories):
        return False

    return True


async def analyze_deck(
    slides: List[Dict],
    feedback_tone: str = "constructive"
) -> Dict[str, Any]:
    """
    Analyze deck using Gemini 3 Pro

    Args:
        slides: List of slide dicts with slide_number and content
        feedback_tone: "brutal" | "constructive" | "encouraging"

    Returns:
        Comprehensive deck analysis as dict
    """
    from services.gemini_service import generate_text_pro
    from prompts.deck_analysis import DECK_ANALYSIS_SYSTEM_PROMPT

    # Format slides for prompt
    slides_text = "\n\n".join([
        f"Slide {s['slide_number']}:\n{s['content']}"
        for s in slides
    ])

    # Detect language (simple heuristic)
    deck_text = " ".join([s["content"] for s in slides])
    turkish_chars = set("şŞğĞüÜöÖçÇıİ")
    is_turkish = any(char in deck_text for char in turkish_chars)
    deck_language = "tr" if is_turkish else "en"

    # Build metadata
    metadata = {
        "slide_count": len(slides),
        "file_format": "PDF",  # Default, can be updated
        "language": deck_language,
        "feedback_tone": feedback_tone
    }

    prompt = f"""<deck_metadata>
{json.dumps(metadata, ensure_ascii=False)}
</deck_metadata>

<slides>
{slides_text}
</slides>

Analyze this pitch deck following all rules and output the complete JSON analysis."""

    # Call Gemini 3 Pro for high-quality analysis
    response = await generate_text_pro(prompt, DECK_ANALYSIS_SYSTEM_PROMPT)

    # Parse JSON response
    try:
        clean_response = _clean_json_response(response)
        analysis = json.loads(clean_response)

        # Validate schema
        if not _validate_analysis_schema(analysis):
            raise ValueError("Invalid analysis schema")

        # Ensure metadata has timestamp
        if "analysis_metadata" in analysis:
            analysis["analysis_metadata"]["analyzed_at"] = datetime.utcnow().isoformat() + "Z"

        return {
            "success": True,
            "data": analysis
        }

    except (json.JSONDecodeError, ValueError) as e:
        # Return error with raw response for debugging
        return {
            "success": False,
            "error": str(e),
            "raw_response": response[:1000] if response else None
        }


async def get_deck_summary(analysis: Dict) -> str:
    """Get a brief summary from analysis for quick display"""
    if not analysis.get("success"):
        return "Analysis failed"

    data = analysis.get("data", {})
    scores = data.get("scores", {})
    overall = scores.get("overall_score", "N/A")
    grade = scores.get("investment_grade", "N/A")
    summary = data.get("executive_summary", "No summary available")

    return f"Score: {overall}/100 ({grade}) - {summary}"
