'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Home, RefreshCw, AlertTriangle, Zap, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-custom flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-neutral-custom">PitchDrill</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border border-red-200">
              <Bug className="w-5 h-5 text-red-500" />
            </div>
          </div>

          {/* Text */}
          <h1 className="text-2xl font-bold text-neutral-custom mb-3">
            Bir Şeyler Ters Gitti
          </h1>
          <p className="text-neutral-custom-subdued mb-4">
            Beklenmedik bir hata oluştu. Tekrar deneyebilir veya ana sayfaya dönebilirsiniz.
          </p>

          {/* Error details (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl text-left">
              <p className="text-xs font-mono text-red-600 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-400 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={reset}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tekrar Dene
            </Button>
            <Link href="/">
              <Button className="w-full sm:w-auto bg-accent-custom hover:bg-accent-custom-baseline text-white gap-2">
                <Home className="w-4 h-4" />
                Ana Sayfaya Git
              </Button>
            </Link>
          </div>

          {/* Support info */}
          <div className="mt-12 pt-8 border-t border-neutral-custom/10">
            <p className="text-sm text-neutral-custom-subdued">
              Sorun devam ederse{' '}
              <a href="mailto:support@pitchdrill.com" className="text-accent-custom hover:underline">
                destek ekibimizle
              </a>{' '}
              iletişime geçin.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
