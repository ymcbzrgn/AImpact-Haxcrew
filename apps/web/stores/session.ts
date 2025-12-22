import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

// History item for completed sessions
export interface SessionHistoryItem {
  id: string
  date: string
  investorMode: InvestorMode
  score: number
  decision: 'invest' | 'pass'
  deckName?: string
}

interface SessionState {
  sessionId: string | null
  status: SessionStatus
  deckAnalysis: DeckAnalysis | null
  investorMode: InvestorMode | null
  deckName: string | null
  history: SessionHistoryItem[]
  setSessionId: (id: string) => void
  setStatus: (status: SessionStatus) => void
  setDeckAnalysis: (analysis: DeckAnalysis) => void
  setInvestorMode: (mode: InvestorMode) => void
  setDeckName: (name: string) => void
  addToHistory: (item: SessionHistoryItem) => void
  clearHistory: () => void
  reset: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      status: 'idle',
      deckAnalysis: null,
      investorMode: null,
      deckName: null,
      history: [],
      setSessionId: (id) => set({ sessionId: id }),
      setStatus: (status) => set({ status }),
      setDeckAnalysis: (analysis) => set({ deckAnalysis: analysis }),
      setInvestorMode: (mode) => set({ investorMode: mode }),
      setDeckName: (name) => set({ deckName: name }),
      addToHistory: (item) =>
        set((state) => ({
          history: [item, ...state.history].slice(0, 20), // Keep last 20 sessions
        })),
      clearHistory: () => set({ history: [] }),
      reset: () =>
        set({
          sessionId: null,
          status: 'idle',
          deckAnalysis: null,
          investorMode: null,
          deckName: null,
        }),
    }),
    {
      name: 'pitchdrill-session',
      partialize: (state) => ({
        sessionId: state.sessionId,
        status: state.status,
        investorMode: state.investorMode,
        deckName: state.deckName,
        history: state.history,
      }),
    }
  )
)
