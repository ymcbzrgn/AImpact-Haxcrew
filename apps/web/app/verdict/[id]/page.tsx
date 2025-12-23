'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Trophy,
  TrendingUp,
  Target,
  Users,
  Lightbulb,
  DollarSign,
  Share2,
  Download,
  RefreshCw,
  ChevronRight,
  Star,
  CheckCircle,
  AlertCircle,
  Zap,
  Award,
  FileText,
  ArrowRight,
  Sparkles,
  BarChart3,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// API_URL will be used when integrating with backend
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface CategoryScore {
  name: string
  score: number
  icon: React.ReactNode
  feedback: string
  strengths: string[]
  improvements: string[]
  color: string
}

interface TermSheet {
  totalRaised: string
  leadInvestor: string
  valuation: string
  terms: string[]
}

interface InvestorVote {
  name: string
  firm: string
  avatar: string
  decision: 'invest' | 'pass'
  amount?: string
  color: string
}

// Navbar component
function VerdictNav() {
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
          <Link href="/dashboard" className="hidden sm:block text-sm text-neutral-custom-subdued hover:text-neutral-custom transition-colors">
            Dashboard
          </Link>
          <Link href="/help" className="hidden sm:block text-sm text-neutral-custom-subdued hover:text-neutral-custom transition-colors">
            Help
          </Link>
          <div className="flex items-center gap-1 text-xs text-neutral-custom-subdued bg-neutral-custom/5 px-3 py-1.5 rounded-full">
            <Trophy className="w-3 h-3" />
            Final Verdict
          </div>
        </div>
      </div>
    </nav>
  )
}

