'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Upload,
  FileText,
  FileImage,
  File,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Zap,
  CheckCircle,
  X,
  Sparkles,
  Target,
  Lightbulb,
  TrendingUp,
  Users,
  Briefcase,
  BarChart3,
  Shield,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useSessionStore } from '@/stores/session'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'

interface CategoryAnalysis {
  score: number
  label: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
}

interface AnalysisResult {
  scores: {
    overall_score: number
    investment_grade: string
  }
  categories: {
    problem?: CategoryAnalysis
    solution?: CategoryAnalysis
    market?: CategoryAnalysis
    business_model?: CategoryAnalysis
    team?: CategoryAnalysis
    [key: string]: CategoryAnalysis | undefined
  }
  executive_summary: string
}

// Navbar component
function UploadNav() {
  return (
    <nav className="bg-white border-b px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
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
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

// File type config
const fileTypeConfig = {
  pdf: { icon: FileText, color: '#ef4444', label: 'PDF Document' },
  ppt: { icon: FileImage, color: '#f97316', label: 'PowerPoint' },
  pptx: { icon: FileImage, color: '#f97316', label: 'PowerPoint' },
  png: { icon: FileImage, color: '#3b82f6', label: 'PNG Image' },
  jpg: { icon: FileImage, color: '#3b82f6', label: 'JPG Image' },
  jpeg: { icon: FileImage, color: '#3b82f6', label: 'JPEG Image' },
}

function getFileConfig(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() as keyof typeof fileTypeConfig
  return fileTypeConfig[ext] || { icon: File, color: '#6b7280', label: 'File' }
}

// Category icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  problem: <Target className="w-5 h-5" />,
  solution: <Lightbulb className="w-5 h-5" />,
  market: <TrendingUp className="w-5 h-5" />,
  business_model: <Briefcase className="w-5 h-5" />,
  team: <Users className="w-5 h-5" />,
}

// Animated Progress component
function AnimatedProgress({ progress, stage }: { progress: number; stage: string }) {
  return (
    <div className="space-y-4">
      <div className="relative h-3 bg-neutral-custom/10 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-custom to-purple-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-custom-subdued">{stage}</span>
        <span className="font-medium text-accent-custom">{progress}%</span>
      </div>
    </div>
  )
}

// Animated Score Circle
function AnimatedScoreCircle({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
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
  }, [score])

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const getGrade = (score: number) => {
    if (score >= 90) return { color: '#22c55e', label: 'Excellent' }
    if (score >= 80) return { color: '#22c55e', label: 'Great' }
    if (score >= 70) return { color: '#84cc16', label: 'Good' }
    if (score >= 60) return { color: '#eab308', label: 'Fair' }
    return { color: '#ef4444', label: 'Needs Work' }
  }

  const { color, label } = getGrade(animatedScore)

  return (
    <div className="relative w-44 h-44">
      {/* Glow effect */}
      <div className="absolute inset-4 rounded-full blur-xl opacity-30" style={{ backgroundColor: color }} />

      <svg className="w-full h-full transform -rotate-90 relative z-10">
        <circle
          cx="88"
          cy="88"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          className="text-neutral-custom/10"
        />
        <circle
          cx="88"
          cy="88"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-100"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="text-4xl font-bold text-neutral-custom">{animatedScore}</span>
        <span className="text-sm font-medium" style={{ color }}>{label}</span>
      </div>
    </div>
  )
}

// Category Score Card
function CategoryScoreCard({
  name,
  score,
  index
}: {
  name: string
  score: number
  index: number
}) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score)
    }, index * 100)
    return () => clearTimeout(timer)
  }, [score, index])

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#eab308'
    return '#ef4444'
  }

  return (
    <div className="flex items-center gap-4 p-3 bg-neutral-custom/5 rounded-xl hover:bg-neutral-custom/10 transition-colors">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${getScoreColor(animatedScore)}15`, color: getScoreColor(animatedScore) }}
      >
        {categoryIcons[name] || <BarChart3 className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium text-neutral-custom capitalize text-sm">{name.replace('_', ' ')}</span>
          <span className="text-sm font-semibold" style={{ color: getScoreColor(animatedScore) }}>
            {animatedScore}/100
          </span>
        </div>
        <div className="w-full h-1.5 bg-neutral-custom/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${animatedScore}%`, backgroundColor: getScoreColor(animatedScore) }}
          />
        </div>
      </div>
    </div>
  )
}

