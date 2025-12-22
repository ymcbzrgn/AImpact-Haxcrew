'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSessionStore, InvestorMode } from '@/stores/session'
import { apiCall, uploadFile } from '@/lib/api'

// File type icons as SVG components
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

// Mode card icons
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

// Backend response type
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

// Transform backend analysis to frontend format
function transformAnalysis(backendData: BackendAnalysis | null): DeckAnalysis | null {
  if (!backendData) return null

  const categories = backendData.categories || {}

  // Extract scores from categories
  const scores = {
    problem: categories.problem?.score || 0,
    solution: categories.solution?.score || 0,
    market: categories.market?.score || 0,
    traction: categories.traction?.score || 0,
    team: categories.team?.score || 0,
    financials: categories.financials?.score || 0,
    ask: categories.business_model?.score || categories.scalability?.score || 0,
  }

  // Collect all strengths and weaknesses
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
    strengths: allStrengths.slice(0, 5), // Top 5
    weaknesses: allWeaknesses.slice(0, 5), // Top 5
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

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const INVESTOR_MODES: { mode: InvestorMode; title: string; description: string; icon: typeof SharkIcon }[] = [
  {
    mode: 'shark',
    title: 'Shark Mode',
    description: 'Tough questions and stress test. Closest to real VC experience.',
    icon: SharkIcon,
  },
  {
    mode: 'friendly',
    title: 'Friendly Mode',
    description: 'Constructive feedback and supportive approach. Ideal for first-time pitchers.',
    icon: FriendlyIcon,
  },
  {
    mode: 'analyst',
    title: 'Analyst Mode',
    description: 'Data-driven detailed analysis. Focuses on metrics and financials.',
    icon: AnalystIcon,
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

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { setSessionId, setDeckAnalysis, setInvestorMode, investorMode } = useSessionStore()

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
      // Step 1: Create session
      const sessionResponse = await apiCall<{ session_id: string }>('/api/session', {
        method: 'POST',
      })

      if (!sessionResponse.success || !sessionResponse.data) {
        throw new Error(sessionResponse.error?.message || 'Failed to create session')
      }

      const newSessionId = sessionResponse.data.session_id
      setLocalSessionId(newSessionId)
      setSessionId(newSessionId)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      // Step 2: Upload file
      const uploadResponse = await uploadFile(`/api/session/${newSessionId}/upload`, selectedFile)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error?.message || 'Failed to upload file')
      }

      // Step 3: Wait for analysis
      setUploadStatus('analyzing')

      // Poll for analysis result
      let attempts = 0
      const maxAttempts = 60 // 60 seconds max (analysis can take time)

      const pollAnalysis = async (): Promise<DeckAnalysis> => {
        const response = await apiCall<{ status: string; deck_analysis: BackendAnalysis }>(
          `/api/session/${newSessionId}`
        )

        // Check if analysis is ready
        if (response.success && response.data?.deck_analysis) {
          const transformed = transformAnalysis(response.data.deck_analysis)
          if (transformed) {
            return transformed
          }
        }

        // Check if still processing
        if (response.success && response.data?.status === 'processing') {
          if (attempts >= maxAttempts) {
            throw new Error('Analysis timed out')
          }
          attempts++
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return pollAnalysis()
        }

        // Check for errors
        if (response.success && response.data?.status === 'analysis_failed') {
          throw new Error('Deck analysis failed')
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
    <main className="min-h-screen bg-canvas py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-neutral-custom-subdued hover:text-neutral-custom text-sm mb-8 inline-block"
        >
          &larr; Home
        </Link>

        <h1 className="text-3xl font-bold text-neutral-custom mb-2">Upload Deck</h1>
        <p className="text-neutral-custom-subdued mb-8">
          Upload your pitch deck and get AI analysis
        </p>

        {/* Upload Area */}
        {uploadStatus === 'idle' && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
              transition-all duration-200
              ${isDragging
                ? 'border-accent-custom bg-accent-custom/5'
                : 'border-neutral-custom-subdued hover:border-accent-custom hover:bg-accent-custom/5'
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
            <UploadIcon className="w-12 h-12 mx-auto mb-4 text-neutral-custom-subdued" />
            <p className="text-neutral-custom font-medium mb-2">
              Drag your file or click to select
            </p>
            <p className="text-neutral-custom-subdued text-sm">
              PDF, PPTX, PNG, JPG - Max. 50MB
            </p>
          </div>
        )}

        {/* File Selected - Uploading/Analyzing */}
        {file && uploadStatus !== 'idle' && uploadStatus !== 'complete' && (
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent-custom/10 flex items-center justify-center">
                  <FileIcon className="w-6 h-6 text-accent-custom" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-neutral-custom font-medium truncate">{file.name}</p>
                  <p className="text-neutral-custom-subdued text-sm">{formatFileSize(file.size)}</p>
                </div>
                {uploadStatus === 'uploading' || uploadStatus === 'analyzing' ? (
                  <Spinner className="w-6 h-6 text-accent-custom" />
                ) : null}
              </div>

              {/* Progress Bar */}
              {uploadStatus === 'uploading' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-custom-subdued">Uploading...</span>
                    <span className="text-neutral-custom">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-custom transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadStatus === 'analyzing' && (
                <div className="flex items-center gap-2 text-neutral-custom-subdued">
                  <Spinner className="w-4 h-4" />
                  <span>AI is analyzing your deck...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={handleRemoveFile}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Analysis Complete */}
        {uploadStatus === 'complete' && analysis && (
          <div className="space-y-6">
            {/* Overall Score Card */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-neutral-custom">Deck Analysis Complete</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-accent-custom mb-1">
                      {analysis.overallScore}
                    </div>
                    <div className="text-neutral-custom-subdued text-sm">Overall Score</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-custom">{analysis.summary}</p>
                  </div>
                </div>

                {/* Score Visualization */}
                <div className="space-y-3">
                  {SCORE_CATEGORIES.map(({ key, label }) => {
                    const score = analysis.scores[key]
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-neutral-custom-subdued">{label}</div>
                        <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreColor(score)} transition-all duration-500`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <div className="w-8 text-sm text-neutral-custom text-right">{score}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Strengths & Weaknesses */}
                {(analysis.strengths || analysis.weaknesses) && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {analysis.strengths && analysis.strengths.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-green-600 mb-2">Strengths</h4>
                        <ul className="text-sm text-neutral-custom-subdued space-y-1">
                          {analysis.strengths.map((s, i) => (
                            <li key={i}>+ {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-red-600 mb-2">Areas to Improve</h4>
                        <ul className="text-sm text-neutral-custom-subdued space-y-1">
                          {analysis.weaknesses.map((w, i) => (
                            <li key={i}>- {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Remove file button */}
                <div className="mt-6 pt-4 border-t">
                  <button
                    onClick={handleRemoveFile}
                    className="text-sm text-neutral-custom-subdued hover:text-neutral-custom"
                  >
                    Upload a different file
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Mode Selection */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-custom mb-4">
                Select Investor Mode
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INVESTOR_MODES.map(({ mode, title, description, icon: Icon }) => (
                  <Card
                    key={mode}
                    onClick={() => handleModeSelect(mode)}
                    className={`
                      cursor-pointer transition-all duration-200
                      ${selectedMode === mode
                        ? 'ring-2 ring-accent-custom bg-accent-custom/5'
                        : 'hover:shadow-md hover:border-accent-custom/50'
                      }
                    `}
                  >
                    <CardContent className="p-6 text-center">
                      <div
                        className={`
                          w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center
                          ${selectedMode === mode ? 'bg-accent-custom text-white' : 'bg-neutral-100 text-neutral-custom'}
                        `}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-neutral-custom mb-2">{title}</h3>
                      <p className="text-sm text-neutral-custom-subdued">{description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Start Session Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleStartSession}
                disabled={!selectedMode}
                className={`
                  px-8 py-3 text-lg
                  ${selectedMode
                    ? 'bg-accent-custom hover:bg-accent-custom-baseline text-white'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  }
                `}
              >
                Start Pitch
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
