'use client'

import { useState, useEffect } from 'react'

// VC Character type
export interface VCCharacter {
  id: string
  name: string
  title: string
  avatar: string // Initials or image URL
  personality: string
  color: string // Tailwind bg class
  expertise?: string[]
}

// Default VC characters
export const DEFAULT_VC_CHARACTERS: VCCharacter[] = [
  {
    id: 'alex',
    name: 'Alex Chen',
    title: 'Growth Partner',
    avatar: 'AC',
    personality: 'Data-driven, asks about metrics and growth',
    color: 'bg-blue-500',
    expertise: ['Metrics', 'Growth', 'Unit Economics'],
  },
  {
    id: 'sarah',
    name: 'Sarah Williams',
    title: 'Managing Partner',
    avatar: 'SW',
    personality: 'Strategic thinker, market focus',
    color: 'bg-purple-500',
    expertise: ['Strategy', 'Market Analysis', 'Competition'],
  },
  {
    id: 'michael',
    name: 'Michael Park',
    title: 'Tech Partner',
    avatar: 'MP',
    personality: 'Technical depth, scalability concerns',
    color: 'bg-green-500',
    expertise: ['Technology', 'Scalability', 'Architecture'],
  },
  {
    id: 'elena',
    name: 'Elena Rodriguez',
    title: 'Operating Partner',
    avatar: 'ER',
    personality: 'Operations focus, team dynamics',
    color: 'bg-amber-500',
    expertise: ['Operations', 'Team', 'Execution'],
  },
  {
    id: 'david',
    name: 'David Kim',
    title: 'Seed Partner',
    avatar: 'DK',
    personality: 'Vision-focused, founder-market fit',
    color: 'bg-red-500',
    expertise: ['Vision', 'Founder Fit', 'Early Stage'],
  },
]

// Vote decision type
export type VoteDecision = 'invest' | 'pass' | 'undecided'

export interface VoteData {
  investorId: string
  decision: VoteDecision
  confidence: number // 0-100
  reasoning?: string
}

// Avatar sizes
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface CouncilAvatarProps {
  character: VCCharacter
  size?: AvatarSize
  isSpeaking?: boolean
  vote?: VoteData
  showName?: boolean
  showTitle?: boolean
  showVote?: boolean
  onClick?: () => void
  className?: string
}

// Size configurations
const sizeConfig: Record<AvatarSize, { avatar: string; text: string; ring: string; badge: string }> = {
  xs: { avatar: 'w-8 h-8', text: 'text-xs', ring: 'ring-2', badge: 'w-4 h-4 -top-0.5 -right-0.5' },
  sm: { avatar: 'w-10 h-10', text: 'text-sm', ring: 'ring-2', badge: 'w-5 h-5 -top-1 -right-1' },
  md: { avatar: 'w-14 h-14', text: 'text-lg', ring: 'ring-[3px]', badge: 'w-6 h-6 -top-1 -right-1' },
  lg: { avatar: 'w-20 h-20', text: 'text-2xl', ring: 'ring-4', badge: 'w-7 h-7 -top-1 -right-1' },
  xl: { avatar: 'w-28 h-28', text: 'text-3xl', ring: 'ring-4', badge: 'w-8 h-8 -top-1 -right-1' },
}

