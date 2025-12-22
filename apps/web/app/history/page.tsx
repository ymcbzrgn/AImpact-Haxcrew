'use client'

import Link from 'next/link'
import { useSessionStore, SessionHistoryItem } from '@/stores/session'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/breadcrumb'
import { ConfirmDialog } from '@/components/ui/dialog'
import { useState } from 'react'
import { toast } from '@/stores/toast'

// Icons
function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 22h16" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  )
}

// Mode labels
const modeLabels = {
  shark: 'Shark',
  friendly: 'Friendly',
  analyst: 'Analyst',
}

// History Item Card
function HistoryCard({ item }: { item: SessionHistoryItem }) {
  const isInvest = item.decision === 'invest'

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isInvest ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {isInvest ? (
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div>
              <span
                className={`text-sm font-medium ${
                  isInvest ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {isInvest ? 'Investment' : 'Pass'}
              </span>
              <span className="text-neutral-300 mx-2">|</span>
              <span className="text-sm text-neutral-500">
                {modeLabels[item.investorMode]} Mode
              </span>
            </div>
          </div>

          {item.deckName && (
            <p className="text-sm text-neutral-600 truncate mb-2">{item.deckName}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              {new Date(item.date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span>ID: {item.id.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Right side - Score */}
        <div className="text-center">
          <div
            className={`text-3xl font-bold ${
              item.score >= 70
                ? 'text-green-600'
                : item.score >= 50
                ? 'text-amber-600'
                : 'text-red-600'
            }`}
          >
            {item.score}
          </div>
          <div className="text-xs text-neutral-500">Score</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
        <Link href={`/verdict/${item.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            View Results
          </Button>
        </Link>
        <Link href="/upload" className="flex-1">
          <Button size="sm" className="w-full bg-accent-custom hover:bg-accent-custom-baseline text-white">
            Try Again
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Empty State
function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <TrophyIcon className="w-10 h-10 text-neutral-400" />
      </div>
      <h3 className="text-lg font-medium text-neutral-700 mb-2">
        No history yet
      </h3>
      <p className="text-neutral-500 max-w-sm mx-auto mb-6">
        Your completed pitch sessions will appear here. Start by doing your first pitch!
      </p>
      <Link href="/upload">
        <Button className="bg-accent-custom hover:bg-accent-custom-baseline text-white">
          <PlusIcon className="w-4 h-4 mr-2" />
          Start Your First Pitch
        </Button>
      </Link>
    </div>
  )
}

export default function HistoryPage() {
  const { history, clearHistory } = useSessionStore()
  const [showClearDialog, setShowClearDialog] = useState(false)

  const handleClearHistory = () => {
    clearHistory()
    setShowClearDialog(false)
    toast.success('History cleared', 'All session records have been deleted.')
  }

  // Stats
  const stats = {
    total: history.length,
    invests: history.filter((h) => h.decision === 'invest').length,
    avgScore:
      history.length > 0
        ? Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length)
        : 0,
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header Section */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Breadcrumb />
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-custom">History</h1>
              <p className="text-neutral-custom-subdued">
                Your completed pitch sessions
              </p>
            </div>
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Stats */}
          {history.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-neutral-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-neutral-700">{stats.total}</div>
                <div className="text-sm text-neutral-500">Total Sessions</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.invests}</div>
                <div className="text-sm text-green-700">Investments</div>
              </div>
              <div className="bg-accent-custom/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-accent-custom">{stats.avgScore}</div>
                <div className="text-sm text-accent-custom">Avg. Score</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {history.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {history.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearHistory}
        title="Clear History"
        description="All session history will be deleted. This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}
