'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSessionStore, InvestorMode } from '@/stores/session'
import { apiCall, uploadFile } from '@/lib/api'

// Icons
function PdfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 15h6" />
      <path d="M9 11h6" />
    </svg>
  )
}

function PptxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

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

function SharkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12c2-4 6-7 10-7s8 3 10 7c-2 4-6 7-10 7s-8-3-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function FriendlyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  )
}

function AnalystIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

// Types
interface DeckAnalysis {
  scores: {
    problem: number
    solution: number
    market: number
    traction: number
    team: number
    financials: number
    ask: number
  }
  overallScore: number
  summary: string
  strengths?: string[]
  weaknesses?: string[]
}

interface BackendAnalysis {
  scores?: {
    overall_score?: number
  }
  categories?: {
    [key: string]: {
      score?: number
      strengths?: string[]
      weaknesses?: string[]
    }
  }
  executive_summary?: string
}

function transformAnalysis(backendData: BackendAnalysis | null): DeckAnalysis | null {
  if (!backendData) return null

  // Check if analysis actually has valid data (not just error object)
  if (!backendData.scores?.overall_score || backendData.scores.overall_score === 0) {
    return null
  }

  const categories = backendData.categories || {}

  const scores = {
    problem: categories.problem?.score || 0,
    solution: categories.solution?.score || 0,
    market: categories.market?.score || 0,
    traction: categories.traction?.score || 0,
    team: categories.team?.score || 0,
    financials: categories.financials?.score || 0,
    ask: categories.business_model?.score || categories.scalability?.score || 0,
  }

  const allStrengths: string[] = []
  const allWeaknesses: string[] = []

  Object.values(categories).forEach((cat) => {
    if (cat.strengths) allStrengths.push(...cat.strengths)
    if (cat.weaknesses) allWeaknesses.push(...cat.weaknesses)
  })

  return {
    scores,
    overallScore: backendData.scores?.overall_score || 0,
    summary: backendData.executive_summary || 'Analysis complete',
    strengths: allStrengths.slice(0, 5),
    weaknesses: allWeaknesses.slice(0, 5),
  }
}

type UploadStatus = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'image/png',
  'image/jpeg',
  'image/jpg',
]

const MAX_FILE_SIZE = 50 * 1024 * 1024

const INVESTOR_MODES: { mode: InvestorMode; title: string; description: string; icon: typeof SharkIcon; color: string }[] = [
  {
    mode: 'shark',
    title: 'Shark Mode',
    description: 'Tough questions and stress test. Closest to real VC experience.',
    icon: SharkIcon,
    color: 'red',
  },
  {
    mode: 'friendly',
    title: 'Friendly Mode',
    description: 'Constructive feedback and supportive approach. Ideal for first-time pitchers.',
    icon: FriendlyIcon,
    color: 'green',
  },
  {
    mode: 'analyst',
    title: 'Analyst Mode',
    description: 'Data-driven detailed analysis. Focuses on metrics and financials.',
    icon: AnalystIcon,
    color: 'blue',
  },
]

const SCORE_CATEGORIES = [
  { key: 'problem', label: 'Problem' },
  { key: 'solution', label: 'Solution' },
  { key: 'market', label: 'Market' },
  { key: 'traction', label: 'Traction' },
  { key: 'team', label: 'Team' },
  { key: 'financials', label: 'Financials' },
  { key: 'ask', label: 'Ask' },
] as const

