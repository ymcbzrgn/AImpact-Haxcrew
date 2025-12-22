import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Icons
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  )
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas">
      {/* Hero Section - Full viewport */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent-custom/5 via-transparent to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold text-neutral-custom tracking-tight">
              Pitch<span className="text-accent-custom">Drill</span>
            </h1>
          </div>

          {/* Tagline */}
          <div className="space-y-2 mb-12">
            <p className="text-xl md:text-2xl text-neutral-custom-subdued">
              Practice your pitch.
            </p>
            <p className="text-xl md:text-2xl text-neutral-custom-subdued">
              Get AI feedback.
            </p>
          </div>

          {/* CTA Button */}
          <Link href="/upload">
            <Button
              size="lg"
              className="bg-accent-custom hover:bg-accent-custom-baseline text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Get Started
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDownIcon className="w-6 h-6 text-neutral-custom-subdued" />
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          {/* Section title */}
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-custom text-center mb-16">
            How It Works
          </h2>

          {/* Steps */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-accent-custom/10 flex items-center justify-center mb-4">
                <UploadIcon className="w-10 h-10 text-accent-custom" />
              </div>
              <h3 className="font-semibold text-neutral-custom mb-1">Upload</h3>
              <p className="text-sm text-neutral-custom-subdued max-w-[140px]">
                Upload your pitch deck
              </p>
            </div>

            {/* Arrow 1 */}
            <div className="hidden md:block">
              <ArrowRightIcon className="w-8 h-8 text-neutral-300" />
            </div>
            <div className="md:hidden">
              <ChevronDownIcon className="w-6 h-6 text-neutral-300 rotate-0" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-accent-custom/10 flex items-center justify-center mb-4">
                <MicIcon className="w-10 h-10 text-accent-custom" />
              </div>
              <h3 className="font-semibold text-neutral-custom mb-1">Pitch</h3>
              <p className="text-sm text-neutral-custom-subdued max-w-[140px]">
                Present to AI VCs
              </p>
            </div>

            {/* Arrow 2 */}
            <div className="hidden md:block">
              <ArrowRightIcon className="w-8 h-8 text-neutral-300" />
            </div>
            <div className="md:hidden">
              <ChevronDownIcon className="w-6 h-6 text-neutral-300 rotate-0" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-semibold text-neutral-custom mb-1">Get Results</h3>
              <p className="text-sm text-neutral-custom-subdued max-w-[140px]">
                Get detailed feedback
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-custom mb-4">
            Ready to improve your pitch?
          </h2>
          <p className="text-neutral-custom-subdued mb-8">
            Try it free, start now.
          </p>
          <Link href="/upload">
            <Button
              size="lg"
              className="bg-accent-custom hover:bg-accent-custom-baseline text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Try Now
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-6 border-t border-neutral-200">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-neutral-custom-subdued">
            Made with <span className="text-red-500">&#9829;</span> in Turkey
          </div>
          <div className="text-sm text-neutral-custom-subdued">
            PitchDrill by HexCrew
          </div>
        </div>
      </footer>
    </main>
  )
}
