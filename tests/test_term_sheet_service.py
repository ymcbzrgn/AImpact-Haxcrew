"""
Term Sheet Service Tests
Testing term sheet generation and helpers
"""

import pytest
import os
import sys

# Add api path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "api"))

# Load env before imports
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "apps", "api", ".env"))

from services.gemini_service import init_gemini


@pytest.fixture(autouse=True)
def setup_gemini():
    """Initialize Gemini before each test"""
    init_gemini()


class TestTermSheetPrompts:
    """Test term sheet prompt imports and helpers"""

    def test_import_term_sheet_prompts(self):
        """Can import term_sheet module"""
        from prompts.term_sheet import (
            TERM_SHEET_SYSTEM_PROMPT,
            PASS_FEEDBACK_PROMPT,
            TERM_SHEET_CONTEXT_TEMPLATE,
            get_lead_investor,
            calculate_valuation,
            get_status_banner,
            build_term_sheet_context,
        )
        assert TERM_SHEET_SYSTEM_PROMPT is not None
        assert PASS_FEEDBACK_PROMPT is not None
        assert TERM_SHEET_CONTEXT_TEMPLATE is not None
        assert get_lead_investor is not None
        assert calculate_valuation is not None
        assert get_status_banner is not None

    def test_get_lead_investor_highest_score(self):
        """Returns character with highest score"""
        from prompts.term_sheet import get_lead_investor

        votes = {
            "sarah_chen": {"score": 75, "rationale": "Good PMF"},
            "marcus_thompson": {"score": 82, "rationale": "Strong market"},
            "elif_yilmaz": {"score": 70, "rationale": "OK founder"},
            "david_park": {"score": 78, "rationale": "Unit economics"}
        }

        lead = get_lead_investor(votes)
        assert lead == "marcus_thompson"

    def test_get_lead_investor_empty_votes(self):
        """Returns sarah_chen as default"""
        from prompts.term_sheet import get_lead_investor

        lead = get_lead_investor({})
        assert lead == "sarah_chen"

    def test_get_lead_investor_none_votes(self):
        """Returns sarah_chen for None input"""
        from prompts.term_sheet import get_lead_investor

        lead = get_lead_investor(None)
        assert lead == "sarah_chen"

    def test_calculate_valuation_pre_seed(self):
        """Pre-seed stage valuation ~$2.5M base"""
        from prompts.term_sheet import calculate_valuation

        result = calculate_valuation(
            stage="pre_seed",
            score=75,
            sector="other",
            has_traction=False,
            strong_team=False
        )

        assert result["base_valuation"] == 2.5
        assert "pre_money_valuation" in result

    def test_calculate_valuation_seed(self):
        """Seed stage valuation ~$8M base"""
        from prompts.term_sheet import calculate_valuation

        result = calculate_valuation(
            stage="seed",
            score=80,
            sector="other",
            has_traction=False,
            strong_team=False
        )

        assert result["base_valuation"] == 8.0

    def test_calculate_valuation_series_a(self):
        """Series A valuation ~$21M base"""
        from prompts.term_sheet import calculate_valuation

        result = calculate_valuation(
            stage="series_a",
            score=85,
            sector="other",
            has_traction=False,
            strong_team=False
        )

        assert result["base_valuation"] == 21.0

    def test_calculate_valuation_score_modifier_95_plus(self):
        """95+ score gives 1.20x modifier"""
        from prompts.term_sheet import calculate_valuation

        result = calculate_valuation(
            stage="seed",
            score=96,
            sector="other",
            has_traction=False,
            strong_team=False
        )

        assert result["score_modifier"] == 1.20

    def test_calculate_valuation_score_modifier_70(self):
        """70-74 score gives 0.75x modifier"""
        from prompts.term_sheet import calculate_valuation

        result = calculate_valuation(
            stage="seed",
            score=72,
            sector="other",
            has_traction=False,
            strong_team=False
        )

        assert result["score_modifier"] == 0.75

    def test_calculate_valuation_sector_premium_ai(self):
        """AI/ML sector gets 1.20x premium"""
        from prompts.term_sheet import calculate_valuation

        result = calculate_valuation(
            stage="seed",
            score=80,
            sector="ai/ml",
            has_traction=False,
            strong_team=False
        )

        assert result["sector_modifier"] == 1.20

    def test_calculate_valuation_sector_premium_fintech(self):
        """Fintech sector gets 1.15x premium"""
        from prompts.term_sheet import calculate_valuation

        result = calculate_valuation(
            stage="seed",
            score=80,
            sector="fintech",
            has_traction=False,
            strong_team=False
        )

        assert result["sector_modifier"] == 1.15

    def test_calculate_valuation_traction_modifier(self):
        """Traction gives 1.15x, no traction gives 0.90x"""
        from prompts.term_sheet import calculate_valuation

        with_traction = calculate_valuation("seed", 80, has_traction=True)
        without_traction = calculate_valuation("seed", 80, has_traction=False)

        assert with_traction["traction_modifier"] == 1.15
        assert without_traction["traction_modifier"] == 0.90

    def test_calculate_valuation_team_modifier(self):
        """Strong team gives 1.12x, weak team gives 0.93x"""
        from prompts.term_sheet import calculate_valuation

        strong_team = calculate_valuation("seed", 80, strong_team=True)
        weak_team = calculate_valuation("seed", 80, strong_team=False)

        assert strong_team["team_modifier"] == 1.12
        assert weak_team["team_modifier"] == 0.93

    def test_get_status_banner_investor_ready_pool_tr(self):
        """Turkish banner for 95+ score"""
        from prompts.term_sheet import get_status_banner

        banner = get_status_banner("INVESTOR_READY_POOL", 96.5, "tr")

        assert "INVESTOR READY POOL" in banner
        assert "MARKETPLACE ACCESS GRANTED" in banner
        assert "Tebrikler" in banner

    def test_get_status_banner_investor_ready_pool_en(self):
        """English banner for 95+ score"""
        from prompts.term_sheet import get_status_banner

        banner = get_status_banner("INVESTOR_READY_POOL", 97.0, "en")

        assert "INVESTOR READY POOL" in banner
        assert "Congratulations" in banner

    def test_get_status_banner_invest_tr(self):
        """Turkish banner for 70-94 score"""
        from prompts.term_sheet import get_status_banner

        banner = get_status_banner("INVEST", 82.0, "tr")

        assert "MOCK TERM SHEET" in banner
        assert "simülasyon" in banner.lower()

    def test_get_status_banner_invest_en(self):
        """English banner for 70-94 score"""
        from prompts.term_sheet import get_status_banner

        banner = get_status_banner("INVEST", 78.0, "en")

        assert "EDUCATIONAL MOCK TERM SHEET" in banner
        assert "simulation" in banner.lower()

    def test_get_status_banner_conditional(self):
        """Conditional banner includes re-pitch date"""
        from prompts.term_sheet import get_status_banner

        banner = get_status_banner("CONDITIONAL", 62.0, "tr")

        assert "CONDITIONAL" in banner or "ŞARTLI" in banner
        assert "14" in banner or "2 hafta" in banner.lower()

    def test_get_status_banner_pass(self):
        """Pass banner shows score and target"""
        from prompts.term_sheet import get_status_banner

        banner = get_status_banner("PASS", 42.0, "en")

        assert "PASS" in banner
        assert "42" in banner
        assert "70" in banner or "95" in banner  # Target scores

    def test_build_term_sheet_context(self):
        """Context template filled correctly"""
        from prompts.term_sheet import build_term_sheet_context

        context = build_term_sheet_context(
            council_result={"decision": "INVEST", "average_score": 78},
            deck_analysis={"startup_name": "PayFlow"},
            language="tr",
            startup_name="PayFlow",
            stage="seed",
            ask_amount="$500K",
            sector="fintech"
        )

        assert "PayFlow" in context
        assert "tr" in context
        assert "seed" in context
        assert "$500K" in context
        assert "fintech" in context


