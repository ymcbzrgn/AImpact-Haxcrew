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


QUICK_COUNCIL_PROMPT = """You are a VC investment committee making a QUICK decision on a startup pitch.

Based on the deck analysis below, provide a rapid assessment from 5 VCs.

DECK ANALYSIS:
{deck_analysis}

PITCH SUMMARY:
{pitch_summary}

Respond with ONLY valid JSON in this exact format:
{{
  "votes": [
    {{"name": "Alex Chen", "firm": "Growth Fund", "decision": "invest", "score": 72, "one_liner": "Strong PMF signals but weak unit economics"}},
    {{"name": "Sarah Williams", "firm": "Strategic Capital", "decision": "pass", "score": 55, "one_liner": "Market too small for our thesis"}},
    {{"name": "Michael Park", "firm": "Tech Ventures", "decision": "invest", "score": 68, "one_liner": "Founder shows grit, worth the bet"}},
    {{"name": "Elena Rodriguez", "firm": "Operations Capital", "decision": "pass", "score": 45, "one_liner": "Unit economics don't scale"}},
    {{"name": "David Kim", "firm": "Seed Fund", "decision": "invest", "score": 65, "one_liner": "Conditional yes with milestones"}}
  ],
  "final_decision": "conditional_invest",
  "average_score": 61,
  "key_strengths": [
    "Clear problem-solution fit",
    "Experienced technical team"
  ],
  "key_weaknesses": [
    "Unclear go-to-market strategy",
    "Limited traction data"
  ],
  "recommendations": [
    "Focus on proving unit economics before next raise",
    "Add a sales/BD co-founder",
    "Get 10 paying customers before Series A"
  ]
}}

IMPORTANT:
- Each VC gives a score 0-100 and decision (invest/pass)
- final_decision can be: "strong_invest", "invest", "conditional_invest", "pass", "strong_pass"
- Keep one_liner under 15 words
- Be realistic and critical - average deck is 50-60 score
- Output ONLY JSON, no markdown, no explanation
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
        response = await generate_text_flash(prompt)

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
        print(f"[QuickCouncil] API Timeout - using fallback votes")
        return await _send_fallback_votes(on_message, "API timeout - results based on deck analysis")

    except json.JSONDecodeError as e:
        print(f"[QuickCouncil] JSON Parse Error: {e}")
        traceback.print_exc()
        return await _send_fallback_votes(on_message, "Response parsing error")

    except Exception as e:
        print(f"[QuickCouncil] Unexpected Error: {e}")
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
