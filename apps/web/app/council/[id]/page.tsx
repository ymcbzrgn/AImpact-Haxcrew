'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Loader2,
  Zap,
  TrendingUp,
  DollarSign,
  Award,
  Clock,
  Users,
  Briefcase,
  Target,
  Lightbulb,
  Heart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// API_URL will be used when integrating with backend
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// VC Council Members with enhanced data
const vcMembers = [
  {
    id: 'sarah',
    name: 'Sarah Chen',
    role: 'Growth Specialist',
    firm: 'Velocity Ventures',
    style: 'Metrics-focused',
    avatar: '👩‍💼',
    color: '#8B5CF6',
    bgGradient: 'from-purple-500 to-indigo-600',
    icon: TrendingUp,
    expertise: ['SaaS Metrics', 'Growth Strategy', 'Unit Economics'],
    portfolio: '42 Companies',
    avgCheck: '$500K',
  },
  {
    id: 'marcus',
    name: 'Marcus Johnson',
    role: 'Tech Investor',
    firm: 'Binary Capital',
    style: 'Technical deep-diver',
    avatar: '👨‍💻',
    color: '#3B82F6',
    bgGradient: 'from-blue-500 to-cyan-600',
    icon: Lightbulb,
    expertise: ['AI/ML', 'Infrastructure', 'Developer Tools'],
    portfolio: '38 Companies',
    avgCheck: '$750K',
  },
  {
    id: 'elena',
    name: 'Elena Rodriguez',
    role: 'Market Expert',
    firm: 'Global Seed Fund',
    style: 'Market-size focused',
    avatar: '👩‍🔬',
    color: '#10B981',
    bgGradient: 'from-emerald-500 to-teal-600',
    icon: Target,
    expertise: ['Market Analysis', 'Go-to-Market', 'B2B Sales'],
    portfolio: '55 Companies',
    avgCheck: '$400K',
  },
  {
    id: 'david',
    name: 'David Park',
    role: 'Serial Entrepreneur',
    firm: 'Founder Fund',
    style: 'Execution-focused',
    avatar: '👨‍🚀',
    color: '#F59E0B',
    bgGradient: 'from-amber-500 to-orange-600',
    icon: Briefcase,
    expertise: ['Operations', 'Scaling', 'Exit Strategy'],
    portfolio: '28 Companies',
    avgCheck: '$1M',
  },
  {
    id: 'amanda',
    name: 'Amanda Foster',
    role: 'Impact Investor',
    firm: 'Purpose Capital',
    style: 'Mission-driven',
    avatar: '👩‍🌾',
    color: '#EC4899',
    bgGradient: 'from-pink-500 to-rose-600',
    icon: Heart,
    expertise: ['ESG', 'Social Impact', 'Sustainability'],
    portfolio: '35 Companies',
    avgCheck: '$600K',
  },
]

interface DialogMessage {
  memberId: string
  message: string
  timestamp: Date
}

interface Vote {
  memberId: string
  decision: 'invest' | 'pass'
  amount?: string
  reason: string
}

