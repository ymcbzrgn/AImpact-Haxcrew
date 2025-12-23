'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  ChevronRight,
  Play,
  Trash2,
  Zap,
  Target,
  Users,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// API_URL will be used when integrating with backend
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface SessionSummary {
  id: string
  created_at: string
  status: string
  deck_analysis?: {
    scores?: {
      overall_score?: number
      investment_grade?: string
    }
    executive_summary?: string
  }
}

// Stat card component
function StatCard({
  title,
  value,
  change,
  icon,
  trend,
}: {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-custom-subdued mb-1">{title}</p>
            <p className="text-2xl font-bold text-neutral-custom">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-neutral-custom-subdued'
              }`}>
                {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                {change}
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent-custom/10 flex items-center justify-center text-accent-custom">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Session card component
function SessionCard({ session, onDelete }: { session: SessionSummary; onDelete?: () => void }) {
  const score = session.deck_analysis?.scores?.overall_score || 0
  const summary = session.deck_analysis?.executive_summary || 'No analysis available'
  const date = new Date(session.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      ready: { label: 'Ready', color: 'bg-green-100 text-green-700' },
      processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700' },
      uploaded: { label: 'Uploaded', color: 'bg-blue-100 text-blue-700' },
      created: { label: 'Created', color: 'bg-gray-100 text-gray-700' },
      completed: { label: 'Completed', color: 'bg-purple-100 text-purple-700' },
    }
    return badges[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
  }

  const statusBadge = getStatusBadge(session.status)

  return (
    <Card className="bg-white hover:shadow-md transition-shadow group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-custom/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent-custom" />
            </div>
            <div>
              <p className="font-medium text-neutral-custom text-sm">
                Session {session.id.slice(0, 8)}...
              </p>
              <div className="flex items-center gap-2 text-xs text-neutral-custom-subdued">
                <Calendar className="w-3 h-3" />
                {date}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
            {score > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getScoreColor(score)}`}>
                {score}/100
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-neutral-custom-subdued line-clamp-2 mb-4">
          {summary}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {session.status === 'ready' && (
              <Link href={`/mode-select?session=${session.id}`}>
                <Button size="sm" className="bg-accent-custom hover:bg-accent-custom-baseline text-white">
                  <Play className="w-3 h-3 mr-1" />
                  Practice
                </Button>
              </Link>
            )}
            <Link href={`/session/${session.id}?mode=solo`}>
              <Button size="sm" variant="outline">
                View
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-neutral-custom-subdued hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick action card
function QuickActionCard({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  color: string
}) {
  return (
    <Link href={href}>
      <Card className="bg-white hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group">
        <CardContent className="p-4 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${color}15` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-neutral-custom">{title}</h3>
            <p className="text-sm text-neutral-custom-subdued">{description}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-custom-subdued group-hover:text-neutral-custom transition-colors" />
        </CardContent>
      </Card>
    </Link>
  )
}

// Navbar for dashboard
function DashboardNav() {
  return (
    <nav className="bg-white border-b px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-custom flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-neutral-custom">PitchDrill</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/help" className="text-sm text-neutral-custom-subdued hover:text-neutral-custom transition-colors">
            Help
          </Link>
          <Link href="/settings" className="text-sm text-neutral-custom-subdued hover:text-neutral-custom transition-colors">
            Settings
          </Link>
          <Link href="/about" className="text-sm text-neutral-custom-subdued hover:text-neutral-custom transition-colors">
            About
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/upload">
            <Button className="bg-accent-custom hover:bg-accent-custom-baseline text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgScore: 0,
    completedSessions: 0,
    improvement: '+12%',
  })

  // Fetch sessions from API (mock for now)
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // In a real app, we'd fetch from the API
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mock sessions
        const mockSessions: SessionSummary[] = [
          {
            id: '742ec4ff-e95d-4c06-b848-9669e40180d1',
            created_at: new Date().toISOString(),
            status: 'ready',
            deck_analysis: {
              scores: { overall_score: 78, investment_grade: 'B+' },
              executive_summary: 'Strong problem statement with clear market opportunity. Consider strengthening the competitive analysis section.',
            },
          },
          {
            id: '0222bead-81f2-4b5c-b1b2-c4b6133649ab',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            status: 'ready',
            deck_analysis: {
              scores: { overall_score: 85, investment_grade: 'A-' },
              executive_summary: 'Excellent pitch with compelling narrative. The team section could highlight more relevant experience.',
            },
          },
          {
            id: 'demo-session-3',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            status: 'completed',
            deck_analysis: {
              scores: { overall_score: 65, investment_grade: 'B' },
              executive_summary: 'Good foundation but needs more market validation data. Consider adding customer testimonials.',
            },
          },
        ]

        setSessions(mockSessions)
        setStats({
          totalSessions: mockSessions.length,
          avgScore: Math.round(mockSessions.reduce((acc, s) => acc + (s.deck_analysis?.scores?.overall_score || 0), 0) / mockSessions.length),
          completedSessions: mockSessions.filter(s => s.status === 'completed').length,
          improvement: '+12%',
        })
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
  }

  return (
    <div className="min-h-screen bg-canvas">
      <DashboardNav />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-custom mb-2">Dashboard</h1>
          <p className="text-neutral-custom-subdued">
            Track your pitch practice progress and manage your sessions.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Sessions"
            value={stats.totalSessions}
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            title="Average Score"
            value={`${stats.avgScore}/100`}
            change={stats.improvement}
            trend="up"
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <StatCard
            title="Completed"
            value={stats.completedSessions}
            icon={<Trophy className="w-5 h-5" />}
          />
          <StatCard
            title="This Week"
            value={stats.totalSessions}
            change="+3 from last week"
            trend="up"
            icon={<Clock className="w-5 h-5" />}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sessions List */}
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Sessions</CardTitle>
                <Link href="/upload">
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    New
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-accent-custom/20 border-t-accent-custom rounded-full animate-spin" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-neutral-custom-subdued mx-auto mb-4" />
                    <p className="text-neutral-custom-subdued mb-4">No sessions yet</p>
                    <Link href="/upload">
                      <Button className="bg-accent-custom hover:bg-accent-custom-baseline text-white">
                        Create Your First Session
                      </Button>
                    </Link>
                  </div>
                ) : (
                  sessions.map(session => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onDelete={() => handleDeleteSession(session.id)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="font-semibold text-neutral-custom">Quick Actions</h2>
            <QuickActionCard
              icon={<Plus className="w-6 h-6" />}
              title="Upload New Deck"
              description="Start a new practice session"
              href="/upload"
              color="#8B5CF6"
            />
            <QuickActionCard
              icon={<Target className="w-6 h-6" />}
              title="Solo Practice"
              description="Practice at your own pace"
              href="/upload"
              color="#3B82F6"
            />
            <QuickActionCard
              icon={<Users className="w-6 h-6" />}
              title="VC Council"
              description="Face the investor panel"
              href="/upload"
              color="#10B981"
            />

            {/* Tips Card */}
            <Card className="bg-gradient-to-br from-accent-custom to-accent-custom-baseline text-white">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Pro Tip</h3>
                <p className="text-sm text-white/80">
                  Practice your pitch at least 3 times before your real investor meeting.
                  Studies show this increases success rates by 40%.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
