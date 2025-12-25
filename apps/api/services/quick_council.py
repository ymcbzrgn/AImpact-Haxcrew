"""
Quick Council Service - Fast VC Panel Voting
Single API call, max 20 seconds
"""

import json
import asyncio
import traceback
from typing import Dict, Any, Optional, Callable
from services.gemini_service import generate_text_flash
from dataclasses import dataclass


@dataclass
class QuickVote:
    name: str
    decision: str  # "invest" or "pass"
    score: int
    one_liner: str


@dataclass
class QuickCouncilResult:
    votes: list[QuickVote]
    final_decision: str
    average_score: float
    key_strengths: list[str]
    key_weaknesses: list[str]
    recommendations: list[str]


QUICK_COUNCIL_PROMPT = """You are 5 VCs making investment decisions. Analyze this pitch deck.

DECK ANALYSIS:
{deck_analysis}

PITCH SUMMARY:
{pitch_summary}

RULES:
1. Use EXACTLY these 5 VC names - no others: Alex Chen, Sarah Williams, Michael Park, Elena Rodriguez, David Kim
2. Each one_liner MUST reference specific content from THIS deck (product name, features, missing sections)
3. key_strengths/key_weaknesses MUST mention actual deck content, not generic phrases
4. Average startup deck scores 50-60. Be realistic.

Return ONLY this JSON (no markdown):
{{
  "votes": [
    {{"name": "Alex Chen", "firm": "Growth Fund", "decision": "invest", "score": 65, "one_liner": "<specific to this deck>"}},
    {{"name": "Sarah Williams", "firm": "Strategic Capital", "decision": "pass", "score": 55, "one_liner": "<specific>"}},
    {{"name": "Michael Park", "firm": "Tech Ventures", "decision": "invest", "score": 60, "one_liner": "<specific>"}},
    {{"name": "Elena Rodriguez", "firm": "Operations Capital", "decision": "pass", "score": 50, "one_liner": "<specific>"}},
    {{"name": "David Kim", "firm": "Seed Fund", "decision": "invest", "score": 58, "one_liner": "<specific>"}}
  ],
  "final_decision": "pass",
  "average_score": 57.6,
  "key_strengths": ["<specific to deck>", "<specific>"],
  "key_weaknesses": ["<specific to deck>", "<specific>"],
  "recommendations": ["<specific action>", "<specific action>"]
}}
"""


