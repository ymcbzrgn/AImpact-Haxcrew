"""
Council Service - PitchDrill
Orchestrates 5-character VC panel debate and voting
"""

import asyncio
import json
from enum import Enum
from typing import Callable, Optional, List, Dict, Any
from dataclasses import dataclass, field

from services.gemini_service import generate_text_pro
from prompts.council_characters import (
    CHARACTERS,
    get_character_prompt,
    get_debate_context,
    get_character_display_name,
    VOTE_PROMPT,
)


class CouncilPhase(Enum):
    """Council debate phases"""
    OPENING = "opening"
    DEBATE = "debate"
    CLOSING = "closing"
    VOTING = "voting"
    COMPLETED = "completed"


class Decision(Enum):
    """Council decision outcomes"""
    INVESTOR_READY_POOL = "INVESTOR_READY_POOL"
    INVEST = "INVEST"
    CONDITIONAL = "CONDITIONAL"
    PASS = "PASS"


@dataclass
class Vote:
    """Individual vote from a panelist"""
    speaker: str
    score: int
    rationale: str


@dataclass
class CouncilResult:
    """Final council result"""
    average_score: float
    decision: Decision
    votes: Dict[str, Vote]
    key_strengths: List[str] = field(default_factory=list)
    key_concerns: List[str] = field(default_factory=list)
    investor_ready_pool: bool = False


