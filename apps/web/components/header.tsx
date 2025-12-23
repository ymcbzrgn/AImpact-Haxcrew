'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Don't show header on landing page and session/council/verdict pages (they have custom headers)
  if (
    pathname === '/' ||
    pathname.startsWith('/session/') ||
    pathname.startsWith('/council/') ||
    pathname.startsWith('/verdict/')
  ) {
    return null
  }

  const navLinks = [
    { href: '/upload', label: 'New Pitch' },
    { href: '/history', label: 'History' },
  ]

  return (
    <header className={`sticky top-0 z-40 bg-white border-b border-neutral-200 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="PitchDrill" width={36} height={36} className="w-9 h-9" />
            <span className="text-xl font-bold text-neutral-custom">
              Pitch<span className="text-accent-custom">Drill</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {showNav && (
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-accent-custom'
                      : 'text-neutral-custom-subdued hover:text-accent-custom'
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
                  className="bg-accent-custom hover:bg-accent-custom-baseline text-white hidden sm:inline-flex rounded-full px-6"
                >
                  Start Pitch
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-custom-subdued hover:text-neutral-custom"
            >
              {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-accent-custom/10 text-accent-custom'
                      : 'text-neutral-custom hover:bg-neutral-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {showCta && pathname !== '/upload' && (
                <Link href="/upload" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full mt-2 bg-accent-custom hover:bg-accent-custom-baseline text-white rounded-full">
                    Start Pitch
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