// Council state progress indicator
function CouncilProgress({ state }: { state: 'intro' | 'discussion' | 'voting' | 'complete' }) {
  const steps = [
    { id: 'intro', label: 'Introduction' },
    { id: 'discussion', label: 'Discussion' },
    { id: 'voting', label: 'Voting' },
    { id: 'complete', label: 'Complete' },
  ]
  const currentIndex = steps.findIndex((s) => s.id === state)

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              index <= currentIndex
                ? 'bg-accent-custom text-white'
                : 'bg-neutral-custom/10 text-neutral-custom-subdued'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                index <= currentIndex ? 'bg-white/20' : 'bg-neutral-custom/10'
              }`}
            >
              {index + 1}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 ${
                index < currentIndex ? 'bg-accent-custom' : 'bg-neutral-custom/10'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// Enhanced Avatar component with card style
function VCAvatar({
  member,
  isSpeaking,
  vote,
  isSelected,
  onClick,
}: {
  member: typeof vcMembers[0]
  isSpeaking: boolean
  vote?: Vote
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`relative group transition-all duration-300 ${
        isSpeaking ? 'scale-110 z-10' : 'hover:scale-105'
      }`}
    >
      {/* Card container */}
      <div
        className={`bg-white rounded-2xl p-3 shadow-sm transition-all duration-300 ${
          isSpeaking
            ? 'shadow-xl'
            : isSelected
            ? 'shadow-lg'
            : 'hover:shadow-md'
        }`}
        style={{
          boxShadow: isSpeaking
            ? `0 0 0 2px ${member.color}, 0 20px 25px -5px rgba(0, 0, 0, 0.1)`
            : isSelected
            ? `0 0 0 1px ${member.color}, 0 10px 15px -3px rgba(0, 0, 0, 0.1)`
            : undefined,
        }}
      >
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1 bg-accent-custom text-white text-[10px] px-2 py-0.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Speaking
            </div>
          </div>
        )}

        {/* Avatar with gradient background */}
        <div className="relative mb-2">
          {/* Animated rings for speaking */}
          {isSpeaking && (
            <>
              <div
                className="absolute inset-0 rounded-xl animate-ping opacity-20"
                style={{ backgroundColor: member.color }}
              />
              <div
                className="absolute -inset-1 rounded-xl animate-pulse opacity-30"
                style={{ backgroundColor: member.color }}
              />
            </>
          )}

          <div
            className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${member.bgGradient} flex items-center justify-center text-2xl md:text-3xl relative overflow-hidden`}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {member.avatar}
          </div>

          {/* Vote badge */}
          {vote && (
            <div
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center shadow-lg animate-in zoom-in duration-300 ${
                vote.decision === 'invest'
                  ? 'bg-gradient-to-br from-green-400 to-green-600'
                  : 'bg-gradient-to-br from-red-400 to-red-600'
              }`}
            >
              {vote.decision === 'invest' ? (
                <ThumbsUp className="w-3 h-3 text-white" />
              ) : (
                <ThumbsDown className="w-3 h-3 text-white" />
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="text-xs font-semibold text-neutral-custom truncate max-w-[80px]">
            {member.name.split(' ')[0]}
          </p>
          <p className="text-[10px] text-neutral-custom-subdued truncate max-w-[80px]">
            {member.firm}
          </p>
        </div>
      </div>

      {/* Expertise tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
        <div className="bg-neutral-custom text-white text-[10px] px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
          <p className="font-semibold mb-1">{member.name}</p>
          <p className="text-white/70">{member.style}</p>
          <div className="flex items-center gap-2 mt-1 text-white/60">
            <span>{member.portfolio}</span>
            <span>•</span>
            <span>{member.avgCheck}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

// Enhanced Speech Bubble component
function SpeechBubble({
  member,
  message,
  isLatest,
  timestamp,
}: {
  member: typeof vcMembers[0]
  message: string
  isLatest: boolean
  timestamp?: Date
}) {
  return (
    <div
      className={`flex gap-3 p-4 rounded-2xl transition-all duration-300 animate-in slide-in-from-bottom-2 ${
        isLatest
          ? 'bg-white shadow-lg border-l-4'
          : 'bg-neutral-custom/5 hover:bg-neutral-custom/10'
      }`}
      style={{ borderLeftColor: isLatest ? member.color : 'transparent' }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${member.bgGradient} flex items-center justify-center text-lg`}
        >
          {member.avatar}
        </div>
        {isLatest && (
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
            style={{ backgroundColor: member.color }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-custom text-sm">{member.name}</span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${member.color}15`, color: member.color }}
            >
              {member.style}
            </span>
          </div>
          {timestamp && (
            <span className="text-[10px] text-neutral-custom-subdued">
              {timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <p className="text-neutral-custom-subdued text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  )
}

// Enhanced Vote Summary component
function VoteSummary({ votes }: { votes: Vote[] }) {
  const investCount = votes.filter((v) => v.decision === 'invest').length
  const passCount = votes.filter((v) => v.decision === 'pass').length
  const totalAmount = votes
    .filter((v) => v.amount)
    .reduce((sum, v) => sum + parseFloat(v.amount!.replace(/[^0-9.]/g, '')) * 1000, 0)

  return (
    <Card className="bg-white overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-accent-custom to-accent-custom-baseline p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5" />
          <h3 className="font-semibold">Council Decision</h3>
        </div>
        <p className="text-sm text-white/80">
          {votes.length} of 5 votes received
        </p>
      </div>

      <CardContent className="p-4">
        {/* Vote counts */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-2">
              <ThumbsUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-green-600">{investCount}</p>
            <p className="text-xs text-green-700">Invest</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-2">
              <ThumbsDown className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-red-600">{passCount}</p>
            <p className="text-xs text-red-700">Pass</p>
          </div>
        </div>

        {/* Total investment */}
        {totalAmount > 0 && (
          <div className="bg-accent-custom/5 rounded-xl p-3 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-custom/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-custom" />
            </div>
            <div>
              <p className="text-xs text-neutral-custom-subdued">Total Committed</p>
              <p className="text-lg font-bold text-accent-custom">
                ${(totalAmount / 1000000).toFixed(2)}M
              </p>
            </div>
          </div>
        )}

        {/* Individual votes */}
        <div className="space-y-2 max-h-[250px] overflow-y-auto">
          {votes.map((vote) => {
            const member = vcMembers.find((m) => m.id === vote.memberId)
            if (!member) return null

            return (
              <div
                key={vote.memberId}
                className={`p-3 rounded-xl transition-all animate-in slide-in-from-right-2 ${
                  vote.decision === 'invest'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${member.bgGradient} flex items-center justify-center text-sm`}
                    >
                      {member.avatar}
                    </div>
                    <span className="font-medium text-sm text-neutral-custom">
                      {member.name.split(' ')[0]}
                    </span>
                  </div>
                  {vote.amount && (
                    <span className="text-xs font-semibold bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                      {vote.amount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-custom-subdued line-clamp-2">
                  {vote.reason}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Navbar component
function CouncilNav({ sessionId }: { sessionId: string }) {
  return (
    <nav className="bg-white border-b px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/session/${sessionId}?mode=council`} className="text-neutral-custom-subdued hover:text-neutral-custom transition-colors">
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
          <div className="flex items-center gap-1 text-xs text-neutral-custom-subdued bg-neutral-custom/5 px-3 py-1.5 rounded-full">
            <Users className="w-3 h-3" />
            VC Council Mode
          </div>
        </div>
      </div>
    </nav>
  )
}

// Member detail panel
function MemberDetailPanel({ member, onClose }: { member: typeof vcMembers[0]; onClose: () => void }) {
  const IconComponent = member.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="bg-white max-w-md w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.bgGradient} flex items-center justify-center text-3xl`}
            >
              {member.avatar}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-neutral-custom">{member.name}</h3>
              <p className="text-sm text-neutral-custom-subdued">{member.role}</p>
              <p className="text-xs" style={{ color: member.color }}>{member.firm}</p>
            </div>
          </div>

          {/* Style badge */}
          <div
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full mb-4"
            style={{ backgroundColor: `${member.color}15`, color: member.color }}
          >
            <IconComponent className="w-3 h-3" />
            {member.style}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-neutral-custom/5 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-neutral-custom">{member.portfolio}</p>
              <p className="text-xs text-neutral-custom-subdued">Portfolio</p>
            </div>
            <div className="bg-neutral-custom/5 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-neutral-custom">{member.avgCheck}</p>
              <p className="text-xs text-neutral-custom-subdued">Avg. Check</p>
            </div>
          </div>

          {/* Expertise */}
          <div>
            <p className="text-xs text-neutral-custom-subdued mb-2">Expertise</p>
            <div className="flex flex-wrap gap-2">
              {member.expertise.map((exp, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-full bg-neutral-custom/5 text-neutral-custom"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>

          {/* Close button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full mt-4"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CouncilPage() {
  const params = useParams()
  const sessionId = params.id as string
  const dialogRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [councilState, setCouncilState] = useState<'intro' | 'discussion' | 'voting' | 'complete'>('intro')
  const [speakingMember, setSpeakingMember] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogMessage[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  // Simulate council discussion
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Auto-scroll dialog
  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.scrollTop = dialogRef.current.scrollHeight
    }
  }, [dialog])

  const startDiscussion = () => {
    setCouncilState('discussion')

    // Simulate council members speaking
    const messages = [
      { memberId: 'sarah', message: "Looking at the metrics presented, I see strong month-over-month growth. However, I'd like to understand your customer acquisition cost better." },
      { memberId: 'marcus', message: "The technical architecture seems solid, but I have concerns about scalability. How do you plan to handle 10x the current load?" },
      { memberId: 'elena', message: "The TAM calculation is interesting, but I think there's a larger opportunity in adjacent markets you haven't explored." },
      { memberId: 'david', message: "I've seen similar execution before. The key will be your go-to-market strategy in the first 18 months." },
      { memberId: 'amanda', message: "I appreciate the mission-driven approach. Let's discuss how you measure social impact alongside financial returns." },
    ]

    messages.forEach((msg, index) => {
      setTimeout(() => {
        setSpeakingMember(msg.memberId)
        setDialog((prev) => [...prev, { ...msg, timestamp: new Date() }])

        setTimeout(() => {
          setSpeakingMember(null)
          if (index === messages.length - 1) {
            setCouncilState('voting')
            simulateVoting()
          }
        }, 3000)
      }, index * 5000)
    })
  }

  const simulateVoting = () => {
    const mockVotes: Vote[] = [
      { memberId: 'sarah', decision: 'invest', amount: '$500K', reason: 'Strong unit economics and clear path to profitability.' },
      { memberId: 'marcus', decision: 'invest', amount: '$300K', reason: 'Solid technical foundation with room for innovation.' },
      { memberId: 'elena', decision: 'pass', reason: 'Market timing concerns. Would reconsider in 6 months.' },
      { memberId: 'david', decision: 'invest', amount: '$750K', reason: 'Reminds me of my own first startup. The team has what it takes.' },
      { memberId: 'amanda', decision: 'invest', amount: '$400K', reason: 'Aligned with our impact thesis. Excited about the social potential.' },
    ]

    mockVotes.forEach((vote, index) => {
      setTimeout(() => {
        setVotes((prev) => [...prev, vote])
        if (index === mockVotes.length - 1) {
          setCouncilState('complete')
        }
      }, index * 1500)
    })
  }

  const selectedMemberData = selectedMember ? vcMembers.find((m) => m.id === selectedMember) : null

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-accent-custom/10 flex items-center justify-center mx-auto">
              <Users className="w-10 h-10 text-accent-custom animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-accent-custom/30 border-t-accent-custom animate-spin" />
          </div>
          <p className="text-neutral-custom font-medium mb-2">Preparing the VC Council</p>
          <p className="text-sm text-neutral-custom-subdued">Getting investors ready...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas">
      <CouncilNav sessionId={sessionId} />

      <main className="max-w-6xl mx-auto p-6">
        {/* Progress Indicator */}
        <CouncilProgress state={councilState} />

        {/* Council Members */}
        <div className="flex justify-center gap-3 md:gap-4 mb-8 flex-wrap">
          {vcMembers.map((member) => (
            <VCAvatar
              key={member.id}
              member={member}
              isSpeaking={speakingMember === member.id}
              vote={votes.find((v) => v.memberId === member.id)}
              isSelected={selectedMember === member.id}
              onClick={() => setSelectedMember(member.id)}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Dialog Panel */}
          <div className="md:col-span-2">
            <Card className="bg-white h-[500px] flex flex-col overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-neutral-custom/5 to-transparent">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-neutral-custom flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-accent-custom" />
                    Council Discussion
                  </h2>
                  {councilState !== 'intro' && (
                    <div className="flex items-center gap-1 text-xs text-neutral-custom-subdued">
                      <Clock className="w-3 h-3" />
                      {dialog.length} messages
                    </div>
                  )}
                </div>
              </div>

              <div ref={dialogRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-neutral-custom/5">
                {councilState === 'intro' && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-accent-custom/10 flex items-center justify-center mb-4">
                      <Users className="w-8 h-8 text-accent-custom" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-custom mb-2">
                      The VC Council is Ready
                    </h3>
                    <p className="text-neutral-custom-subdued mb-6 max-w-sm">
                      5 experienced investors will evaluate your pitch deck and provide feedback.
                      Each has a unique perspective and investment style.
                    </p>
                    <Button
                      onClick={startDiscussion}
                      size="lg"
                      className="bg-accent-custom hover:bg-accent-custom-baseline text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Start Council Review
                    </Button>
                  </div>
                )}

                {dialog.map((msg, index) => {
                  const member = vcMembers.find((m) => m.id === msg.memberId)
                  if (!member) return null
                  return (
                    <SpeechBubble
                      key={index}
                      member={member}
                      message={msg.message}
                      isLatest={index === dialog.length - 1}
                      timestamp={msg.timestamp}
                    />
                  )
                })}

                {speakingMember && (
                  <div className="flex items-center gap-2 text-neutral-custom-subdued text-sm bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-accent-custom rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-accent-custom rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-accent-custom rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>{vcMembers.find((m) => m.id === speakingMember)?.name} is speaking...</span>
                  </div>
                )}

                {councilState === 'voting' && votes.length < 5 && (
                  <div className="flex items-center gap-2 text-neutral-custom-subdued text-sm bg-amber-50 rounded-xl p-3 border border-amber-200">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Council is voting... ({votes.length}/5 votes received)</span>
                  </div>
                )}

                {councilState === 'complete' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-green-800">Council Review Complete</p>
                        <p className="text-sm text-green-600">View the final verdict and investment details</p>
                      </div>
                      <Link href={`/verdict/${sessionId}`}>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          View Verdict
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Vote Summary */}
          <div>
            {votes.length > 0 ? (
              <VoteSummary votes={votes} />
            ) : (
              <Card className="bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-accent-custom/10 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent-custom" />
                    <h3 className="font-semibold text-neutral-custom">Waiting for Votes</h3>
                  </div>
                </div>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-custom/5 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-neutral-custom-subdued" />
                  </div>
                  <p className="text-sm text-neutral-custom-subdued">
                    Votes will appear here after the discussion ends
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Member Detail Modal */}
      {selectedMemberData && (
        <MemberDetailPanel
          member={selectedMemberData}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  )
}
