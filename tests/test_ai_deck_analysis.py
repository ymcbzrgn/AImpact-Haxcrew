"""
AI Deck Analysis Tests - E2E pitch deck analysis
"""

import pytest
import os
import json

# Load env before imports
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "apps", "api", ".env"))

from services.gemini_service import init_gemini, generate_text


@pytest.fixture(autouse=True)
def setup_gemini():
    """Her test öncesi Gemini'yi başlat"""
    init_gemini()


# Sample deck content for testing
SAMPLE_DECK_CONTENT = """
Slide 1: Title
PitchDrill - AI-Powered Pitch Training Platform

Slide 2: Problem
- Founders struggle to prepare for investor meetings
- No realistic practice environment
- Feedback is subjective and delayed
- 90% of pitches fail in first 30 seconds

Slide 3: Solution
- AI-powered investor simulation
- Real-time feedback during pitch
- Multiple investor personas (Shark, Friendly, Analyst)
- Detailed scoring and improvement suggestions

Slide 4: Market
- TAM: $50B global startup ecosystem
- SAM: $5B pitch training market
- SOM: $500M in first 3 years
- 500K+ startups founded annually

Slide 5: Traction
- 100 beta users
- 85% retention rate
- $10K MRR
- 3 enterprise pilots

Slide 6: Team
- CEO: 10 years VC experience
- CTO: Ex-Google ML engineer
- CPO: Former founder, 2 exits

Slide 7: Ask
- Raising $2M Seed round
- 18 months runway
- Use of funds: Product (50%), Growth (30%), Team (20%)
"""

DECK_ANALYSIS_SYSTEM_PROMPT = """You are an expert VC analyst. Analyze the pitch deck and return a JSON response with the following structure:

{
  "overall_score": <0-100>,
  "categories": {
    "problem": {"score": <0-100>, "feedback": "<string>"},
    "solution": {"score": <0-100>, "feedback": "<string>"},
    "market": {"score": <0-100>, "feedback": "<string>"},
    "traction": {"score": <0-100>, "feedback": "<string>"},
    "team": {"score": <0-100>, "feedback": "<string>"},
    "ask": {"score": <0-100>, "feedback": "<string>"}
  },
  "strengths": ["<string>", ...],
  "weaknesses": ["<string>", ...],
  "recommendation": "INVEST" | "PASS" | "MORE_INFO"
}

Only output valid JSON, no markdown or explanation."""


class TestDeckAnalysis:
    """Test deck analysis with Gemini"""

    @pytest.mark.asyncio
    async def test_deck_analysis_returns_response(self):
        """Deck analysis bir response döndürüyor mu?"""
        response = await generate_text(
            f"Analyze this pitch deck:\n\n{SAMPLE_DECK_CONTENT}",
            system_instruction=DECK_ANALYSIS_SYSTEM_PROMPT
        )
        assert response is not None
        assert len(response) > 100

    @pytest.mark.asyncio
    async def test_deck_analysis_json_parseable(self):
        """Response JSON olarak parse edilebiliyor mu?"""
        response = await generate_text(
            f"Analyze this pitch deck:\n\n{SAMPLE_DECK_CONTENT}",
            system_instruction=DECK_ANALYSIS_SYSTEM_PROMPT
        )

        # Clean potential markdown
        clean_response = response.strip()
        if clean_response.startswith("```"):
            clean_response = clean_response.split("```")[1]
            if clean_response.startswith("json"):
                clean_response = clean_response[4:]
            clean_response = clean_response.strip()

        try:
            data = json.loads(clean_response)
            assert isinstance(data, dict)
        except json.JSONDecodeError as e:
            pytest.fail(f"Response is not valid JSON: {e}\nResponse: {response[:500]}")

    @pytest.mark.asyncio
    async def test_deck_analysis_has_required_fields(self):
        """Response gerekli alanları içeriyor mu?"""
        response = await generate_text(
            f"Analyze this pitch deck:\n\n{SAMPLE_DECK_CONTENT}",
            system_instruction=DECK_ANALYSIS_SYSTEM_PROMPT
        )

        # Clean and parse
        clean_response = response.strip()
        if clean_response.startswith("```"):
            clean_response = clean_response.split("```")[1]
            if clean_response.startswith("json"):
                clean_response = clean_response[4:]
            clean_response = clean_response.strip()

        data = json.loads(clean_response)

        # Check required fields
        assert "overall_score" in data, "Missing overall_score"
        assert "categories" in data, "Missing categories"
        assert "recommendation" in data, "Missing recommendation"

    @pytest.mark.asyncio
    async def test_deck_analysis_scores_in_range(self):
        """Skorlar 0-100 arasında mı?"""
        response = await generate_text(
            f"Analyze this pitch deck:\n\n{SAMPLE_DECK_CONTENT}",
            system_instruction=DECK_ANALYSIS_SYSTEM_PROMPT
        )

        # Clean and parse
        clean_response = response.strip()
        if clean_response.startswith("```"):
            clean_response = clean_response.split("```")[1]
            if clean_response.startswith("json"):
                clean_response = clean_response[4:]
            clean_response = clean_response.strip()

        data = json.loads(clean_response)

        # Check overall score
        assert 0 <= data["overall_score"] <= 100, f"overall_score out of range: {data['overall_score']}"

        # Check category scores
        for category, details in data.get("categories", {}).items():
            if isinstance(details, dict) and "score" in details:
                assert 0 <= details["score"] <= 100, f"{category} score out of range: {details['score']}"

    @pytest.mark.asyncio
    async def test_deck_analysis_recommendation_valid(self):
        """Recommendation geçerli değerlerden biri mi?"""
        response = await generate_text(
            f"Analyze this pitch deck:\n\n{SAMPLE_DECK_CONTENT}",
            system_instruction=DECK_ANALYSIS_SYSTEM_PROMPT
        )

        # Clean and parse
        clean_response = response.strip()
        if clean_response.startswith("```"):
            clean_response = clean_response.split("```")[1]
            if clean_response.startswith("json"):
                clean_response = clean_response[4:]
            clean_response = clean_response.strip()

        data = json.loads(clean_response)

        valid_recommendations = ["INVEST", "PASS", "MORE_INFO"]
        assert data["recommendation"] in valid_recommendations, \
            f"Invalid recommendation: {data['recommendation']}"
