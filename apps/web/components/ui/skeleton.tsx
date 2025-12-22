import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

// Base Skeleton
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-200',
        className
      )}
    />
  )
}

// Text Skeleton
interface TextSkeletonProps {
  lines?: number
  className?: string
}

export function TextSkeleton({ lines = 3, className }: TextSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

// Avatar Skeleton
interface AvatarSkeletonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function AvatarSkeleton({ size = 'md', className }: AvatarSkeletonProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  return (
    <Skeleton className={cn('rounded-full', sizes[size], className)} />
  )
}

// Card Skeleton
interface CardSkeletonProps {
  hasImage?: boolean
  hasAvatar?: boolean
  className?: string
}

export function CardSkeleton({ hasImage = false, hasAvatar = false, className }: CardSkeletonProps) {
  return (
    <div className={cn('rounded-lg border border-neutral-200 bg-white overflow-hidden', className)}>
      {hasImage && (
        <Skeleton className="h-40 w-full rounded-none" />
      )}
      <div className="p-4">
        {hasAvatar && (
          <div className="flex items-center gap-3 mb-3">
            <AvatarSkeleton size="sm" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        )}
        <Skeleton className="h-5 w-3/4 mb-2" />
        <TextSkeleton lines={2} />
      </div>
    </div>
  )
}

// Stats Skeleton
export function StatsSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-neutral-50 rounded-lg p-4 text-center">
          <Skeleton className="h-8 w-12 mx-auto mb-2" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>
      ))}
    </div>
  )
}

// Table Row Skeleton
interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-neutral-200">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Slide Skeleton (for pitch deck preview)
export function SlideSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('aspect-[16/9] rounded-lg overflow-hidden', className)}>
      <Skeleton className="w-full h-full rounded-none" />
    </div>
  )
}

// Feedback List Skeleton
export function FeedbackSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-neutral-200">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Page Loading Skeleton
export function PageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SlideSkeleton />
          <StatsSkeleton />
        </div>
        <div className="space-y-4">
          <CardSkeleton hasAvatar />
          <CardSkeleton hasAvatar />
        </div>
      </div>
    </div>
  )
}

export default Skeleton
