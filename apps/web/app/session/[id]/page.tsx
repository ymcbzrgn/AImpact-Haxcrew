'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSessionStore } from '@/stores/session'
import { apiCall } from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useAudio } from '@/hooks/useAudio'

// Types
interface SlideData {
  slide_number: number
  image_url?: string
  image_base64?: string
  text_content?: string
  content?: string
}

interface SessionData {
  session_id: string
  status: string
  investor_mode: string
  current_phase?: 'pitch' | 'qa' | 'council' | 'verdict'
  current_slide?: number
  total_slides?: number
  slides?: SlideData[]
  slide_contents?: Array<{
    slide_number: number
    content?: string
    image_base64?: string
  }>
  deck_analysis?: {
    scores?: {
      overall_score?: number
    }
    executive_summary?: string
  }
  time_remaining?: number
}

interface Message {
  id: string
  role: 'user' | 'investor'
  content: string
  timestamp: Date
  investor_name?: string
}

interface RealtimeNote {
  note: string
  type: string
  timestamp: number
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

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function MicOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function WifiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  )
}

function WifiOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  )
}

function VideoOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

// UserIcon removed - not used

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

// Phase labels
const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  pitch: { label: 'Pitch', color: 'bg-blue-500' },
  qa: { label: 'Q&A', color: 'bg-amber-500' },
  council: { label: 'VC Council', color: 'bg-purple-500' },
  verdict: { label: 'Result', color: 'bg-green-500' },
}

const MODE_LABELS: Record<string, string> = {
  shark: 'Shark Mode',
  friendly: 'Friendly Mode',
  analyst: 'Analyst Mode',
}

// Timer Component
function Timer({
  initialTime,
  isRunning,
  onTimeEnd
}: {
  initialTime: number
  isRunning: boolean
  onTimeEnd?: () => void
}) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const onTimeEndRef = useRef(onTimeEnd)

  // Update ref when callback changes
  useEffect(() => {
    onTimeEndRef.current = onTimeEnd
  }, [onTimeEnd])

  // Reset when initialTime changes
  useEffect(() => {
    setTimeLeft(initialTime)
  }, [initialTime])

  // Timer logic - only depends on isRunning
  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeEndRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isLow = timeLeft < 60

  return (
    <div className={`font-mono text-2xl font-bold ${isLow ? 'text-red-500 animate-pulse' : 'text-neutral-custom'}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}

// Audio Visualizer Component
function AudioVisualizer({ level, isRecording }: { level: number; isRecording: boolean }) {
  const bars = 5
  // Use a stable pattern based on bar index, modulated by audio level
  const getBarHeight = (index: number) => {
    if (!isRecording) return 4
    // Create wave-like pattern that responds to audio level
    const basePattern = [0.6, 0.8, 1.0, 0.8, 0.6]
    const normalizedLevel = Math.min(1, Math.max(0, level))
    // Add some variation based on level
    const height = 4 + (normalizedLevel * 28 * basePattern[index])
    return Math.max(4, height)
  }

  return (
    <div className="flex items-center gap-1">
      {/* Recording indicator dot */}
      {isRecording && (
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1" />
      )}
      <div className="flex items-end gap-1 h-8">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-100 ${
              isRecording ? 'bg-red-500' : 'bg-neutral-300'
            }`}
            style={{ height: `${getBarHeight(i)}px` }}
          />
        ))}
      </div>
    </div>
  )
}

