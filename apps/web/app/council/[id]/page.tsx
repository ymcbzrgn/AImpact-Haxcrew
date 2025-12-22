'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiCall } from '@/lib/api'

// Types
interface VCCharacter {
  id: string
  name: string
  title: string
  avatar: string
  personality: string
  color: string
}

interface DialogMessage {
  id: string
  speaker_id: string
  speaker_name: string
  content: string
  timestamp: Date
  type: 'discussion' | 'question' | 'vote'
}

interface VoteData {
  investor_id: string
  decision: 'invest' | 'pass' | 'undecided'
  confidence: number
  reasoning?: string
}

interface SessionData {
  session_id: string
  status: string
  investor_mode: string
  deck_analysis?: {
    scores?: {
      overall_score?: number
    }
  }
}

// VC Characters
const VC_CHARACTERS: VCCharacter[] = [
  {
    id: 'alex',
    name: 'Alex Chen',
    title: 'Growth Partner',
    avatar: 'AC',
    personality: 'Data-driven, asks about metrics',
    color: 'bg-blue-500',
  },
  {
    id: 'sarah',
    name: 'Sarah Williams',
    title: 'Managing Partner',
    avatar: 'SW',
    personality: 'Strategic thinker, market focus',
    color: 'bg-purple-500',
  },
  {
    id: 'michael',
    name: 'Michael Park',
    title: 'Tech Partner',
    avatar: 'MP',
    personality: 'Technical depth, scalability',
    color: 'bg-green-500',
  },
  {
    id: 'elena',
    name: 'Elena Rodriguez',
    title: 'Operating Partner',
    avatar: 'ER',
    personality: 'Operations, team dynamics',
    color: 'bg-amber-500',
  },
  {
    id: 'david',
    name: 'David Kim',
    title: 'Seed Partner',
    avatar: 'DK',
    personality: 'Vision, founder-market fit',
    color: 'bg-red-500',
  },
]

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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

// VC Avatar Component with Speaking Animation
function VCAvatar({
  character,
  isSpeaking,
  vote,
  size = 'medium',
}: {
  character: VCCharacter
  isSpeaking: boolean
  vote?: VoteData
  size?: 'small' | 'medium' | 'large'
}) {
  const sizeClasses = {
    small: 'w-10 h-10 text-sm',
    medium: 'w-16 h-16 text-xl',
    large: 'w-24 h-24 text-3xl',
  }

  const ringSize = {
    small: 'ring-2',
    medium: 'ring-4',
    large: 'ring-4',
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} ${character.color} rounded-full flex items-center justify-center text-white font-bold transition-all ${
            isSpeaking ? `${ringSize[size]} ring-accent-custom animate-pulse` : ''
          }`}
        >
          {character.avatar}
        </div>
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            <div className="w-1.5 h-1.5 bg-accent-custom rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-accent-custom rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-accent-custom rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        {/* Vote indicator */}
        {vote && (
          <div
            className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
              vote.decision === 'invest'
                ? 'bg-green-500'
                : vote.decision === 'pass'
                ? 'bg-red-500'
                : 'bg-neutral-400'
            }`}
          >
            {vote.decision === 'invest' && <CheckIcon className="w-4 h-4 text-white" />}
            {vote.decision === 'pass' && <XIcon className="w-4 h-4 text-white" />}
            {vote.decision === 'undecided' && <MinusIcon className="w-4 h-4 text-white" />}
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-neutral-custom">{character.name}</div>
        <div className="text-xs text-neutral-custom-subdued">{character.title}</div>
      </div>
    </div>
  )
}