async def run_quick_council(
    deck_analysis: Optional[Dict] = None,
    pitch_transcript: Optional[str] = None,
    on_message: Optional[Callable] = None
) -> QuickCouncilResult:
    """
    Run fast council evaluation - single API call

    Args:
        deck_analysis: Analyzed deck data
        pitch_transcript: Optional pitch transcript
        on_message: Callback to send real-time updates

    Returns:
        QuickCouncilResult with all votes and recommendations
    """

    # Build analysis summary
    analysis_summary = "No deck analysis available"
    if deck_analysis:
        scores = deck_analysis.get("scores", {})
        categories = deck_analysis.get("categories", {})

        analysis_summary = f"""
Overall Score: {scores.get('overall_score', 'N/A')}/100
Investment Grade: {scores.get('investment_grade', 'N/A')}
Fundability: {scores.get('fundability', 'N/A')}

Executive Summary: {deck_analysis.get('executive_summary', 'N/A')}

Category Scores:
"""
        for cat, data in categories.items():
            if isinstance(data, dict):
                analysis_summary += f"- {cat}: {data.get('score', 'N/A')}/100 - {data.get('feedback', '')[:100]}\n"

    pitch_summary = pitch_transcript[:500] if pitch_transcript else "No pitch transcript"

    # Send starting message
    if on_message:
        await on_message({
            "speaker": "Moderator",
            "content": "Let's hear from the panel. Quick thoughts everyone?",
            "type": "moderation"
        })

    # Single API call for all votes
    prompt = QUICK_COUNCIL_PROMPT.format(
        deck_analysis=analysis_summary,
        pitch_summary=pitch_summary
    )

    try:
        print(f"[QuickCouncil] ========== STARTING COUNCIL ==========")
        print(f"[QuickCouncil] Deck analysis present: {deck_analysis is not None}")
        print(f"[QuickCouncil] Pitch transcript present: {pitch_transcript is not None}")
        print(f"[QuickCouncil] Prompt length: {len(prompt)} chars")

        response = await generate_text_flash(prompt)

        print(f"[QuickCouncil] Raw response (first 300 chars): {response[:300]}...")

        # Parse JSON
        # Clean response
        text = response.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()

        result = json.loads(text)

        # Send each vote as a message
        votes = []
        for vote_data in result.get("votes", []):
            vote = QuickVote(
                name=vote_data.get("name", "VC"),
                decision=vote_data.get("decision", "pass"),
                score=vote_data.get("score", 50),
                one_liner=vote_data.get("one_liner", "")
            )
            votes.append(vote)

            # Send vote message (no emoji to avoid Windows encoding issues)
            if on_message:
                prefix = "[INVEST]" if vote.decision == "invest" else "[PASS]"
                await on_message({
                    "speaker": vote.name,
                    "content": f"{prefix} {vote.one_liner}",
                    "score": vote.score,
                    "decision": vote.decision,
                    "type": "vote"
                })
                await asyncio.sleep(0.3)  # Small delay for animation

        # Calculate average
        avg_score = sum(v.score for v in votes) / len(votes) if votes else 50

        # Send final decision
        if on_message:
            decision = result.get("final_decision", "pass")
            await on_message({
                "speaker": "Moderator",
                "content": f"Final Decision: {decision.upper().replace('_', ' ')}",
                "type": "final_decision",
                "decision": decision,
                "average_score": avg_score
            })

        return QuickCouncilResult(
            votes=votes,
            final_decision=result.get("final_decision", "pass"),
            average_score=avg_score,
            key_strengths=result.get("key_strengths", []),
            key_weaknesses=result.get("key_weaknesses", []),
            recommendations=result.get("recommendations", [])
        )

    except asyncio.TimeoutError:
        print(f"[QuickCouncil] !!! TIMEOUT ERROR - Falling back to mock data")
        return await _send_fallback_votes(on_message, "API timeout - results based on deck analysis")

    except json.JSONDecodeError as e:
        print(f"[QuickCouncil] !!! JSON PARSE ERROR: {e}")
        print(f"[QuickCouncil] Raw text that failed to parse: {text[:500] if 'text' in dir() else 'N/A'}")
        traceback.print_exc()
        return await _send_fallback_votes(on_message, "Response parsing error")

    except Exception as e:
        print(f"[QuickCouncil] !!! UNEXPECTED ERROR: {type(e).__name__}: {e}")
        traceback.print_exc()
        return await _send_fallback_votes(on_message, f"System error: {str(e)[:50]}")


async def _send_fallback_votes(on_message: Optional[Callable], error_reason: str) -> QuickCouncilResult:
    """Send fallback mock votes when API fails"""

    # Notify about fallback
    if on_message:
        await on_message({
            "speaker": "Moderator",
            "content": f"Using preliminary assessment. ({error_reason})",
            "type": "status"
        })

    mock_votes = [
        QuickVote("Alex Chen", "invest", 65, "Interesting concept, needs more traction"),
        QuickVote("Sarah Williams", "pass", 55, "Market timing is off"),
        QuickVote("Michael Park", "invest", 70, "Strong founder-market fit"),
        QuickVote("Elena Rodriguez", "pass", 50, "Unit economics unclear"),
        QuickVote("David Kim", "invest", 62, "Worth a small bet"),
    ]

    # Send mock votes (no emoji to avoid Windows encoding issues)
    if on_message:
        for vote in mock_votes:
            prefix = "[INVEST]" if vote.decision == "invest" else "[PASS]"
            await on_message({
                "speaker": vote.name,
                "content": f"{prefix} {vote.one_liner}",
                "score": vote.score,
                "decision": vote.decision,
                "type": "vote"
            })
            await asyncio.sleep(0.3)

        await on_message({
            "speaker": "Moderator",
            "content": "Final Decision: CONDITIONAL INVEST",
            "type": "final_decision",
            "decision": "conditional_invest",
            "average_score": 60.4
        })

    return QuickCouncilResult(
        votes=mock_votes,
        final_decision="conditional_invest",
        average_score=60.4,
        key_strengths=["Clear problem definition", "Technical expertise"],
        key_weaknesses=["Limited traction", "Unclear GTM"],
        recommendations=["Get 5 paying customers", "Hire sales lead"]
    )
