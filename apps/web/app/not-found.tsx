'use client'

import Link from 'next/link'
import { Home, ArrowLeft, Zap, FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
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
            <div className="w-32 h-32 mx-auto rounded-full bg-accent-custom/10 flex items-center justify-center">
              <FileQuestion className="w-16 h-16 text-accent-custom" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-lg">
              <span className="text-4xl font-bold text-accent-custom">404</span>
            </div>
          </div>

          {/* Text */}
          <h1 className="text-2xl font-bold text-neutral-custom mb-3">
            Sayfa Bulunamadı
          </h1>
          <p className="text-neutral-custom-subdued mb-8">
            Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
            Endişelenmeyin, sizi doğru yere yönlendirelim.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Button>
            <Link href="/">
              <Button className="w-full sm:w-auto bg-accent-custom hover:bg-accent-custom-baseline text-white gap-2">
                <Home className="w-4 h-4" />
                Ana Sayfaya Git
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-neutral-custom/10">
            <p className="text-sm text-neutral-custom-subdued mb-4">Popüler sayfalar:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/upload" className="text-sm text-accent-custom hover:underline">
                Deck Yükle
              </Link>
              <span className="text-neutral-custom/30">•</span>
              <Link href="/dashboard" className="text-sm text-accent-custom hover:underline">
                Dashboard
              </Link>
              <span className="text-neutral-custom/30">•</span>
              <Link href="/help" className="text-sm text-accent-custom hover:underline">
                Yardım
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
