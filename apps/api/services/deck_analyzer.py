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
    """Extract text and images from PDF file with enhanced OCR"""
    import base64
    slides = []
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    for page_num, page in enumerate(doc):
        text = page.get_text()

        # Always try OCR for better accuracy, especially for image-heavy slides
        ocr_text = ""
        image_base64 = ""
        try:
            pix = page.get_pixmap(dpi=150)  # 150 DPI for display
            img_bytes = pix.tobytes("png")
            image_base64 = base64.b64encode(img_bytes).decode('utf-8')

            # OCR from higher res version
            pix_ocr = page.get_pixmap(dpi=300)
            img = Image.open(io.BytesIO(pix_ocr.tobytes()))
            ocr_text = pytesseract.image_to_string(img).strip()
        except Exception as e:
            print(f"[PDF] Image/OCR failed for page {page_num + 1}: {e}")

        # Merge text and OCR results intelligently
        combined_text = _merge_text_and_ocr(text, ocr_text)

        slides.append({
            "slide_number": page_num + 1,
            "content": combined_text,
            "text_source": "pdf" if text.strip() else "ocr",
            "has_ocr": bool(ocr_text),
            "image_base64": image_base64  # Base64 encoded PNG image
        })

    doc.close()
    return slides


async def extract_text_from_pptx(file_bytes: bytes) -> List[Dict]:
    """Extract text from PPTX file with enhanced image/OCR support"""
    slides = []
    prs = Presentation(io.BytesIO(file_bytes))

    for slide_num, slide in enumerate(prs.slides):
        text_parts = []
        ocr_texts = []

        # Extract text from shapes
        for shape in slide.shapes:
            if hasattr(shape, "text") and shape.text.strip():
                text_parts.append(shape.text)

        # Extract images and run OCR
        for shape in slide.shapes:
            if hasattr(shape, "image") and shape.image:
                try:
                    # Get image bytes
                    image_bytes = shape.image.blob
                    img = Image.open(io.BytesIO(image_bytes))
                    ocr_result = pytesseract.image_to_string(img).strip()
                    if ocr_result:
                        ocr_texts.append(ocr_result)
                except Exception as e:
                    print(f"[PPTX] OCR failed for slide {slide_num + 1}: {e}")

        # Combine text and OCR results
        combined_text = "\n".join(text_parts).strip()
        ocr_combined = "\n".join(ocr_texts).strip()

        # Merge intelligently
        final_text = _merge_text_and_ocr(combined_text, ocr_combined)

        slides.append({
            "slide_number": slide_num + 1,
            "content": final_text,
            "text_source": "pptx" if combined_text else "ocr",
            "has_ocr": bool(ocr_combined)
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

    # Detect deck language (for reference only - output is ALWAYS in English)
    deck_text = " ".join([s["content"] for s in slides])
    turkish_chars = set("şŞğĞüÜöÖçÇıİ")
    is_turkish = any(char in deck_text for char in turkish_chars)
    deck_language = "tr" if is_turkish else "en"

    # Build metadata - output_language is ALWAYS English regardless of deck language
    metadata = {
        "slide_count": len(slides),
        "file_format": "PDF",  # Default, can be updated
        "deck_language": deck_language,  # Language of the deck content
        "output_language": "en",  # ALWAYS output analysis in English
        "feedback_tone": feedback_tone
    }

    prompt = f"""# ABSOLUTE REQUIREMENT: RESPOND IN ENGLISH ONLY

⚠️ CRITICAL: YOUR ENTIRE RESPONSE MUST BE IN ENGLISH ⚠️

Even though the deck content below is in {deck_language.upper()} ({"Turkish" if is_turkish else "non-English"}), YOU MUST:
- Write ALL text in ENGLISH
- Translate any quotes from the deck to English
- Use English for: executive_summary, feedback, evidence_found, missing, improvement, rationale - EVERY field

DO NOT write in Turkish or any other language. English ONLY.

---

<deck_metadata>
{json.dumps(metadata, ensure_ascii=False)}
</deck_metadata>

<slides>
{slides_text}
</slides>

---

⚠️ FINAL REMINDER: OUTPUT LANGUAGE = ENGLISH ⚠️
- If the deck says "Müşteri" → You write "Customer"
- If the deck says "Pazar" → You write "Market"
- Translate EVERYTHING to English in your JSON output.

Now analyze this deck and respond with a JSON object in ENGLISH ONLY:"""

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
