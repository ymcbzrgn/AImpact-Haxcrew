'use client'

import { useState } from 'react'

// Types
export interface TermSheetData {
  valuation: string
  valuationType?: 'pre-money' | 'post-money'
  investmentAmount: string
  equityPercentage: string
  boardSeats: number
  investorRights?: string[]
  specialTerms?: string[]
  vestingSchedule?: string
  liquidationPreference?: string
  antiDilution?: string
  proRataRights?: boolean
  informationRights?: boolean
  dragAlong?: boolean
  tagAlong?: boolean
}

// Icons
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Simple Term Sheet Card
interface TermSheetCardProps {
  termSheet: TermSheetData
  className?: string
}

export function TermSheetCard({ termSheet, className = '' }: TermSheetCardProps) {
  return (
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <TrophyIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-800">Term Sheet Offer</h3>
            <p className="text-sm text-green-600">Investment terms</p>
          </div>
        </div>
      </div>

      {/* Main Terms */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/80 rounded-lg p-4">
            <div className="text-sm text-green-700 mb-1">Valuation</div>
            <div className="text-2xl font-bold text-green-900">{termSheet.valuation}</div>
            {termSheet.valuationType && (
              <div className="text-xs text-green-600 mt-1 capitalize">{termSheet.valuationType}</div>
            )}
          </div>
          <div className="bg-white/80 rounded-lg p-4">
            <div className="text-sm text-green-700 mb-1">Investment Amount</div>
            <div className="text-2xl font-bold text-green-900">{termSheet.investmentAmount}</div>
          </div>
          <div className="bg-white/80 rounded-lg p-4">
            <div className="text-sm text-green-700 mb-1">Equity Percentage</div>
            <div className="text-2xl font-bold text-green-900">{termSheet.equityPercentage}</div>
          </div>
          <div className="bg-white/80 rounded-lg p-4">
            <div className="text-sm text-green-700 mb-1">Board Seats</div>
            <div className="text-2xl font-bold text-green-900">{termSheet.boardSeats} Seats</div>
          </div>
        </div>

        {/* Special Terms */}
        {termSheet.specialTerms && termSheet.specialTerms.length > 0 && (
          <div className="bg-white/80 rounded-lg p-4">
            <div className="text-sm font-medium text-green-700 mb-3">Special Terms</div>
            <ul className="space-y-2">
              {termSheet.specialTerms.map((term, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-green-900">
                  <CheckIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// Detailed Term Sheet with expandable sections
interface DetailedTermSheetProps {
  termSheet: TermSheetData
  className?: string
}

export function DetailedTermSheet({ termSheet, className = '' }: DetailedTermSheetProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main']))

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const sections = [
    {
      id: 'main',
      title: 'Main Terms',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-neutral-500">Valuation</span>
            <p className="font-semibold">{termSheet.valuation}</p>
          </div>
          <div>
            <span className="text-sm text-neutral-500">Investment</span>
            <p className="font-semibold">{termSheet.investmentAmount}</p>
          </div>
          <div>
            <span className="text-sm text-neutral-500">Equity Percentage</span>
            <p className="font-semibold">{termSheet.equityPercentage}</p>
          </div>
          <div>
            <span className="text-sm text-neutral-500">Board Seats</span>
            <p className="font-semibold">{termSheet.boardSeats}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'rights',
      title: 'Investor Rights',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Pro-rata Rights</span>
            <span className={`text-sm font-medium ${termSheet.proRataRights ? 'text-green-600' : 'text-neutral-400'}`}>
              {termSheet.proRataRights ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Information Rights</span>
            <span className={`text-sm font-medium ${termSheet.informationRights ? 'text-green-600' : 'text-neutral-400'}`}>
              {termSheet.informationRights ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Drag-along</span>
            <span className={`text-sm font-medium ${termSheet.dragAlong ? 'text-green-600' : 'text-neutral-400'}`}>
              {termSheet.dragAlong ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Tag-along</span>
            <span className={`text-sm font-medium ${termSheet.tagAlong ? 'text-green-600' : 'text-neutral-400'}`}>
              {termSheet.tagAlong ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'protection',
      title: 'Protective Provisions',
      content: (
        <div className="space-y-3">
          {termSheet.liquidationPreference && (
            <div>
              <span className="text-sm text-neutral-500">Liquidation Preference</span>
              <p className="font-medium">{termSheet.liquidationPreference}</p>
            </div>
          )}
          {termSheet.antiDilution && (
            <div>
              <span className="text-sm text-neutral-500">Anti-dilution</span>
              <p className="font-medium">{termSheet.antiDilution}</p>
            </div>
          )}
          {termSheet.vestingSchedule && (
            <div>
              <span className="text-sm text-neutral-500">Vesting</span>
              <p className="font-medium">{termSheet.vestingSchedule}</p>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className={`bg-white border border-neutral-200 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500">
        <div className="flex items-center gap-3 text-white">
          <DocumentIcon className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-bold">Term Sheet</h3>
            <p className="text-sm opacity-90">Detailed investment terms</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-neutral-100">
        {sections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
            >
              <span className="font-medium text-neutral-700">{section.title}</span>
              <ChevronDownIcon
                className={`w-5 h-5 text-neutral-400 transition-transform ${
                  expandedSections.has(section.id) ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSections.has(section.id) && (
              <div className="px-6 pb-4 text-neutral-700">{section.content}</div>
            )}
          </div>
        ))}
      </div>

      {/* Special Terms */}
      {termSheet.specialTerms && termSheet.specialTerms.length > 0 && (
        <div className="px-6 py-4 bg-green-50 border-t border-green-100">
          <div className="text-sm font-medium text-green-700 mb-2">Special Terms</div>
          <ul className="space-y-1">
            {termSheet.specialTerms.map((term, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                <CheckIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                {term}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Compact Term Sheet Summary
interface TermSheetSummaryProps {
  termSheet: TermSheetData
  onClick?: () => void
  className?: string
}

export function TermSheetSummary({ termSheet, onClick, className = '' }: TermSheetSummaryProps) {
  return (
    <div
      className={`bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white ${
        onClick ? 'cursor-pointer hover:from-green-600 hover:to-emerald-600 transition-all' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrophyIcon className="w-8 h-8" />
          <div>
            <div className="font-bold text-lg">{termSheet.valuation}</div>
            <div className="text-sm opacity-90">{termSheet.investmentAmount} for {termSheet.equityPercentage}</div>
          </div>
        </div>
        {onClick && (
          <div className="text-sm opacity-75">Details &rarr;</div>
        )}
      </div>
    </div>
  )
}

// No Term Sheet / Pass Card
export function NoTermSheet({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-neutral-100 border border-neutral-200 rounded-xl p-6 text-center ${className}`}>
      <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <DocumentIcon className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-medium text-neutral-700 mb-2">No Term Sheet</h3>
      <p className="text-sm text-neutral-500">
        No investment offer was received this round. Review the feedback to improve your pitch.
      </p>
    </div>
  )
}

export default TermSheetCard
