'use client'

import { Zap } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-6">
          {/* Outer ring */}
          <div className="w-24 h-24 rounded-full border-4 border-accent-custom/20 border-t-accent-custom animate-spin mx-auto" />

          {/* Inner logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-accent-custom flex items-center justify-center animate-pulse">
              <Zap className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h2 className="text-xl font-bold text-neutral-custom mb-2">PitchDrill</h2>
        <p className="text-neutral-custom-subdued text-sm">Yükleniyor...</p>

        {/* Loading dots */}
        <div className="flex justify-center gap-1 mt-4">
          <div className="w-2 h-2 bg-accent-custom rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-accent-custom rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-accent-custom rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
