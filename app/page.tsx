import { Suspense } from 'react'
import { Dashboard } from './components/Dashboard'
import { Header } from './components/Header'
import { AuthWrapper } from './components/AuthWrapper'

export default function Home() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        </main>
      </div>
    </AuthWrapper>
  )
}
