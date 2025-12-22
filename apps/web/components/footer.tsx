'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface FooterProps {
  className?: string
}

export function Footer({ className = '' }: FooterProps) {
  const pathname = usePathname()

  // Don't show footer on landing page (it has its own)
  // Also hide on session pages to avoid distraction
  if (pathname === '/' || pathname.startsWith('/session/') || pathname.startsWith('/council/')) {
    return null
  }

  return (
    <footer className={`py-6 px-4 border-t border-neutral-200 mt-auto ${className}`}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-neutral-custom hover:text-accent-custom transition-colors">
            Pitch<span className="text-accent-custom">Drill</span>
          </Link>
          <span className="text-neutral-300">|</span>
          <span className="text-sm text-neutral-custom-subdued">
            HexCrew
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          <span className="text-sm text-neutral-custom-subdued">
            Made with <span className="text-red-500">&#9829;</span> in Turkey
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