// Vote badge icons
function VoteBadge({ decision, className }: { decision: VoteDecision; className: string }) {
  const bgColor = {
    invest: 'bg-green-500',
    pass: 'bg-red-500',
    undecided: 'bg-neutral-400',
  }

  return (
    <div
      className={`absolute ${className} ${bgColor[decision]} rounded-full flex items-center justify-center shadow-md`}
    >
      {decision === 'invest' && (
        <svg className="w-3/5 h-3/5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {decision === 'pass' && (
        <svg className="w-3/5 h-3/5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18" strokeWidth="3" strokeLinecap="round" />
          <line x1="6" y1="6" x2="18" y2="18" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {decision === 'undecided' && (
        <svg className="w-3/5 h-3/5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <line x1="5" y1="12" x2="19" y2="12" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
    </div>
  )
}

// Speaking animation dots
function SpeakingIndicator({ size }: { size: AvatarSize }) {
  const dotSize = size === 'xs' || size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5'

  return (
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${dotSize} bg-accent-custom rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}

// Main Avatar Component
export function CouncilAvatar({
  character,
  size = 'md',
  isSpeaking = false,
  vote,
  showName = true,
  showTitle = true,
  showVote = true,
  onClick,
  className = '',
}: CouncilAvatarProps) {
  const config = sizeConfig[size]
  const isClickable = !!onClick

  // Check if avatar is an image URL or initials
  const isImageUrl = character.avatar.startsWith('http') || character.avatar.startsWith('/')

  return (
    <div
      className={`flex flex-col items-center gap-2 ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className={`
            ${config.avatar} ${character.color} rounded-full flex items-center justify-center text-white font-bold
            ${config.text} transition-all duration-200
            ${isSpeaking ? `${config.ring} ring-accent-custom animate-pulse` : ''}
            ${isClickable ? 'hover:scale-105 hover:shadow-lg' : ''}
          `}
        >
          {isImageUrl ? (
            <img
              src={character.avatar}
              alt={character.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            character.avatar
          )}
        </div>

        {/* Speaking indicator */}
        {isSpeaking && <SpeakingIndicator size={size} />}

        {/* Vote badge */}
        {showVote && vote && <VoteBadge decision={vote.decision} className={config.badge} />}
      </div>

      {/* Name and title */}
      {(showName || showTitle) && (
        <div className="text-center">
          {showName && (
            <div className={`font-medium text-neutral-custom ${size === 'xs' ? 'text-xs' : 'text-sm'}`}>
              {character.name}
            </div>
          )}
          {showTitle && (
            <div className={`text-neutral-custom-subdued ${size === 'xs' ? 'text-[10px]' : 'text-xs'}`}>
              {character.title}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Council Panel - All avatars in a row
interface CouncilPanelProps {
  characters?: VCCharacter[]
  currentSpeaker?: string | null
  votes?: VoteData[]
  size?: AvatarSize
  onAvatarClick?: (character: VCCharacter) => void
  className?: string
}

export function CouncilPanel({
  characters = DEFAULT_VC_CHARACTERS,
  currentSpeaker = null,
  votes = [],
  size = 'lg',
  onAvatarClick,
  className = '',
}: CouncilPanelProps) {
  return (
    <div className={`flex justify-around items-start ${className}`}>
      {characters.map((character) => {
        const vote = votes.find((v) => v.investorId === character.id)
        return (
          <CouncilAvatar
            key={character.id}
            character={character}
            size={size}
            isSpeaking={currentSpeaker === character.id}
            vote={vote}
            onClick={onAvatarClick ? () => onAvatarClick(character) : undefined}
          />
        )
      })}
    </div>
  )
}

// Animated speaking avatar (with typing effect simulation)
interface AnimatedAvatarProps {
  character: VCCharacter
  isActive: boolean
  message?: string
  size?: AvatarSize
  className?: string
}

export function AnimatedAvatar({
  character,
  isActive,
  message,
  size = 'md',
  className = '',
}: AnimatedAvatarProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!message || !isActive) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    setDisplayedText('')

    let index = 0
    const interval = setInterval(() => {
      if (index < message.length) {
        setDisplayedText(message.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [message, isActive])

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <CouncilAvatar
        character={character}
        size={size}
        isSpeaking={isTyping}
        showName={false}
        showTitle={false}
        showVote={false}
      />
      {isActive && message && (
        <div className="flex-1">
          <div className="text-sm font-medium text-neutral-custom mb-1">{character.name}</div>
          <div className="bg-neutral-100 rounded-lg rounded-tl-none px-4 py-3">
            <p className="text-sm text-neutral-700">
              {displayedText}
              {isTyping && <span className="inline-block w-1 h-4 bg-accent-custom ml-1 animate-pulse" />}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CouncilAvatar
