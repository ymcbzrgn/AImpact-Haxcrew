"""
Live Audio Service - Gemini Live API Integration
Real-time audio streaming for pitch sessions
"""

from google.genai import types
from services.gemini_service import get_client, MODELS
from typing import Optional, AsyncGenerator
import asyncio


class LiveAudioSession:
    """Manages a single Gemini Live audio session"""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.client = get_client()
        self.live_session = None
        self._context_manager = None
        self.transcript: list[dict] = []
        self.is_active = False

    async def start(self, system_instruction: str = None):
        """
        Start Gemini Live session with optional context

        Args:
            system_instruction: System prompt for the session
        """
        config = types.LiveConnectConfig(
            response_modalities=["AUDIO", "TEXT"],
        )

        if system_instruction:
            config = types.LiveConnectConfig(
                response_modalities=["AUDIO", "TEXT"],
                system_instruction=types.Content(
                    parts=[types.Part(text=system_instruction)]
                ),
            )

        # connect() returns an async context manager, enter it manually
        self._context_manager = self.client.aio.live.connect(
            model=MODELS["live"],
            config=config
        )
        self.live_session = await self._context_manager.__aenter__()
        self.is_active = True

    async def send_audio(self, audio_chunk: bytes):
        """
        Send audio chunk to Gemini Live

        Args:
            audio_chunk: Raw audio bytes (PCM 16-bit, 16kHz mono)
        """
        if not self.live_session or not self.is_active:
            raise RuntimeError("Session not started")

        await self.live_session.send_realtime_input(
            audio=types.Blob(data=audio_chunk, mime_type="audio/pcm")
        )

    async def send_text(self, text: str):
        """
        Send text input to Gemini Live

        Args:
            text: Text message to send
        """
        if not self.live_session or not self.is_active:
            raise RuntimeError("Session not started")

        await self.live_session.send_client_content(
            turns=types.Content(parts=[types.Part(text=text)])
        )

    async def receive_responses(self) -> AsyncGenerator:
        """
        Generator that yields responses from Gemini Live

        Yields:
            Response objects containing audio/text
        """
        if not self.live_session or not self.is_active:
            raise RuntimeError("Session not started")

        async for response in self.live_session.receive():
            # Track transcript
            if response.server_content:
                if response.server_content.model_turn:
                    for part in response.server_content.model_turn.parts:
                        if hasattr(part, 'text') and part.text:
                            self.transcript.append({
                                "role": "model",
                                "text": part.text
                            })

            yield response

    async def close(self):
        """Close the live session"""
        self.is_active = False
        if self._context_manager:
            try:
                await self._context_manager.__aexit__(None, None, None)
            except Exception:
                pass  # Ignore errors during cleanup
            self._context_manager = None
            self.live_session = None

    def get_transcript(self) -> list[dict]:
        """Get the conversation transcript"""
        return self.transcript.copy()


# Session Manager - tracks all active sessions
_sessions: dict[str, LiveAudioSession] = {}
_lock = asyncio.Lock()


async def get_or_create_session(
    session_id: str,
    system_instruction: str = None
) -> LiveAudioSession:
    """
    Get existing session or create new one

    Args:
        session_id: Unique session identifier
        system_instruction: System prompt (only used for new sessions)

    Returns:
        LiveAudioSession instance
    """
    async with _lock:
        if session_id not in _sessions:
            session = LiveAudioSession(session_id)
            await session.start(system_instruction)
            _sessions[session_id] = session

        return _sessions[session_id]


async def get_session(session_id: str) -> Optional[LiveAudioSession]:
    """
    Get existing session

    Args:
        session_id: Session identifier

    Returns:
        LiveAudioSession or None if not found
    """
    return _sessions.get(session_id)


async def close_session(session_id: str) -> bool:
    """
    Close and remove a session

    Args:
        session_id: Session identifier

    Returns:
        True if session was closed, False if not found
    """
    async with _lock:
        if session_id in _sessions:
            await _sessions[session_id].close()
            del _sessions[session_id]
            return True
        return False


async def close_all_sessions():
    """Close all active sessions (cleanup)"""
    async with _lock:
        for session in _sessions.values():
            await session.close()
        _sessions.clear()


def get_active_session_count() -> int:
    """Get count of active sessions"""
    return len(_sessions)
