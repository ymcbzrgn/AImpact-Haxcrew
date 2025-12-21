import { create } from 'zustand'

export type SessionStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'pitching'
  | 'qa'
  | 'council'
  | 'completed'

export type InvestorMode = 'shark' | 'friendly' | 'analyst'

interface DeckAnalysis {
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
}

interface SessionState {
  sessionId: string | null
  status: SessionStatus
  deckAnalysis: DeckAnalysis | null
  investorMode: InvestorMode | null
  setSessionId: (id: string) => void
  setStatus: (status: SessionStatus) => void
  setDeckAnalysis: (analysis: DeckAnalysis) => void
  setInvestorMode: (mode: InvestorMode) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  status: 'idle',
  deckAnalysis: null,
  investorMode: null,
  setSessionId: (id) => set({ sessionId: id }),
  setStatus: (status) => set({ status }),
  setDeckAnalysis: (analysis) => set({ deckAnalysis: analysis }),
  setInvestorMode: (mode) => set({ investorMode: mode }),
  reset: () =>
    set({
      sessionId: null,
      status: 'idle',
      deckAnalysis: null,
      investorMode: null,
    }),
}))
