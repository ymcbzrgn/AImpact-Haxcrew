'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Zap,
  ArrowLeft,
  HelpCircle,
  Upload,
  Mic,
  Users,
  Trophy,
  ChevronDown,
  ChevronUp,
  Search,
  MessageCircle,
  Mail,
  FileText,
  Play,
  Target,
  Brain,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-neutral-custom/10 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-custom/5 transition-colors"
      >
        <span className="font-medium text-neutral-custom pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-neutral-custom-subdued flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-custom-subdued flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-neutral-custom-subdued text-sm leading-relaxed animate-in slide-in-from-top-2">
          {answer}
        </div>
      )}
    </div>
  )
}

const faqs = [
  {
    question: 'PitchDrill nasıl çalışır?',
    answer:
      'PitchDrill, pitch deck\'inizi yüklemenizle başlar. AI, deck\'inizi 7 kritik kategoride analiz eder ve size detaylı geri bildirim verir. Ardından sesli pratik yapabilir, AI tarafından sorulan sorulara cevap verebilir ve sanal bir yatırımcı paneli ile karşılaşabilirsiniz.',
  },
  {
    question: 'Hangi dosya formatları destekleniyor?',
    answer:
      'PDF, PowerPoint (PPT, PPTX) ve görsel dosyaları (PNG, JPG) destekliyoruz. En iyi sonuçlar için PDF formatını öneriyoruz.',
  },
  {
    question: 'Pratik modları arasındaki fark nedir?',
    answer:
      'Solo Pratik: Kendi hızınızda pratik yapın ve gerçek zamanlı geri bildirim alın. Q&A Pratik: AI tarafından sorulan yaygın yatırımcı sorularına hazırlanın. VC Council: 5 farklı yatırımcı karakterinden oluşan bir panel ile gerçekçi bir sunum deneyimi yaşayın.',
  },
  {
    question: 'Deck analizi ne kadar sürer?',
    answer:
      'Deck analizi genellikle 30-60 saniye sürer. Bu süre, deck\'inizin boyutuna ve karmaşıklığına göre değişebilir.',
  },
  {
    question: 'Verilerim güvende mi?',
    answer:
      'Evet, tüm verileriniz şifrelenmiş olarak saklanır. Deck\'leriniz ve pratik verileriniz gizli tutulur ve üçüncü taraflarla paylaşılmaz.',
  },
  {
    question: 'VC Council\'daki karakterler kimler?',
    answer:
      'Panelimizde 5 farklı yatırımcı karakteri bulunur: Sarah Chen (Büyüme Uzmanı), Marcus Johnson (Teknoloji Yatırımcısı), Elena Rodriguez (Pazar Uzmanı), David Park (Seri Girişimci) ve Amanda Foster (Etki Yatırımcısı). Her birinin kendine özgü soruları ve değerlendirme kriterleri vardır.',
  },
]

const steps = [
  {
    icon: <Upload className="w-6 h-6" />,
    title: '1. Deck Yükle',
    description: 'PDF veya PowerPoint formatında pitch deck\'inizi yükleyin',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: '2. AI Analizi',
    description: 'AI, deck\'inizi 7 kategoride analiz eder ve skor verir',
  },
  {
    icon: <Play className="w-6 h-6" />,
    title: '3. Mod Seç',
    description: 'Solo, Q&A veya Council modlarından birini seçin',
  },
  {
    icon: <Mic className="w-6 h-6" />,
    title: '4. Pratik Yap',
    description: 'Sesli sunumunuzu yapın ve gerçek zamanlı geri bildirim alın',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: '5. VC Council',
    description: 'Sanal yatırımcı paneli ile Q&A oturumu yapın',
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: '6. Sonuç Al',
    description: 'Detaylı geri bildirim ve yatırım kararını görün',
  },
]

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent-custom/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-accent-custom" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-custom mb-2">Yardım Merkezi</h1>
          <p className="text-neutral-custom-subdued">
            PitchDrill&apos;i nasıl kullanacağınızı öğrenin
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-custom-subdued" />
          <input
            type="text"
            placeholder="Soru ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-custom/10 rounded-xl text-neutral-custom placeholder:text-neutral-custom-subdued focus:outline-none focus:ring-2 focus:ring-accent-custom"
          />
        </div>

        {/* Quick Start */}
        <Card className="bg-white mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-accent-custom" />
              Hızlı Başlangıç
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-neutral-custom/5 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent-custom/10 flex items-center justify-center text-accent-custom flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-custom text-sm">{step.title}</p>
                    <p className="text-xs text-neutral-custom-subdued">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="bg-white mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-accent-custom" />
              Sıkça Sorulan Sorular
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-neutral-custom-subdued">
                Arama sonucu bulunamadı
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-gradient-to-br from-accent-custom to-purple-600 text-white mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Pro İpuçları
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/90">
                  Pitch&apos;inizin ilk 30 saniyesi en kritik kısımdır. Problem tanımınızı net tutun.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/90">
                  Her slide için 1-2 dakikadan fazla zaman harcamayın.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/90">
                  TAM/SAM/SOM hesaplamalarınızı bottom-up yaklaşımla yapın.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/90">
                  En az 3 kez pratik yapın - çalışmalar başarı oranını %40 artırıyor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-neutral-custom mb-4">Hala yardıma mı ihtiyacınız var?</h3>
            <p className="text-neutral-custom-subdued mb-6">
              Sorularınız için bizimle iletişime geçebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="mailto:support@pitchdrill.com" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="w-4 h-4" />
                  E-posta Gönder
                </Button>
              </a>
              <Link href="/about" className="flex-1">
                <Button className="w-full bg-accent-custom hover:bg-accent-custom-baseline text-white gap-2">
                  <FileText className="w-4 h-4" />
                  Hakkımızda
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-neutral-custom-subdued">
          <p>
            PitchDrill v1.0.0 • <Link href="/about" className="text-accent-custom hover:underline">Haxcrew</Link> tarafından geliştirildi
          </p>
        </div>
      </main>
    </div>
  )
}
