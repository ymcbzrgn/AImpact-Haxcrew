'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Mic,
  Users,
  Brain,
  Check,
  Clock,
  Zap,
  Shield,
  Target,
  Star,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type PracticeMode = 'solo' | 'council' | 'qa'
type Difficulty = 'beginner' | 'intermediate' | 'advanced'

interface ModeOption {
  id: PracticeMode
  title: string
  description: string
  features: string[]
  icon: React.ReactNode
  recommended?: boolean
  duration: string
  difficulty: Difficulty
  color: string
}

const modeOptions: ModeOption[] = [
  {
    id: 'solo',
    title: 'Solo Practice',
    description: 'Practice your pitch at your own pace with real-time AI feedback and coaching.',
    features: [
      'Real-time transcription',
      'Slide-by-slide feedback',
      'Pacing analysis',
      'Filler word detection',
    ],
    icon: <Mic className="w-7 h-7" />,
    recommended: true,
    duration: '5-10 min',
    difficulty: 'beginner',
    color: '#8B5CF6',
  },
  {
    id: 'council',
    title: 'VC Council',
    description: 'Face a panel of 5 AI-powered virtual investors with distinct personalities.',
    features: [
      '5 unique VC personas',
      'Tough Q&A session',
      'Investment decision',
      'Term sheet preview',
    ],
    icon: <Users className="w-7 h-7" />,
    duration: '15-20 min',
    difficulty: 'advanced',
    color: '#10B981',
  },
  {
    id: 'qa',
    title: 'Q&A Practice',
    description: 'Prepare for investor questions with AI-generated challenges based on your deck.',
    features: [
      'Common VC questions',
      'Industry-specific queries',
      'Answer evaluation',
      'Improvement tips',
    ],
    icon: <Brain className="w-7 h-7" />,
    duration: '10-15 min',
    difficulty: 'intermediate',
    color: '#F59E0B',
  },
]

