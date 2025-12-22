"""
Term Sheet Generator System Prompts - PitchDrill
Based on PROMPTS.md Module 5 (5.1-5.3)
"""

from typing import Dict, Optional, List
from datetime import datetime, timedelta

# Main Term Sheet Generator Prompt
TERM_SHEET_SYSTEM_PROMPT = """# TERM SHEET GENERATOR
Version: 1.0
Last Updated: 2025-12-21

---

## ROLE DEFINITION

You are a **VC Legal & Deal Structuring Expert** who generates realistic term sheets based on council evaluation results.

**Your Expertise:**
- 15 years structuring VC deals
- Worked at top law firms (Fenwick, Gunderson)
- Deep knowledge of SAFE, convertible notes, equity rounds
- Fair to founders while protecting investor interests

---

## DECISION ROUTING

### Path 1: INVESTOR_READY_POOL (95-100)
→ Generate **Founder-Friendly Term Sheet**
→ Include **Marketplace Access Notice**
→ Premium terms (lower dilution, minimal preferences)

### Path 2: INVEST (70-94)
→ Generate **Standard Mock Term Sheet**
→ Include **Educational Disclaimer**
→ Standard market terms

### Path 3: CONDITIONAL (50-69)
→ Generate **Conditional Term Sheet**
→ Include **Improvement Requirements**
→ Include **Re-pitch Invitation**

### Path 4: PASS (<50)
→ Generate **Pass Feedback Report**
→ Provide actionable improvement roadmap
→ Include 90-day improvement plan

---

## TERM SHEET STYLE BY LEAD INVESTOR

Identify highest-scoring council member → Apply their investment style:

### Sarah Chen (YC Style) - SAFE Note
- Y Combinator Post-Money SAFE
- No valuation cap OR reasonable cap
- No discount (or minimal 10-15%)
- MFN clause
- Pro-rata rights
- Simple, founder-friendly

### Marcus Thompson (a16z Style) - Priced Equity
- Series Seed Preferred Stock
- 1x Non-participating liquidation preference
- Standard anti-dilution (broad-based weighted average)
- Board seat for lead investor
- Standard protective provisions
- Information rights

### Elif Yılmaz (Angel Style) - Convertible Note
- Convertible Promissory Note
- Valuation cap + discount (typically 20%)
- 18-24 month maturity
- Interest rate 4-6%
- Conversion triggers
- Flexible, relationship-focused

### David Park (Tiger Style) - Growth Equity
- Series A Preferred Stock
- 1x Non-participating liquidation preference
- Full ratchet anti-dilution (aggressive)
- Board observer seat
- Extensive information rights
- Milestone-based tranches possible

---

## VALUATION LOGIC

AI determines valuation based on:

### Input Factors
1. **Stage** (primary anchor)
   - Pre-seed: $1M - $4M
   - Seed: $4M - $12M
   - Series A: $12M - $30M

2. **Council Score** (modifier)
   - 95-100: Top of range + 20%
   - 85-94: Top of range
   - 75-84: Mid-range
   - 70-74: Bottom of range

3. **Sector Premium**
   - AI/ML: +15-25%
   - Fintech: +10-20%
   - SaaS B2B: +10-15%
   - Marketplace: +5-10%
   - Other: baseline

4. **Traction Modifier**
   - Strong traction evidence: +10-20%
   - Weak/no traction: -10-20%

5. **Team Modifier**
   - Exceptional team: +10-15%
   - Weak team signals: -10-15%

### Output Formula
Pre-money valuation = Stage_Anchor × Score_Modifier × Sector_Premium × Traction × Team

---

## OUTPUT FORMAT

Return a JSON object with the following structure:

```json
{{
  "decision": "INVESTOR_READY_POOL" | "INVEST" | "CONDITIONAL" | "PASS",
  "average_score": <0-100>,
  "status_banner": "<formatted banner text>",
  "term_sheet": {{
    "company_name": "<name>",
    "security_type": "<SAFE|Convertible Note|Preferred Stock>",
    "lead_investor_style": "<sarah_chen|marcus_thompson|elif_yilmaz|david_park>",
    "deal_summary": {{
      "investment_amount": "<amount>",
      "pre_money_valuation": "<amount>",
      "post_money_valuation": "<amount>",
      "equity_sold": "<percentage>",
      "valuation_cap": "<amount if SAFE/Note>",
      "discount": "<percentage if applicable>"
    }},
    "key_terms": [
      {{
        "term": "<term name>",
        "description": "<detailed explanation>"
      }}
    ],
    "rationale": "<why this structure from lead investor's perspective>",
    "conditions_precedent": ["<condition 1>", "<condition 2>"],
    "improvement_requirements": ["<if conditional>"],
    "re_pitch_date": "<if conditional, date + 14 days>"
  }},
  "glossary": [
    {{
      "term_en": "<term>",
      "term_tr": "<Turkish explanation>"
    }}
  ]
}}
```

For PASS decisions, return feedback report format instead.
"""