// Slide Preview Component
function SlidePreview({
  slides,
  currentSlide,
  onSlideSelect
}: {
  slides: SlideData[]
  currentSlide: number
  onSlideSelect: (index: number) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto p-2 bg-neutral-100 rounded-lg">
      {slides.map((slide, index) => (
        <button
          key={index}
          onClick={() => onSlideSelect(index)}
          className={`flex-shrink-0 w-20 h-14 rounded border-2 transition-all ${
            currentSlide === index
              ? 'border-accent-custom ring-2 ring-accent-custom/30'
              : 'border-transparent hover:border-neutral-300'
          }`}
        >
          {slide.image_base64 ? (
            <img
              src={`data:image/png;base64,${slide.image_base64}`}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="w-full h-full bg-white rounded flex items-center justify-center text-xs text-neutral-400">
              {index + 1}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

// Main Component
export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const { investorMode } = useSessionStore()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pitch room state
  const [currentPhase, setCurrentPhase] = useState<'pitch' | 'qa' | 'council' | 'verdict'>('pitch')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isMicOn, setIsMicOn] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Q&A state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Realtime notes state
  const [realtimeNotes, setRealtimeNotes] = useState<RealtimeNote[]>([])

  // Slide loading state
  const [slidesLoading, setSlidesLoading] = useState(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // AI Audio playback
  const audioQueueRef = useRef<string[]>([])
  const isPlayingRef = useRef(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)

  // Mock slides for demo
  const mockSlides: SlideData[] = Array.from({ length: 10 }, (_, i) => ({
    slide_number: i + 1,
    text_content: `Slide ${i + 1}`,
  }))

  // WebSocket URL - Use correct backend format
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/${sessionId}`

  // Play audio from queue - defined before handleWebSocketMessage since it's used there
  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return

    isPlayingRef.current = true
    setIsAISpeaking(true)

    const audioData = audioQueueRef.current.shift()
    if (audioData) {
      try {
        const audio = new Audio(`data:audio/wav;base64,${audioData}`)
        audio.onended = () => {
          isPlayingRef.current = false
          setIsAISpeaking(false)
          // Note: We can't call playNextAudio here directly due to closure, handled separately
        }
        audio.onerror = () => {
          isPlayingRef.current = false
          setIsAISpeaking(false)
        }
        await audio.play()
      } catch {
        console.error('Error playing audio')
        isPlayingRef.current = false
        setIsAISpeaking(false)
      }
    }
  }, [])

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: { type: string; payload: unknown; timestamp: number }) => {
    console.log('WebSocket message received:', message)
    const data = message.payload as Record<string, unknown> || {}

    switch (message.type) {
      case 'connected':
        console.log('WebSocket connected to session')
        break

      case 'reconnected':
        console.log('WebSocket reconnected')
        break

      case 'phase_change':
        const newPhase = (data.phase as string || 'pitch') as 'pitch' | 'qa' | 'council' | 'verdict'
        setCurrentPhase(newPhase)
        if (newPhase === 'qa') {
          setIsTimerRunning(false)
        }
        break

      case 'realtime_note':
        const note: RealtimeNote = {
          note: data.note as string || '',
          type: data.type as string || 'coaching',
          timestamp: data.timestamp as number || Date.now(),
        }
        setRealtimeNotes(prev => [...prev.slice(-9), note]) // Keep last 10 notes
        break

      case 'ai_speaking':
        const audioData = data.audio as string
        if (audioData) {
          audioQueueRef.current.push(audioData)
          playNextAudio()
        }
        break

      case 'qa_question':
        const question = data.question as string || ''
        const investorName = data.investor_name as string || 'VC Panel'
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'investor',
          content: question,
          timestamp: new Date(),
          investor_name: investorName,
        }])
        break

      case 'qa_complete':
        console.log('Q&A complete')
        // Automatically navigate to council after a short delay
        setTimeout(() => {
          router.push(`/council/${sessionId}`)
        }, 2000)
        break

      case 'council_result':
        // Council finished, go to verdict
        setTimeout(() => {
          router.push(`/verdict/${sessionId}`)
        }, 2000)
        break

      case 'session_complete':
        router.push(`/verdict/${sessionId}`)
        break

      case 'error':
        console.error('WebSocket error:', data.message)
        break

      default:
        console.log('Unknown message type:', message.type)
    }
  }, [router, sessionId, playNextAudio])

  // WebSocket hook
  const {
    status: wsStatus,
    send: wsSend,
    connect: wsConnect,
    isConnected
  } = useWebSocket({
    url: wsUrl,
    onMessage: handleWebSocketMessage,
    onConnect: () => console.log('WebSocket connected'),
    onDisconnect: () => console.log('WebSocket disconnected'),
    onError: (e) => console.error('WebSocket error:', e),
    reconnect: true,
    reconnectAttempts: 5,
  })

  // Audio hook for recording
  const {
    audioLevel,
    startRecording,
    stopRecording
  } = useAudio({
    onAudioChunk: (chunk: Blob) => {
      // Convert blob to base64 and send via WebSocket
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1]
        if (base64 && isConnected) {
          wsSend('audio_chunk', { audio: base64, timestamp: Date.now() })
        }
      }
      reader.readAsDataURL(chunk)
    },
    chunkInterval: 500, // Send chunks every 500ms
  })

  // Fetch session data and connect WebSocket
  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await apiCall<SessionData>(`/api/session/${sessionId}`)
        if (response.success && response.data) {
          setSessionData(response.data)
          if (response.data.current_phase) {
            setCurrentPhase(response.data.current_phase)
          }
          if (response.data.current_slide !== undefined) {
            setCurrentSlide(response.data.current_slide)
          }
          // Connect to WebSocket after session is loaded
          wsConnect()

          // If slides aren't ready yet, start polling
          if (!response.data.slide_contents || response.data.slide_contents.length === 0) {
            setSlidesLoading(true)
            pollForSlides()
          }
        } else {
          setError(response.error?.message || 'Session not found')
        }
      } catch {
        setError('Connection error')
      } finally {
        setLoading(false)
      }
    }

    // Poll for slide_contents until they're available
    async function pollForSlides() {
      let attempts = 0
      const maxAttempts = 30 // Poll for up to 30 seconds

      const poll = async () => {
        attempts++
        try {
          const response = await apiCall<SessionData>(`/api/session/${sessionId}`)
          if (response.success && response.data) {
            if (response.data.slide_contents && response.data.slide_contents.length > 0) {
              // Slides are ready!
              setSessionData(response.data)
              setSlidesLoading(false)
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current)
                pollIntervalRef.current = null
              }
            } else if (attempts >= maxAttempts) {
              // Give up after max attempts
              setSlidesLoading(false)
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current)
                pollIntervalRef.current = null
              }
            }
          }
        } catch {
          console.error('Error polling for slides')
        }
      }

      pollIntervalRef.current = setInterval(poll, 1000)
    }

    if (sessionId) {
      fetchSession()
    }

    // Cleanup polling on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [sessionId, wsConnect])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1))
  }

  const handleNextSlide = () => {
    const totalSlides = sessionData?.slides?.length || mockSlides.length
    setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))
  }

  const handleToggleMic = async () => {
    if (!isMicOn) {
      await startRecording()
      setIsMicOn(true)
    } else {
      stopRecording()
      setIsMicOn(false)
    }
  }

  const handleToggleCamera = async () => {
    if (!isCameraOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        setCameraStream(stream)
        setIsCameraOn(true)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        console.error('Camera permission denied')
      }
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
        setCameraStream(null)
      }
      setIsCameraOn(false)
    }
  }

  // Connect camera stream to video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
      stopRecording()
    }
  }, [cameraStream, stopRecording])

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])

    // Send answer to backend
    if (isConnected) {
      wsSend('answer_complete', { answer: inputMessage, duration: 0 })
    }

    setInputMessage('')
  }

  const handleStartPitch = async () => {
    setIsTimerRunning(true)
    setCurrentPhase('pitch')
    // Start microphone recording when pitch starts
    if (!isMicOn) {
      await startRecording()
      setIsMicOn(true)
    }
  }

  const handleEndPitch = () => {
    setIsTimerRunning(false)
    // Stop microphone recording
    if (isMicOn) {
      stopRecording()
      setIsMicOn(false)
    }
    // Send end_pitch event to backend
    if (isConnected) {
      wsSend('end_pitch', {})
    }
    setCurrentPhase('qa')
    // Start Q&A
    if (isConnected) {
      wsSend('start_qa', {})
    }
  }

  const handleGoToCouncil = () => {
    // Send start_council event to backend
    if (isConnected) {
      wsSend('start_council', {})
    }
    router.push(`/council/${sessionId}`)
  }

  const handleGoToVerdict = () => {
    router.push(`/verdict/${sessionId}`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-12 h-12 text-accent-custom mx-auto mb-4" />
          <p className="text-neutral-custom-subdued">Preparing pitch room...</p>
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

  const mode = investorMode || sessionData?.investor_mode || 'friendly'
  const overallScore = sessionData?.deck_analysis?.scores?.overall_score
  // Map slide_contents to slides format
  const slides: SlideData[] = sessionData?.slide_contents?.length
    ? sessionData.slide_contents.map((s: { slide_number: number; content?: string; image_base64?: string }) => ({
        slide_number: s.slide_number,
        content: s.content,
        image_base64: s.image_base64,
      }))
    : mockSlides
  const totalSlides = slides.length

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

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-green-600' : wsStatus === 'connecting' ? 'text-amber-500' : 'text-red-500'}`}>
              {isConnected ? <WifiIcon className="w-4 h-4" /> : <WifiOffIcon className="w-4 h-4" />}
              {isConnected ? 'Connected' : wsStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </div>

            {/* AI Speaking Indicator */}
            {isAISpeaking && (
              <div className="flex items-center gap-2 text-sm text-purple-600 animate-pulse">
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-ping" />
                AI Speaking
              </div>
            )}

            {/* Mode Badge */}
            <span className="text-sm font-normal bg-accent-custom/10 text-accent-custom px-3 py-1 rounded-full">
              {MODE_LABELS[mode] || mode}
            </span>

            {/* Score Badge */}
            {overallScore && (
              <span className="text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                Score: {overallScore}/100
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Phase Indicator */}
      <div className="bg-white border-b border-neutral-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          {Object.entries(PHASE_LABELS).map(([key, value], index) => (
            <div key={key} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentPhase === key
                    ? `${value.color} text-white`
                    : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                {value.label}
              </div>
              {index < Object.keys(PHASE_LABELS).length - 1 && (
                <div className="w-8 h-0.5 bg-neutral-200 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Panel - Slide Preview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Slide View */}
          <Card className="bg-white">
            <CardContent className="p-0">
              <div className="aspect-video bg-neutral-900 rounded-t-lg flex items-center justify-center relative">
                {slidesLoading ? (
                  <div className="text-white text-center">
                    <Spinner className="w-12 h-12 text-accent-custom mx-auto mb-4" />
                    <div className="text-neutral-400">Loading slides...</div>
                    <div className="text-xs text-neutral-500 mt-2">Analyzing your deck</div>
                  </div>
                ) : slides[currentSlide]?.image_base64 ? (
                  <img
                    src={`data:image/png;base64,${slides[currentSlide].image_base64}`}
                    alt={`Slide ${currentSlide + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-white text-center">
                    <div className="text-6xl font-bold mb-4">{currentSlide + 1}</div>
                    <div className="text-neutral-400">Slide {currentSlide + 1} / {totalSlides}</div>
                  </div>
                )}

                {/* Slide Navigation Overlay */}
                <button
                  onClick={handlePrevSlide}
                  disabled={currentSlide === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextSlide}
                  disabled={currentSlide === totalSlides - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>

                {/* Current Slide Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                  {currentSlide + 1} / {totalSlides}
                </div>
              </div>

              {/* Slide Thumbnails */}
              <div className="p-4">
                <SlidePreview
                  slides={slides}
                  currentSlide={currentSlide}
                  onSlideSelect={setCurrentSlide}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media Controls */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Microphone Toggle */}
                  <button
                    onClick={handleToggleMic}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isMicOn
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-600'
                    }`}
                    title={isMicOn ? 'Turn off microphone' : 'Turn on microphone'}
                  >
                    {isMicOn ? <MicIcon className="w-6 h-6" /> : <MicOffIcon className="w-6 h-6" />}
                  </button>

                  {/* Camera Toggle */}
                  <button
                    onClick={handleToggleCamera}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCameraOn
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-600'
                    }`}
                    title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                  >
                    {isCameraOn ? <VideoIcon className="w-6 h-6" /> : <VideoOffIcon className="w-6 h-6" />}
                  </button>

                  <div>
                    <div className="text-sm font-medium text-neutral-custom">
                      {isMicOn && isCameraOn ? 'Mic & Camera On' :
                       isMicOn ? 'Microphone On' :
                       isCameraOn ? 'Camera On' : 'Media Off'}
                    </div>
                    <div className="text-xs text-neutral-custom-subdued">
                      {isMicOn ? 'Audio streaming to AI...' : 'Enable mic to pitch'}
                    </div>
                  </div>
                  <AudioVisualizer level={audioLevel} isRecording={isMicOn} />
                </div>

                <div className="flex items-center gap-4">
                  <Timer
                    initialTime={sessionData?.time_remaining || 300}
                    isRunning={isTimerRunning}
                    onTimeEnd={handleEndPitch}
                  />
                  <button
                    onClick={isTimerRunning ? handleEndPitch : handleStartPitch}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isTimerRunning
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-accent-custom hover:bg-accent-custom/90 text-white'
                    }`}
                  >
                    {isTimerRunning ? (
                      <span className="flex items-center gap-2">
                        <PauseIcon className="w-4 h-4" /> End Pitch
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <PlayIcon className="w-4 h-4" /> Start
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Realtime Notes Panel */}
          {realtimeNotes.length > 0 && (
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <NoteIcon className="w-4 h-4" />
                  AI Coaching Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {realtimeNotes.map((note, index) => (
                    <div
                      key={index}
                      className="text-sm p-2 bg-accent-custom/5 border-l-2 border-accent-custom rounded"
                    >
                      {note.note}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Camera Preview */}
          {isCameraOn && (
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <VideoIcon className="w-4 h-4" />
                  Camera Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="relative aspect-video bg-neutral-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    You
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Q&A / Chat */}
        <div className="space-y-4">
          <Card className="bg-white h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Q&A</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  currentPhase === 'qa' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {currentPhase === 'qa' ? 'Active' : 'Waiting'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-neutral-custom-subdued py-8">
                    <p>No messages yet.</p>
                    <p className="text-sm mt-2">Questions will come after you complete your pitch.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-accent-custom text-white'
                            : 'bg-neutral-100 text-neutral-custom'
                        }`}
                      >
                        {message.role === 'investor' && message.investor_name && (
                          <div className="text-xs font-medium mb-1 text-accent-custom">
                            {message.investor_name}
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your answer..."
                    className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-custom/50"
                    disabled={currentPhase !== 'qa'}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || currentPhase !== 'qa'}
                    className="bg-accent-custom hover:bg-accent-custom/90"
                  >
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase Actions */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="space-y-3">
                {currentPhase === 'pitch' && (
                  <p className="text-sm text-neutral-custom-subdued text-center">
                    Present your pitch. When time runs out, you&apos;ll move to Q&A.
                  </p>
                )}
                {currentPhase === 'qa' && (
                  <>
                    <p className="text-sm text-neutral-custom-subdued text-center">
                      Answer investor questions.
                    </p>
                    <Button
                      onClick={handleGoToCouncil}
                      className="w-full bg-purple-500 hover:bg-purple-600"
                    >
                      Go to VC Council
                    </Button>
                  </>
                )}
                {currentPhase === 'council' && (
                  <Button
                    onClick={handleGoToVerdict}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    See Results
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
