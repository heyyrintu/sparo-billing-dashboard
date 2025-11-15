'use client'

import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { UploadSection } from '@/components/UploadSection'
import { AppSidebar } from '@/components/AppSidebar'
import { cn } from '@/lib/utils'

export default function UploadPage() {
  return (
    <div className="min-h-screen relative bg-[#F1F1F1]">
      {/* Header */}
      {/* <div className="relative z-50">
        <Header />
      </div> */}

      {/* Main Content */}
      <main className="relative z-10 w-full h-screen">
        <div className={cn(
          "flex w-full flex-1 flex-col overflow-hidden md:flex-row",
          "h-screen"
        )}>
          <AppSidebar />
          
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-4 md:p-8 dark:border-neutral-700 dark:bg-neutral-900">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Upload Files</h1>
                <p className="text-muted-foreground">Upload your Inbound and Outbound MIS Excel files</p>
              </div>
              
              <Suspense fallback={<div>Loading...</div>}>
                <UploadSection />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