# Pass Feedback Generator Prompt
PASS_FEEDBACK_PROMPT = """# PASS FEEDBACK GENERATOR
Version: 1.0

---

## ROLE DEFINITION

You are a **Startup Advisor & VC Feedback Specialist** who provides actionable improvement guidance to founders who didn't pass the council evaluation.

**Your Approach:**
- Honest but constructive
- Specific and actionable
- Focus on what they CAN change
- Provide clear roadmap
- Encourage iteration

---

## OUTPUT FORMAT

Return a JSON object:

```json
{{
  "decision": "PASS",
  "average_score": <0-100>,
  "target_scores": {{
    "invest": 70,
    "investor_ready_pool": 95
  }},
  "council_opinions": [
    {{
      "character": "<character_name>",
      "score": <0-100>,
      "rationale": "<full rationale>",
      "main_concern": "<specific concern>",
      "action_to_fix": "<concrete action>"
    }}
  ],
  "critical_improvements": [
    {{
      "area": "<category>",
      "current_state": "<what is now>",
      "target_state": "<what should be>",
      "priority": "critical" | "important" | "bonus"
    }}
  ],
  "roadmap_90_days": {{
    "month_1": {{
      "weeks_1_2": ["<action 1>", "<action 2>"],
      "weeks_3_4": ["<action 3>", "<action 4>"],
      "end_goal": "<measurable goal>"
    }},
    "month_2": {{
      "weeks_5_6": ["<action>"],
      "weeks_7_8": ["<action>"],
      "end_goal": "<measurable goal>"
    }},
    "month_3": {{
      "weeks_9_10": ["<action>"],
      "weeks_11_12": ["<action>"],
      "end_goal": "70+ score to get INVEST"
    }}
  }},
  "strengths": ["<strength 1>", "<strength 2>"],
  "recommended_resources": [
    {{
      "concern": "<main concern>",
      "resources": ["<resource 1>", "<resource 2>"]
    }}
  ]
}}
```

---

## LANGUAGE RULES

- Match deck language (Turkish or English)
- All output in same language as deck
- Technical terms can include both EN/TR in glossary
"""


# Context template for term sheet generation
TERM_SHEET_CONTEXT_TEMPLATE = """
## COUNCIL RESULT

{council_result}

## DECK ANALYSIS

{deck_analysis}

## SESSION METADATA

- Language: {language}
- Startup Name: {startup_name}
- Stage: {stage}
- Ask Amount: {ask_amount}
- Sector: {sector}

---

Now generate the term sheet or feedback report based on the decision path.
Language: {language}
"""


# Helper functions
def get_lead_investor(votes: Dict[str, Dict]) -> str:
    """Identify highest-scoring council member to determine term sheet style."""
    if not votes:
        return "sarah_chen"  # Default to YC style
    
    highest_score = -1
    lead_investor = "sarah_chen"
    
    for character, vote_data in votes.items():
        if isinstance(vote_data, dict):
            score = vote_data.get("score", 0)
            if score > highest_score:
                highest_score = score
                lead_investor = character
    
    return lead_investor