function getFileIcon(type: string) {
  if (type === 'application/pdf') return PdfIcon
  if (type.includes('presentation') || type.includes('powerpoint')) return PptxIcon
  if (type.startsWith('image/')) return ImageIcon
  return PdfIcon
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'bg-green-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getScoreTextColor(score: number): string {
  if (score >= 70) return 'text-green-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { setSessionId, setDeckAnalysis, setInvestorMode } = useSessionStore()

  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setLocalSessionId] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<DeckAnalysis | null>(null)
  const [selectedMode, setSelectedMode] = useState<InvestorMode | null>(null)

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Unsupported file format. Upload PDF, PPTX, PNG or JPG.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 50MB limit.'
    }
    return null
  }

  const handleFile = useCallback(async (selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(selectedFile)
    setError(null)
    setUploadStatus('uploading')
    setUploadProgress(0)

    try {
      const sessionResponse = await apiCall<{ session_id: string }>('/api/session', {
        method: 'POST',
      })

      if (!sessionResponse.success || !sessionResponse.data) {
        throw new Error(sessionResponse.error?.message || 'Failed to create session')
      }

      const newSessionId = sessionResponse.data.session_id
      setLocalSessionId(newSessionId)
      setSessionId(newSessionId)

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const uploadResponse = await uploadFile(`/api/session/${newSessionId}/upload`, selectedFile)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error?.message || 'Failed to upload file')
      }

      setUploadStatus('analyzing')

      let attempts = 0
      const maxAttempts = 60

      const pollAnalysis = async (): Promise<DeckAnalysis> => {
        const response = await apiCall<{ status: string; deck_analysis: BackendAnalysis }>(
          `/api/session/${newSessionId}`
        )

        if (response.success && response.data?.deck_analysis) {
          const transformed = transformAnalysis(response.data.deck_analysis)
          if (transformed) {
            return transformed
          }
        }

        if (response.success && response.data?.status === 'processing') {
          if (attempts >= maxAttempts) {
            throw new Error('Analysis timed out')
          }
          attempts++
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return pollAnalysis()
        }

        if (response.success && (response.data?.status === 'analysis_failed' || response.data?.status === 'error')) {
          throw new Error('Deck analysis failed. Please try again with a different PDF.')
        }

        if (attempts >= maxAttempts) {
          throw new Error('Analysis timed out')
        }

        attempts++
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return pollAnalysis()
      }

      const deckAnalysis = await pollAnalysis()
      setAnalysis(deckAnalysis)
      setDeckAnalysis(deckAnalysis)
      setUploadStatus('complete')
    } catch (err) {
      setUploadStatus('error')
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }, [setSessionId, setDeckAnalysis])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFile(droppedFile)
    }
  }, [handleFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
  }, [handleFile])

  const handleRemoveFile = useCallback(() => {
    setFile(null)
    setUploadStatus('idle')
    setUploadProgress(0)
    setError(null)
    setAnalysis(null)
    setLocalSessionId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleModeSelect = useCallback((mode: InvestorMode) => {
    setSelectedMode(mode)
    setInvestorMode(mode)
  }, [setInvestorMode])

  const handleStartSession = useCallback(async () => {
    if (!sessionId || !selectedMode) return

    try {
      await apiCall(`/api/session/${sessionId}/start`, {
        method: 'POST',
        body: JSON.stringify({ mode: selectedMode }),
      })
      router.push(`/session/${sessionId}`)
    } catch (err) {
      setError('Failed to start session')
    }
  }, [sessionId, selectedMode, router])

  const FileIcon = file ? getFileIcon(file.type) : UploadIcon

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Step Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Upload', active: uploadStatus === 'idle' || uploadStatus === 'uploading' || uploadStatus === 'error' },
              { num: 2, label: 'Analyze', active: uploadStatus === 'analyzing' },
              { num: 3, label: 'Select Mode', active: uploadStatus === 'complete' && !selectedMode },
              { num: 4, label: 'Practice', active: uploadStatus === 'complete' && !!selectedMode },
            ].map((step, index) => {
              // Determine if step is completed
              const getCompletedStep = () => {
                if (uploadStatus === 'error' || uploadStatus === 'idle') return 0
                if (uploadStatus === 'uploading') return 1
                if (uploadStatus === 'analyzing') return 2
                if (uploadStatus === 'complete') return 4
                return 0
              }
              const completedStep = getCompletedStep()
              const isCompleted = step.num < completedStep

              return (
                <div key={step.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        step.active
                          ? 'bg-accent-custom text-white shadow-lg shadow-accent-custom/30'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckIcon className="w-5 h-5" />
                      ) : (
                        step.num
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${step.active ? 'text-accent-custom' : 'text-neutral-custom-subdued'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      isCompleted ? 'bg-green-500' : 'bg-neutral-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-custom mb-3">
            Upload Your Pitch Deck
          </h1>
          <p className="text-lg text-neutral-custom-subdued max-w-xl mx-auto">
            Upload your deck and get instant AI analysis. Then choose your investor mode and start practicing.
          </p>
        </div>

        {/* Upload Area - Only show when idle */}
        {uploadStatus === 'idle' && (
          <div className="max-w-2xl mx-auto">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer
                transition-all duration-300 group
                ${isDragging
                  ? 'border-accent-custom bg-accent-custom/5 scale-[1.02]'
                  : 'border-neutral-300 hover:border-accent-custom hover:bg-accent-custom/5'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.pptx,.ppt,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload Icon with Animation */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent-custom/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadIcon className="w-10 h-10 text-accent-custom" />
              </div>

              <h3 className="text-xl font-bold text-neutral-custom mb-2">
                Drag & Drop Your Deck
              </h3>
              <p className="text-neutral-custom-subdued mb-6">
                or click to browse your files
              </p>

              {/* File Types */}
              <div className="flex items-center justify-center gap-4 text-sm text-neutral-custom-subdued">
                <div className="flex items-center gap-1.5">
                  <PdfIcon className="w-5 h-5" />
                  PDF
                </div>
                <div className="flex items-center gap-1.5">
                  <PptxIcon className="w-5 h-5" />
                  PPTX
                </div>
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-5 h-5" />
                  Images
                </div>
              </div>

              <p className="text-xs text-neutral-400 mt-4">
                Maximum file size: 50MB
              </p>
            </div>

            {/* Tips Section */}
            <div className="mt-8 p-6 bg-accent-custom/5 rounded-2xl border border-accent-custom/20">
              <h3 className="font-semibold text-neutral-custom mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Tips for a Great Pitch Deck
              </h3>
              <ul className="space-y-3 text-sm text-neutral-custom-subdued">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-accent-custom/20 text-accent-custom flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                  <span><strong className="text-neutral-custom">Keep it concise</strong> - 10-15 slides is ideal. Investors see hundreds of decks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-accent-custom/20 text-accent-custom flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                  <span><strong className="text-neutral-custom">Lead with the problem</strong> - Make investors feel the pain before presenting the solution.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-accent-custom/20 text-accent-custom flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                  <span><strong className="text-neutral-custom">Show traction</strong> - Real numbers beat projections. Include metrics if you have them.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-accent-custom/20 text-accent-custom flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                  <span><strong className="text-neutral-custom">Be clear on the ask</strong> - State how much you&apos;re raising and what you&apos;ll use it for.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Uploading/Analyzing State */}
        {file && (uploadStatus === 'uploading' || uploadStatus === 'analyzing') && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white shadow-xl border-0 overflow-hidden">
              <CardContent className="p-8">
                {/* File Info */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-accent-custom/10 flex items-center justify-center">
                    <FileIcon className="w-7 h-7 text-accent-custom" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-neutral-custom truncate">{file.name}</p>
                    <p className="text-neutral-custom-subdued">{formatFileSize(file.size)}</p>
                  </div>
                  <Spinner className="w-8 h-8 text-accent-custom" />
                </div>

                {/* Progress */}
                {uploadStatus === 'uploading' && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-neutral-custom-subdued">Uploading...</span>
                      <span className="text-accent-custom">{uploadProgress}%</span>
                    </div>
                    <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent-custom to-accent-custom-baseline transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadStatus === 'analyzing' && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-3 text-accent-custom font-medium">
                      <div className="w-3 h-3 bg-accent-custom rounded-full animate-pulse" />
                      AI is analyzing your deck...
                    </div>
                    <p className="text-sm text-neutral-custom-subdued mt-2">
                      This may take up to a minute
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error State */}
        {error && uploadStatus === 'error' && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-800 mb-2">Upload Failed</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <Button
                  onClick={handleRemoveFile}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analysis Complete */}
        {uploadStatus === 'complete' && analysis && (
          <div className="space-y-8">
            {/* Analysis Card */}
            <Card className="bg-white shadow-xl border-0 overflow-hidden">
              <CardContent className="p-0">
                {/* Header with Score */}
                <div className="bg-gradient-to-r from-accent-custom to-accent-custom-baseline p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium mb-1">OVERALL SCORE</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-bold">{analysis.overallScore}</span>
                        <span className="text-2xl text-white/60">/100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-white/80 mb-2">
                        <CheckIcon className="w-5 h-5" />
                        Analysis Complete
                      </div>
                      {file && (
                        <p className="text-sm text-white/60">{file.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="p-8">
                  <h3 className="text-lg font-bold text-neutral-custom mb-6">Category Scores</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {SCORE_CATEGORIES.map(({ key, label }) => {
                      const score = analysis.scores[key]
                      return (
                        <div key={key} className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium text-neutral-custom">{label}</div>
                          <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getScoreColor(score)} transition-all duration-700`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <div className={`w-10 text-sm font-bold text-right ${getScoreTextColor(score)}`}>
                            {score}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Summary */}
                  <div className="mt-8 p-6 bg-neutral-50 rounded-2xl">
                    <h4 className="font-semibold text-neutral-custom mb-2">AI Summary</h4>
                    <p className="text-neutral-custom-subdued">{analysis.summary}</p>
                  </div>

                  {/* Strengths & Weaknesses */}
                  {(analysis.strengths?.length || analysis.weaknesses?.length) && (
                    <div className="mt-6 grid md:grid-cols-2 gap-6">
                      {analysis.strengths && analysis.strengths.length > 0 && (
                        <div className="p-6 bg-green-50 rounded-2xl">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <CheckIcon className="w-5 h-5" />
                            Strengths
                          </h4>
                          <ul className="space-y-2">
                            {analysis.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                                <span className="text-green-500 mt-1">+</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                        <div className="p-6 bg-amber-50 rounded-2xl">
                          <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Areas to Improve
                          </h4>
                          <ul className="space-y-2">
                            {analysis.weaknesses.map((w, i) => (
                              <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                                <span className="text-amber-500 mt-1">-</span>
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Change File */}
                  <button
                    onClick={handleRemoveFile}
                    className="mt-6 text-sm text-neutral-custom-subdued hover:text-accent-custom transition-colors"
                  >
                    Upload a different file
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Mode Selection */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-custom mb-2 text-center">
                Choose Your Investor Mode
              </h2>
              <p className="text-neutral-custom-subdued text-center mb-8">
                Select how tough you want your AI investors to be
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {INVESTOR_MODES.map(({ mode, title, description, icon: Icon, color }) => (
                  <Card
                    key={mode}
                    onClick={() => handleModeSelect(mode)}
                    className={`
                      cursor-pointer transition-all duration-300 overflow-hidden
                      ${selectedMode === mode
                        ? 'ring-2 ring-accent-custom shadow-xl scale-[1.02]'
                        : 'hover:shadow-lg hover:scale-[1.01]'
                      }
                    `}
                  >
                    <CardContent className="p-6 text-center">
                      <div
                        className={`
                          w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors
                          ${selectedMode === mode
                            ? 'bg-accent-custom text-white'
                            : color === 'red'
                              ? 'bg-red-100 text-red-600'
                              : color === 'green'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-blue-100 text-blue-600'
                          }
                        `}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-neutral-custom mb-2">{title}</h3>
                      <p className="text-sm text-neutral-custom-subdued">{description}</p>

                      {selectedMode === mode && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-accent-custom font-medium">
                          <CheckIcon className="w-5 h-5" />
                          Selected
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center pt-4">
              <Button
                onClick={handleStartSession}
                disabled={!selectedMode}
                size="lg"
                className={`
                  px-12 py-6 text-lg rounded-full transition-all duration-300
                  ${selectedMode
                    ? 'bg-accent-custom hover:bg-accent-custom-baseline text-white shadow-xl shadow-accent-custom/30 hover:shadow-2xl hover:scale-105'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  }
                `}
              >
                Start Pitch Session
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              {!selectedMode && (
                <p className="text-sm text-neutral-custom-subdued mt-3">
                  Select an investor mode to continue
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