class TestTermSheetService:
    """Test term sheet service functionality"""

    def test_import_term_sheet_service(self):
        """Can import term_sheet_service module"""
        from services.term_sheet_service import (
            generate_term_sheet,
            extract_session_metadata,
        )
        assert generate_term_sheet is not None
        assert extract_session_metadata is not None

    def test_parse_json_response_clean(self):
        """Parse clean JSON string"""
        from services.term_sheet_service import _parse_json_response

        json_str = '{"decision": "INVEST", "score": 75}'
        result = _parse_json_response(json_str)

        assert result["decision"] == "INVEST"
        assert result["score"] == 75

    def test_parse_json_response_markdown(self):
        """Parse JSON from markdown code block"""
        from services.term_sheet_service import _parse_json_response

        json_str = '''```json
{"decision": "PASS", "score": 45}
```'''
        result = _parse_json_response(json_str)

        assert result["decision"] == "PASS"
        assert result["score"] == 45

    def test_parse_json_response_with_prefix(self):
        """Parse JSON with text before/after"""
        from services.term_sheet_service import _parse_json_response

        json_str = 'Here is the result: {"decision": "INVEST", "score": 80} as requested.'
        result = _parse_json_response(json_str)

        assert result["decision"] == "INVEST"
        assert result["score"] == 80

    def test_fallback_term_sheet_structure(self):
        """Fallback has required fields"""
        from services.term_sheet_service import _get_fallback_term_sheet

        fallback = _get_fallback_term_sheet(
            decision="INVEST",
            average_score=78.5,
            language="tr",
            startup_name="TestCo",
            stage="seed",
            ask_amount="$500K"
        )

        assert fallback["decision"] == "INVEST"
        assert fallback["average_score"] == 78.5
        assert "status_banner" in fallback
        assert "term_sheet" in fallback
        assert fallback["term_sheet"]["company_name"] == "TestCo"
        assert "deal_summary" in fallback["term_sheet"]
        assert "key_terms" in fallback["term_sheet"]

    def test_fallback_feedback_structure(self):
        """Fallback feedback has required fields"""
        from services.term_sheet_service import _get_fallback_feedback

        council_result = {
            "votes": {
                "sarah_chen": {"score": 40, "rationale": "Weak traction"},
                "marcus_thompson": {"score": 35, "rationale": "Small market"}
            }
        }

        fallback = _get_fallback_feedback(
            council_result=council_result,
            average_score=38.0,
            language="tr"
        )

        assert fallback["decision"] == "PASS"
        assert fallback["average_score"] == 38.0
        assert "status_banner" in fallback
        assert "target_scores" in fallback
        assert fallback["target_scores"]["invest"] == 70
        assert fallback["target_scores"]["investor_ready_pool"] == 95
        assert "council_opinions" in fallback
        assert "critical_improvements" in fallback
        assert "roadmap_90_days" in fallback

    def test_extract_session_metadata_empty(self):
        """Returns defaults for empty deck_analysis"""
        from services.term_sheet_service import extract_session_metadata

        metadata = extract_session_metadata({})

        assert metadata["startup_name"] == "Startup"
        assert metadata["stage"] == "seed"
        assert metadata["ask_amount"] == "$500K"
        assert metadata["sector"] == "other"

    def test_extract_session_metadata_none(self):
        """Returns defaults for None deck_analysis"""
        from services.term_sheet_service import extract_session_metadata

        metadata = extract_session_metadata(None)

        assert metadata["startup_name"] == "Startup"
        assert metadata["stage"] == "seed"

    def test_extract_session_metadata_with_data(self):
        """Extracts stage, sector from deck_analysis"""
        from services.term_sheet_service import extract_session_metadata

        deck_analysis = {
            "analysis_metadata": {
                "detected_stage": "Series A",
                "detected_sector": "Fintech"
            }
        }

        metadata = extract_session_metadata(deck_analysis)

        assert metadata["stage"] == "series_a"
        assert metadata["sector"] == "fintech"