def calculate_valuation(
    stage: str,
    score: float,
    sector: str = "other",
    has_traction: bool = False,
    strong_team: bool = False
) -> Dict[str, float]:
    """Calculate pre-money valuation based on multiple factors."""
    # Stage anchors (mid-point of range)
    stage_anchors = {
        "pre_seed": 2.5,  # $2.5M (mid of $1M-$4M)
        "seed": 8.0,      # $8M (mid of $4M-$12M)
        "series_a": 21.0  # $21M (mid of $12M-$30M)
    }
    
    base_valuation = stage_anchors.get(stage.lower(), 2.5)
    
    # Score modifier
    if score >= 95:
        score_modifier = 1.20  # Top + 20%
    elif score >= 85:
        score_modifier = 1.0   # Top of range
    elif score >= 75:
        score_modifier = 0.85  # Mid-range
    elif score >= 70:
        score_modifier = 0.75  # Bottom of range
    else:
        score_modifier = 0.65  # Below threshold
    
    # Sector premium
    sector_premiums = {
        "ai/ml": 1.20,
        "fintech": 1.15,
        "saas b2b": 1.12,
        "marketplace": 1.07,
        "other": 1.0
    }
    sector_modifier = sector_premiums.get(sector.lower(), 1.0)
    
    # Traction modifier
    traction_modifier = 1.15 if has_traction else 0.90
    
    # Team modifier
    team_modifier = 1.12 if strong_team else 0.93
    
    # Calculate final valuation
    pre_money = base_valuation * score_modifier * sector_modifier * traction_modifier * team_modifier
    
    return {
        "pre_money_valuation": round(pre_money, 2),
        "base_valuation": base_valuation,
        "score_modifier": score_modifier,
        "sector_modifier": sector_modifier,
        "traction_modifier": traction_modifier,
        "team_modifier": team_modifier
    }


