'use client'

import { Suspense } from 'react'
import { Billing } from '@/components/Billing'

export default function BillingPage() {
  return (
    <div className="min-h-screen relative bg-[#F1F1F1]">
      {/* Main Content */}
      <main className="relative z-10 w-full h-screen">
        <Suspense fallback={<div>Loading...</div>}>
          <Billing />
        </Suspense>
      </main>
    </div>
  )
}

