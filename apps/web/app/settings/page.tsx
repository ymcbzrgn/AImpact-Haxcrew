'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Zap,
  ArrowLeft,
  User,
  Bell,
  Volume2,
  Moon,
  Sun,
  Globe,
  Shield,
  Trash2,
  Save,
  Check,
  ChevronRight,
  Mic,
  Monitor,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface SettingToggleProps {
  label: string
  description: string
  enabled: boolean
  onChange: (enabled: boolean) => void
  icon: React.ReactNode
}

function SettingToggle({ label, description, enabled, onChange, icon }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-neutral-custom/5 rounded-xl transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-accent-custom/10 flex items-center justify-center text-accent-custom">
          {icon}
        </div>
        <div>
          <p className="font-medium text-neutral-custom">{label}</p>
          <p className="text-sm text-neutral-custom-subdued">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-accent-custom' : 'bg-neutral-custom/20'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

function SettingSelect({
  label,
  description,
  value,
  options,
  onChange,
  icon,
}: {
  label: string
  description: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-neutral-custom/5 rounded-xl transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-accent-custom/10 flex items-center justify-center text-accent-custom">
          {icon}
        </div>
        <div>
          <p className="font-medium text-neutral-custom">{label}</p>
          <p className="text-sm text-neutral-custom-subdued">{description}</p>
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 bg-neutral-custom/5 border border-neutral-custom/10 rounded-lg text-sm text-neutral-custom focus:outline-none focus:ring-2 focus:ring-accent-custom"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    darkMode: false,
    autoSave: true,
    language: 'tr',
    microphoneEnabled: true,
    displayMode: 'comfortable',
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('pitchdrill_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateSetting = (key: keyof typeof settings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
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
          <Button
            onClick={handleSave}
            className={`gap-2 transition-all ${
              saved
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-accent-custom hover:bg-accent-custom-baseline'
            } text-white`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Kaydedildi
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-custom mb-2">Ayarlar</h1>
          <p className="text-neutral-custom-subdued">
            Uygulama tercihlerinizi özelleştirin
          </p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-accent-custom" />
                Genel
              </CardTitle>
              <CardDescription>Temel uygulama ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <SettingSelect
                label="Dil"
                description="Uygulama dilini seçin"
                value={settings.language}
                options={[
                  { value: 'tr', label: 'Türkçe' },
                  { value: 'en', label: 'English' },
                ]}
                onChange={(v) => updateSetting('language', v)}
                icon={<Globe className="w-5 h-5" />}
              />
              <SettingSelect
                label="Görünüm"
                description="Arayüz yoğunluğunu ayarlayın"
                value={settings.displayMode}
                options={[
                  { value: 'compact', label: 'Kompakt' },
                  { value: 'comfortable', label: 'Rahat' },
                  { value: 'spacious', label: 'Geniş' },
                ]}
                onChange={(v) => updateSetting('displayMode', v)}
                icon={<Monitor className="w-5 h-5" />}
              />
              <SettingToggle
                label="Karanlık Mod"
                description="Göz yorgunluğunu azaltmak için karanlık tema"
                enabled={settings.darkMode}
                onChange={(v) => updateSetting('darkMode', v)}
                icon={settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              />
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent-custom" />
                Bildirimler
              </CardTitle>
              <CardDescription>Bildirim tercihlerinizi yönetin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <SettingToggle
                label="Bildirimler"
                description="Uygulama bildirimlerini al"
                enabled={settings.notifications}
                onChange={(v) => updateSetting('notifications', v)}
                icon={<Bell className="w-5 h-5" />}
              />
              <SettingToggle
                label="Ses Efektleri"
                description="Uygulama seslerini aç/kapat"
                enabled={settings.soundEffects}
                onChange={(v) => updateSetting('soundEffects', v)}
                icon={<Volume2 className="w-5 h-5" />}
              />
            </CardContent>
          </Card>

          {/* Practice Settings */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mic className="w-5 h-5 text-accent-custom" />
                Pratik Ayarları
              </CardTitle>
              <CardDescription>Pitch pratik tercihlerinizi özelleştirin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <SettingToggle
                label="Mikrofon"
                description="Ses kaydı için mikrofon erişimi"
                enabled={settings.microphoneEnabled}
                onChange={(v) => updateSetting('microphoneEnabled', v)}
                icon={<Mic className="w-5 h-5" />}
              />
              <SettingToggle
                label="Otomatik Kayıt"
                description="Pratik notlarını otomatik kaydet"
                enabled={settings.autoSave}
                onChange={(v) => updateSetting('autoSave', v)}
                icon={<Save className="w-5 h-5" />}
              />
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent-custom" />
                Gizlilik ve Veri
              </CardTitle>
              <CardDescription>Verilerinizi yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 hover:bg-neutral-custom/5 rounded-xl transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-custom">Verileri Sil</p>
                      <p className="text-sm text-neutral-custom-subdued">
                        Tüm pratik verilerini ve ayarları sil
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    Sil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="bg-white">
            <CardContent className="p-2">
              <Link href="/about" className="flex items-center justify-between p-4 hover:bg-neutral-custom/5 rounded-xl transition-colors">
                <span className="text-neutral-custom">Hakkında</span>
                <ChevronRight className="w-5 h-5 text-neutral-custom-subdued" />
              </Link>
              <Link href="/help" className="flex items-center justify-between p-4 hover:bg-neutral-custom/5 rounded-xl transition-colors">
                <span className="text-neutral-custom">Yardım</span>
                <ChevronRight className="w-5 h-5 text-neutral-custom-subdued" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Version */}
        <div className="text-center mt-8 text-sm text-neutral-custom-subdued">
          PitchDrill v1.0.0 • AImpact Hackathon 2025
        </div>
      </main>
    </div>
  )
}