def get_status_banner(decision: str, score: float, language: str = "tr") -> str:
    """Generate status banner based on decision."""
    if decision == "INVESTOR_READY_POOL":
        if language == "tr":
            return f"""╔═══════════════════════════════════════════════════════════════╗
║  🎯 INVESTOR READY POOL - MARKETPLACE ACCESS GRANTED          ║
╠═══════════════════════════════════════════════════════════════╣
║  Tebrikler! %{score:.0f}+ skor ile Investor Ready Pool'a girmeye       ║
║  hak kazandınız. Bu term sheet gerçek yatırımcılara           ║
║  sunulacaktır.                                                 ║
║                                                                ║
║  Sonraki adım: Marketplace profilinizi tamamlayın.            ║
╚═══════════════════════════════════════════════════════════════╝"""
        else:
            return f"""╔═══════════════════════════════════════════════════════════════╗
║  🎯 INVESTOR READY POOL - MARKETPLACE ACCESS GRANTED          ║
╠═══════════════════════════════════════════════════════════════╣
║  Congratulations! With a score of {score:.0f}+, you've qualified    ║
║  for the Investor Ready Pool. This term sheet will be         ║
║  presented to real investors.                                 ║
║                                                                ║
║  Next step: Complete your marketplace profile.               ║
╚═══════════════════════════════════════════════════════════════╝"""
    
    elif decision == "INVEST":
        if language == "tr":
            return f"""╔═══════════════════════════════════════════════════════════════╗
║  📋 EĞİTİM AMAÇLI MOCK TERM SHEET                             ║
╠═══════════════════════════════════════════════════════════════╣
║  Council sizin için olumlu oy kullandı! Bu term sheet         ║
║  gerçek bir yatırım turunda göreceğiniz koşulları             ║
║  simüle etmektedir.                                            ║
║                                                                ║
║  ⚠️ NOT: Bu bir simülasyondur. Investor Marketplace           ║
║  erişimi için %95+ skor gereklidir.                           ║
║                                                                ║
║  Mevcut skorunuz: {score:.0f}% | Hedefiniz: 95%                       ║
║  Tekrar deneyin ve skorunuzu yükseltin!                       ║
╚═══════════════════════════════════════════════════════════════╝"""
        else:
            return f"""╔═══════════════════════════════════════════════════════════════╗
║  📋 EDUCATIONAL MOCK TERM SHEET                                ║
╠═══════════════════════════════════════════════════════════════╣
║  Council voted positively! This term sheet simulates          ║
║  conditions you would see in a real investment round.          ║
║                                                                ║
║  ⚠️ NOTE: This is a simulation. Investor Marketplace          ║
║  access requires 95+ score.                                    ║
║                                                                ║
║  Current score: {score:.0f}% | Target: 95%                            ║
║  Try again and improve your score!                            ║
╚═══════════════════════════════════════════════════════════════╝"""
    
    elif decision == "CONDITIONAL":
        re_pitch_date = (datetime.now() + timedelta(days=14)).strftime("%d %B %Y")
        if language == "tr":
            return f"""╔═══════════════════════════════════════════════════════════════╗
║  🔄 ŞARTLI TERM SHEET - GELİŞTİRME GEREKLİ                    ║
╠═══════════════════════════════════════════════════════════════╣
║  Council potansiyel gördü ancak bazı endişeler var.           ║
║  Aşağıdaki iyileştirmeleri yaparak 2 hafta içinde             ║
║  tekrar pitch yapabilirsiniz.                                  ║
║                                                                ║
║  Bu term sheet, iyileştirmeler tamamlandığında                 ║
║  geçerli olacak koşulları göstermektedir.                     ║
║                                                                ║
║  📅 Tekrar pitch daveti: {re_pitch_date}                     ║
╚═══════════════════════════════════════════════════════════════╝"""
        else:
            return f"""╔═══════════════════════════════════════════════════════════════╗
║  🔄 CONDITIONAL TERM SHEET - IMPROVEMENTS REQUIRED             ║
╠═══════════════════════════════════════════════════════════════╣
║  Council saw potential but has some concerns.                 ║
║  Complete the improvements below and re-pitch within           ║
║  2 weeks.                                                      ║
║                                                                ║
║  This term sheet shows conditions that will be valid           ║
║  once improvements are completed.                              ║
║                                                                ║
║  📅 Re-pitch invitation: {re_pitch_date}                      ║
╚═══════════════════════════════════════════════════════════════╝"""
    
    else:  # PASS
        if language == "tr":
            return f"""╔═══════════════════════════════════════════════════════════════╗
║  ❌ KARAR: PASS                                                ║
╠═══════════════════════════════════════════════════════════════╣
║  Council bu aşamada yatırım kararı vermedi.                   ║
║  Ancak bu bir son değil - net bir yol haritası sunuyoruz.     ║
║                                                                ║
║  Ortalama Skor: {score:.0f}/100                                        ║
║  Hedef: 70+ (INVEST) veya 95+ (Investor Ready Pool)           ║
╚═══════════════════════════════════════════════════════════════╝"""
        else:
            return f"""╔═══════════════════════════════════════════════════════════════╗
║  ❌ DECISION: PASS                                             ║
╠═══════════════════════════════════════════════════════════════╣
║  Council did not make an investment decision at this stage.   ║
║  But this is not the end - we provide a clear roadmap.        ║
║                                                                ║
║  Average Score: {score:.0f}/100                                        ║
║  Target: 70+ (INVEST) or 95+ (Investor Ready Pool)           ║
╚═══════════════════════════════════════════════════════════════╝"""


def build_term_sheet_context(
    council_result: Dict,
    deck_analysis: Dict,
    language: str,
    startup_name: str,
    stage: str,
    ask_amount: str,
    sector: str
) -> str:
    """Build context string for term sheet generation."""
    return TERM_SHEET_CONTEXT_TEMPLATE.format(
        council_result=str(council_result),
        deck_analysis=str(deck_analysis),
        language=language,
        startup_name=startup_name,
        stage=stage,
        ask_amount=ask_amount,
        sector=sector
    )

