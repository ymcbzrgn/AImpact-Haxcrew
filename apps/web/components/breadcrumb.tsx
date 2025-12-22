'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

// Route translations
const routeLabels: Record<string, string> = {
  upload: 'Upload',
  session: 'Session',
  council: 'Council',
  verdict: 'Result',
  history: 'History',
  settings: 'Settings',
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const pathname = usePathname()

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbs: BreadcrumbItem[] = items || (() => {
    const segments = pathname.split('/').filter(Boolean)
    const result: BreadcrumbItem[] = []

    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Skip dynamic route IDs (they look like UUIDs or long strings)
      const isDynamicId = segment.length > 10 && !routeLabels[segment]

      if (isDynamicId) {
        // For dynamic IDs, show abbreviated version
        result.push({
          label: `#${segment.slice(0, 6)}...`,
          href: index < segments.length - 1 ? currentPath : undefined,
        })
      } else {
        result.push({
          label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          href: index < segments.length - 1 ? currentPath : undefined,
        })
      }
    })

    return result
  })()

  if (breadcrumbs.length === 0) return null

  return (
    <nav className={`flex items-center text-sm ${className}`} aria-label="Breadcrumb">
      {/* Home link */}
      <Link
        href="/"
        className="text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        <HomeIcon className="w-4 h-4" />
      </Link>

      {/* Breadcrumb items */}
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRightIcon className="w-4 h-4 mx-2 text-neutral-300" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-700 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

// Page wrapper with breadcrumb
interface PageWithBreadcrumbProps {
  children: React.ReactNode
  breadcrumbItems?: BreadcrumbItem[]
  title?: string
  className?: string
}

export function PageWithBreadcrumb({
  children,
  breadcrumbItems,
  title,
  className = '',
}: PageWithBreadcrumbProps) {
  return (
    <div className={className}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <Breadcrumb items={breadcrumbItems} />
        {title && (
          <h1 className="text-2xl font-bold text-neutral-custom mt-4">{title}</h1>
        )}
      </div>
      {children}
    </div>
  )
}

export default Breadcrumb