const difficultyConfig = {
  beginner: { label: 'Beginner', color: 'text-green-600 bg-green-100', stars: 1 },
  intermediate: { label: 'Intermediate', color: 'text-yellow-600 bg-yellow-100', stars: 2 },
  advanced: { label: 'Advanced', color: 'text-red-600 bg-red-100', stars: 3 },
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const config = difficultyConfig[difficulty]
  return (
    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${config.color}`}>
      {[...Array(config.stars)].map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-current" />
      ))}
      <span className="ml-1">{config.label}</span>
    </div>
  )
}

function ModeCard({
  mode,
  isSelected,
  onSelect,
}: {
  mode: ModeOption
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer transition-all duration-300 bg-white hover:shadow-xl relative overflow-hidden ${
        isSelected
          ? 'ring-2 ring-accent-custom shadow-xl scale-[1.02]'
          : 'hover:ring-1 hover:ring-accent-custom/50 hover:scale-[1.01]'
      }`}
    >
      {/* Top color bar */}
      <div
        className="h-1 w-full transition-all duration-300"
        style={{ backgroundColor: isSelected ? mode.color : 'transparent' }}
      />

      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-3 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: isSelected ? mode.color : `${mode.color}15`,
              color: isSelected ? 'white' : mode.color,
            }}
          >
            {mode.icon}
          </div>
          <div className="flex flex-col items-end gap-2">
            {mode.recommended && (
              <span className="flex items-center gap-1 text-xs font-medium bg-accent-custom/10 text-accent-custom px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                Recommended
              </span>
            )}
            {isSelected && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center animate-in zoom-in duration-200"
                style={{ backgroundColor: mode.color }}
              >
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-semibold text-neutral-custom mb-2">{mode.title}</h3>
        <p className="text-neutral-custom-subdued text-sm mb-4 leading-relaxed">{mode.description}</p>

        {/* Meta info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1 text-xs text-neutral-custom-subdued">
            <Clock className="w-3 h-3" />
            {mode.duration}
          </div>
          <DifficultyBadge difficulty={mode.difficulty} />
        </div>

        {/* Features */}
        <ul className="space-y-2">
          {mode.features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-neutral-custom-subdued">
              <div
                className="w-1.5 h-1.5 rounded-full mr-2 transition-all duration-300"
                style={{ backgroundColor: isSelected ? mode.color : '#9CA3AF' }}
              />
              {feature}
            </li>
          ))}
        </ul>

        {/* Select indicator */}
        <div
          className={`mt-4 pt-4 border-t border-neutral-custom/10 flex items-center justify-between transition-all duration-300 ${
            isSelected ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-sm font-medium" style={{ color: mode.color }}>
            Selected
          </span>
          <ChevronRight className="w-4 h-4" style={{ color: mode.color }} />
        </div>
      </CardContent>
    </Card>
  )
}

// Navbar
function ModeSelectNav() {
  return (
    <nav className="bg-white border-b px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-custom flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-neutral-custom">PitchDrill</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/help" className="hidden sm:block text-sm text-neutral-custom-subdued hover:text-neutral-custom transition-colors">
            Help
          </Link>
          <Link href="/dashboard" className="text-sm text-neutral-custom-subdued hover:text-neutral-custom transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default function ModeSelectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session')
  const [selectedMode, setSelectedMode] = useState<PracticeMode | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  const handleStartSession = () => {
    if (selectedMode && sessionId) {
      setIsStarting(true)
      router.push(`/session/${sessionId}?mode=${selectedMode}`)
    }
  }

  // Auto-select recommended mode
  useEffect(() => {
    if (!selectedMode) {
      const recommended = modeOptions.find(m => m.recommended)
      if (recommended) {
        setSelectedMode(recommended.id)
      }
    }
  }, [selectedMode])

  return (
    <div className="min-h-screen bg-canvas">
      <ModeSelectNav />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/upload"
            className="inline-flex items-center text-neutral-custom-subdued hover:text-neutral-custom mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Link>
          <h1 className="text-3xl font-bold text-neutral-custom mb-2">Choose Your Practice Mode</h1>
          <p className="text-neutral-custom-subdued">
            Select how you want to practice your pitch. Each mode offers different levels of challenge.
          </p>
        </div>

        {/* Session info */}
        {sessionId && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-neutral-custom/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-custom/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-custom" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-custom">Session Ready</p>
              <p className="text-xs text-neutral-custom-subdued">
                Your deck has been analyzed and is ready for practice.
              </p>
            </div>
          </div>
        )}

        {/* Mode Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {modeOptions.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              isSelected={selectedMode === mode.id}
              onSelect={() => setSelectedMode(mode.id)}
            />
          ))}
        </div>

        {/* Start Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={handleStartSession}
            disabled={!selectedMode || !sessionId || isStarting}
            size="lg"
            className={`px-12 h-14 text-lg font-semibold transition-all ${
              selectedMode && sessionId
                ? 'bg-accent-custom hover:bg-accent-custom-baseline text-white shadow-lg hover:shadow-xl'
                : 'bg-neutral-custom/20 text-neutral-custom-subdued cursor-not-allowed'
            }`}
          >
            {isStarting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Starting...
              </>
            ) : (
              <>
                <Target className="w-5 h-5 mr-2" />
                Start {selectedMode ? modeOptions.find(m => m.id === selectedMode)?.title : 'Session'}
              </>
            )}
          </Button>

          {!sessionId && (
            <p className="text-sm text-red-500">
              No session found. Please <Link href="/upload" className="underline">upload a deck</Link> first.
            </p>
          )}
        </div>

        {/* Quick tips */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-neutral-custom/10">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-accent-custom" />
              <span className="text-sm font-medium text-neutral-custom">Solo Practice</span>
            </div>
            <p className="text-xs text-neutral-custom-subdued">
              Best for first-time users. Practice without pressure and get comfortable with your pitch.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-neutral-custom/10">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-accent-custom" />
              <span className="text-sm font-medium text-neutral-custom">Q&A Practice</span>
            </div>
            <p className="text-xs text-neutral-custom-subdued">
              Perfect for preparing answers to common investor questions about your startup.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-neutral-custom/10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-accent-custom" />
              <span className="text-sm font-medium text-neutral-custom">VC Council</span>
            </div>
            <p className="text-xs text-neutral-custom-subdued">
              The ultimate test. Face tough questions from AI investors and get a verdict.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