// File Preview Card
function FilePreviewCard({ file, onRemove }: { file: File; onRemove: () => void }) {
  const config = getFileConfig(file.name)
  const IconComponent = config.icon

  return (
    <div className="flex items-center gap-4 p-4 bg-neutral-custom/5 rounded-xl">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${config.color}15` }}
      >
        <IconComponent className="w-6 h-6" style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-custom truncate">{file.name}</p>
        <div className="flex items-center gap-2 text-sm text-neutral-custom-subdued">
          <span>{config.label}</span>
          <span>•</span>
          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-neutral-custom-subdued hover:text-red-500"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default function UploadPage() {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Zustand store
  const { setSessionId: setGlobalSessionId, setStatus, setDeckAnalysis, reset } = useSessionStore()

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const pollForAnalysis = useCallback(async (sid: string) => {
    const maxAttempts = 60
    let attempts = 0

    const poll = async (): Promise<AnalysisResult | null> => {
      attempts++

      try {
        const response = await fetch(`${API_URL}/api/session/${sid}/analysis`)
        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error?.message || 'Analysis failed')
        }

        if (data.data.status === 'processing') {
          if (attempts >= maxAttempts) {
            throw new Error('Analysis timed out')
          }
          setProgress(Math.min(50 + (attempts / maxAttempts) * 45, 95))
          setStage('Analyzing slides...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          return poll()
        }

        if (data.data.status === 'ready' && data.data.deck_analysis) {
          return data.data.deck_analysis
        }

        if (data.data.status === 'analysis_failed') {
          throw new Error('Deck analysis failed')
        }

        await new Promise(resolve => setTimeout(resolve, 2000))
        return poll()
      } catch (err) {
        throw err
      }
    }

    return poll()
  }, [])

  const uploadFile = useCallback(async (uploadedFile: File) => {
    setFile(uploadedFile)
    setUploadState('uploading')
    setProgress(0)
    setError(null)
    setStage('Creating session...')

    try {
      // Step 1: Create session
      setProgress(10)
      const sessionResponse = await fetch(`${API_URL}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investor_mode: 'friendly' })
      })
      const sessionData = await sessionResponse.json()

      if (!sessionData.success) {
        throw new Error(sessionData.error?.message || 'Failed to create session')
      }

      const sid = sessionData.data.session_id
      setSessionId(sid)
      setGlobalSessionId(sid)
      setStatus('uploading')
      setProgress(20)
      setStage('Uploading file...')

      // Step 2: Upload file
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const uploadResponse = await fetch(`${API_URL}/api/session/${sid}/upload`, {
        method: 'POST',
        body: formData
      })
      const uploadData = await uploadResponse.json()

      if (!uploadData.success) {
        throw new Error(uploadData.error?.message || 'Failed to upload file')
      }

      setProgress(50)
      setUploadState('analyzing')
      setStatus('processing')
      setStage('AI is analyzing your deck...')

      // Step 3: Poll for analysis results
      const analysis = await pollForAnalysis(sid)

      if (analysis) {
        setResult(analysis)
        setProgress(100)
        setUploadState('complete')
        setStatus('ready')
        setStage('Analysis complete!')

        if (analysis.scores && analysis.categories) {
          setDeckAnalysis({
            scores: {
              problem: analysis.categories.problem?.score || 0,
              solution: analysis.categories.solution?.score || 0,
              market: analysis.categories.market?.score || 0,
              traction: 0,
              team: analysis.categories.team?.score || 0,
              financials: analysis.categories.business_model?.score || 0,
              ask: 0,
            },
            overallScore: analysis.scores.overall_score,
            summary: analysis.executive_summary,
          })
        }
      } else {
        throw new Error('No analysis data received')
      }

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setUploadState('error')
    }
  }, [pollForAnalysis, setGlobalSessionId, setStatus, setDeckAnalysis])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0])
    }
  }, [uploadFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0])
    }
  }, [uploadFile])

  const resetUpload = () => {
    setUploadState('idle')
    setFile(null)
    setProgress(0)
    setResult(null)
    setSessionId(null)
    setError(null)
    setStage('')
    reset()
  }

  const getTopCategories = () => {
    if (!result?.categories) return []

    const categoryNames = ['problem', 'solution', 'market', 'business_model', 'team']
    return categoryNames
      .filter(name => result.categories[name])
      .map(name => ({
        name,
        ...result.categories[name]!
      }))
  }

  return (
    <div className="min-h-screen bg-canvas">
      <UploadNav />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-custom-subdued hover:text-neutral-custom mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-neutral-custom mb-2">Upload Your Pitch Deck</h1>
          <p className="text-neutral-custom-subdued">
            Upload your pitch deck and get instant AI-powered feedback
          </p>
        </div>

        {/* Upload Area - Idle State */}
        {uploadState === 'idle' && (
          <Card className="bg-white overflow-hidden">
            <CardContent className="p-0">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative p-12 transition-all duration-300 ${
                  dragActive
                    ? 'bg-accent-custom/5'
                    : 'bg-gradient-to-b from-neutral-custom/5 to-transparent'
                }`}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent-custom/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

                <div
                  className={`relative flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                    dragActive
                      ? 'border-accent-custom bg-accent-custom/5 scale-[1.02]'
                      : 'border-neutral-custom/20 hover:border-accent-custom/50'
                  }`}
                >
                  {/* Upload icon */}
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                      dragActive
                        ? 'bg-accent-custom text-white scale-110'
                        : 'bg-accent-custom/10 text-accent-custom'
                    }`}
                  >
                    <Upload className="w-10 h-10" />
                  </div>

                  <p className="text-xl font-semibold text-neutral-custom mb-2">
                    {dragActive ? 'Drop your file here' : 'Drag and drop your pitch deck'}
                  </p>
                  <p className="text-neutral-custom-subdued mb-6">
                    or click to browse from your computer
                  </p>

                  {/* Supported formats */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {['PDF', 'PPT', 'PPTX', 'PNG', 'JPG'].map((format) => (
                      <span
                        key={format}
                        className="px-3 py-1 bg-neutral-custom/5 rounded-full text-xs font-medium text-neutral-custom-subdued"
                      >
                        {format}
                      </span>
                    ))}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.ppt,.pptx,.png,.jpg,.jpeg"
                    onChange={handleFileInput}
                  />
                  <Button
                    onClick={handleBrowseClick}
                    size="lg"
                    className="bg-accent-custom hover:bg-accent-custom-baseline text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Browse Files
                  </Button>
                </div>
              </div>

              {/* Tips section */}
              <div className="px-8 pb-8">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-neutral-custom/5 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-accent-custom/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-accent-custom" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-custom">Secure Upload</p>
                      <p className="text-xs text-neutral-custom-subdued">Your files are encrypted and private</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-neutral-custom/5 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-accent-custom/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-accent-custom" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-custom">AI Analysis</p>
                      <p className="text-xs text-neutral-custom-subdued">Powered by advanced AI models</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-neutral-custom/5 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-accent-custom/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-accent-custom" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-custom">Quick Results</p>
                      <p className="text-xs text-neutral-custom-subdued">Analysis in under 2 minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Uploading State */}
        {uploadState === 'uploading' && file && (
          <Card className="bg-white">
            <CardContent className="p-8">
              <FilePreviewCard file={file} onRemove={resetUpload} />
              <div className="mt-8">
                <AnimatedProgress progress={progress} stage={stage} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analyzing State */}
        {uploadState === 'analyzing' && file && (
          <Card className="bg-white overflow-hidden">
            <CardContent className="p-8">
              <FilePreviewCard file={file} onRemove={resetUpload} />

              <div className="mt-8 flex flex-col items-center py-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-accent-custom/10 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-accent-custom animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-accent-custom/30 border-t-accent-custom animate-spin" />
                </div>
                <p className="text-xl font-semibold text-neutral-custom mb-2">AI is analyzing your deck</p>
                <p className="text-neutral-custom-subdued mb-6">This usually takes about 30-60 seconds</p>

                <div className="w-full max-w-md">
                  <AnimatedProgress progress={progress} stage={stage} />
                </div>

                {/* Analysis steps */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  {[
                    { label: 'Extracting slides', done: progress > 30 },
                    { label: 'Reading content', done: progress > 50 },
                    { label: 'Evaluating pitch', done: progress > 70 },
                    { label: 'Generating feedback', done: progress > 90 },
                  ].map((step, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 p-3 rounded-lg transition-all ${
                        step.done ? 'bg-green-50' : 'bg-neutral-custom/5'
                      }`}
                    >
                      {step.done ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-neutral-custom/20 rounded-full" />
                      )}
                      <span className={`text-xs ${step.done ? 'text-green-700' : 'text-neutral-custom-subdued'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {uploadState === 'error' && (
          <Card className="bg-white border-red-200">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-xl font-semibold text-neutral-custom mb-2">Analysis Failed</p>
              <p className="text-neutral-custom-subdued text-center mb-6 max-w-md">{error}</p>
              <Button onClick={resetUpload} className="bg-accent-custom hover:bg-accent-custom-baseline text-white">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {uploadState === 'complete' && result && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            {/* Success banner */}
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Analysis Complete</p>
                <p className="text-sm text-green-600">Your pitch deck has been analyzed successfully</p>
              </div>
            </div>

            {/* Score Card */}
            <Card className="bg-white overflow-hidden">
              <div className="relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent-custom/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-neutral-custom">Deck Analysis</CardTitle>
                      <CardDescription>Here&apos;s how your pitch deck scored</CardDescription>
                    </div>
                    {result.scores.investment_grade && (
                      <span className="px-4 py-2 bg-gradient-to-r from-accent-custom to-purple-600 text-white font-bold rounded-xl text-lg shadow-lg">
                        {result.scores.investment_grade}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <AnimatedScoreCircle score={result.scores.overall_score} />
                    <div className="flex-1 w-full space-y-3">
                      {getTopCategories().map((category, index) => (
                        <CategoryScoreCard
                          key={category.name}
                          name={category.name}
                          score={category.score}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Summary Card */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-neutral-custom flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-custom" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-custom-subdued leading-relaxed">{result.executive_summary}</p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={resetUpload}
                className="flex-1"
              >
                Upload Another Deck
              </Button>
              <Link href={`/mode-select?session=${sessionId}`} className="flex-1">
                <Button className="w-full bg-accent-custom hover:bg-accent-custom-baseline text-white shadow-lg">
                  Start Practice Session
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
