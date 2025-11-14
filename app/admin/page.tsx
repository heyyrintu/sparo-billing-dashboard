import { Suspense } from 'react'
import { AdminDashboard } from './components/AdminDashboard'
import { Header } from '@/components/Header'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage uploads and system data</p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <AdminDashboard />
        </Suspense>
      </main>
    </div>
  )
}
