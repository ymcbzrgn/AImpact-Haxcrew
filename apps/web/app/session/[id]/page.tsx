'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Clock,
  MessageSquare,
  Play,
  Pause,
  X,
  FileText,
  Users,
  HelpCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  Zap,
  ArrowRight,
  Maximize,
  Monitor,
  Sparkles,
  Target,
  Brain,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSessionStore } from '@/stores/session'
import { useWebSocket, WebSocketMessage } from '@/hooks/useWebSocket'
import { useAudioCapture } from '@/hooks/useAudioCapture'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type SessionPhase = 'setup' | 'practice' | 'qa' | 'council' | 'complete'
type PracticeMode = 'solo' | 'council' | 'qa'

interface SlideContent {
  slide_number: number
  content: string
}

interface SessionData {
  session_id: string
  status: string
  slide_contents: SlideContent[] | null
  deck_analysis: Record<string, unknown>
}

// Phase configuration with colors
const phases: { id: SessionPhase; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'setup', label: 'Setup', icon: <FileText className="w-4 h-4" />, color: '#8B5CF6' },
  { id: 'practice', label: 'Practice', icon: <Mic className="w-4 h-4" />, color: '#3B82F6' },
  { id: 'qa', label: 'Q&A', icon: <HelpCircle className="w-4 h-4" />, color: '#F59E0B' },
  { id: 'council', label: 'Council', icon: <Users className="w-4 h-4" />, color: '#10B981' },
  { id: 'complete', label: 'Complete', icon: <CheckCircle className="w-4 h-4" />, color: '#22C55E' },
]

// Mode configuration
const modeConfig: Record<PracticeMode, { label: string; icon: React.ReactNode; color: string }> = {
  solo: { label: 'Solo Practice', icon: <Mic className="w-4 h-4" />, color: '#8B5CF6' },
  council: { label: 'VC Council', icon: <Users className="w-4 h-4" />, color: '#10B981' },
  qa: { label: 'Q&A Practice', icon: <Brain className="w-4 h-4" />, color: '#F59E0B' },
}

// Navbar
function SessionNav({ mode, sessionId }: { mode: PracticeMode; sessionId: string }) {
  const config = modeConfig[mode]

  return (
    <nav className="bg-white border-b px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/mode-select?session=${sessionId}`} className="text-neutral-custom-subdued hover:text-neutral-custom transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-custom flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-neutral-custom">PitchDrill</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/help" className="hidden sm:block text-sm text-neutral-custom-subdued hover:text-neutral-custom transition-colors">
            Help
          </Link>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${config.color}15`, color: config.color }}
          >
            {config.icon}
            {config.label}
          </div>
        </div>
      </div>
    </nav>
  )
}

// Enhanced Timer component
function Timer({ isRunning, onTimeUpdate }: { isRunning: boolean; onTimeUpdate?: (time: number) => void }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => {
          const newTime = s + 1
          onTimeUpdate?.(newTime)
          return newTime
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, onTimeUpdate])

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-2 bg-neutral-custom/5 px-4 py-2 rounded-xl">
      <Clock className={`w-5 h-5 ${isRunning ? 'text-red-500 animate-pulse' : 'text-neutral-custom-subdued'}`} />
      <span className="text-lg font-mono font-semibold text-neutral-custom">{formatTime(seconds)}</span>
    </div>
  )
}

// Enhanced Audio Visualizer
function AudioVisualizer({ isActive, audioLevel = 0 }: { isActive: boolean; audioLevel?: number }) {
  const bars = 7

  return (
    <div className="flex items-end gap-0.5 h-10 px-3 py-2 bg-neutral-custom/5 rounded-xl">
      {Array.from({ length: bars }).map((_, i) => {
        const baseHeight = isActive
          ? Math.max(15, Math.min(100, audioLevel * (0.5 + Math.random() * 0.5)))
          : 15
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-75 ${
              isActive ? 'bg-red-500' : 'bg-neutral-custom/30'
            }`}
            style={{
              height: `${baseHeight}%`,
              animationDelay: `${i * 50}ms`,
            }}
          />
        )
      })}
    </div>
  )
}

