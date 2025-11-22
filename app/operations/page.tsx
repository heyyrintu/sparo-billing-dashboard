'use client'

import { Suspense } from 'react'
import { Operations } from '@/components/Operations'
import { AppSidebar } from '@/components/AppSidebar'

export default function OperationsPage() {
  return (
    <div className="min-h-screen relative bg-[#F1F1F1]">
      {/* Main Content */}
      <main className="relative z-10 w-full h-screen">
        <Suspense fallback={<div>Loading...</div>}>
          <Operations />
        </Suspense>
      </main>
    </div>
  )
}

