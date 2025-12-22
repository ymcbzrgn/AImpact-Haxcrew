'use client'

import { useEffect, useState, useRef } from 'react'

// Message types
export type MessageType = 'discussion' | 'question' | 'vote' | 'system' | 'user'

export interface SpeechMessage {
  id: string
  speakerId: string
  speakerName: string
  speakerAvatar?: string
  speakerColor?: string
  content: string
  timestamp: Date
  type: MessageType
  isUser?: boolean
}

// Type badge colors
const typeBadges: Record<MessageType, { bg: string; text: string; label: string }> = {
  discussion: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Discussion' },
  question: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Question' },
  vote: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Vote' },
  system: { bg: 'bg-neutral-100', text: 'text-neutral-600', label: 'System' },
  user: { bg: 'bg-green-100', text: 'text-green-700', label: 'Reply' },
}

// Individual Speech Bubble
interface SpeechBubbleProps {
  message: SpeechMessage
  isLatest?: boolean
  showTypeBadge?: boolean
  showTimestamp?: boolean
  animated?: boolean
  className?: string
}

export function SpeechBubble({
  message,
  isLatest = false,
  showTypeBadge = true,
  showTimestamp = true,
  animated = true,
  className = '',
}: SpeechBubbleProps) {
  const [isVisible, setIsVisible] = useState(!animated)

  useEffect(() => {
    if (animated && isLatest) {
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(true)
    }
  }, [animated, isLatest])

  const isUserMessage = message.isUser || message.type === 'user'
  const typeBadge = typeBadges[message.type]

  return (
    <div
      className={`
        flex gap-3 transition-all duration-300
        ${isUserMessage ? 'flex-row-reverse' : ''}
        ${animated && isLatest ? (isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4') : ''}
        ${className}
      `}
    >
      {/* Avatar */}
      {!isUserMessage && (
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
            ${message.speakerColor || 'bg-neutral-400'}
          `}
        >
          {message.speakerAvatar || message.speakerName.slice(0, 2).toUpperCase()}
        </div>
      )}

      {/* Bubble Content */}
      <div className={`flex-1 max-w-[80%] ${isUserMessage ? 'flex flex-col items-end' : ''}`}>
        {/* Header */}
        <div className={`flex items-center gap-2 mb-1 ${isUserMessage ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm font-medium text-neutral-custom">
            {isUserMessage ? 'You' : message.speakerName}
          </span>
          {showTimestamp && (
            <span className="text-xs text-neutral-custom-subdued">
              {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {showTypeBadge && !isUserMessage && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge.bg} ${typeBadge.text}`}>
              {typeBadge.label}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`
            rounded-lg px-4 py-3 shadow-sm
            ${isUserMessage
              ? 'bg-accent-custom text-white rounded-tr-none'
              : 'bg-white border border-neutral-200 rounded-tl-none'
            }
          `}
        >
          <p className={`text-sm ${isUserMessage ? 'text-white' : 'text-neutral-custom'}`}>
            {message.content}
          </p>
        </div>
      </div>
    </div>
  )
}

// Speech Bubble with typing animation
interface TypingBubbleProps {
  message: SpeechMessage
  typingSpeed?: number
  onComplete?: () => void
  className?: string
}

export function TypingBubble({
  message,
  typingSpeed = 30,
  onComplete,
  className = '',
}: TypingBubbleProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)

    let index = 0
    const interval = setInterval(() => {
      if (index < message.content.length) {
        setDisplayedText(message.content.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(interval)
        onComplete?.()
      }
    }, typingSpeed)

    return () => clearInterval(interval)
  }, [message.content, typingSpeed, onComplete])

  const typeBadge = typeBadges[message.type]

  return (
    <div className={`flex gap-3 ${className}`}>
      {/* Avatar */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
          ${message.speakerColor || 'bg-neutral-400'}
          ${!isComplete ? 'animate-pulse' : ''}
        `}
      >
        {message.speakerAvatar || message.speakerName.slice(0, 2).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-neutral-custom">{message.speakerName}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge.bg} ${typeBadge.text}`}>
            {typeBadge.label}
          </span>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
          <p className="text-sm text-neutral-custom">
            {displayedText}
            {!isComplete && (
              <span className="inline-block w-0.5 h-4 bg-accent-custom ml-1 animate-pulse" />
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

// Thinking indicator
export function ThinkingBubble({
  speakerName,
  speakerAvatar,
  speakerColor,
  className = '',
}: {
  speakerName: string
  speakerAvatar?: string
  speakerColor?: string
  className?: string
}) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
          ${speakerColor || 'bg-neutral-400'}
        `}
      >
        {speakerAvatar || speakerName.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-neutral-custom">{speakerName}</span>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg rounded-tl-none px-4 py-3 shadow-sm inline-block">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Dialog Container with auto-scroll
interface DialogContainerProps {
  messages: SpeechMessage[]
  showTypeBadge?: boolean
  showTimestamp?: boolean
  animated?: boolean
  maxHeight?: string
  className?: string
}

export function DialogContainer({
  messages,
  showTypeBadge = true,
  showTimestamp = true,
  animated = true,
  maxHeight = '500px',
  className = '',
}: DialogContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={scrollRef}
      className={`overflow-y-auto space-y-4 p-4 ${className}`}
      style={{ maxHeight }}
    >
      {messages.length === 0 ? (
        <div className="text-center text-neutral-custom-subdued py-8">
          <p>Discussion has not started</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <SpeechBubble
            key={message.id}
            message={message}
            isLatest={index === messages.length - 1}
            showTypeBadge={showTypeBadge}
            showTimestamp={showTimestamp}
            animated={animated}
          />
        ))
      )}
    </div>
  )
}

// Quick reply buttons
interface QuickReplyProps {
  options: string[]
  onSelect: (option: string) => void
  disabled?: boolean
  className?: string
}

export function QuickReplies({ options, onSelect, disabled = false, className = '' }: QuickReplyProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className={`
            px-4 py-2 rounded-full border text-sm transition-all
            ${disabled
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : 'bg-white border-accent-custom text-accent-custom hover:bg-accent-custom hover:text-white'
            }
          `}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export default SpeechBubble
