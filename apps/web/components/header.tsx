'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

interface HeaderProps {
  showNav?: boolean
  showCta?: boolean
  className?: string
}

export function Header({ showNav = true, showCta = true, className = '' }: HeaderProps) {
  const pathname = usePathname()

  // Don't show header on landing page
  if (pathname === '/') return null

  const navLinks = [
    { href: '/upload', label: 'New Pitch' },
    { href: '/history', label: 'History' },
  ]

  return (
    <header className={`sticky top-0 z-40 bg-canvas/80 backdrop-blur-sm border-b border-neutral-200 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-neutral-custom">
              Pitch<span className="text-accent-custom">Drill</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {showNav && (
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-accent-custom'
                      : 'text-neutral-custom-subdued hover:text-neutral-custom'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* CTA / Actions */}
          <div className="flex items-center gap-4">
            {showCta && pathname !== '/upload' && (
              <Link href="/upload">
                <Button
                  size="sm"
                  className="bg-accent-custom hover:bg-accent-custom-baseline text-white hidden sm:inline-flex"
                >
                  Start Pitch
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-neutral-custom-subdued hover:text-neutral-custom">
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
