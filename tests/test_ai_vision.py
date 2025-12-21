"""
AI Vision Tests - Gemini 3 Pro Image analysis
"""

import pytest
import os
import io

# Load env before imports
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "apps", "api", ".env"))

from services.gemini_service import init_gemini, analyze_image

# Try to import PIL for creating test images
try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


@pytest.fixture(autouse=True)
def setup_gemini():
    """Her test öncesi Gemini'yi başlat"""
    init_gemini()


def create_test_slide_image() -> bytes:
    """Create a simple pitch deck slide image for testing"""
    if not PIL_AVAILABLE:
        pytest.skip("PIL not installed - run: pip install Pillow")

    # Create a simple slide-like image
    img = Image.new('RGB', (800, 600), color='white')
    draw = ImageDraw.Draw(img)

    # Add title
    draw.rectangle([0, 0, 800, 80], fill='#74492A')
    draw.text((50, 25), "PitchDrill - Problem Slide", fill='white')

    # Add bullet points
    y_pos = 120
    bullets = [
        "90% of startup pitches fail in first 30 seconds",
        "Founders lack realistic practice environment",
        "Feedback is subjective and delayed",
        "$50B market opportunity"
    ]

    for bullet in bullets:
        draw.text((50, y_pos), f"• {bullet}", fill='black')
        y_pos += 50

    # Add a simple chart placeholder
    draw.rectangle([500, 300, 750, 550], outline='#A5683B', width=2)
    draw.text((550, 400), "TAM: $50B", fill='#74492A')

    # Convert to bytes
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    return buffer.getvalue()


def create_simple_test_image() -> bytes:
    """Create a very simple test image without text"""
    if not PIL_AVAILABLE:
        pytest.skip("PIL not installed - run: pip install Pillow")

    # Simple colored rectangles
    img = Image.new('RGB', (400, 300), color='#FBF7F4')
    draw = ImageDraw.Draw(img)

    # Draw some shapes
    draw.rectangle([50, 50, 150, 150], fill='#74492A')  # Brown square
    draw.ellipse([200, 50, 350, 200], fill='#A5683B')   # Orange circle
    draw.rectangle([50, 180, 350, 250], fill='#2D1C10') # Dark bar

    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    return buffer.getvalue()


class TestVisionAnalysis:
    """Test Gemini 3 Pro Image for slide/image analysis"""

    @pytest.mark.asyncio
    async def test_vision_simple_image(self):
        """Basit görsel analizi çalışıyor mu?"""
        image_data = create_simple_test_image()

        response = await analyze_image(
            image_data,
            "Describe what you see in this image. List the shapes and colors."
        )

        assert response is not None
        assert len(response) > 20
        # Should mention shapes or colors
        response_lower = response.lower()
        assert any(word in response_lower for word in ['square', 'circle', 'rectangle', 'shape', 'brown', 'orange', 'color'])

    @pytest.mark.asyncio
    async def test_vision_slide_analysis(self):
        """Pitch deck slide analizi çalışıyor mu?"""
        image_data = create_test_slide_image()

        response = await analyze_image(
            image_data,
            """Analyze this pitch deck slide. Extract:
            1. The title
            2. Key bullet points
            3. Any numbers or metrics mentioned
            Return as plain text summary."""
        )

        assert response is not None
        assert len(response) > 50
        # Should extract some content from the slide
        response_lower = response.lower()
        assert any(word in response_lower for word in ['pitch', 'problem', 'startup', '90%', 'market', 'billion', '50'])

    @pytest.mark.asyncio
    async def test_vision_returns_structured_analysis(self):
        """Vision JSON formatında analiz dönebiliyor mu?"""
        image_data = create_test_slide_image()

        response = await analyze_image(
            image_data,
            """Analyze this pitch deck slide and return a JSON object with:
            {
                "slide_type": "problem|solution|market|team|ask",
                "title": "extracted title",
                "key_points": ["point1", "point2"],
                "has_visual": true/false
            }
            Return only valid JSON."""
        )

        assert response is not None
        # Should contain JSON-like structure
        assert '{' in response and '}' in response

    @pytest.mark.asyncio
    async def test_vision_turkish_analysis(self):
        """Türkçe prompt ile analiz çalışıyor mu?"""
        image_data = create_simple_test_image()

        response = await analyze_image(
            image_data,
            "Bu görseli Türkçe olarak açıkla. Ne görüyorsun?"
        )

        assert response is not None
        assert len(response) > 20