// Speech Bubble Component
function SpeechBubble({
  message,
  character,
  isLatest,
}: {
  message: DialogMessage
  character?: VCCharacter
  isLatest: boolean
}) {
  return (
    <div
      className={`flex gap-3 ${isLatest ? 'animate-fadeIn' : ''}`}
      style={{ animationDuration: '0.3s' }}
    >
      {/* Avatar */}
      {character && (
        <div
          className={`w-10 h-10 ${character.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
        >
          {character.avatar}
        </div>
      )}

      {/* Bubble */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-neutral-custom">
            {message.speaker_name}
          </span>
          <span className="text-xs text-neutral-custom-subdued">
            {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.type === 'vote' && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              Vote
            </span>
          )}
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
          <p className="text-sm text-neutral-custom">{message.content}</p>
        </div>
      </div>
    </div>
  )
}

// Vote Display Component
function VoteDisplay({ votes }: { votes: VoteData[] }) {
  const investCount = votes.filter((v) => v.decision === 'invest').length
  const passCount = votes.filter((v) => v.decision === 'pass').length
  const undecidedCount = votes.filter((v) => v.decision === 'undecided').length

  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Voting Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{investCount}</div>
            <div className="text-sm text-green-700">Invest</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{passCount}</div>
            <div className="text-sm text-red-700">Pass</div>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="text-3xl font-bold text-neutral-600">{undecidedCount}</div>
            <div className="text-sm text-neutral-700">Pending</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-3 bg-neutral-200 rounded-full overflow-hidden flex">
          {investCount > 0 && (
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(investCount / 5) * 100}%` }}
            />
          )}
          {passCount > 0 && (
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${(passCount / 5) * 100}%` }}
            />
          )}
        </div>

        <p className="text-center text-sm text-neutral-custom-subdued mt-3">
          {votes.length < 5
            ? `${5 - votes.length} investor${5 - votes.length > 1 ? 's' : ''} still voting`
            : 'All votes cast'}
        </p>
      </CardContent>
    </Card>
  )
}

// Main Component
export default function CouncilPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Council state
  const [dialog, setDialog] = useState<DialogMessage[]>([])
  const [votes, setVotes] = useState<VoteData[]>([])
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null)
  const [isDiscussionComplete, setIsDiscussionComplete] = useState(false)

  const dialogEndRef = useRef<HTMLDivElement>(null)

  // Fetch session data
  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await apiCall<SessionData>(`/api/session/${sessionId}`)
        if (response.success && response.data) {
          setSessionData(response.data)
        } else {
          setError(response.error?.message || 'Session not found')
        }
      } catch (err) {
        setError('Connection error')
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      fetchSession()
    }
  }, [sessionId])

  // Simulate council discussion
  useEffect(() => {
    if (loading || error) return

    const discussionScript: { speakerId: string; content: string; delay: number; type: 'discussion' | 'question' | 'vote' }[] = [
      { speakerId: 'sarah', content: 'This pitch looks interesting. What do you think about the market size?', delay: 1000, type: 'discussion' },
      { speakerId: 'alex', content: 'Looking at TAM, we see a $2.5B market. However, the SAM calculation seems a bit aggressive.', delay: 3000, type: 'discussion' },
      { speakerId: 'michael', content: 'Technically there\'s scalability potential. Their choice of microservices architecture is a good sign.', delay: 5000, type: 'discussion' },
      { speakerId: 'elena', content: 'The team is experienced but I\'d like more detail on the operational side.', delay: 7000, type: 'discussion' },
      { speakerId: 'david', content: 'Strong founder-market fit. The founders\' industry background is reassuring.', delay: 9000, type: 'discussion' },
      { speakerId: 'sarah', content: 'I\'m voting INVEST. Solid thesis for early stage.', delay: 12000, type: 'vote' },
      { speakerId: 'alex', content: 'Seeing the metrics, I say INVEST but we should be careful.', delay: 14000, type: 'vote' },
      { speakerId: 'michael', content: 'INVEST for the technical vision.', delay: 16000, type: 'vote' },
      { speakerId: 'elena', content: 'Considering operational risks, I\'m saying PASS this round.', delay: 18000, type: 'vote' },
      { speakerId: 'david', content: 'I trust the founder. INVEST.', delay: 20000, type: 'vote' },
    ]

    let messageIndex = 0
    const interval = setInterval(() => {
      if (messageIndex >= discussionScript.length) {
        setIsDiscussionComplete(true)
        clearInterval(interval)
        return
      }

      const script = discussionScript[messageIndex]
      const character = VC_CHARACTERS.find((c) => c.id === script.speakerId)

      // Set current speaker
      setCurrentSpeaker(script.speakerId)

      // Add message
      const newMessage: DialogMessage = {
        id: Date.now().toString(),
        speaker_id: script.speakerId,
        speaker_name: character?.name || 'Unknown',
        content: script.content,
        timestamp: new Date(),
        type: script.type,
      }
      setDialog((prev) => [...prev, newMessage])

      // Add vote if it's a vote message
      if (script.type === 'vote') {
        const isInvest = script.content.includes('INVEST')
        setVotes((prev) => [
          ...prev,
          {
            investor_id: script.speakerId,
            decision: isInvest ? 'invest' : 'pass',
            confidence: isInvest ? 75 : 60,
          },
        ])
      }

      // Clear speaker after a moment
      setTimeout(() => setCurrentSpeaker(null), 1500)

      messageIndex++
    }, 2500)

    return () => clearInterval(interval)
  }, [loading, error])

  // Auto-scroll dialog
  useEffect(() => {
    dialogEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [dialog])

  const handleGoToVerdict = () => {
    router.push(`/verdict/${sessionId}`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-12 h-12 text-accent-custom mx-auto mb-4" />
          <p className="text-neutral-custom-subdued">Preparing VC Council...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/upload">
              <Button variant="outline">Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/session/${sessionId}`}
              className="text-neutral-custom-subdued hover:text-neutral-custom text-sm"
            >
              &larr; Back to Pitch Room
            </Link>
            <div className="h-6 w-px bg-neutral-200" />
            <span className="text-lg font-bold text-neutral-custom">VC Council</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              Discussion {isDiscussionComplete ? 'Complete' : 'In Progress'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* VC Panel */}
        <Card className="bg-white mb-6">
          <CardContent className="p-6">
            <div className="flex justify-around items-start">
              {VC_CHARACTERS.map((character) => {
                const vote = votes.find((v) => v.investor_id === character.id)
                return (
                  <VCAvatar
                    key={character.id}
                    character={character}
                    isSpeaking={currentSpeaker === character.id}
                    vote={vote}
                    size="large"
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dialog Area */}
          <div className="lg:col-span-2">
            <Card className="bg-neutral-50 h-[500px] flex flex-col">
              <CardHeader className="border-b bg-white rounded-t-lg">
                <CardTitle className="text-lg">Council Discussion</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {dialog.length === 0 ? (
                  <div className="text-center text-neutral-custom-subdued py-8">
                    <Spinner className="w-8 h-8 mx-auto mb-4 text-accent-custom" />
                    <p>Council discussion starting...</p>
                  </div>
                ) : (
                  dialog.map((message, index) => (
                    <SpeechBubble
                      key={message.id}
                      message={message}
                      character={VC_CHARACTERS.find((c) => c.id === message.speaker_id)}
                      isLatest={index === dialog.length - 1}
                    />
                  ))
                )}
                <div ref={dialogEndRef} />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Vote Display */}
            <VoteDisplay votes={votes} />

            {/* Action */}
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {!isDiscussionComplete ? (
                    <div className="text-center">
                      <Spinner className="w-6 h-6 mx-auto mb-2 text-accent-custom" />
                      <p className="text-sm text-neutral-custom-subdued">
                        Investors are discussing...
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-neutral-custom-subdued text-center">
                        Discussion complete. You can view the results.
                      </p>
                      <Button
                        onClick={handleGoToVerdict}
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        See Results
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="text-sm text-neutral-custom-subdued">
                  <div className="flex justify-between mb-2">
                    <span>Session ID:</span>
                    <span className="font-mono text-xs">{sessionId?.slice(0, 12)}...</span>
                  </div>
                  {sessionData?.deck_analysis?.scores?.overall_score && (
                    <div className="flex justify-between">
                      <span>Deck Score:</span>
                      <span className="font-bold text-accent-custom">
                        {sessionData.deck_analysis.scores.overall_score}/100
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CSS for fade-in animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </main>
  )
}
