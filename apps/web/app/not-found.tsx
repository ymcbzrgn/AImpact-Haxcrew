'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-canvas flex flex-col items-center justify-center px-6">
      {/* 404 Illustration */}
      <div className="text-center mb-8">
        <div className="text-[150px] md:text-[200px] font-bold text-neutral-200 leading-none select-none">
          404
        </div>
        <div className="relative -mt-16 md:-mt-20">
          <div className="text-6xl">🔍</div>
        </div>
      </div>

      {/* Message */}
      <div className="text-center max-w-md mb-8">
        <h1 className="text-2xl font-bold text-neutral-custom mb-2">
          Page Not Found
        </h1>
        <p className="text-neutral-custom-subdued">
          The page you're looking for doesn't exist or has been moved. You can return to the home page to continue.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/">
          <Button className="bg-accent-custom hover:bg-accent-custom-baseline text-white">
            <HomeIcon className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={() => typeof window !== 'undefined' && window.history.back()}
          className="border-neutral-300 text-neutral-custom hover:bg-neutral-100"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>

      {/* Help text */}
      <p className="text-sm text-neutral-custom-subdued mt-12">
        Need help?{' '}
        <Link href="/upload" className="text-accent-custom hover:underline">
          Start a new pitch
        </Link>
      </p>
    </main>
  )
}
