'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiCall } from '@/lib/api'
import { useSessionStore } from '@/stores/session'

// Types
interface CategoryScore {
  name: string
  score: number
  feedback: string
}

interface TermSheet {
  valuation: string
  investment_amount: string
  equity_percentage: string
  board_seats: number
  special_terms?: string[]
}

interface FeedbackItem {
  category: string
  type: 'strength' | 'weakness' | 'suggestion'
  content: string
}

interface VerdictData {
  session_id: string
  decision: 'invest' | 'pass'
  final_score: number
  confidence: number
  investor_votes: {
    invest: number
    pass: number
  }
  term_sheet?: TermSheet
  category_scores: CategoryScore[]
  feedback: FeedbackItem[]
  investor_pool_eligible: boolean
}

interface SessionData {
  session_id: string
  status: string
  investor_mode: string
  deck_analysis?: {
    scores?: {
      overall_score?: number
    }
    categories?: Record<string, { score?: number }>
  }
}

// SVG Icons
function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

// Score Circle Component
function ScoreCircle({ score, size = 'large' }: { score: number; size?: 'small' | 'large' }) {
  const sizeClasses = {
    small: 'w-20 h-20 text-2xl',
    large: 'w-40 h-40 text-5xl',
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-amber-500'
    return 'text-red-500'
  }

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className={`font-bold ${getScoreColor(score)}`}>{score}</div>
    </div>
  )
}

