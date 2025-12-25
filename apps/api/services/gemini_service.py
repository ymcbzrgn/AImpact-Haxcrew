"""
Gemini AI Service - PitchDrill
Using new google.genai SDK (not deprecated google.generativeai)
"""

from google import genai
from google.genai import types
from PIL import Image
import io
import os
import asyncio

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Global client instance
_client = None

# Model Configuration - Using Gemini 2.5 (Stable)
MODELS = {
    # Text Generation - High Quality (Deck Analysis, Council)
    "pro": "gemini-2.5-flash",  # 2.5 flash is fast and high quality

    # Text Generation - Fast (Realtime Notes, Quick responses)
    "flash": "gemini-2.5-flash",

    # Vision - Image analysis
    "vision": "gemini-2.5-flash",

    # Embeddings (RAG pipeline) - 768 dimensions
    "embedding": "text-embedding-004",

    # Live Audio (Real-time conversation)
    "live": "gemini-2.0-flash-live-001",

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
    model_type: str = "flash",
    timeout: int = 60
) -> str:
    """
    Generate text response using Gemini

    Args:
        prompt: User prompt
        system_instruction: Optional system prompt
        model_type: "pro" for quality, "flash" for speed
        timeout: API call timeout in seconds (default 60)
    """
    client = get_client()
    model_name = MODELS.get(model_type, MODELS["flash"])

    # Logging for debugging
    print(f"[Gemini] Calling model: {model_name}")
    print(f"[Gemini] Prompt length: {len(prompt)} chars")
    if system_instruction:
        print(f"[Gemini] System instruction: {len(system_instruction)} chars")

    config = None
    if system_instruction:
        config = types.GenerateContentConfig(
            system_instruction=system_instruction
        )

    # Senkron cagiyi thread pool'a tasi (event loop'u bloklamaz)
    try:
        response = await asyncio.wait_for(
            asyncio.to_thread(
                client.models.generate_content,
                model=model_name,
                contents=prompt,
                config=config
            ),
            timeout=timeout
        )
        print(f"[Gemini] SUCCESS - Response length: {len(response.text)} chars")
        return response.text
    except asyncio.TimeoutError:
        print(f"[Gemini] ERROR: Timeout after {timeout} seconds")
        raise Exception(f"Gemini API timeout after {timeout} seconds")
    except Exception as e:
        print(f"[Gemini] ERROR: {type(e).__name__}: {e}")
        raise


async def generate_text_pro(prompt: str, system_instruction: str = None) -> str:
    """Generate high-quality text using Gemini Pro - with 30 second timeout for faster response"""
    return await generate_text(prompt, system_instruction, model_type="pro", timeout=30)


async def generate_text_flash(prompt: str, system_instruction: str = None) -> str:
    """Generate fast text using Gemini Flash"""
    return await generate_text(prompt, system_instruction, model_type="flash")


async def analyze_image(image_data: bytes, prompt: str, timeout: int = 60) -> str:
    """
    Analyze image (slide) using Gemini

    Args:
        image_data: Image bytes
        prompt: Analysis prompt
        timeout: API call timeout in seconds (default 60)
    """
    client = get_client()

    # Convert bytes to PIL Image
    img = Image.open(io.BytesIO(image_data))

    # Senkron çağrıyı thread pool'a taşı
    try:
        response = await asyncio.wait_for(
            asyncio.to_thread(
                client.models.generate_content,
                model=MODELS["flash"],
                contents=[prompt, img]
            ),
            timeout=timeout
        )
        return response.text
    except asyncio.TimeoutError:
        raise Exception(f"Gemini image analysis timeout after {timeout} seconds")


async def generate_embedding(text: str, timeout: int = 30) -> list[float]:
    """
    Generate embedding vector for RAG

    Args:
        text: Text to embed
        timeout: API call timeout in seconds (default 30)

    Returns:
        List of floats (embedding vector)
    """
    client = get_client()

    # Senkron çağrıyı thread pool'a taşı
    try:
        response = await asyncio.wait_for(
            asyncio.to_thread(
                client.models.embed_content,
                model=MODELS["embedding"],
                contents=text
            ),
            timeout=timeout
        )
        return response.embeddings[0].values
    except asyncio.TimeoutError:
        raise Exception(f"Gemini embedding timeout after {timeout} seconds")


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
