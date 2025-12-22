'use client'

import { useState, useMemo } from 'react'

// Types
export type FeedbackType = 'strength' | 'weakness' | 'suggestion' | 'question' | 'concern'

export interface FeedbackItem {
  id?: string
  category: string
  type: FeedbackType
  content: string
  source?: string // Which VC gave this feedback
  priority?: 'high' | 'medium' | 'low'
  actionable?: boolean
}

export interface CategoryFeedback {
  category: string
  score: number
  items: FeedbackItem[]
}

// Icons
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  )
}

// Type configuration
const typeConfig: Record<FeedbackType, { icon: typeof CheckCircleIcon; color: string; bgColor: string; label: string }> = {
  strength: {
    icon: CheckCircleIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    label: 'Strength',
  },
  weakness: {
    icon: XCircleIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    label: 'Weakness',
  },
  suggestion: {
    icon: LightbulbIcon,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    label: 'Suggestion',
  },
  question: {
    icon: QuestionIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    label: 'Question',
  },
  concern: {
    icon: AlertIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    label: 'Concern',
  },
}

// Single Feedback Item Component
interface FeedbackItemCardProps {
  item: FeedbackItem
  showCategory?: boolean
  showSource?: boolean
  compact?: boolean
  className?: string
}

export function FeedbackItemCard({
  item,
  showCategory = true,
  showSource = false,
  compact = false,
  className = '',
}: FeedbackItemCardProps) {
  const config = typeConfig[item.type]
  const Icon = config.icon

  if (compact) {
    return (
      <div className={`flex items-start gap-2 ${className}`}>
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          {showCategory && (
            <span className="text-xs text-neutral-500 mr-2">[{item.category}]</span>
          )}
          <span className="text-sm text-neutral-700">{item.content}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`${config.bgColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full ${config.color} bg-white flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {showCategory && (
              <span className="text-xs font-medium text-neutral-500 uppercase">{item.category}</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
              {config.label}
            </span>
            {item.priority === 'high' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Important</span>
            )}
          </div>
          <p className="text-sm text-neutral-700">{item.content}</p>
          {showSource && item.source && (
            <p className="text-xs text-neutral-500 mt-2">- {item.source}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Grouped Feedback List
interface FeedbackListProps {
  feedback: FeedbackItem[]
  groupBy?: 'type' | 'category' | 'none'
  showFilters?: boolean
  className?: string
}

export function FeedbackList({
  feedback,
  groupBy = 'type',
  showFilters = true,
  className = '',
}: FeedbackListProps) {
  const [activeFilter, setActiveFilter] = useState<FeedbackType | 'all'>('all')

  const filteredFeedback = useMemo(() => {
    if (activeFilter === 'all') return feedback
    return feedback.filter((item) => item.type === activeFilter)
  }, [feedback, activeFilter])

  const groupedFeedback = useMemo(() => {
    if (groupBy === 'none') return { all: filteredFeedback }

    return filteredFeedback.reduce((acc, item) => {
      const key = groupBy === 'type' ? item.type : item.category
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {} as Record<string, FeedbackItem[]>)
  }, [filteredFeedback, groupBy])

  const typeOrder: FeedbackType[] = ['strength', 'weakness', 'suggestion', 'concern', 'question']
  const sortedGroups = Object.entries(groupedFeedback).sort((a, b) => {
    if (groupBy === 'type') {
      return typeOrder.indexOf(a[0] as FeedbackType) - typeOrder.indexOf(b[0] as FeedbackType)
    }
    return a[0].localeCompare(b[0])
  })

  const counts = useMemo(() => {
    return feedback.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [feedback])

  return (
    <div className={className}>
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-neutral-800 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All ({feedback.length})
          </button>
          {typeOrder.map((type) => {
            const config = typeConfig[type]
            const count = counts[type] || 0
            if (count === 0) return null
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === type
                    ? `${config.bgColor} ${config.color} border`
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {config.label} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Grouped Items */}
      <div className="space-y-6">
        {sortedGroups.map(([group, items]) => (
          <div key={group}>
            {groupBy !== 'none' && (
              <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                groupBy === 'type' ? typeConfig[group as FeedbackType]?.color : 'text-neutral-700'
              }`}>
                {groupBy === 'type' && (() => {
                  const Icon = typeConfig[group as FeedbackType]?.icon
                  return Icon ? <Icon className="w-4 h-4" /> : null
                })()}
                {groupBy === 'type' ? typeConfig[group as FeedbackType]?.label : group}
                <span className="text-neutral-400">({items.length})</span>
              </h4>
            )}
            <div className="space-y-3">
              {items.map((item, index) => (
                <FeedbackItemCard
                  key={item.id || index}
                  item={item}
                  showCategory={groupBy !== 'category'}
                  showSource
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredFeedback.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          <FilterIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No feedback matches this filter</p>
        </div>
      )}
    </div>
  )
}

// Summary Stats
interface FeedbackSummaryProps {
  feedback: FeedbackItem[]
  className?: string
}

export function FeedbackSummary({ feedback, className = '' }: FeedbackSummaryProps) {
  const stats = useMemo(() => {
    const counts = feedback.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      strengths: counts.strength || 0,
      weaknesses: counts.weakness || 0,
      suggestions: counts.suggestion || 0,
      total: feedback.length,
    }
  }, [feedback])

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      <div className="bg-green-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{stats.strengths}</div>
        <div className="text-sm text-green-700">Strengths</div>
      </div>
      <div className="bg-red-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-red-600">{stats.weaknesses}</div>
        <div className="text-sm text-red-700">To Improve</div>
      </div>
      <div className="bg-amber-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-amber-600">{stats.suggestions}</div>
        <div className="text-sm text-amber-700">Suggestions</div>
      </div>
    </div>
  )
}

// Actionable Feedback (with checkboxes)
interface ActionableFeedbackProps {
  feedback: FeedbackItem[]
  onToggle?: (itemId: string, completed: boolean) => void
  className?: string
}

export function ActionableFeedback({ feedback, onToggle, className = '' }: ActionableFeedbackProps) {
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const actionableItems = feedback.filter((item) => item.actionable || item.type === 'suggestion' || item.type === 'weakness')

  const handleToggle = (itemId: string) => {
    const newCompleted = new Set(completed)
    const isCompleted = !completed.has(itemId)

    if (isCompleted) {
      newCompleted.add(itemId)
    } else {
      newCompleted.delete(itemId)
    }

    setCompleted(newCompleted)
    onToggle?.(itemId, isCompleted)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-neutral-700">Action Items</h3>
        <span className="text-sm text-neutral-500">
          {completed.size}/{actionableItems.length} completed
        </span>
      </div>

      {actionableItems.map((item, index) => {
        const itemId = item.id || `item-${index}`
        const isChecked = completed.has(itemId)
        const config = typeConfig[item.type]

        return (
          <label
            key={itemId}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              isChecked ? 'bg-neutral-50 border-neutral-200' : `${config.bgColor} border`
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleToggle(itemId)}
              className="mt-1 w-4 h-4 rounded border-neutral-300 text-green-600 focus:ring-green-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-neutral-500">[{item.category}]</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>
              </div>
              <p className={`text-sm ${isChecked ? 'text-neutral-400 line-through' : 'text-neutral-700'}`}>
                {item.content}
              </p>
            </div>
          </label>
        )
      })}

      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(completed.size / actionableItems.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default FeedbackList
