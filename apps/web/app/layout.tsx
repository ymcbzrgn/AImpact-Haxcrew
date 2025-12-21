import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PitchDrill - AI Pitch Simulation',
  description: 'Practice your startup pitch with AI-powered VC simulation',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-canvas text-neutral-custom antialiased`}>
        {children}
      </body>
    </html>
  )
}
