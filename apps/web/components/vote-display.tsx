'use client'

import { useState, useEffect } from 'react'

// Types
export type VoteDecision = 'invest' | 'pass' | 'undecided'

export interface VoteData {
  investorId: string
  investorName?: string
  decision: VoteDecision
  confidence: number // 0-100
  reasoning?: string
  timestamp?: Date
}

// Vote summary
interface VoteSummary {
  invest: number
  pass: number
  undecided: number
  total: number
}

// Icons
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Simple Vote Summary Card
interface VoteSummaryCardProps {
  votes: VoteData[]
  totalVoters?: number
  showPercentage?: boolean
  className?: string
}

export function VoteSummaryCard({
  votes,
  totalVoters = 5,
  showPercentage = true,
  className = '',
}: VoteSummaryCardProps) {
  const summary: VoteSummary = {
    invest: votes.filter((v) => v.decision === 'invest').length,
    pass: votes.filter((v) => v.decision === 'pass').length,
    undecided: totalVoters - votes.length,
    total: totalVoters,
  }

  return (
    <div className={`bg-white rounded-lg border border-neutral-200 p-4 ${className}`}>
      <h3 className="text-sm font-medium text-neutral-700 mb-4">Voting Status</h3>

      {/* Vote counts */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{summary.invest}</div>
          <div className="text-xs text-green-700">Invest</div>
          {showPercentage && (
            <div className="text-xs text-green-600 mt-1">
              {Math.round((summary.invest / summary.total) * 100)}%
            </div>
          )}
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{summary.pass}</div>
          <div className="text-xs text-red-700">Pass</div>
          {showPercentage && (
            <div className="text-xs text-red-600 mt-1">
              {Math.round((summary.pass / summary.total) * 100)}%
            </div>
          )}
        </div>
        <div className="text-center p-3 bg-neutral-50 rounded-lg">
          <div className="text-2xl font-bold text-neutral-600">{summary.undecided}</div>
          <div className="text-xs text-neutral-700">Pending</div>
          {showPercentage && (
            <div className="text-xs text-neutral-600 mt-1">
              {Math.round((summary.undecided / summary.total) * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-neutral-200 rounded-full overflow-hidden flex">
        {summary.invest > 0 && (
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(summary.invest / summary.total) * 100}%` }}
          />
        )}
        {summary.pass > 0 && (
          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${(summary.pass / summary.total) * 100}%` }}
          />
        )}
      </div>

      {/* Status text */}
      <p className="text-center text-xs text-neutral-500 mt-3">
        {summary.undecided > 0
          ? `${summary.undecided} investor${summary.undecided > 1 ? 's' : ''} still voting`
          : 'All votes cast'}
      </p>
    </div>
  )
}

// Detailed Vote List
interface VoteListProps {
  votes: VoteData[]
  showReasoning?: boolean
  showConfidence?: boolean
  className?: string
}

export function VoteList({
  votes,
  showReasoning = true,
  showConfidence = true,
  className = '',
}: VoteListProps) {
  const decisionConfig = {
    invest: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckIcon, iconColor: 'text-green-500', label: 'Invest' },
    pass: { bg: 'bg-red-50', border: 'border-red-200', icon: XIcon, iconColor: 'text-red-500', label: 'Pass' },
    undecided: { bg: 'bg-neutral-50', border: 'border-neutral-200', icon: MinusIcon, iconColor: 'text-neutral-500', label: 'Undecided' },
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {votes.map((vote) => {
        const config = decisionConfig[vote.decision]
        const Icon = config.icon

        return (
          <div
            key={vote.investorId}
            className={`${config.bg} ${config.border} border rounded-lg p-3 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${vote.decision === 'invest' ? 'bg-green-500' : vote.decision === 'pass' ? 'bg-red-500' : 'bg-neutral-400'} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-700">
                    {vote.investorName || vote.investorId}
                  </div>
                  <div className={`text-xs ${config.iconColor}`}>{config.label}</div>
                </div>
              </div>

              {showConfidence && (
                <div className="text-right">
                  <div className="text-xs text-neutral-500">Confidence</div>
                  <div className="text-sm font-medium text-neutral-700">{vote.confidence}%</div>
                </div>
              )}
            </div>

            {showReasoning && vote.reasoning && (
              <p className="text-xs text-neutral-600 mt-2 pl-10">{vote.reasoning}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Animated Vote Reveal
interface VoteRevealProps {
  vote: VoteData
  onComplete?: () => void
  className?: string
}

export function VoteReveal({ vote, onComplete, className = '' }: VoteRevealProps) {
  const [stage, setStage] = useState<'hidden' | 'revealing' | 'revealed'>('hidden')

  useEffect(() => {
    // Start reveal animation
    setStage('revealing')

    const timer = setTimeout(() => {
      setStage('revealed')
      onComplete?.()
    }, 1500)

    return () => clearTimeout(timer)
  }, [vote, onComplete])

  const decisionConfig = {
    invest: { bg: 'bg-green-500', label: 'INVEST', icon: CheckIcon },
    pass: { bg: 'bg-red-500', label: 'PASS', icon: XIcon },
    undecided: { bg: 'bg-neutral-400', label: 'UNDECIDED', icon: MinusIcon },
  }

  const config = decisionConfig[vote.decision]
  const Icon = config.icon

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Animated card flip effect */}
      <div
        className={`
          w-32 h-40 rounded-lg shadow-lg flex flex-col items-center justify-center transition-all duration-500
          ${stage === 'hidden' ? 'bg-neutral-800 scale-95' : ''}
          ${stage === 'revealing' ? 'bg-neutral-600 scale-110 animate-pulse' : ''}
          ${stage === 'revealed' ? `${config.bg} scale-100` : ''}
        `}
      >
        {stage === 'revealed' ? (
          <>
            <Icon className="w-12 h-12 text-white mb-2" />
            <div className="text-white font-bold text-lg">{config.label}</div>
          </>
        ) : (
          <div className="text-white text-2xl font-bold">?</div>
        )}
      </div>

      {/* Investor name */}
      <div className="mt-3 text-center">
        <div className="text-sm font-medium text-neutral-700">
          {vote.investorName || vote.investorId}
        </div>
        {stage === 'revealed' && (
          <div className="text-xs text-neutral-500 mt-1">
            Confidence: {vote.confidence}%
          </div>
        )}
      </div>
    </div>
  )
}

// Final Decision Display
interface FinalDecisionProps {
  decision: 'invest' | 'pass'
  votes: VoteData[]
  score?: number
  animated?: boolean
  className?: string
}

export function FinalDecision({
  decision,
  votes,
  score,
  animated = true,
  className = '',
}: FinalDecisionProps) {
  const [isVisible, setIsVisible] = useState(!animated)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [animated])

  const isInvest = decision === 'invest'
  const investCount = votes.filter((v) => v.decision === 'invest').length
  const passCount = votes.filter((v) => v.decision === 'pass').length

  return (
    <div
      className={`
        text-center py-8 rounded-xl transition-all duration-700
        ${isInvest ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        ${className}
      `}
    >
      {/* Icon */}
      <div className="mb-4">
        {isInvest ? (
          <svg className="w-16 h-16 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-16 h-16 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      {/* Decision text */}
      <h2 className="text-3xl font-bold text-white mb-2">
        {isInvest ? 'INVESTMENT DECISION' : 'PASS'}
      </h2>

      {/* Vote counts */}
      <div className="flex justify-center gap-6 text-white/80 text-sm mb-4">
        <span>{investCount} Invest</span>
        <span>|</span>
        <span>{passCount} Pass</span>
      </div>

      {/* Score */}
      {score !== undefined && (
        <div className="inline-block bg-white/20 rounded-full px-6 py-2">
          <span className="text-white font-bold text-xl">{score}/100</span>
          <span className="text-white/80 text-sm ml-2">Final Score</span>
        </div>
      )}
    </div>
  )
}

// Hook for managing votes
export function useVotes(totalVoters: number = 5) {
  const [votes, setVotes] = useState<VoteData[]>([])

  const addVote = (vote: VoteData) => {
    setVotes((prev) => {
      // Remove existing vote from same investor
      const filtered = prev.filter((v) => v.investorId !== vote.investorId)
      return [...filtered, vote]
    })
  }

  const clearVotes = () => {
    setVotes([])
  }

  const getSummary = (): VoteSummary => ({
    invest: votes.filter((v) => v.decision === 'invest').length,
    pass: votes.filter((v) => v.decision === 'pass').length,
    undecided: totalVoters - votes.length,
    total: totalVoters,
  })

  const getFinalDecision = (): 'invest' | 'pass' | null => {
    if (votes.length < totalVoters) return null
    const summary = getSummary()
    return summary.invest > summary.pass ? 'invest' : 'pass'
  }

  const isComplete = votes.length >= totalVoters

  return {
    votes,
    addVote,
    clearVotes,
    getSummary,
    getFinalDecision,
    isComplete,
  }
}

export default VoteSummaryCard
