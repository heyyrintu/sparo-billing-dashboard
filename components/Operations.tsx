'use client'

import { useState, useCallback, useEffect } from 'react'
import { AppSidebar } from '@/components/AppSidebar'
import { DateRangePicker } from '@/components/DateRangePicker'
import { KPICards } from '@/components/KPICards'
import { DailyChart } from '@/components/DailyChart'
import { BoxesBarChart } from '@/components/BoxesBarChart'
import { GrossSalesBarChart } from '@/components/GrossSalesBarChart'
import { subDays, startOfMonth } from 'date-fns'
import { cn } from '@/lib/utils'

export function Operations() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null)

  // Initialize date range on client side only to avoid hydration mismatch
  useEffect(() => {
    setDateRange({
      from: subDays(new Date(), 30),
      to: new Date()
    })
  }, [])

  const handleDateRangeChange = useCallback((from: Date, to: Date) => {
    setDateRange({ from, to })
  }, [])

  const handleQuickFilter = useCallback((filter: string) => {
    const today = new Date()
    
    switch (filter) {
      case 'today':
        setDateRange({ from: today, to: today })
        break
      case 'wtd':
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        setDateRange({ from: startOfWeek, to: today })
        break
      case 'mtd':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        setDateRange({ from: startOfMonth, to: today })
        break
      case 'last30':
        setDateRange({ from: subDays(today, 30), to: today })
        break
    }
  }, [])

  // Show loading state until dateRange is initialized
  if (!dateRange) {
    return (
      <div className={cn(
        "flex w-full flex-1 flex-col overflow-hidden md:flex-row",
        "h-screen"
      )}>
        <AppSidebar activeTab="operations" onTabChange={() => {}} />
        <div className="flex flex-1 flex-col overflow-y-auto items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex w-full flex-1 flex-col overflow-hidden md:flex-row",
      "h-screen"
    )}>
      <AppSidebar activeTab="operations" onTabChange={() => {}} />
      
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-4 md:p-8 dark:border-neutral-700 dark:bg-neutral-900">
          {/* Date Range Picker */}
          <div className="mb-4">
            <DateRangePicker
              from={dateRange.from}
              to={dateRange.to}
              onDateRangeChange={handleDateRangeChange}
              onQuickFilter={handleQuickFilter}
            />
          </div>
          
          {/* Inbound Section */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold">Inbound Operations</h2>
            <KPICards 
              dateRange={dateRange} 
              mode="marginal" 
              type="inbound" 
            />
            <BoxesBarChart 
              dateRange={dateRange} 
              type="inbound" 
            />
            <DailyChart 
              dateRange={dateRange} 
              metric="gross" 
              mode="marginal" 
            />
          </div>

          {/* Outward Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Outward Operations</h2>
            <KPICards 
              dateRange={dateRange} 
              mode="marginal" 
              type="outward" 
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GrossSalesBarChart 
                dateRange={dateRange} 
                type="outward" 
              />
              <BoxesBarChart 
                dateRange={dateRange} 
                type="outward" 
              />
            </div>
            <DailyChart 
              dateRange={dateRange} 
              metric="gross" 
              mode="marginal" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

