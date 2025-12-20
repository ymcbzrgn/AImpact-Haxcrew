export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary-600 mb-4">
          DeckMate
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect Startups with the Right Investors
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Get Started
          </button>
          <button className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </main>
  )
}