class TestTermSheetE2E:
    """E2E tests with real Gemini API"""

    @pytest.mark.asyncio
    async def test_generate_term_sheet_invest_real_api(self):
        """Generate term sheet for INVEST decision"""
        from services.term_sheet_service import generate_term_sheet

        council_result = {
            "decision": "INVEST",
            "average_score": 78.5,
            "votes": {
                "sarah_chen": {"score": 80, "rationale": "Strong PMF signals"},
                "marcus_thompson": {"score": 75, "rationale": "Good market size"},
                "elif_yilmaz": {"score": 82, "rationale": "Impressive founder"},
                "david_park": {"score": 77, "rationale": "Decent unit economics"},
                "orchestrator": {"score": 78, "rationale": "Overall positive"}
            },
            "key_strengths": ["Strong PMF", "Good team"],
            "key_concerns": ["Limited traction", "Competition"],
            "investor_ready_pool": False
        }

        deck_analysis = {
            "startup_name": "PayFlow",
            "language": "en",
            "analysis_metadata": {
                "detected_stage": "Seed",
                "detected_sector": "Fintech"
            }
        }

        result = await generate_term_sheet(
            council_result=council_result,
            deck_analysis=deck_analysis,
            language="en",
            startup_name="PayFlow",
            stage="seed",
            ask_amount="$500K",
            sector="fintech"
        )

        # Verify result structure
        assert result is not None
        assert result["decision"] == "INVEST"
        assert result["average_score"] == 78.5
        assert "status_banner" in result
        assert "term_sheet" in result

        print(f"\n=== Generated Term Sheet ===")
        print(f"Decision: {result['decision']}")
        print(f"Score: {result['average_score']}")
        if "term_sheet" in result:
            ts = result["term_sheet"]
            print(f"Security Type: {ts.get('security_type', 'N/A')}")
            print(f"Lead Investor Style: {ts.get('lead_investor_style', 'N/A')}")

    @pytest.mark.asyncio
    async def test_generate_pass_feedback_real_api(self):
        """Generate feedback for PASS decision"""
        from services.term_sheet_service import generate_term_sheet

        council_result = {
            "decision": "PASS",
            "average_score": 42.0,
            "votes": {
                "sarah_chen": {"score": 40, "rationale": "Weak traction, no PMF"},
                "marcus_thompson": {"score": 38, "rationale": "Market too small"},
                "elif_yilmaz": {"score": 48, "rationale": "Founder has potential"},
                "david_park": {"score": 42, "rationale": "Unit economics unclear"},
                "orchestrator": {"score": 42, "rationale": "Not ready yet"}
            },
            "key_strengths": ["Passionate founder"],
            "key_concerns": ["No traction", "Unclear market", "Weak business model"],
            "investor_ready_pool": False
        }

        deck_analysis = {
            "startup_name": "FailedCo",
            "language": "tr"
        }

        result = await generate_term_sheet(
            council_result=council_result,
            deck_analysis=deck_analysis,
            language="tr",
            startup_name="FailedCo",
            stage="pre_seed",
            ask_amount="$250K",
            sector="other"
        )

        # Verify result structure
        assert result is not None
        assert result["decision"] == "PASS"
        assert result["average_score"] == 42.0
        assert "status_banner" in result

        # For PASS, we expect feedback report instead of term sheet
        print(f"\n=== Generated PASS Feedback ===")
        print(f"Decision: {result['decision']}")
        print(f"Score: {result['average_score']}")
        if "target_scores" in result:
            print(f"Target for INVEST: {result['target_scores'].get('invest', 70)}")
        if "roadmap_90_days" in result:
            print("90-day roadmap included: Yes")
