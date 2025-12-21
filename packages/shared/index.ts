// Session Status
export type SessionStatus =
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'pitching'
  | 'qa'
  | 'council'
  | 'completed'

// Investor Modes
export type InvestorMode = 'shark' | 'friendly' | 'analyst'

// WebSocket Events
export type WSEventType =
  | 'audio_chunk'
  | 'end_pitch'
  | 'answer_complete'
  | 'phase_change'
  | 'timer_update'
  | 'realtime_note'
  | 'ai_speaking'
  | 'council_message'
  | 'session_complete'

// Deck Analysis
export interface DeckAnalysis {
  scores: {
    problem: number
    solution: number
    market: number
    traction: number
    team: number
    financials: number
    ask: number
  }
  overallScore: number
  summary: string
  strengths: string[]
  weaknesses: string[]
}

// Council Characters
export interface CouncilCharacter {
  id: string
  name: string
  role: string
  firm: string
  focus: string
}

export const COUNCIL_CHARACTERS: CouncilCharacter[] = [
  { id: 'sarah', name: 'Sarah Chen', role: 'YC Partner', firm: 'Y Combinator', focus: 'PMF, velocity' },
  { id: 'marcus', name: 'Marcus Thompson', role: 'Analyst', firm: 'a16z', focus: 'Market, data' },
  { id: 'elif', name: 'Elif Yilmaz', role: 'Angel Investor', firm: 'TR Angels', focus: 'Founder, local' },
  { id: 'david', name: 'David Park', role: 'Partner', firm: 'Tiger Global', focus: 'Scale, unit eco' },
]

// API Response
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

// Realtime Note
export interface RealtimeNote {
  note: string
  type: 'tip' | 'warning' | 'positive'
  timestamp: number
}

// Council Vote
export interface CouncilVote {
  character: string
  score: number
  rationale: string
}

// Verdict
export interface Verdict {
  decision: 'INVEST' | 'PASS' | 'CONDITIONAL'
  averageScore: number
  votes: CouncilVote[]
  termSheet?: object
  feedback?: string[]
}