// Enhanced Phase Indicator
function PhaseIndicator({ currentPhase }: { currentPhase: SessionPhase }) {
  const currentIndex = phases.findIndex((p) => p.id === currentPhase)

  return (
    <div className="flex items-center gap-1">
      {phases.map((phase, index) => {
        const isActive = index === currentIndex
        const isPast = index < currentIndex

        return (
          <div key={phase.id} className="flex items-center">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'text-white shadow-lg'
                  : isPast
                  ? 'text-white/80'
                  : 'bg-neutral-custom/10 text-neutral-custom-subdued'
              }`}
              style={{
                backgroundColor: isActive ? phase.color : isPast ? `${phase.color}80` : undefined,
              }}
            >
              {phase.icon}
              <span className="hidden md:inline">{phase.label}</span>
            </div>
            {index < phases.length - 1 && (
              <div
                className={`w-4 h-0.5 mx-0.5 ${
                  isPast ? 'bg-accent-custom' : 'bg-neutral-custom/10'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Enhanced Slide Thumbnail
function SlideThumbnail({
  slide,
  index,
  isActive,
  onClick,
}: {
  slide: SlideContent
  index: number
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-xl text-left transition-all group ${
        isActive
          ? 'bg-accent-custom/10 ring-2 ring-accent-custom shadow-sm'
          : 'bg-white hover:bg-neutral-custom/5 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
            isActive
              ? 'bg-accent-custom text-white'
              : 'bg-neutral-custom/10 text-neutral-custom group-hover:bg-accent-custom/10 group-hover:text-accent-custom'
          }`}
        >
          {index + 1}
        </div>
        <p className="text-xs text-neutral-custom-subdued line-clamp-2 leading-relaxed">
          {slide.content.slice(0, 60)}...
        </p>
      </div>
    </button>
  )
}

// Notes Panel
function NotesPanel({
  isOpen,
  onClose,
  notes,
}: {
  isOpen: boolean
  onClose: () => void
  notes: string[]
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-accent-custom/5 to-transparent">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-custom" />
          <h3 className="font-semibold text-neutral-custom">Live Notes</h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-neutral-custom/10 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-neutral-custom/20 mx-auto mb-3" />
            <p className="text-neutral-custom-subdued text-sm">
              Notes will appear here as you practice
            </p>
          </div>
        ) : (
          notes.map((note, index) => (
            <div
              key={index}
              className="p-3 bg-gradient-to-r from-accent-custom/5 to-purple-500/5 rounded-xl text-sm text-neutral-custom animate-in slide-in-from-right"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {note}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Main Slide Card
function SlideCard({
  slide,
  currentSlide,
  totalSlides,
}: {
  slide: SlideContent | undefined
  currentSlide: number
  totalSlides: number
}) {
  return (
    <Card className="w-full max-w-5xl aspect-[16/9] bg-white shadow-xl overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Slide header */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gradient-to-r from-neutral-custom/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-accent-custom text-white px-3 py-1 rounded-lg text-sm font-semibold">
              <FileText className="w-4 h-4" />
              Slide {currentSlide + 1}
            </div>
            <span className="text-sm text-neutral-custom-subdued">of {totalSlides}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-neutral-custom-subdued">
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Slide content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {slide ? (
            <div className="prose prose-neutral max-w-none">
              <p className="text-neutral-custom whitespace-pre-wrap leading-relaxed text-lg">
                {slide.content}
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-neutral-custom-subdued">
              <Monitor className="w-16 h-16 mb-4 opacity-50" />
              <p>No slide content available</p>
            </div>
          )}
        </div>

        {/* Slide progress */}
        <div className="px-6 py-3 border-t bg-neutral-custom/5">
          <div className="h-1 bg-neutral-custom/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-custom to-purple-600 transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function SessionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const sessionId = params.id as string
  const mode = (searchParams.get('mode') || 'solo') as PracticeMode

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentSlide, setCurrentSlide] = useState(0)
  const [phase, setPhase] = useState<SessionPhase>('setup')
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState<string[]>([])

  // Zustand store
  const { setStatus } = useSessionStore()

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'realtime_note':
        if (message.data?.note) {
          setNotes((prev) => [...prev, message.data.note])
        }
        break
    }
  }, [])

  // WebSocket hook
  const {
    isConnected,
    isReconnecting,
    sendAudioChunk,
  } = useWebSocket({
    sessionId,
    autoConnect: false,
    onMessage: handleWebSocketMessage,
  })

  // Audio capture hook
  const {
    audioLevel,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    pauseRecording: pauseAudioRecording,
    resumeRecording: resumeAudioRecording,
  } = useAudioCapture({
    onAudioChunk: (chunk) => {
      if (isConnected) {
        sendAudioChunk(chunk)
      }
    },
  })

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`${API_URL}/api/session/${sessionId}`)
        const data = await response.json()

        if (data.success) {
          setSessionData(data.data)
        } else {
          setError(data.error?.message || 'Failed to load session')
        }
      } catch {
        setError('Failed to connect to server')
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      fetchSession()
    }
  }, [sessionId])

  const slides = sessionData?.slide_contents || []
  const totalSlides = slides.length

  const goToSlide = (index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index)
    }
  }

  const nextSlide = () => goToSlide(currentSlide + 1)
  const prevSlide = () => goToSlide(currentSlide - 1)

  const startPractice = async () => {
    setPhase('practice')
    setStatus('pitching')
    setIsRecording(true)
    await startAudioRecording()
  }

  const toggleRecording = () => {
    if (isRecording) {
      if (isPaused) {
        resumeAudioRecording()
      } else {
        pauseAudioRecording()
      }
      setIsPaused(!isPaused)
    }
  }

  const endPractice = () => {
    setIsRecording(false)
    stopAudioRecording()
    setStatus('qa')
    setPhase('qa')
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === ' ' && phase === 'practice') {
        e.preventDefault()
        toggleRecording()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide, phase, isRecording, isPaused])

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full bg-accent-custom/10 flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-accent-custom animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-accent-custom/30 border-t-accent-custom animate-spin" />
          </div>
          <p className="text-neutral-custom font-medium">Loading session...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-custom mb-2">Session Not Found</h2>
            <p className="text-neutral-custom-subdued mb-6">{error}</p>
            <Link href="/upload">
              <Button className="bg-accent-custom hover:bg-accent-custom-baseline text-white">
                Upload a Deck
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <SessionNav mode={mode} sessionId={sessionId} />

      {/* Phase indicator bar */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <PhaseIndicator currentPhase={phase} />
          {/* Connection status */}
          {phase !== 'setup' && (
            <div
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
                isConnected
                  ? 'bg-green-100 text-green-700'
                  : isReconnecting
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isConnected ? 'Live' : isReconnecting ? 'Reconnecting...' : 'Offline'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnails - Left Sidebar */}
        <aside className="w-72 bg-neutral-custom/5 border-r overflow-y-auto hidden lg:block">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-accent-custom" />
              <h2 className="text-sm font-semibold text-neutral-custom">Slides</h2>
              <span className="text-xs text-neutral-custom-subdued bg-neutral-custom/10 px-2 py-0.5 rounded-full">
                {totalSlides}
              </span>
            </div>
            <div className="space-y-2">
              {slides.map((slide, index) => (
                <SlideThumbnail
                  key={slide.slide_number}
                  slide={slide}
                  index={index}
                  isActive={index === currentSlide}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Main Slide View */}
        <main className="flex-1 flex flex-col">
          {/* Slide Content */}
          <div className="flex-1 p-6 flex items-center justify-center overflow-hidden">
            <SlideCard
              slide={slides[currentSlide]}
              currentSlide={currentSlide}
              totalSlides={totalSlides}
            />
          </div>

          {/* Controls */}
          <div className="bg-white border-t p-4 shadow-lg">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="rounded-xl"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="px-4 py-2 bg-neutral-custom/5 rounded-xl">
                  <span className="text-sm font-medium text-neutral-custom">
                    {currentSlide + 1} / {totalSlides}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  disabled={currentSlide === totalSlides - 1}
                  className="rounded-xl"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Center Controls */}
              <div className="flex items-center gap-3">
                {phase === 'setup' && (
                  <Button
                    onClick={startPractice}
                    size="lg"
                    className="bg-accent-custom hover:bg-accent-custom-baseline text-white px-8 shadow-lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Practice
                  </Button>
                )}

                {phase === 'practice' && (
                  <>
                    <Timer isRunning={isRecording && !isPaused} />
                    <div className="flex items-center gap-1 bg-neutral-custom/5 p-1 rounded-xl">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleRecording}
                        className={`rounded-lg ${!isPaused ? 'text-neutral-custom' : 'text-accent-custom'}`}
                      >
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-lg ${isRecording && !isPaused ? 'text-red-500' : 'text-neutral-custom-subdued'}`}
                      >
                        {isRecording && !isPaused ? (
                          <Mic className="w-5 h-5 animate-pulse" />
                        ) : (
                          <MicOff className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                    <AudioVisualizer isActive={isRecording && !isPaused} audioLevel={audioLevel} />
                    <Button
                      onClick={endPractice}
                      className="bg-gradient-to-r from-accent-custom to-purple-600 hover:from-accent-custom-baseline hover:to-purple-700 text-white shadow-lg"
                    >
                      End Practice
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}

                {phase === 'qa' && (
                  <Link href={`/council/${sessionId}`}>
                    <Button size="lg" className="bg-gradient-to-r from-accent-custom to-purple-600 text-white px-8 shadow-lg">
                      <Users className="w-5 h-5 mr-2" />
                      Go to VC Council
                    </Button>
                  </Link>
                )}
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNotes(!showNotes)}
                  className={`rounded-xl ${showNotes ? 'bg-accent-custom/10 text-accent-custom' : ''}`}
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Notes Panel */}
      <NotesPanel isOpen={showNotes} onClose={() => setShowNotes(false)} notes={notes} />
    </div>
  )
}
