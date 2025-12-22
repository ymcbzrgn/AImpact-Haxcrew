"""
Term Sheet Service - PitchDrill
Generates term sheets or feedback reports based on council evaluation results
"""

from typing import Dict, Optional, Any
import json
from services.gemini_service import generate_text_pro
from prompts.term_sheet import (
    TERM_SHEET_SYSTEM_PROMPT,
    PASS_FEEDBACK_PROMPT,
    build_term_sheet_context,
    get_lead_investor,
    calculate_valuation,
    get_status_banner
)


async def generate_term_sheet(
    council_result: Dict[str, Any],
    deck_analysis: Dict[str, Any],
    language: str = "tr",
    startup_name: str = "Startup",
    stage: str = "seed",
    ask_amount: str = "$500K",
    sector: str = "other"
) -> Dict[str, Any]:
    """
    Generate term sheet or feedback report based on council result

    Args:
        council_result: Council evaluation result with votes and decision
        deck_analysis: Full deck analysis data
        language: "tr" | "en"
        startup_name: Name of the startup
        stage: "pre_seed" | "seed" | "series_a"
        ask_amount: Investment amount requested
        sector: Startup sector

    Returns:
        Dict containing term sheet or feedback report
    """
    decision = council_result.get("decision", "PASS")
    average_score = council_result.get("average_score", 0)

    # Determine if we need term sheet or feedback report
    if decision == "PASS":
        return await _generate_pass_feedback(
            council_result=council_result,
            deck_analysis=deck_analysis,
            language=language,
            average_score=average_score
        )
    else:
        return await _generate_term_sheet(
            council_result=council_result,
            deck_analysis=deck_analysis,
            language=language,
            startup_name=startup_name,
            stage=stage,
            ask_amount=ask_amount,
            sector=sector,
            average_score=average_score
        )


async def _generate_term_sheet(
    council_result: Dict[str, Any],
    deck_analysis: Dict[str, Any],
    language: str,
    startup_name: str,
    stage: str,
    ask_amount: str,
    sector: str,
    average_score: float
) -> Dict[str, Any]:
    """Generate term sheet for INVEST, INVESTOR_READY_POOL, or CONDITIONAL decisions"""
    
    # Build context
    context = build_term_sheet_context(
        council_result=council_result,
        deck_analysis=deck_analysis,
        language=language,
        startup_name=startup_name,
        stage=stage,
        ask_amount=ask_amount,
        sector=sector
    )

    # Build prompt
    prompt = f"""{context}

Generate the term sheet now. Return ONLY valid JSON matching the output format specified in the system prompt.
Do not include markdown code blocks, just the raw JSON object."""

    # Generate term sheet using Gemini Pro
    try:
        response_text = await generate_text_pro(
            prompt=prompt,
            system_instruction=TERM_SHEET_SYSTEM_PROMPT
        )

        # Parse JSON response
        term_sheet_data = _parse_json_response(response_text)

        # Add status banner
        decision = council_result.get("decision", "INVEST")
        term_sheet_data["status_banner"] = get_status_banner(
            decision=decision,
            score=average_score,
            language=language
        )

        # Ensure decision matches
        term_sheet_data["decision"] = decision
        term_sheet_data["average_score"] = average_score

        # Add lead investor style if not present
        if "term_sheet" in term_sheet_data:
            votes = council_result.get("votes", {})
            lead_investor = get_lead_investor(votes)
            if "lead_investor_style" not in term_sheet_data["term_sheet"]:
                term_sheet_data["term_sheet"]["lead_investor_style"] = lead_investor

        return term_sheet_data

    except Exception as e:
        print(f"[TermSheet] Error generating term sheet: {e}")
        # Return fallback term sheet
        return _get_fallback_term_sheet(
            decision=council_result.get("decision", "INVEST"),
            average_score=average_score,
            language=language,
            startup_name=startup_name,
            stage=stage,
            ask_amount=ask_amount
        )


async def _generate_pass_feedback(
    council_result: Dict[str, Any],
    deck_analysis: Dict[str, Any],
    language: str,
    average_score: float
) -> Dict[str, Any]:
    """Generate feedback report for PASS decisions"""
    
    # Build context for feedback
    context = f"""
## COUNCIL RESULT

{json.dumps(council_result, ensure_ascii=False, indent=2)}

## DECK ANALYSIS

{json.dumps(deck_analysis, ensure_ascii=False, indent=2)}

## SESSION METADATA

- Language: {language}
- Average Score: {average_score}/100

---

Generate the feedback report now. Return ONLY valid JSON matching the output format specified in the system prompt.
Do not include markdown code blocks, just the raw JSON object.
"""

    # Generate feedback using Gemini Pro
    try:
        response_text = await generate_text_pro(
            prompt=context,
            system_instruction=PASS_FEEDBACK_PROMPT
        )

        # Parse JSON response
        feedback_data = _parse_json_response(response_text)

        # Ensure decision is PASS
        feedback_data["decision"] = "PASS"
        feedback_data["average_score"] = average_score

        # Add status banner
        feedback_data["status_banner"] = get_status_banner(
            decision="PASS",
            score=average_score,
            language=language
        )

        return feedback_data

    except Exception as e:
        print(f"[TermSheet] Error generating feedback: {e}")
        # Return fallback feedback
        return _get_fallback_feedback(
            council_result=council_result,
            average_score=average_score,
            language=language
        )


