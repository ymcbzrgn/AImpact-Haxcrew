'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiCall } from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'

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
  const [councilStarted, setCouncilStarted] = useState(false)

  const dialogEndRef = useRef<HTMLDivElement>(null)
  const speakerTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // WebSocket URL
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/${sessionId}`

  // Map speaker names to VC character IDs
  const mapSpeakerToCharacter = (speakerName: string): string => {
    const nameMap: Record<string, string> = {
      'Alex Chen': 'alex',
      'Sarah Williams': 'sarah',
      'Michael Park': 'michael',
      'Elena Rodriguez': 'elena',
      'David Kim': 'david',
    }
    return nameMap[speakerName] || speakerName.toLowerCase().replace(/\s+/g, '_')
  }

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: { type: string; payload: unknown; timestamp: number }) => {
    console.log('Council WebSocket message:', message)
    const data = message.payload as Record<string, unknown> || {}

    switch (message.type) {
      case 'connected':
        console.log('Council WebSocket connected')
        break

      case 'council_started':
        setCouncilStarted(true)
        break

      case 'council_message': {
        const speakerName = data.speaker as string || 'VC'
        const content = data.content as string || ''
        const messageType = data.type as string || 'discussion'
        const speakerId = mapSpeakerToCharacter(speakerName)
        const character = VC_CHARACTERS.find((c) => c.id === speakerId)

        // Set current speaker with animation
        setCurrentSpeaker(speakerId)

        // Clear previous timeout
        if (speakerTimeoutRef.current) {
          clearTimeout(speakerTimeoutRef.current)
        }

        // Add message to dialog
        const newMessage: DialogMessage = {
          id: Date.now().toString(),
          speaker_id: speakerId,
          speaker_name: character?.name || speakerName,
          content: content,
          timestamp: new Date(),
          type: messageType as 'discussion' | 'question' | 'vote',
        }
        setDialog((prev) => [...prev, newMessage])

        // If this is a vote, also add to votes list
        if (messageType === 'vote' && data.decision) {
          const voteDecision = data.decision as string
          setVotes((prev) => {
            if (prev.find(v => v.investor_id === speakerId)) return prev
            return [...prev, {
              investor_id: speakerId,
              decision: voteDecision === 'invest' ? 'invest' : 'pass',
              confidence: data.score as number || 50,
              reasoning: content,
            }]
          })
        }

        // Clear speaker after 1 second (faster)
        speakerTimeoutRef.current = setTimeout(() => setCurrentSpeaker(null), 1000)
        break
      }

      case 'council_vote': {
        const investorId = data.investor_id as string
        const decision = data.decision as 'invest' | 'pass' | 'undecided'
        const confidence = data.confidence as number || 70
        const reasoning = data.reasoning as string

        if (investorId) {
          const speakerId = mapSpeakerToCharacter(investorId)
          setVotes((prev) => {
            // Don't add duplicate votes
            if (prev.find(v => v.investor_id === speakerId)) return prev
            return [...prev, {
              investor_id: speakerId,
              decision: decision,
              confidence: confidence,
              reasoning: reasoning,
            }]
          })
        }
        break
      }

      case 'council_result': {
        // All votes are in, discussion is complete
        const finalVotes = data.votes as VoteData[]

        if (finalVotes && Array.isArray(finalVotes)) {
          setVotes(finalVotes.map(v => ({
            ...v,
            investor_id: mapSpeakerToCharacter(v.investor_id),
          })))
        }

        setIsDiscussionComplete(true)

        // Navigate to verdict after 3 seconds
        setTimeout(() => {
          router.push(`/verdict/${sessionId}`)
        }, 3000)
        break
      }

      case 'council_complete':
        setIsDiscussionComplete(true)
        break

      case 'error':
        console.error('Council WebSocket error:', data.message)
        setError(data.message || 'Connection error')
        break

      default:
        console.log('Unknown council message type:', message.type)
    }
  }, [router, sessionId])

  // WebSocket hook
  const {
    status: wsStatus,
    send: wsSend,
    connect: wsConnect,
    isConnected
  } = useWebSocket({
    url: wsUrl,
    onMessage: handleWebSocketMessage,
    onConnect: () => console.log('Council WebSocket connected'),
    onDisconnect: () => console.log('Council WebSocket disconnected'),
    onError: (e) => console.error('Council WebSocket error:', e),
    reconnect: true,
    reconnectAttempts: 10,      // 5'ten 10'a çıkarıldı
    reconnectInterval: 2000,    // 3000'den 2000ms'ye düşürüldü
    heartbeatInterval: 15000,   // 30000'den 15000ms'ye düşürüldü (daha sık ping)
  })

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
      } catch {
        setError('Connection error')
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      fetchSession()
    }
  }, [sessionId])

  // Connect WebSocket when session is loaded
  useEffect(() => {
    if (sessionData && !isConnected && wsStatus === 'disconnected') {
      wsConnect()
    }
  }, [sessionData, isConnected, wsStatus, wsConnect])

  // Start council discussion when connected
  useEffect(() => {
    if (isConnected && !councilStarted && !loading) {
      wsSend('start_council', {})
      setCouncilStarted(true)
    }
  }, [isConnected, councilStarted, loading, wsSend])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speakerTimeoutRef.current) {
        clearTimeout(speakerTimeoutRef.current)
      }
    }
  }, [])

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

          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-green-600' : wsStatus === 'connecting' ? 'text-amber-500' : 'text-red-500'}`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : wsStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
              {isConnected ? 'Connected' : wsStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </div>
            <span className="text-sm font-medium text-neutral-custom hidden sm:block">VC Council</span>
            <span className={`text-sm px-3 py-1 rounded-full ${
              isDiscussionComplete
                ? 'bg-green-100 text-green-700'
                : 'bg-purple-100 text-purple-700 animate-pulse'
            }`}>
              {isDiscussionComplete ? 'Complete' : 'In Progress'}
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
