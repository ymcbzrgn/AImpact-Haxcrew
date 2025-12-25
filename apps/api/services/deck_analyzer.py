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
    """Extract text and images from PDF file - optimized for speed"""
    import base64
    slides = []
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    # Limit to first 10 slides for demo speed
    max_slides = min(len(doc), 10)

    for page_num in range(max_slides):
        page = doc[page_num]
        text = page.get_text()

        # Get low-res image for display (skip OCR for speed)
        image_base64 = ""
        try:
            pix = page.get_pixmap(dpi=72)  # Low DPI for speed
            img_bytes = pix.tobytes("png")
            image_base64 = base64.b64encode(img_bytes).decode('utf-8')
        except Exception as e:
            print(f"[PDF] Image failed for page {page_num + 1}: {e}")

        slides.append({
            "slide_number": page_num + 1,
            "content": text.strip(),
            "text_source": "pdf",
            "has_ocr": False,
            "image_base64": image_base64
        })

    doc.close()
    return slides


async def extract_text_from_pptx(file_bytes: bytes) -> List[Dict]:
    """Extract text from PPTX file - optimized for speed (skip OCR)"""
    slides = []
    prs = Presentation(io.BytesIO(file_bytes))

    # Limit to first 10 slides for demo speed
    all_slides = list(prs.slides)[:10]

    for slide_num, slide in enumerate(all_slides):
        text_parts = []

        # Extract text from shapes only (skip OCR for speed)
        for shape in slide.shapes:
            if hasattr(shape, "text") and shape.text.strip():
                text_parts.append(shape.text)

        combined_text = "\n".join(text_parts).strip()

        slides.append({
            "slide_number": slide_num + 1,
            "content": combined_text,
            "text_source": "pptx",
            "has_ocr": False
        })

    return slides


async def extract_text_from_image(file_bytes: bytes) -> List[Dict]:
    """Extract text from image file (PNG/JPG) using OCR"""
    img = Image.open(io.BytesIO(file_bytes))
    text = pytesseract.image_to_string(img)

    return [{
        "slide_number": 1,
        "content": text.strip(),
        "text_source": "ocr",
        "has_ocr": True
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


def _merge_text_and_ocr(pdf_text: str, ocr_text: str) -> str:
    """Intelligently merge PDF text extraction with OCR results"""
    pdf_text = pdf_text.strip()
    ocr_text = ocr_text.strip()

    # If PDF has text and OCR doesn't, use PDF
    if pdf_text and not ocr_text:
        return pdf_text

    # If OCR has text and PDF doesn't, use OCR
    if ocr_text and not pdf_text:
        return ocr_text

    # If both have text, compare and choose the better one
    if pdf_text and ocr_text:
        # Simple heuristic: prefer the longer text, but check for OCR artifacts
        pdf_words = len(pdf_text.split())
        ocr_words = len(ocr_text.split())

        # If OCR has significantly more words, it might be better
        if ocr_words > pdf_words * 1.5:
            return ocr_text
        # If PDF has more words, use PDF
        elif pdf_words > ocr_words:
            return pdf_text
        # If similar length, prefer PDF (usually more accurate)
        else:
            return pdf_text

    # Fallback
    return pdf_text or ocr_text or ""


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
    Analyze deck using Gemini Flash - FAST MODE (10-15 seconds)

    Args:
        slides: List of slide dicts with slide_number and content
        feedback_tone: "brutal" | "constructive" | "encouraging"

    Returns:
        Deck analysis as dict
    """
    from services.gemini_service import generate_text

    # Format slides - only first 5 slides for speed
    slides_to_analyze = slides[:5]
    slides_text = "\n".join([
        f"Slide {s['slide_number']}: {s['content'][:500]}"  # Limit content per slide
        for s in slides_to_analyze
    ])

    # Quick system prompt (short = fast)
    system_prompt = """You are a VC analyst. Analyze pitch decks quickly.
Output ONLY valid JSON, no markdown. All text in ENGLISH."""

    # Simple prompt for fast analysis
    prompt = f"""Analyze this pitch deck. Output JSON only.

SLIDES:
{slides_text}

Return this exact JSON structure:
{{
  "analysis_metadata": {{
    "slide_count": {len(slides)},
    "detected_stage": "Pre-seed" or "Seed" or "Series A",
    "detected_sector": "<sector>"
  }},
  "executive_summary": "<2 sentences: main strength and main weakness>",
  "scores": {{
    "overall_score": <0-100, average deck=65>,
    "investment_grade": "A/B/C/D/F with +/-",
    "fundability": "Ready/Almost Ready/Needs Work/Not Ready"
  }},
  "categories": {{
    "problem": {{"score": <0-100>, "feedback": "<1 sentence>"}},
    "solution": {{"score": <0-100>, "feedback": "<1 sentence>"}},
    "market": {{"score": <0-100>, "feedback": "<1 sentence>"}},
    "business_model": {{"score": <0-100>, "feedback": "<1 sentence>"}},
    "traction": {{"score": <0-100>, "feedback": "<1 sentence>"}},
    "team": {{"score": <0-100>, "feedback": "<1 sentence>"}},
    "financials": {{"score": <0-100>, "feedback": "<1 sentence>"}},
    "competitive_advantage": {{"score": <0-100>, "feedback": "<1 sentence>"}},
    "scalability": {{"score": <0-100>, "feedback": "<1 sentence>"}}
  }},
  "strong_points": ["<strength1>", "<strength2>"],
  "weak_points": ["<weakness1>", "<weakness2>"],
  "deal_killers": []
}}

Output ONLY the JSON, no other text:"""

    # Call Gemini Flash with 45 second timeout (some PDFs need more time)
    response = await generate_text(prompt, system_prompt, model_type="flash", timeout=45)

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
