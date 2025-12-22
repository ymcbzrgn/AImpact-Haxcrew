'use client'

import { useEffect, useState, useCallback } from 'react'

interface TimerProps {
  initialTime: number // seconds
  isRunning: boolean
  onTimeEnd?: () => void
  onTick?: (timeLeft: number) => void
  warningThreshold?: number // seconds - when to show warning state
  size?: 'small' | 'medium' | 'large'
  showProgress?: boolean
  className?: string
}

export function Timer({
  initialTime,
  isRunning,
  onTimeEnd,
  onTick,
  warningThreshold = 60,
  size = 'medium',
  showProgress = false,
  className = '',
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime)

  // Reset when initialTime changes
  useEffect(() => {
    setTimeLeft(initialTime)
  }, [initialTime])

  // Timer logic
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        onTick?.(newTime)

        if (newTime <= 0) {
          clearInterval(timer)
          onTimeEnd?.()
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, onTimeEnd, onTick])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isWarning = timeLeft <= warningThreshold
  const isCritical = timeLeft <= 10
  const progress = ((initialTime - timeLeft) / initialTime) * 100

  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl',
  }

  const getColorClass = () => {
    if (isCritical) return 'text-red-600'
    if (isWarning) return 'text-amber-500'
    return 'text-neutral-custom'
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className={`font-mono font-bold ${sizeClasses[size]} ${getColorClass()} ${
          isCritical ? 'animate-pulse' : ''
        }`}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      {showProgress && (
        <div className="w-full mt-2">
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-accent-custom'
              }`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Circular Timer variant
interface CircularTimerProps extends Omit<TimerProps, 'showProgress'> {
  radius?: number
  strokeWidth?: number
}

export function CircularTimer({
  initialTime,
  isRunning,
  onTimeEnd,
  onTick,
  warningThreshold = 60,
  size = 'medium',
  radius = 45,
  strokeWidth = 8,
  className = '',
}: CircularTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    setTimeLeft(initialTime)
  }, [initialTime])

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        onTick?.(newTime)

        if (newTime <= 0) {
          clearInterval(timer)
          onTimeEnd?.()
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, onTimeEnd, onTick])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isWarning = timeLeft <= warningThreshold
  const isCritical = timeLeft <= 10
  const progress = timeLeft / initialTime

  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const sizeMap = {
    small: 80,
    medium: 120,
    large: 160,
  }

  const fontSizeMap = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl',
  }

  const svgSize = sizeMap[size]
  const center = svgSize / 2

  const getStrokeColor = () => {
    if (isCritical) return '#dc2626' // red-600
    if (isWarning) return '#f59e0b' // amber-500
    return '#6366f1' // indigo-500 (accent)
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      {/* Time display */}
      <div
        className={`absolute font-mono font-bold ${fontSizeMap[size]} ${
          isCritical ? 'text-red-600 animate-pulse' : isWarning ? 'text-amber-500' : 'text-neutral-custom'
        }`}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  )
}

// Countdown Timer with controls
interface CountdownTimerProps {
  duration: number // seconds
  onComplete?: () => void
  autoStart?: boolean
}

export function CountdownTimer({ duration, onComplete, autoStart = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isPaused, setIsPaused] = useState(false)

  const start = useCallback(() => {
    setIsRunning(true)
    setIsPaused(false)
  }, [])

  const pause = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    setIsPaused(false)
  }, [])

  const reset = useCallback(() => {
    setTimeLeft(duration)
    setIsRunning(false)
    setIsPaused(false)
  }, [duration])

  useEffect(() => {
    if (!isRunning || isPaused || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsRunning(false)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, isPaused, onComplete])

  return {
    timeLeft,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    minutes: Math.floor(timeLeft / 60),
    seconds: timeLeft % 60,
    progress: ((duration - timeLeft) / duration) * 100,
  }
}

export default Timer