class CouncilSession:
    """
    Manages a single council debate session.
    Orchestrates 5 characters through opening -> debate -> closing -> voting.
    """

    MIN_EXCHANGES = 8
    MAX_EXCHANGES = 15
    PANELISTS = ["sarah_chen", "marcus_thompson", "elif_yilmaz", "david_park"]

    def __init__(
        self,
        session_id: str,
        deck_analysis: Optional[dict] = None,
        pitch_transcript: Optional[str] = None,
        qa_transcript: Optional[list] = None,
        realtime_notes: Optional[list] = None,
        investor_mode: str = "shark",
        language: str = "tr",
        on_message: Optional[Callable] = None
    ):
        self.session_id = session_id
        self.deck_analysis = deck_analysis or {}
        self.pitch_transcript = pitch_transcript or ""
        self.qa_transcript = qa_transcript or []
        self.realtime_notes = realtime_notes or []
        self.investor_mode = investor_mode
        self.language = language
        self.on_message = on_message

        # State
        self.messages: List[Dict[str, Any]] = []
        self.votes: Dict[str, Vote] = {}
        self.phase = CouncilPhase.OPENING
        self.exchange_count = 0
        self.last_speaker = None
        self.topics_covered: List[str] = []

    async def _emit(self, message: Dict[str, Any]):
        """Emit message to client via callback"""
        self.messages.append(message)
        if self.on_message:
            await self.on_message(message)

    def _build_context(self) -> str:
        """Build context string for AI prompt"""
        overall_score = 0
        if self.deck_analysis and "overall_score" in self.deck_analysis:
            overall_score = self.deck_analysis.get("overall_score", 0)

        return get_debate_context(
            deck_analysis=self.deck_analysis,
            pitch_transcript=self.pitch_transcript,
            qa_transcript=self.qa_transcript,
            realtime_notes=self.realtime_notes,
            language=self.language,
            investor_mode=self.investor_mode,
            overall_score=overall_score,
            conversation_history=self.messages[-10:]  # Last 10 messages for context
        )

    async def _generate_response(
        self,
        character: str,
        extra_instruction: str = ""
    ) -> Dict[str, Any]:
        """Generate response from a character using Gemini Pro"""
        system_prompt = get_character_prompt(character)
        if not system_prompt:
            raise ValueError(f"Unknown character: {character}")

        context = self._build_context()
        full_prompt = f"{context}\n\n{extra_instruction}" if extra_instruction else context

        response_text = await generate_text_pro(
            prompt=full_prompt,
            system_instruction=system_prompt
        )

        # Parse JSON response
        try:
            # Try to extract JSON from response
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()

            parsed = json.loads(json_str)
            parsed["speaker"] = character  # Ensure correct speaker
            parsed["timestamp"] = self.exchange_count

            # Track topics
            if "topics" in parsed:
                for topic in parsed["topics"]:
                    if topic not in self.topics_covered:
                        self.topics_covered.append(topic)

            return parsed

        except json.JSONDecodeError:
            # Fallback: treat as plain text message
            return {
                "speaker": character,
                "message": response_text.strip(),
                "sentiment": "neutral",
                "timestamp": self.exchange_count
            }

    def _get_next_speaker(self) -> str:
        """Determine next speaker for debate flow"""
        # Avoid same speaker twice in a row
        available = [p for p in self.PANELISTS if p != self.last_speaker]

        # Natural alliances/tensions for variety
        if self.last_speaker == "sarah_chen":
            # Sarah often sparks response from Marcus or David
            return "marcus_thompson" if self.exchange_count % 2 == 0 else "david_park"
        elif self.last_speaker == "marcus_thompson":
            # Marcus often gets response from Elif or Sarah
            return "elif_yilmaz" if self.exchange_count % 2 == 0 else "sarah_chen"
        elif self.last_speaker == "elif_yilmaz":
            # Elif often gets response from David or orchestrator
            return "david_park" if self.exchange_count % 2 == 0 else "orchestrator"
        elif self.last_speaker == "david_park":
            # David often gets response from Sarah or Elif
            return "sarah_chen" if self.exchange_count % 2 == 0 else "elif_yilmaz"
        elif self.last_speaker == "orchestrator":
            # Orchestrator can call anyone
            return available[self.exchange_count % len(available)]

        # Default: rotate through panelists
        return available[self.exchange_count % len(available)]

    async def _run_opening(self):
        """Opening phase: Orchestrator sets context, invites first speaker"""
        self.phase = CouncilPhase.OPENING

        # Get startup name from deck analysis
        startup_name = "Bu startup"
        if self.deck_analysis:
            startup_name = self.deck_analysis.get("startup_name", "Bu startup")

        # Orchestrator opening
        opening_instruction = f"""
        You are starting the council debate.
        Set context briefly: we just saw {startup_name}'s pitch.
        Invite the first panelist to share their initial reaction.
        Keep it under 30 seconds of speaking time.
        Choose Sarah or Elif to start (vary it).
        """

        response = await self._generate_response("orchestrator", opening_instruction)
        response["phase"] = "opening"
        response["type"] = "moderation"
        await self._emit(response)
        self.exchange_count += 1
        self.last_speaker = "orchestrator"

        # First panelist response
        first_speaker = "sarah_chen" if self.exchange_count % 2 == 0 else "elif_yilmaz"
        first_instruction = "Give your initial reaction to this pitch. Be direct and in character."

        first_response = await self._generate_response(first_speaker, first_instruction)
        first_response["phase"] = "opening"
        await self._emit(first_response)
        self.exchange_count += 1
        self.last_speaker = first_speaker

    async def _run_debate(self):
        """Main debate phase: characters respond to each other"""
        self.phase = CouncilPhase.DEBATE

        while self.exchange_count < self.MAX_EXCHANGES:
            # Determine if orchestrator should intervene
            should_moderate = (
                self.exchange_count >= self.MIN_EXCHANGES or  # Near end
                self.exchange_count % 4 == 0 or  # Every 4 exchanges
                len(set([m.get("speaker") for m in self.messages[-4:]])) < 3  # Same speakers
            )

            if should_moderate and self.last_speaker != "orchestrator":
                # Orchestrator intervention
                moderation_instruction = """
                Guide the debate. Options:
                - Invite someone who hasn't spoken much
                - Point out a topic not yet discussed
                - Summarize a disagreement and ask for response
                - Share your own view briefly
                Keep it short - you're facilitating, not dominating.
                """
                response = await self._generate_response("orchestrator", moderation_instruction)
                response["phase"] = "debate"
                response["type"] = "moderation"
                await self._emit(response)
                self.exchange_count += 1
                self.last_speaker = "orchestrator"
            else:
                # Next panelist responds
                next_speaker = self._get_next_speaker()
                debate_instruction = """
                Respond to the discussion. Stay in character.
                You can:
                - Agree or disagree with previous speaker
                - Add a new perspective
                - Challenge a claim
                - Ask a rhetorical question
                Keep it natural and conversational.
                """
                response = await self._generate_response(next_speaker, debate_instruction)
                response["phase"] = "debate"
                await self._emit(response)
                self.exchange_count += 1
                self.last_speaker = next_speaker

            # Check if we should wrap up
            if self.exchange_count >= self.MIN_EXCHANGES:
                # 50% chance to start closing after min exchanges
                if self.exchange_count >= self.MAX_EXCHANGES - 2:
                    break

    async def _run_closing(self):
        """Closing phase: final thoughts before voting"""
        self.phase = CouncilPhase.CLOSING

        # Orchestrator calls for final thoughts
        closing_instruction = """
        We're wrapping up. Call for final thoughts before voting.
        Keep it brief: "Final thoughts before we vote?"
        """
        response = await self._generate_response("orchestrator", closing_instruction)
        response["phase"] = "closing"
        response["type"] = "transition"
        await self._emit(response)
        self.exchange_count += 1

        # 2-3 quick final statements from panelists who haven't spoken recently
        recent_speakers = [m.get("speaker") for m in self.messages[-3:]]
        final_speakers = [p for p in self.PANELISTS if p not in recent_speakers][:2]

        for speaker in final_speakers:
            final_instruction = "Give a brief final thought (1-2 sentences max) before voting."
            response = await self._generate_response(speaker, final_instruction)
            response["phase"] = "closing"
            await self._emit(response)
            self.exchange_count += 1

    async def _run_voting(self):
        """Voting phase: collect votes from all panelists"""
        self.phase = CouncilPhase.VOTING

        # Orchestrator calls for votes
        vote_call_instruction = """
        Call for votes. Say something like:
        "Let's vote. Everyone give your score out of 100 and a one-line rationale."
        """
        response = await self._generate_response("orchestrator", vote_call_instruction)
        response["phase"] = "voting"
        response["type"] = "vote_call"
        await self._emit(response)

        # Collect votes from each panelist
        all_voters = self.PANELISTS + ["orchestrator"]
        for voter in all_voters:
            vote_instruction = VOTE_PROMPT
            vote_response = await self._generate_response(voter, vote_instruction)

            # Parse vote
            score = vote_response.get("score", 50)
            rationale = vote_response.get("rationale", vote_response.get("message", ""))

            # Validate score
            if isinstance(score, str):
                try:
                    score = int(score)
                except ValueError:
                    score = 50
            score = max(0, min(100, score))

            self.votes[voter] = Vote(
                speaker=voter,
                score=score,
                rationale=rationale
            )

            # Emit vote
            vote_message = {
                "speaker": voter,
                "type": "vote",
                "score": score,
                "rationale": rationale,
                "phase": "voting"
            }
            await self._emit(vote_message)

    def _calculate_result(self) -> CouncilResult:
        """Calculate final council result from votes"""
        if not self.votes:
            return CouncilResult(
                average_score=0,
                decision=Decision.PASS,
                votes={},
                investor_ready_pool=False
            )

        # Calculate average
        total = sum(v.score for v in self.votes.values())
        average = total / len(self.votes)

        # Determine decision
        if average >= 95:
            decision = Decision.INVESTOR_READY_POOL
            investor_ready = True
        elif average >= 70:
            decision = Decision.INVEST
            investor_ready = False
        elif average >= 50:
            decision = Decision.CONDITIONAL
            investor_ready = False
        else:
            decision = Decision.PASS
            investor_ready = False

        # Extract key points from debate
        key_strengths = []
        key_concerns = []

        for msg in self.messages:
            if msg.get("sentiment") == "positive":
                key_strengths.append(msg.get("message", "")[:100])
            elif msg.get("sentiment") == "negative":
                key_concerns.append(msg.get("message", "")[:100])

        return CouncilResult(
            average_score=round(average, 1),
            decision=decision,
            votes={k: v for k, v in self.votes.items()},
            key_strengths=key_strengths[:3],
            key_concerns=key_concerns[:3],
            investor_ready_pool=investor_ready
        )

    async def run(self) -> CouncilResult:
        """Run full council debate flow"""
        try:
            await self._run_opening()
            await self._run_debate()
            await self._run_closing()
            await self._run_voting()
            self.phase = CouncilPhase.COMPLETED
            return self._calculate_result()
        except Exception as e:
            print(f"[Council] Error during session: {e}")
            raise

    def get_dialog(self) -> List[Dict]:
        """Get full debate dialog"""
        return self.messages.copy()

    def get_verdict(self) -> Dict:
        """Get verdict summary"""
        result = self._calculate_result()
        return {
            "decision": result.decision.value,
            "average_score": result.average_score,
            "votes": {
                k: {"score": v.score, "rationale": v.rationale}
                for k, v in result.votes.items()
            },
            "investor_ready_pool": result.investor_ready_pool,
            "key_strengths": result.key_strengths,
            "key_concerns": result.key_concerns
        }


