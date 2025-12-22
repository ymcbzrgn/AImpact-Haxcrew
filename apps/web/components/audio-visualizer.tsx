'use client'

import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  frequencyData: Uint8Array | null
  audioLevel?: number
  isActive: boolean
  variant?: 'bars' | 'wave' | 'circle' | 'minimal'
  color?: string
  backgroundColor?: string
  barCount?: number
  className?: string
}

// Bar Visualizer
export function AudioVisualizer({
  frequencyData,
  audioLevel = 0,
  isActive,
  variant = 'bars',
  color = '#6366f1',
  backgroundColor = '#e5e7eb',
  barCount = 5,
  className = '',
}: AudioVisualizerProps) {
  if (variant === 'minimal') {
    return <MinimalVisualizer isActive={isActive} audioLevel={audioLevel} color={color} className={className} />
  }

  if (variant === 'wave') {
    return <WaveVisualizer frequencyData={frequencyData} isActive={isActive} color={color} className={className} />
  }

  if (variant === 'circle') {
    return <CircleVisualizer audioLevel={audioLevel} isActive={isActive} color={color} className={className} />
  }

  // Default: bars
  return (
    <BarsVisualizer
      frequencyData={frequencyData}
      isActive={isActive}
      color={color}
      backgroundColor={backgroundColor}
      barCount={barCount}
      className={className}
    />
  )
}

// Bars Visualizer
function BarsVisualizer({
  frequencyData,
  isActive,
  color,
  backgroundColor,
  barCount,
  className,
}: {
  frequencyData: Uint8Array | null
  isActive: boolean
  color: string
  backgroundColor: string
  barCount: number
  className: string
}) {
  const getBarHeight = (index: number): number => {
    if (!isActive || !frequencyData) return 4

    // Sample frequency data at regular intervals
    const step = Math.floor(frequencyData.length / barCount)
    const value = frequencyData[index * step] || 0
    // Normalize to 8-32px range
    return Math.max(4, (value / 255) * 32)
  }

  return (
    <div className={`flex items-end gap-1 h-8 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full transition-all duration-75"
          style={{
            height: `${getBarHeight(i)}px`,
            backgroundColor: isActive ? color : backgroundColor,
          }}
        />
      ))}
    </div>
  )
}

// Minimal Visualizer (just dots)
function MinimalVisualizer({
  isActive,
  audioLevel,
  color,
  className,
}: {
  isActive: boolean
  audioLevel: number
  color: string
  className: string
}) {
  const dots = 3
  const baseDelay = 150

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-150 ${
            isActive ? 'animate-bounce' : ''
          }`}
          style={{
            backgroundColor: isActive ? color : '#d1d5db',
            animationDelay: `${i * baseDelay}ms`,
            transform: isActive ? `scale(${0.8 + audioLevel * 0.4})` : 'scale(1)',
          }}
        />
      ))}
    </div>
  )
}

// Wave Visualizer (canvas-based)
function WaveVisualizer({
  frequencyData,
  isActive,
  color,
  className,
}: {
  frequencyData: Uint8Array | null
  isActive: boolean
  color: string
  className: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    if (!isActive || !frequencyData) {
      // Draw flat line when inactive
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 2
      ctx.stroke()
      return
    }

    // Draw wave
    ctx.beginPath()
    ctx.moveTo(0, height / 2)

    const sliceWidth = width / frequencyData.length
    let x = 0

    for (let i = 0; i < frequencyData.length; i++) {
      const v = frequencyData[i] / 128.0
      const y = (v * height) / 2

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.lineTo(width, height / 2)
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()
  }, [frequencyData, isActive, color])

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={40}
      className={`${className}`}
      style={{ width: '120px', height: '40px' }}
    />
  )
}

// Circle Visualizer
function CircleVisualizer({
  audioLevel,
  isActive,
  color,
  className,
}: {
  audioLevel: number
  isActive: boolean
  color: string
  className: string
}) {
  const baseSize = 40
  const maxScale = 1.5
  const scale = isActive ? 1 + audioLevel * (maxScale - 1) : 1

  return (
    <div className={`relative ${className}`} style={{ width: baseSize, height: baseSize }}>
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-100"
        style={{
          backgroundColor: isActive ? `${color}20` : '#f3f4f6',
          transform: `scale(${scale})`,
        }}
      />
      {/* Inner circle */}
      <div
        className="absolute inset-2 rounded-full transition-all duration-100"
        style={{
          backgroundColor: isActive ? color : '#d1d5db',
        }}
      />
      {/* Pulse effect when active */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            backgroundColor: `${color}40`,
            animationDuration: '1.5s',
          }}
        />
      )}
    </div>
  )
}

// Microphone button with built-in visualizer
interface MicButtonProps {
  isActive: boolean
  audioLevel?: number
  onClick: () => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function MicButton({
  isActive,
  audioLevel = 0,
  onClick,
  disabled = false,
  size = 'medium',
  className = '',
}: MicButtonProps) {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-14 h-14',
    large: 'w-20 h-20',
  }

  const iconSizes = {
    small: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative rounded-full flex items-center justify-center transition-all ${sizeClasses[size]} ${
        isActive
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {/* Pulse ring when active */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"
          style={{ transform: `scale(${1 + audioLevel * 0.3})` }}
        />
      )}

      {/* Mic icon */}
      <svg className={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {isActive ? (
          <>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </>
        ) : (
          <>
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </>
        )}
      </svg>
    </button>
  )
}

export default AudioVisualizer
