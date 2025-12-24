'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  )
}

function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

// Intersection Observer Hook for scroll animations
function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold: 0.1, ...options }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [options])

  return { ref, isInView }
}

// Animated Section Component
function AnimatedSection({
  children,
  className = '',
  delay = 0
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// Pricing data
const pricingPlans = [
  {
    name: 'Free Trial',
    price: '$0',
    period: '',
    description: 'Try it out',
    features: ['1 pitch session', 'Basic AI feedback', 'Deck analysis'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Single Session',
    price: '$5',
    period: '',
    description: 'One-time use',
    features: ['1 pitch session', 'Full AI feedback', 'Q&A session', 'Council verdict'],
    cta: 'Buy Now',
    popular: false,
  },
  {
    name: 'Founder Pack',
    price: '$19',
    period: '',
    description: 'Most Popular',
    features: ['5 pitch sessions', 'Full AI feedback', 'Q&A sessions', 'Council verdicts', 'Progress tracking'],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Accelerator',
    price: '$49',
    period: '',
    description: 'For Teams',
    features: ['15 pitch sessions', 'Full AI feedback', 'Q&A sessions', 'Council verdicts', 'Team analytics', 'Priority support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Unlimited',
    price: '$29',
    period: '/mo',
    description: 'Go Pro',
    features: ['Unlimited sessions', 'Full AI feedback', 'Q&A sessions', 'Council verdicts', 'Advanced analytics', 'Priority support', 'API access'],
    cta: 'Subscribe',
    popular: false,
  },
]

// Features data
const features = [
  {
    icon: SparklesIcon,
    title: '4 AI Investor Personas',
    description: 'Practice with different investor types - from aggressive VCs to supportive angels.',
  },
  {
    icon: MicIcon,
    title: 'Voice-Based Pitching',
    description: 'Present your pitch naturally using your voice. Our AI responds like a real investor.',
  },
  {
    icon: ChartIcon,
    title: 'Instant Deck Analysis',
    description: 'Upload your pitch deck and get immediate scores across 7 key categories.',
  },
  {
    icon: ShieldIcon,
    title: 'Safe Environment',
    description: 'Make mistakes, learn, and improve without any real-world consequences.',
  },
  {
    icon: MessageIcon,
    title: 'Tough Q&A Sessions',
    description: 'Face challenging investor questions about market, financials, and team.',
  },
  {
    icon: ClockIcon,
    title: '24/7 Availability',
    description: 'Practice anytime, anywhere. Your AI investors are always ready.',
  },
]

// Stats data
const stats = [
  { value: '500+', label: 'Founders Trained' },
  { value: '2,000+', label: 'Pitch Sessions' },
  { value: '85%', label: 'Success Rate' },
  { value: '4.9/5', label: 'User Rating' },
]

// Testimonials data
const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CEO, TechFlow',
    avatar: 'SC',
    content: 'PitchDrill helped me secure $2M in seed funding. The AI investors asked tougher questions than the real VCs did!',
    rating: 5,
    color: 'bg-blue-500',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Founder, GreenLeaf',
    avatar: 'MR',
    content: 'After 5 sessions with PitchDrill, my confidence skyrocketed. I went from nervous to nailing every pitch.',
    rating: 5,
    color: 'bg-green-500',
  },
  {
    name: 'Emily Park',
    role: 'Co-founder, DataSync',
    avatar: 'EP',
    content: 'The deck analysis feature alone is worth it. Found critical weaknesses I never would have caught myself.',
    rating: 5,
    color: 'bg-purple-500',
  },
  {
    name: 'David Kim',
    role: 'CEO, CloudBase',
    avatar: 'DK',
    content: 'Best investment I made for my startup. Practiced with Shark mode until I could handle any question.',
    rating: 5,
    color: 'bg-amber-500',
  },
]

// Partner logos
const partners = [
  { name: 'Y Combinator', abbr: 'YC' },
  { name: 'Techstars', abbr: 'TS' },
  { name: '500 Startups', abbr: '500' },
  { name: 'Plug and Play', abbr: 'PnP' },
  { name: 'Seedcamp', abbr: 'SC' },
  { name: 'Entrepreneur First', abbr: 'EF' },
]

// Comparison data
const comparisonData = [
  { feature: 'Practice anytime', pitchdrill: true, traditional: false, mentors: false },
  { feature: 'Instant feedback', pitchdrill: true, traditional: false, mentors: false },
  { feature: 'Multiple investor types', pitchdrill: true, traditional: false, mentors: true },
  { feature: 'Deck analysis', pitchdrill: true, traditional: false, mentors: false },
  { feature: 'No scheduling needed', pitchdrill: true, traditional: true, mentors: false },
  { feature: 'Real investor questions', pitchdrill: true, traditional: false, mentors: true },
  { feature: 'Affordable', pitchdrill: true, traditional: true, mentors: false },
  { feature: 'Risk-free environment', pitchdrill: true, traditional: true, mentors: false },
]

// FAQ data
const faqs = [
  {
    question: 'How does PitchDrill work?',
    answer: 'Upload your pitch deck, select an investor persona, and start pitching. Our AI analyzes your deck, listens to your pitch, asks tough questions, and provides detailed feedback.',
  },
  {
    question: 'What file formats are supported?',
    answer: 'We support PDF, PPTX, and image files (PNG, JPG). Your pitch deck can be up to 50MB in size.',
  },
  {
    question: 'How realistic are the AI investors?',
    answer: 'Our AI investors are trained on thousands of real VC interactions. They ask about market size, unit economics, competitive advantage, and more.',
  },
  {
    question: 'Can I practice multiple times?',
    answer: 'Absolutely! Depending on your plan, you can practice as many times as you need. Each session provides unique questions.',
  },
  {
    question: 'Is my pitch deck data secure?',
    answer: 'Yes, we take security seriously. Your pitch decks are encrypted and never shared. You can delete your data at any time.',
  },
]

// FAQ Item Component
function FAQItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left hover:text-accent-custom transition-colors group"
      >
        <span className="font-semibold text-neutral-custom group-hover:text-accent-custom">{question}</span>
        <ChevronDownIcon className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p className="text-neutral-custom-subdued">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  return (
    <main className="min-h-screen bg-canvas overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-canvas/90 backdrop-blur-lg border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="PitchDrill" width={44} height={44} className="w-11 h-11" />
              <span className="text-xl font-bold text-neutral-custom">
                Pitch<span className="text-accent-custom">Drill</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-neutral-custom-subdued hover:text-accent-custom transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-neutral-custom-subdued hover:text-accent-custom transition-colors font-medium">
                How It Works
              </a>
              <a href="#testimonials" className="text-neutral-custom-subdued hover:text-accent-custom transition-colors font-medium">
                Testimonials
              </a>
              <a href="#pricing" className="text-neutral-custom-subdued hover:text-accent-custom transition-colors font-medium">
                Pricing
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/upload">
                <Button className="bg-accent-custom hover:bg-accent-custom-baseline text-white rounded-full px-6 shadow-lg shadow-accent-custom/25">
                  Get Started Free
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`block h-0.5 bg-neutral-custom transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 bg-neutral-custom transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-neutral-custom transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-neutral-200 pt-4">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-neutral-custom hover:text-accent-custom py-2">Features</a>
                <a href="#how-it-works" className="text-neutral-custom hover:text-accent-custom py-2">How It Works</a>
                <a href="#testimonials" className="text-neutral-custom hover:text-accent-custom py-2">Testimonials</a>
                <a href="#pricing" className="text-neutral-custom hover:text-accent-custom py-2">Pricing</a>
                <Link href="/upload">
                  <Button className="w-full bg-accent-custom text-white rounded-full mt-2">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-custom/5 via-canvas to-accent-custom-baseline/5" />
        <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-accent-custom/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-custom-baseline/10 rounded-full blur-[120px]" />

        {/* Floating Elements */}
        <div className="absolute top-32 right-20 w-20 h-20 border-2 border-accent-custom/20 rounded-2xl rotate-12 hidden lg:block animate-float" />
        <div className="absolute bottom-40 left-20 w-16 h-16 bg-accent-custom/10 rounded-full hidden lg:block animate-float-delayed" />
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-accent-custom rounded-full animate-pulse hidden lg:block" />

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-accent-custom/10 text-accent-custom px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fadeIn">
                <SparklesIcon className="w-4 h-4" />
                AI-Powered VC Simulation
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-custom leading-tight mb-6 animate-fadeIn animation-delay-100">
                Practice Your Pitch.
                <br />
                <span className="text-accent-custom">Impress Investors.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-neutral-custom-subdued mb-8 max-w-xl mx-auto lg:mx-0 animate-fadeIn animation-delay-200">
                Train with AI investors before your real pitch. Get feedback from 4 different VC personas, face tough Q&A sessions, and nail your next funding round.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 animate-fadeIn animation-delay-300">
                <Link href="/upload">
                  <Button
                    size="lg"
                    className="bg-accent-custom hover:bg-accent-custom-baseline text-white px-8 py-6 text-lg rounded-full shadow-xl shadow-accent-custom/30 hover:shadow-2xl hover:shadow-accent-custom/40 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  >
                    Start Free Trial
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-neutral-300 text-neutral-custom hover:bg-neutral-100 hover:border-accent-custom px-8 py-6 text-lg rounded-full w-full sm:w-auto group"
                  >
                    <PlayIcon className="w-5 h-5 mr-2 group-hover:text-accent-custom" />
                    Watch Demo
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-neutral-custom-subdued animate-fadeIn animation-delay-400">
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-green-500" />
                  First session free
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-green-500" />
                  Cancel anytime
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image/Card */}
            <div className="relative hidden lg:block animate-fadeIn animation-delay-300">
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-neutral-100 hover:shadow-3xl transition-shadow duration-500">
                {/* Mock App Interface */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                    <div className="w-12 h-12 bg-accent-custom/20 rounded-xl flex items-center justify-center">
                      <UploadIcon className="w-6 h-6 text-accent-custom" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-custom">Deck Uploaded</div>
                      <div className="text-sm text-neutral-custom-subdued">startup_pitch.pdf</div>
                    </div>
                    <CheckIcon className="w-6 h-6 text-green-500 ml-auto" />
                  </div>

                  <div className="p-4 bg-accent-custom/5 rounded-xl border-2 border-accent-custom/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-neutral-custom">Overall Score</span>
                      <span className="text-2xl font-bold text-accent-custom">78/100</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-custom-subdued">Problem</span>
                        <span className="text-green-600">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-custom-subdued">Solution</span>
                        <span className="text-green-600">82%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-custom-subdued">Market</span>
                        <span className="text-yellow-600">68%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-custom-subdued">Team</span>
                        <span className="text-green-600">90%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {['Shark', 'Friendly', 'Analyst'].map((mode) => (
                      <div key={mode} className="flex-1 p-3 bg-neutral-50 rounded-lg text-center text-sm font-medium text-neutral-custom hover:bg-accent-custom/10 transition-colors cursor-pointer">
                        {mode}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -right-4 -bottom-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-bounce-slow">
                  Ready to Pitch!
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -z-10 -top-4 -left-4 w-full h-full bg-accent-custom/10 rounded-3xl" />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <a href="#stats">
            <ChevronDownIcon className="w-8 h-8 text-neutral-custom-subdued hover:text-accent-custom transition-colors" />
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 px-6 bg-neutral-custom">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <AnimatedSection key={stat.label} delay={index * 100}>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-neutral-400 font-medium">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Logos Section */}
      <section className="py-12 px-6 bg-white border-b border-neutral-100">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <p className="text-center text-sm text-neutral-custom-subdued mb-8 uppercase tracking-wider font-medium">
              Trusted by founders from top accelerators
            </p>
          </AnimatedSection>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner, index) => (
              <AnimatedSection key={partner.name} delay={index * 50}>
                <div className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 group-hover:bg-accent-custom/10 flex items-center justify-center font-bold text-sm transition-colors">
                    {partner.abbr}
                  </div>
                  <span className="hidden sm:block font-medium">{partner.name}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="inline-block text-accent-custom font-semibold text-sm uppercase tracking-wider mb-4">
                Features
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-custom mb-4">
                Everything You Need to Perfect Your Pitch
              </h2>
              <p className="text-neutral-custom-subdued max-w-2xl mx-auto text-lg">
                From deck analysis to live Q&A sessions, we&apos;ve got you covered
              </p>
            </div>
          </AnimatedSection>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 100}>
                <div className="group p-8 rounded-2xl bg-neutral-50 hover:bg-accent-custom hover:shadow-xl transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-accent-custom/10 group-hover:bg-white/20 flex items-center justify-center mb-6 transition-colors">
                    <feature.icon className="w-7 h-7 text-accent-custom group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-custom group-hover:text-white mb-3 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-custom-subdued group-hover:text-white/80 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-canvas">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="inline-block text-accent-custom font-semibold text-sm uppercase tracking-wider mb-4">
                How It Works
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-custom mb-4">
                4 Steps to Investor-Ready
              </h2>
              <p className="text-neutral-custom-subdued max-w-2xl mx-auto text-lg">
                From deck upload to VC verdict in minutes
              </p>
            </div>
          </AnimatedSection>

          {/* Timeline Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-accent-custom via-accent-custom-baseline to-green-500 -translate-y-1/2" />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { num: 1, icon: UploadIcon, title: 'Upload', desc: 'Upload your pitch deck and get instant AI analysis with scores across 7 categories', color: 'bg-accent-custom' },
                { num: 2, icon: MicIcon, title: 'Pitch', desc: 'Present your startup using voice. Our AI listens and prepares relevant questions', color: 'bg-accent-custom' },
                { num: 3, icon: MessageIcon, title: 'Q&A', desc: 'Face tough investor questions about market, financials, team, and competition', color: 'bg-accent-custom-baseline' },
                { num: 4, icon: UsersIcon, title: 'Council', desc: 'Get final verdict from the VC panel with detailed feedback and improvement tips', color: 'bg-green-500' },
              ].map((step, index) => (
                <AnimatedSection key={step.num} delay={index * 150}>
                  <div className="relative">
                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center relative z-10">
                      <div className={`w-16 h-16 rounded-full ${step.color} text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6`}>
                        {step.num}
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-accent-custom/10 flex items-center justify-center mx-auto mb-4">
                        <step.icon className="w-7 h-7 text-accent-custom" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-custom mb-2">{step.title}</h3>
                      <p className="text-neutral-custom-subdued text-sm">{step.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>

          {/* CTA */}
          <AnimatedSection delay={600}>
            <div className="text-center mt-12">
              <Link href="/upload">
                <Button
                  size="lg"
                  className="bg-accent-custom hover:bg-accent-custom-baseline text-white px-8 py-6 text-lg rounded-full shadow-lg"
                >
                  Try It Now - It&apos;s Free
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="inline-block text-accent-custom font-semibold text-sm uppercase tracking-wider mb-4">
                Testimonials
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-custom mb-4">
                Loved by Founders Worldwide
              </h2>
              <p className="text-neutral-custom-subdued max-w-2xl mx-auto text-lg">
                See what founders are saying about their PitchDrill experience
              </p>
            </div>
          </AnimatedSection>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={testimonial.name} delay={index * 100}>
                <div className="bg-canvas rounded-2xl p-8 relative group hover:shadow-xl transition-all duration-300">
                  {/* Quote Icon */}
                  <QuoteIcon className="w-10 h-10 text-accent-custom/20 absolute top-6 right-6" />

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-neutral-custom mb-6 text-lg leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-custom">{testimonial.name}</div>
                      <div className="text-sm text-neutral-custom-subdued">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-6 bg-canvas">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="inline-block text-accent-custom font-semibold text-sm uppercase tracking-wider mb-4">
                Why PitchDrill?
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-custom mb-4">
                Compare Your Options
              </h2>
              <p className="text-neutral-custom-subdued max-w-2xl mx-auto text-lg">
                See how PitchDrill stacks up against traditional pitch practice methods
              </p>
            </div>
          </AnimatedSection>

          {/* Comparison Table */}
          <AnimatedSection delay={200}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200">
                      <th className="text-left py-4 px-6 font-semibold text-neutral-custom">Feature</th>
                      <th className="text-center py-4 px-6">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-accent-custom rounded-lg flex items-center justify-center mb-1">
                            <SparklesIcon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold text-accent-custom">PitchDrill</span>
                        </div>
                      </th>
                      <th className="text-center py-4 px-6">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-neutral-200 rounded-lg flex items-center justify-center mb-1">
                            <span className="text-lg">🪞</span>
                          </div>
                          <span className="font-semibold text-neutral-custom">Mirror Practice</span>
                        </div>
                      </th>
                      <th className="text-center py-4 px-6">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-neutral-200 rounded-lg flex items-center justify-center mb-1">
                            <span className="text-lg">👥</span>
                          </div>
                          <span className="font-semibold text-neutral-custom">Mentors/Advisors</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, index) => (
                      <tr key={row.feature} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                        <td className="py-4 px-6 text-neutral-custom font-medium">{row.feature}</td>
                        <td className="py-4 px-6 text-center">
                          {row.pitchdrill ? (
                            <CheckIcon className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <XMarkIcon className="w-6 h-6 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {row.traditional ? (
                            <CheckIcon className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <XMarkIcon className="w-6 h-6 text-red-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {row.mentors ? (
                            <CheckIcon className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <XMarkIcon className="w-6 h-6 text-red-400 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="inline-block text-accent-custom font-semibold text-sm uppercase tracking-wider mb-4">
                Pricing
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-custom mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-neutral-custom-subdued max-w-2xl mx-auto text-lg">
                Start free, upgrade when you&apos;re ready. No hidden fees.
              </p>
            </div>
          </AnimatedSection>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {pricingPlans.map((plan, index) => (
              <AnimatedSection key={plan.name} delay={index * 100}>
                <div
                  className={`relative rounded-2xl p-6 transition-all duration-300 hover:scale-105 h-full flex flex-col ${
                    plan.popular
                      ? 'bg-accent-custom text-white shadow-2xl shadow-accent-custom/30 scale-105 lg:scale-110 z-10'
                      : 'bg-canvas border border-neutral-200 hover:shadow-xl hover:border-accent-custom/30'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Plan Info */}
                  <div className="text-center mb-6 pt-2">
                    <h3 className={`font-bold text-lg mb-1 ${plan.popular ? 'text-white' : 'text-neutral-custom'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm mb-4 ${plan.popular ? 'text-white/80' : 'text-neutral-custom-subdued'}`}>
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-neutral-custom'}`}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className={`text-sm ${plan.popular ? 'text-white/80' : 'text-neutral-custom-subdued'}`}>
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckIcon className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-green-500'}`} />
                        <span className={plan.popular ? 'text-white/90' : 'text-neutral-custom-subdued'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href="/upload" className="block mt-auto">
                    <Button
                      className={`w-full rounded-full font-semibold ${
                        plan.popular
                          ? 'bg-white text-accent-custom hover:bg-neutral-100'
                          : 'bg-accent-custom text-white hover:bg-accent-custom-baseline'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-canvas">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <AnimatedSection>
            <div className="text-center mb-12">
              <span className="inline-block text-accent-custom font-semibold text-sm uppercase tracking-wider mb-4">
                FAQ
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-custom mb-4">
                Frequently Asked Questions
              </h2>
            </div>
          </AnimatedSection>

          {/* FAQ Items */}
          <AnimatedSection delay={200}>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              ))}
            </div>
          </AnimatedSection>

          {/* Contact */}
          <AnimatedSection delay={300}>
            <div className="text-center mt-8">
              <p className="text-neutral-custom-subdued">
                Still have questions?{' '}
                <a href="mailto:hello@pitchdrill.com" className="text-accent-custom hover:underline font-medium">
                  Contact us
                </a>
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-accent-custom relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full animate-float" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-white rounded-full animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 border border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        <AnimatedSection>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Nail Your Next Pitch?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join hundreds of founders who practice smarter, not harder.
              <br />
              Start your free trial today.
            </p>
            <Link href="/upload">
              <Button
                size="lg"
                className="bg-white text-accent-custom hover:bg-neutral-100 px-10 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold"
              >
                Get Started Free
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="mt-6 text-white/60 text-sm">
              No credit card required • First session free • Cancel anytime
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-neutral-custom">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="PitchDrill" width={40} height={40} className="w-10 h-10 invert" />
                <span className="text-xl font-bold text-white">
                  Pitch<span className="text-accent-custom-baseline">Drill</span>
                </span>
              </div>
              <p className="text-neutral-400 mb-4 max-w-xs">
                AI-powered pitch simulation platform. Practice with virtual VCs before meeting real ones.
              </p>
              <p className="text-neutral-500 text-sm">
                Made with <span className="text-red-400">&#9829;</span> in Turkey by <span className="text-white">HexCrew</span>
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-neutral-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-neutral-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="text-neutral-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#faq" className="text-neutral-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Get Started */}
            <div>
              <h4 className="text-white font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2">
                <li><Link href="/upload" className="text-neutral-400 hover:text-white transition-colors">Start Free Trial</Link></li>
                <li><Link href="/upload" className="text-neutral-400 hover:text-white transition-colors">Upload Deck</Link></li>
                <li><Link href="/history" className="text-neutral-400 hover:text-white transition-colors">Session History</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-neutral-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-500 text-sm">
              &copy; {new Date().getFullYear()} PitchDrill. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(12deg);
          }
          50% {
            transform: translateY(-20px) rotate(12deg);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animation-delay-100 {
          animation-delay: 100ms;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </main>
  )
}