# Session Manager
_council_sessions: Dict[str, CouncilSession] = {}
_lock = asyncio.Lock()


async def start_council_session(
    session_id: str,
    deck_analysis: Optional[dict] = None,
    pitch_transcript: Optional[str] = None,
    qa_transcript: Optional[list] = None,
    realtime_notes: Optional[list] = None,
    investor_mode: str = "shark",
    language: str = "tr",
    on_message: Optional[Callable] = None
) -> CouncilSession:
    """
    Start a new council session

    Args:
        session_id: Unique session identifier
        deck_analysis: Analyzed deck data
        pitch_transcript: Founder's pitch transcript
        qa_transcript: Q&A session transcript
        realtime_notes: Notes from pitch phase
        investor_mode: shark/friendly/analyst
        language: tr/en
        on_message: Callback for real-time message delivery

    Returns:
        CouncilSession instance
    """
    async with _lock:
        session = CouncilSession(
            session_id=session_id,
            deck_analysis=deck_analysis,
            pitch_transcript=pitch_transcript,
            qa_transcript=qa_transcript,
            realtime_notes=realtime_notes,
            investor_mode=investor_mode,
            language=language,
            on_message=on_message
        )
        _council_sessions[session_id] = session
        return session


async def get_council_session(session_id: str) -> Optional[CouncilSession]:
    """Get existing council session"""
    return _council_sessions.get(session_id)


async def close_council_session(session_id: str) -> bool:
    """Close and remove a council session"""
    async with _lock:
        if session_id in _council_sessions:
            del _council_sessions[session_id]
            return True
        return False


def get_active_council_count() -> int:
    """Get count of active council sessions"""
    return len(_council_sessions)
