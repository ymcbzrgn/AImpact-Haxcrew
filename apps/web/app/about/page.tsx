'use client'

import Link from 'next/link'
import {
  Zap,
  ArrowLeft,
  Heart,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Award,
  Users,
  Target,
  Sparkles,
  Code,
  Cpu,
  Brain,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const teamMembers = [
  { name: 'Yamaç', role: 'Backend & Architecture', avatar: '👨‍💻' },
  { name: 'Bartın', role: 'Frontend Developer', avatar: '🎨' },
  { name: 'Bekir', role: 'Frontend Developer', avatar: '💻' },
  { name: 'Nisa', role: 'Backend Developer', avatar: '⚙️' },
  { name: 'Sinem', role: 'AI & Prompts', avatar: '🤖' },
  { name: 'Melisa', role: 'Testing & QA', avatar: '🧪' },
]

const techStack = [
  { name: 'Next.js 14', icon: <Globe className="w-5 h-5" />, color: '#000000' },
  { name: 'FastAPI', icon: <Zap className="w-5 h-5" />, color: '#009688' },
  { name: 'Gemini AI', icon: <Brain className="w-5 h-5" />, color: '#8B5CF6' },
  { name: 'PostgreSQL', icon: <Cpu className="w-5 h-5" />, color: '#336791' },
  { name: 'Tailwind CSS', icon: <Code className="w-5 h-5" />, color: '#06B6D4' },
  { name: 'TypeScript', icon: <Code className="w-5 h-5" />, color: '#3178C6' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-neutral-custom-subdued hover:text-neutral-custom transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-custom flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-neutral-custom">PitchDrill</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent-custom/10 text-accent-custom px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            AImpact Hackathon 2025
          </div>
          <h1 className="text-4xl font-bold text-neutral-custom mb-4">
            PitchDrill Hakkında
          </h1>
          <p className="text-xl text-neutral-custom-subdued max-w-2xl mx-auto">
            Yapay zeka destekli pitch pratik platformu.
            Girişimcilerin yatırımcı sunumlarını mükemmelleştirmelerine yardımcı oluyoruz.
          </p>
        </div>

        {/* Mission */}
        <Card className="bg-gradient-to-br from-accent-custom to-purple-600 text-white mb-8 overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6" />
                <h2 className="text-xl font-bold">Misyonumuz</h2>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">
                Her girişimcinin fikirlerini en iyi şekilde sunabilmesi için gerekli
                araçları ve geri bildirimi sağlamak. Yapay zeka ile güçlendirilmiş
                pratik ortamımız, gerçek yatırımcı toplantılarına hazırlanmanızı sağlar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-neutral-custom mb-2">AI Destekli Analiz</h3>
              <p className="text-sm text-neutral-custom-subdued">
                Gemini AI ile deck&apos;inizi 7 kritik kategoride analiz ediyoruz
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-neutral-custom mb-2">Sanal VC Paneli</h3>
              <p className="text-sm text-neutral-custom-subdued">
                5 farklı yatırımcı karakteri ile gerçekçi Q&A deneyimi
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-neutral-custom mb-2">Gerçek Zamanlı Geri Bildirim</h3>
              <p className="text-sm text-neutral-custom-subdued">
                Pitch yaparken anında öneriler ve iyileştirme noktaları
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-custom mb-6 text-center">
            Haxcrew Ekibi
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.name} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{member.avatar}</div>
                  <p className="font-semibold text-neutral-custom">{member.name}</p>
                  <p className="text-xs text-neutral-custom-subdued">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-custom mb-6 text-center">
            Teknoloji Stack
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm"
              >
                <div style={{ color: tech.color }}>{tech.icon}</div>
                <span className="text-sm font-medium text-neutral-custom">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-neutral-custom/10">
          <p className="text-neutral-custom-subdued mb-4">
            Made with <Heart className="w-4 h-4 inline text-red-500" /> by Haxcrew
          </p>
          <div className="flex justify-center gap-4">
            <span className="text-neutral-custom-subdued opacity-50 cursor-not-allowed" title="Coming soon">
              <Github className="w-5 h-5" />
            </span>
            <span className="text-neutral-custom-subdued opacity-50 cursor-not-allowed" title="Coming soon">
              <Linkedin className="w-5 h-5" />
            </span>
            <span className="text-neutral-custom-subdued opacity-50 cursor-not-allowed" title="Coming soon">
              <Twitter className="w-5 h-5" />
            </span>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/" className="text-sm text-accent-custom hover:underline">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm text-accent-custom hover:underline">
              Dashboard
            </Link>
            <Link href="/help" className="text-sm text-accent-custom hover:underline">
              Help
            </Link>
          </div>
          <p className="text-xs text-neutral-custom-subdued mt-4">
            AImpact Hackathon 2025 • v1.0.0
          </p>
        </div>
      </main>
    </div>
  )
}
