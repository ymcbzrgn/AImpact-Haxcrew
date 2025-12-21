"""
Gemini AI Service - PitchDrill
Using new google.genai SDK (not deprecated google.generativeai)
"""

from google import genai
from google.genai import types
from PIL import Image
import io
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Global client instance
_client = None

# Model Configuration - Using Latest Gemini Models
MODELS = {
    # Text Generation - High Quality (Deck Analysis, Council)
    "pro": "gemini-3-pro-preview",

    # Text Generation - Fast (Realtime Notes, Quick responses)
    "flash": "gemini-3-flash-preview",

    # Vision - Image analysis
    "vision": "gemini-3-pro-image-preview",

    # Embeddings (RAG pipeline) - 768 dimensions
    "embedding": "text-embedding-004",

    # Live Audio (Real-time conversation)
    "live": "gemini-2.5-flash-native-audio-latest",

    # Text-to-Speech
    "tts": "gemini-2.5-flash-preview-tts",
}


def init_gemini():
    """Initialize Gemini API client"""
    global _client
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not configured")
    _client = genai.Client(api_key=GEMINI_API_KEY)


def get_client() -> genai.Client:
    """Get initialized Gemini client"""
    global _client
    if _client is None:
        init_gemini()
    return _client


async def generate_text(
    prompt: str,
    system_instruction: str = None,
    model_type: str = "flash"
) -> str:
    """
    Generate text response using Gemini

    Args:
        prompt: User prompt
        system_instruction: Optional system prompt
        model_type: "pro" for quality, "flash" for speed
    """
    client = get_client()
    model_name = MODELS.get(model_type, MODELS["flash"])

    config = None
    if system_instruction:
        config = types.GenerateContentConfig(
            system_instruction=system_instruction
        )

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=config
    )
    return response.text


async def generate_text_pro(prompt: str, system_instruction: str = None) -> str:
    """Generate high-quality text using Gemini Pro"""
    return await generate_text(prompt, system_instruction, model_type="pro")


async def generate_text_flash(prompt: str, system_instruction: str = None) -> str:
    """Generate fast text using Gemini Flash"""
    return await generate_text(prompt, system_instruction, model_type="flash")


async def analyze_image(image_data: bytes, prompt: str) -> str:
    """
    Analyze image (slide) using Gemini

    Args:
        image_data: Image bytes
        prompt: Analysis prompt
    """
    client = get_client()

    # Convert bytes to PIL Image
    img = Image.open(io.BytesIO(image_data))

    response = client.models.generate_content(
        model=MODELS["flash"],
        contents=[prompt, img]
    )
    return response.text


async def generate_embedding(text: str) -> list[float]:
    """
    Generate embedding vector for RAG

    Args:
        text: Text to embed

    Returns:
        List of floats (embedding vector)
    """
    client = get_client()

    response = client.models.embed_content(
        model=MODELS["embedding"],
        contents=text
    )
    return response.embeddings[0].values


# ============================================
# LIVE API (Real-time Audio) - Coming Soon
# ============================================
# Model: gemini-2.5-flash-native-audio-dialog
# Features:
#   - Real-time audio input/output
#   - Bi-directional conversation
#   - Low latency for pitch sessions
#
# Implementation will use:
#   from google.genai import live
#   async with client.aio.live.connect(model=...) as session:
#       ...
# ============================================