def _parse_json_response(response_text: str) -> Dict[str, Any]:
    """Parse JSON from Gemini response, handling markdown code blocks"""
    text = response_text.strip()

    # Remove markdown code blocks if present
    if "```json" in text:
        json_str = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        # Try to find JSON block
        parts = text.split("```")
        if len(parts) >= 3:
            json_str = parts[1].strip()
            # Remove language identifier if present
            if json_str.startswith("json"):
                json_str = json_str[4:].strip()
        else:
            json_str = text
    else:
        json_str = text

    # Try to find JSON object boundaries
    start_idx = json_str.find("{")
    end_idx = json_str.rfind("}")
    
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        json_str = json_str[start_idx:end_idx + 1]

    return json.loads(json_str)


def _get_fallback_term_sheet(
    decision: str,
    average_score: float,
    language: str,
    startup_name: str,
    stage: str,
    ask_amount: str
) -> Dict[str, Any]:
    """Fallback term sheet if AI generation fails"""
    return {
        "decision": decision,
        "average_score": average_score,
        "status_banner": get_status_banner(decision, average_score, language),
        "term_sheet": {
            "company_name": startup_name,
            "security_type": "SAFE" if stage == "pre_seed" else "Preferred Stock",
            "lead_investor_style": "sarah_chen",
            "deal_summary": {
                "investment_amount": ask_amount,
                "pre_money_valuation": "$5M",
                "post_money_valuation": "$5.5M",
                "equity_sold": "10%"
            },
            "key_terms": [
                {
                    "term": "Security Type",
                    "description": "Standard SAFE or Preferred Stock"
                }
            ],
            "rationale": "Standard market terms based on council evaluation."
        },
        "glossary": []
    }


def _get_fallback_feedback(
    council_result: Dict[str, Any],
    average_score: float,
    language: str
) -> Dict[str, Any]:
    """Fallback feedback report if AI generation fails"""
    votes = council_result.get("votes", {})
    
    return {
        "decision": "PASS",
        "average_score": average_score,
        "status_banner": get_status_banner("PASS", average_score, language),
        "target_scores": {
            "invest": 70,
            "investor_ready_pool": 95
        },
        "council_opinions": [
            {
                "character": k,
                "score": v.get("score", 0) if isinstance(v, dict) else 0,
                "rationale": v.get("rationale", "") if isinstance(v, dict) else "",
                "main_concern": "General improvement needed",
                "action_to_fix": "Work on key areas identified in deck analysis"
            }
            for k, v in votes.items()
        ],
        "critical_improvements": [
            {
                "area": "Traction",
                "current_state": "Limited",
                "target_state": "Strong metrics",
                "priority": "critical"
            }
        ],
        "roadmap_90_days": {
            "month_1": {
                "weeks_1_2": ["Focus on traction"],
                "weeks_3_4": ["Improve metrics"],
                "end_goal": "Show progress"
            },
            "month_2": {
                "weeks_5_6": ["Build momentum"],
                "weeks_7_8": ["Validate assumptions"],
                "end_goal": "Demonstrate growth"
            },
            "month_3": {
                "weeks_9_10": ["Refine pitch"],
                "weeks_11_12": ["Prepare for re-pitch"],
                "end_goal": "70+ score to get INVEST"
            }
        },
        "strengths": [],
        "recommended_resources": []
    }


def extract_session_metadata(deck_analysis: Dict[str, Any]) -> Dict[str, str]:
    """
    Extract session metadata from deck analysis

    Returns:
        Dict with startup_name, stage, ask_amount, sector
    """
    metadata = {
        "startup_name": "Startup",
        "stage": "seed",
        "ask_amount": "$500K",
        "sector": "other"
    }

    # Extract from deck analysis
    if deck_analysis:
        # Try to find startup name
        if "analysis_metadata" in deck_analysis:
            meta = deck_analysis["analysis_metadata"]
            metadata["stage"] = meta.get("detected_stage", "seed").lower().replace(" ", "_")
            metadata["sector"] = meta.get("detected_sector", "other").lower()

        # Try to find ask amount from financials
        if "categories" in deck_analysis:
            financials = deck_analysis["categories"].get("financials", {})
            if "evidence_found" in financials:
                # Try to extract ask amount from evidence
                for evidence in financials["evidence_found"]:
                    if "$" in evidence or "USD" in evidence.upper():
                        # Simple extraction
                        import re
                        amounts = re.findall(r'\$[\d,]+[KMB]?', evidence)
                        if amounts:
                            metadata["ask_amount"] = amounts[0]
                            break

    return metadata