// Animated Score Circle component
function AnimatedScoreCircle({
  score,
  size = 'large',
  delay = 0
}: {
  score: number
  size?: 'large' | 'medium' | 'small'
  delay?: number
}) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const sizeConfig = {
    large: { radius: 85, stroke: 12, svgSize: 220, textSize: 'text-5xl', gradeSize: 'text-xl' },
    medium: { radius: 50, stroke: 8, svgSize: 130, textSize: 'text-3xl', gradeSize: 'text-base' },
    small: { radius: 32, stroke: 6, svgSize: 80, textSize: 'text-xl', gradeSize: 'text-xs' },
  }

  const config = sizeConfig[size]
  const circumference = 2 * Math.PI * config.radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: '#22c55e', bg: 'from-green-400 to-emerald-600' }
    if (score >= 80) return { grade: 'A', color: '#22c55e', bg: 'from-green-400 to-emerald-600' }
    if (score >= 70) return { grade: 'B+', color: '#84cc16', bg: 'from-lime-400 to-green-600' }
    if (score >= 60) return { grade: 'B', color: '#eab308', bg: 'from-yellow-400 to-amber-600' }
    if (score >= 50) return { grade: 'C', color: '#f97316', bg: 'from-orange-400 to-red-600' }
    return { grade: 'D', color: '#ef4444', bg: 'from-red-400 to-red-600' }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      const duration = 1500
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        setAnimatedScore(Math.floor(easeOut * score))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timer)
  }, [score, delay])

  const { grade, color, bg } = getGrade(animatedScore)
  const center = config.svgSize / 2

  return (
    <div
      className={`relative transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
      style={{ width: config.svgSize, height: config.svgSize }}
    >
      {/* Glow effect */}
      <div
        className={`absolute inset-4 rounded-full blur-xl opacity-30 bg-gradient-to-br ${bg}`}
      />

      <svg className="transform -rotate-90 relative z-10" width={config.svgSize} height={config.svgSize}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          stroke="currentColor"
          strokeWidth={config.stroke}
          fill="none"
          className="text-neutral-custom/10"
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          stroke={color}
          strokeWidth={config.stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-100"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className={`font-bold text-neutral-custom ${config.textSize}`}>
          {animatedScore}
        </span>
        <span className={`font-semibold ${config.gradeSize}`} style={{ color }}>
          {grade}
        </span>
      </div>
    </div>
  )
}

// Enhanced Category Card component
function CategoryCard({ category, index }: { category: CategoryScore; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card
      className={`bg-white overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-4 hover:shadow-lg`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Color bar */}
      <div className="h-1 w-full" style={{ backgroundColor: category.color }} />

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${category.color}15`, color: category.color }}
            >
              {category.icon}
            </div>
            <div>
              <p className="font-semibold text-neutral-custom">{category.name}</p>
              <p className="text-sm text-neutral-custom-subdued">{category.feedback}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AnimatedScoreCircle score={category.score} size="small" delay={index * 200 + 500} />
            <ChevronRight
              className={`w-5 h-5 text-neutral-custom-subdued transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            />
          </div>
        </div>
      </button>

      {/* Expandable content */}
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96' : 'max-h-0'}`}>
        <div className="px-5 pb-5 pt-0 border-t">
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            {/* Strengths */}
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-green-700 flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4" /> Strengths
              </h4>
              <ul className="space-y-2">
                {category.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="bg-amber-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4" /> Areas to Improve
              </h4>
              <ul className="space-y-2">
                {category.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Enhanced Term Sheet Card component
function TermSheetCard({ termSheet }: { termSheet: TermSheet }) {
  return (
    <Card className="overflow-hidden">
      {/* Gradient header */}
      <div className="bg-gradient-to-r from-accent-custom via-purple-600 to-accent-custom-baseline p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Term Sheet</h3>
            <p className="text-white/70 text-sm">Investment offer from the council</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-white/70 text-xs mb-1">Total Raised</p>
            <p className="text-3xl font-bold">{termSheet.totalRaised}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-white/70 text-xs mb-1">Pre-Money Valuation</p>
            <p className="text-3xl font-bold">{termSheet.valuation}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="mb-6">
          <p className="text-xs text-neutral-custom-subdued mb-1">Lead Investor</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-lg">
              👨‍🚀
            </div>
            <div>
              <p className="font-semibold text-neutral-custom">{termSheet.leadInvestor}</p>
              <p className="text-xs text-neutral-custom-subdued">Founder Fund</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-neutral-custom-subdued mb-3">Key Terms</p>
          <div className="grid grid-cols-2 gap-2">
            {termSheet.terms.map((term, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-neutral-custom/5 rounded-lg px-3 py-2"
              >
                <Star className="w-3 h-3 text-accent-custom flex-shrink-0" />
                <span className="text-sm text-neutral-custom">{term}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Investor Votes component
function InvestorVotes({ votes }: { votes: InvestorVote[] }) {
  const invested = votes.filter(v => v.decision === 'invest').length
  const passed = votes.filter(v => v.decision === 'pass').length
  const investedPercent = (invested / votes.length) * 100

  return (
    <Card className="bg-white overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-custom" />
            <h3 className="font-semibold text-neutral-custom">Council Votes</h3>
          </div>
          <span className="text-sm text-neutral-custom-subdued">{votes.length} investors</span>
        </div>

        {/* Progress bar */}
        <div className="relative h-3 bg-neutral-custom/10 rounded-full overflow-hidden mb-4">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
            style={{ width: `${investedPercent}%` }}
          />
          <div className="absolute inset-0 flex">
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-white drop-shadow-sm">{invested}</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-neutral-custom">{passed}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 bg-green-50 rounded-xl p-3">
            <ThumbsUp className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-lg font-bold text-green-600">{invested}</p>
              <p className="text-xs text-green-700">Would Invest</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-50 rounded-xl p-3">
            <ThumbsDown className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-lg font-bold text-red-600">{passed}</p>
              <p className="text-xs text-red-700">Would Pass</p>
            </div>
          </div>
        </div>

        {/* Individual votes */}
        <div className="space-y-2">
          {votes.map((vote, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-xl ${
                vote.decision === 'invest' ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{ backgroundColor: `${vote.color}20` }}
                >
                  {vote.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-custom">{vote.name}</p>
                  <p className="text-xs text-neutral-custom-subdued">{vote.firm}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {vote.amount && (
                  <span className="text-xs font-semibold bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                    {vote.amount}
                  </span>
                )}
                {vote.decision === 'invest' ? (
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                ) : (
                  <ThumbsDown className="w-4 h-4 text-red-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// Share button with copy functionality
function ShareButton() {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'My PitchDrill Results',
        text: 'Check out my pitch practice results!',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="relative">
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </>
      )}
    </Button>
  )
}

export default function VerdictPage() {
  const params = useParams()
  const sessionId = params.id as string
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  // Mock data - would come from API
  const [verdictData] = useState({
    overallScore: 78,
    categories: [
      {
        name: 'Problem Statement',
        score: 85,
        icon: <Target className="w-5 h-5" />,
        feedback: 'Clear and compelling problem definition',
        strengths: ['Well-defined target market', 'Strong pain point articulation', 'Good use of data and statistics'],
        improvements: ['Could quantify the problem impact more', 'Add more customer quotes and testimonials'],
        color: '#8B5CF6',
      },
      {
        name: 'Solution',
        score: 75,
        icon: <Lightbulb className="w-5 h-5" />,
        feedback: 'Solid solution with room for differentiation',
        strengths: ['Innovative approach to the problem', 'Clear value proposition'],
        improvements: ['Explain technical moat better', 'Show demo or working prototype'],
        color: '#3B82F6',
      },
      {
        name: 'Market Size',
        score: 70,
        icon: <TrendingUp className="w-5 h-5" />,
        feedback: 'TAM/SAM/SOM could be more specific',
        strengths: ['Large addressable market identified', 'Growing industry with tailwinds'],
        improvements: ['Bottom-up TAM calculation needed', 'More specific SOM focus and timeline'],
        color: '#10B981',
      },
      {
        name: 'Team',
        score: 82,
        icon: <Users className="w-5 h-5" />,
        feedback: 'Strong founding team with relevant experience',
        strengths: ['Domain expertise evident', 'Complementary skill sets', 'Previous successful exits'],
        improvements: ['Show advisory board members', 'Highlight key hires planned'],
        color: '#F59E0B',
      },
    ] as CategoryScore[],
    termSheet: {
      totalRaised: '$1.95M',
      leadInvestor: 'David Park',
      valuation: '$8M',
      terms: ['20% equity', 'Board seat', '1x liquidation pref', 'Pro-rata rights'],
    },
    votes: [
      { name: 'Sarah Chen', firm: 'Velocity Ventures', avatar: '👩‍💼', decision: 'invest' as const, amount: '$500K', color: '#8B5CF6' },
      { name: 'Marcus Johnson', firm: 'Binary Capital', avatar: '👨‍💻', decision: 'invest' as const, amount: '$300K', color: '#3B82F6' },
      { name: 'Elena Rodriguez', firm: 'Global Seed Fund', avatar: '👩‍🔬', decision: 'pass' as const, color: '#10B981' },
      { name: 'David Park', firm: 'Founder Fund', avatar: '👨‍🚀', decision: 'invest' as const, amount: '$750K', color: '#F59E0B' },
      { name: 'Amanda Foster', firm: 'Purpose Capital', avatar: '👩‍🌾', decision: 'invest' as const, amount: '$400K', color: '#EC4899' },
    ],
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      if (verdictData.overallScore >= 70) {
        setShowConfetti(true)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [verdictData.overallScore])

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-accent-custom/10 flex items-center justify-center mx-auto">
              <Trophy className="w-12 h-12 text-accent-custom" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-accent-custom/30 border-t-accent-custom animate-spin" />
          </div>
          <p className="text-neutral-custom font-medium mb-2">Calculating Your Results</p>
          <p className="text-sm text-neutral-custom-subdued">Analyzing council feedback...</p>
        </div>
      </div>
    )
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { title: 'Outstanding Pitch!', subtitle: 'You nailed it! Investors are excited.' }
    if (score >= 80) return { title: 'Excellent Pitch!', subtitle: 'Strong performance with minor improvements possible.' }
    if (score >= 70) return { title: 'Good Foundation!', subtitle: 'Solid pitch with room for growth.' }
    if (score >= 60) return { title: 'Promising Start!', subtitle: 'Good potential, needs some refinement.' }
    return { title: 'Needs Work', subtitle: 'Focus on the improvement areas below.' }
  }

  const scoreMessage = getScoreMessage(verdictData.overallScore)

  return (
    <div className="min-h-screen bg-canvas">
      <VerdictNav />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <Card className="bg-white overflow-hidden mb-8">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent-custom/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-500/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Score circle */}
                <div className="relative">
                  {showConfetti && (
                    <div className="absolute -inset-4">
                      <Sparkles className="w-6 h-6 text-yellow-400 absolute top-0 left-0 animate-pulse" />
                      <Sparkles className="w-5 h-5 text-accent-custom absolute top-0 right-0 animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <Sparkles className="w-4 h-4 text-green-400 absolute bottom-0 left-0 animate-pulse" style={{ animationDelay: '0.4s' }} />
                      <Sparkles className="w-6 h-6 text-pink-400 absolute bottom-0 right-0 animate-pulse" style={{ animationDelay: '0.6s' }} />
                    </div>
                  )}
                  <AnimatedScoreCircle score={verdictData.overallScore} size="large" />
                </div>

                {/* Message */}
                <div className="text-center lg:text-left flex-1">
                  <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
                    <Award className="w-6 h-6 text-accent-custom" />
                    <span className="text-sm font-medium text-accent-custom">Final Verdict</span>
                  </div>
                  <h1 className="text-3xl font-bold text-neutral-custom mb-2">
                    {scoreMessage.title}
                  </h1>
                  <p className="text-neutral-custom-subdued mb-6 max-w-md">
                    {scoreMessage.subtitle}
                  </p>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    <ShareButton />
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Link href={`/session/${sessionId}?mode=solo`}>
                      <Button size="sm" className="bg-accent-custom hover:bg-accent-custom-baseline text-white">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Practice Again
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Term Sheet */}
          <div className="lg:col-span-2">
            <TermSheetCard termSheet={verdictData.termSheet} />
          </div>

          {/* Investor Votes */}
          <div>
            <InvestorVotes votes={verdictData.votes} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-accent-custom" />
            <h2 className="text-xl font-bold text-neutral-custom">Category Breakdown</h2>
          </div>
          <div className="space-y-4">
            {verdictData.categories.map((category, index) => (
              <CategoryCard key={category.name} category={category} index={index} />
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <Card className="bg-gradient-to-r from-accent-custom to-accent-custom-baseline text-white p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-8 h-8" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">Ready to Improve?</h3>
              <p className="text-white/80 mb-4">
                Focus on the improvement areas above and try another practice session.
                Each practice helps you refine your pitch.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/upload">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <FileText className="w-4 h-4 mr-2" />
                  New Deck
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-white text-accent-custom hover:bg-white/90">
                  Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Session info */}
        <div className="text-center text-sm text-neutral-custom-subdued">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Session completed on {new Date().toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