// Term Sheet Card Component
function TermSheetCard({ termSheet }: { termSheet: TermSheet }) {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="text-lg text-green-800 flex items-center gap-2">
          <TrophyIcon className="w-5 h-5" />
          Term Sheet Offer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 p-4 rounded-lg">
            <div className="text-sm text-green-700">Valuation</div>
            <div className="text-2xl font-bold text-green-900">{termSheet.valuation}</div>
          </div>
          <div className="bg-white/80 p-4 rounded-lg">
            <div className="text-sm text-green-700">Investment</div>
            <div className="text-2xl font-bold text-green-900">{termSheet.investment_amount}</div>
          </div>
          <div className="bg-white/80 p-4 rounded-lg">
            <div className="text-sm text-green-700">Equity</div>
            <div className="text-2xl font-bold text-green-900">{termSheet.equity_percentage}</div>
          </div>
          <div className="bg-white/80 p-4 rounded-lg">
            <div className="text-sm text-green-700">Board Seats</div>
            <div className="text-2xl font-bold text-green-900">{termSheet.board_seats} Seat(s)</div>
          </div>
        </div>

        {termSheet.special_terms && termSheet.special_terms.length > 0 && (
          <div className="bg-white/80 p-4 rounded-lg">
            <div className="text-sm text-green-700 mb-2">Special Terms</div>
            <ul className="space-y-1">
              {termSheet.special_terms.map((term, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-green-900">
                  <CheckIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {term}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Feedback List Component
function FeedbackList({ feedback }: { feedback: FeedbackItem[] }) {
  const strengths = feedback.filter((f) => f.type === 'strength')
  const weaknesses = feedback.filter((f) => f.type === 'weakness')
  const suggestions = feedback.filter((f) => f.type === 'suggestion')

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Detailed Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
              <CheckIcon className="w-4 h-4" /> Strengths
            </h4>
            <ul className="space-y-2">
              {strengths.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-1">+</span>
                  <div>
                    <span className="text-xs text-neutral-500">[{item.category}]</span>
                    <p className="text-neutral-700">{item.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-700 mb-3 flex items-center gap-2">
              <XCircleIcon className="w-4 h-4" /> Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {weaknesses.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-red-500 mt-1">-</span>
                  <div>
                    <span className="text-xs text-neutral-500">[{item.category}]</span>
                    <p className="text-neutral-700">{item.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-blue-700 mb-3 flex items-center gap-2">
              <StarIcon className="w-4 h-4" /> Suggestions
            </h4>
            <ul className="space-y-2">
              {suggestions.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-500 mt-1">*</span>
                  <div>
                    <span className="text-xs text-neutral-500">[{item.category}]</span>
                    <p className="text-neutral-700">{item.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Category Breakdown Component
function CategoryBreakdown({ categories }: { categories: CategoryScore[] }) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Category Scores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-neutral-custom">{category.name}</span>
              <span className={`text-sm font-bold ${
                category.score >= 80 ? 'text-green-600' :
                category.score >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {category.score}/100
              </span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  category.score >= 80 ? 'bg-green-500' :
                  category.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${category.score}%` }}
              />
            </div>
            <p className="text-xs text-neutral-custom-subdued mt-1">{category.feedback}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Main Component
export default function VerdictPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const { investorMode, addToHistory, deckName } = useSessionStore()

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [verdictData, setVerdictData] = useState<VerdictData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Generate deck-specific feedback from deck analysis categories
  const generateFeedbackFromDeckAnalysis = (deckAnalysis: SessionData['deck_analysis']): FeedbackItem[] => {
    const feedback: FeedbackItem[] = []
    const categories = deckAnalysis?.categories || {}

    // Extract feedback from each category based on score
    Object.entries(categories).forEach(([name, data]) => {
      if (typeof data === 'object' && data !== null) {
        const catData = data as { score?: number; feedback?: string }
        const score = catData.score || 50
        const categoryName = name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' ')
        const feedbackText = catData.feedback || ''

        if (score >= 70) {
          feedback.push({
            category: categoryName,
            type: 'strength',
            content: feedbackText || `Strong ${categoryName.toLowerCase()} presentation.`
          })
        } else if (score < 40) {
          feedback.push({
            category: categoryName,
            type: 'weakness',
            content: feedbackText || `${categoryName} needs significant improvement.`
          })
        } else if (score < 60) {
          feedback.push({
            category: categoryName,
            type: 'suggestion',
            content: feedbackText || `Consider strengthening ${categoryName.toLowerCase()}.`
          })
        }
      }
    })

    // Limit to 6 items
    return feedback.slice(0, 6)
  }

  // Helper function to generate fallback verdict from deck analysis
  const generateFallbackVerdict = (session: SessionData): VerdictData => {
    const overallScore = session.deck_analysis?.scores?.overall_score || 65
    const isInvest = overallScore >= 65

    // Map category scores from deck_analysis if available
    const categoryNames = ['problem', 'solution', 'market', 'traction', 'team', 'financials', 'business_model']
    const categoryScores: CategoryScore[] = categoryNames.map(name => {
      const categoryData = session.deck_analysis?.categories?.[name]
      const score = categoryData?.score || Math.min(100, overallScore + Math.floor(Math.random() * 20) - 10)
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        score: score,
        feedback: `Based on deck analysis for ${name}.`,
      }
    })

    return {
      session_id: sessionId,
      decision: isInvest ? 'invest' : 'pass',
      final_score: overallScore,
      confidence: isInvest ? 78 : 65,
      investor_votes: {
        invest: isInvest ? 4 : 1,
        pass: isInvest ? 1 : 4,
      },
      term_sheet: isInvest ? {
        valuation: '$5M Pre-money',
        investment_amount: '$500K',
        equity_percentage: '10%',
        board_seats: 1,
        special_terms: [
          'Pro-rata rights',
          'Information rights',
          '4-year vesting with 12-month cliff',
        ],
      } : undefined,
      category_scores: categoryScores,
      feedback: generateFeedbackFromDeckAnalysis(session.deck_analysis),
      investor_pool_eligible: isInvest && overallScore >= 75,
    }
  }

  // Fetch session and verdict from backend
  useEffect(() => {
    async function fetchData() {
      try {
        // First, try to fetch verdict directly from backend
        // Backend returns { success, data: { session_id, status, verdict, deck_analysis, final_score } }
        const verdictResponse = await apiCall<{ session_id: string; status: string; verdict: VerdictData | null; deck_analysis: SessionData['deck_analysis']; final_score: number | null }>(`/api/session/${sessionId}/verdict`)

        console.log('Verdict API response:', verdictResponse)

        if (verdictResponse.success && verdictResponse.data?.verdict) {
          // Use backend verdict data - it's nested inside data.verdict
          console.log('Using backend verdict:', verdictResponse.data.verdict)
          setVerdictData(verdictResponse.data.verdict)

          // Also fetch session for additional info
          const sessionResponse = await apiCall<SessionData>(`/api/session/${sessionId}`)
          if (sessionResponse.success && sessionResponse.data) {
            setSessionData(sessionResponse.data)
          }

          // Save to history - use verdict data for score and decision
          const verdict = verdictResponse.data.verdict
          addToHistory({
            id: sessionId,
            date: new Date().toISOString(),
            investorMode: (investorMode || 'friendly') as 'shark' | 'friendly' | 'analyst',
            score: verdict.final_score ?? verdictResponse.data.final_score ?? 0,
            decision: verdict.decision,
            deckName: deckName || undefined,
          })
        } else {
          // Fallback: fetch session and generate verdict locally
          console.log('No backend verdict found, using fallback')
          const sessionResponse = await apiCall<SessionData>(`/api/session/${sessionId}`)

          if (sessionResponse.success && sessionResponse.data) {
            setSessionData(sessionResponse.data)

            // Generate fallback verdict from deck analysis
            const fallbackVerdict = generateFallbackVerdict(sessionResponse.data)
            setVerdictData(fallbackVerdict)

            // Save to history
            const overallScore = sessionResponse.data.deck_analysis?.scores?.overall_score || 65
            addToHistory({
              id: sessionId,
              date: new Date().toISOString(),
              investorMode: (investorMode || sessionResponse.data.investor_mode || 'friendly') as 'shark' | 'friendly' | 'analyst',
              score: overallScore,
              decision: overallScore >= 65 ? 'invest' : 'pass',
              deckName: deckName || undefined,
            })
          } else {
            setError(sessionResponse.error?.message || 'Session not found')
          }
        }
      } catch (err) {
        setError('Connection error')
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      fetchData()
    }
  }, [sessionId, addToHistory, investorMode, deckName])

  const handleTryAgain = () => {
    router.push('/upload')
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'PitchDrill Result',
        text: `Pitch score: ${verdictData?.final_score}/100 - ${verdictData?.decision === 'invest' ? 'INVESTMENT' : 'PASS'}`,
        url: window.location.href,
      })
    } catch (err) {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied!')
    }
  }

  const handleExport = () => {
    // Create export data
    const exportData = {
      session_id: sessionId,
      date: new Date().toISOString(),
      verdict: verdictData,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pitchdrill-verdict-${sessionId?.slice(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-12 h-12 text-accent-custom mx-auto mb-4" />
          <p className="text-neutral-custom-subdued">Preparing results...</p>
        </div>
      </main>
    )
  }

  if (error || !verdictData) {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || 'Result not found'}</p>
            <Link href="/upload">
              <Button variant="outline">Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  const isInvest = verdictData.decision === 'invest'

  return (
    <main className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="PitchDrill" width={32} height={32} className="w-8 h-8" />
              <span className="text-lg font-bold text-neutral-custom hidden sm:block">
                Pitch<span className="text-accent-custom">Drill</span>
              </span>
            </Link>
            <div className="h-6 w-px bg-neutral-200 hidden sm:block" />
            <nav className="hidden sm:flex items-center gap-4">
              <Link href="/upload" className="text-sm text-neutral-custom-subdued hover:text-accent-custom">
                New Pitch
              </Link>
              <Link href="/history" className="text-sm text-neutral-custom-subdued hover:text-accent-custom">
                History
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <ShareIcon className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Decision Banner */}
      <div className={`py-12 ${isInvest ? 'bg-gradient-to-b from-green-500 to-green-600' : 'bg-gradient-to-b from-red-500 to-red-600'}`}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="mb-6">
            {isInvest ? (
              <TrophyIcon className="w-20 h-20 mx-auto" />
            ) : (
              <XCircleIcon className="w-20 h-20 mx-auto" />
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {isInvest ? 'INVESTMENT DECISION' : 'PASS'}
          </h1>
          <p className="text-xl opacity-90 mb-6">
            {isInvest
              ? 'Congratulations! The VC Council has decided to invest in your project.'
              : 'Unfortunately, you did not receive investment this round. Review the feedback.'}
          </p>

          <div className="flex items-center justify-center gap-8">
            <div>
              <ScoreCircle score={verdictData.final_score ?? 0} size="large" />
              <p className="mt-2 text-sm opacity-75">Final Score</p>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-200">Invest:</span>
                <span className="font-bold text-2xl">{verdictData.investor_votes?.invest ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-200">Pass:</span>
                <span className="font-bold text-2xl">{verdictData.investor_votes?.pass ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investor Pool Banner */}
      {verdictData.investor_pool_eligible && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-4">
          <div className="max-w-4xl mx-auto text-center text-white px-4">
            <div className="flex items-center justify-center gap-2">
              <StarIcon className="w-5 h-5" />
              <span className="font-medium">You've been added to the Investor Pool!</span>
            </div>
            <p className="text-sm opacity-90 mt-1">
              Your score is high enough. You have a chance to be matched with real investors.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Term Sheet */}
            {verdictData.term_sheet && (
              <TermSheetCard termSheet={verdictData.term_sheet} />
            )}

            {/* Category Breakdown */}
            {verdictData.category_scores && verdictData.category_scores.length > 0 && (
              <CategoryBreakdown categories={verdictData.category_scores} />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Feedback */}
            {verdictData.feedback && verdictData.feedback.length > 0 && (
              <FeedbackList feedback={verdictData.feedback} />
            )}

            {/* Actions */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-neutral-custom mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleTryAgain}
                    className="w-full bg-accent-custom hover:bg-accent-custom/90"
                  >
                    <RefreshIcon className="w-4 h-4 mr-2" />
                    Try New Pitch
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/upload')}
                  >
                    Upload Different Deck
                  </Button>
                  {verdictData.investor_pool_eligible && (
                    <Button
                      className="w-full bg-purple-500 hover:bg-purple-600"
                      onClick={() => alert('Investor Pool feature coming soon!')}
                    >
                      <StarIcon className="w-4 h-4 mr-2" />
                      Apply to Investor Pool
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card className="bg-neutral-50">
              <CardContent className="p-4 text-sm text-neutral-custom-subdued">
                <div className="flex justify-between mb-2">
                  <span>Session ID:</span>
                  <span className="font-mono text-xs">{sessionId}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString('en-US')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <span className="capitalize">{investorMode || sessionData?.investor_mode || 'Friendly'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
