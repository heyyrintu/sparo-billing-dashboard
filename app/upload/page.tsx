import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { UploadSection } from '@/components/UploadSection'

export default function UploadPage() {
  return (
    <div className="min-h-screen relative bg-[#F1F1F1]">
      {/* Header */}
      <div className="relative z-50">
        <Header />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Upload Files</h1>
          <p className="text-muted-foreground">Upload your Inbound and Outbound MIS Excel files</p>
        </div>
        
        <Suspense fallback={<div>Loading...</div>}>
          <UploadSection />
        </Suspense>
      </main>
    </div>
  )
}

