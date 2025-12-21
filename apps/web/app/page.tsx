import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-neutral-custom mb-4">PitchDrill</h1>
      <p className="text-neutral-custom-subdued mb-8 text-center max-w-md">
        AI-Powered Pitch Simulation & VC Council
      </p>
      <Link href="/upload">
        <Button className="bg-accent-custom hover:bg-accent-custom-baseline text-white">
          Start Practice
        </Button>
      </Link>
    </main>
  )
}
