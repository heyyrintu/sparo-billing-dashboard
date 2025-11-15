import { Suspense } from 'react'
import { Dashboard } from '@/components/Dashboard'
import { Header } from '@/components/Header'

export default function Home() {
  return (
    <div className="min-h-screen relative bg-[#F1F1F1]">
      {/* Header */}
      {/* <div className="relative z-50">
        <Header />
      </div> */}

      {/* Main Content */}
      <main className="relative z-10 w-full h-screen">
        <Suspense fallback={<div>Loading...</div>}>
          <Dashboard />
        </Suspense>
      </main>
    </div>
  )
}
