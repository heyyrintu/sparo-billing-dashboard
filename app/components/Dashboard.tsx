'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/ui/tabs'
import { UploadSection } from './UploadSection'
import { DateRangePicker } from './DateRangePicker'
import { KPICards } from './KPICards'
import { DailyChart } from './DailyChart'
import { DataBadge } from './DataBadge'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

export function Dashboard() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [mode, setMode] = useState<'marginal' | 'flat'>('marginal')
  const [metric, setMetric] = useState<'gross' | 'revenue'>('gross')

  const handleDateRangeChange = (from: Date, to: Date) => {
    setDateRange({ from, to })
  }

  const handleQuickFilter = (filter: string) => {
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
        setDateRange({ from: startOfMonth(today), to: today })
        break
      case 'last30':
        setDateRange({ from: subDays(today, 30), to: today })
        break
    }
  }

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <UploadSection />
      
      {/* Data Freshness Badge */}
      <DataBadge />
      
      {/* Date Range Picker */}
      <DateRangePicker
        from={dateRange.from}
        to={dateRange.to}
        onDateRangeChange={handleDateRangeChange}
        onQuickFilter={handleQuickFilter}
      />
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inbound">Inbound</TabsTrigger>
          <TabsTrigger value="outward">Outward</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inbound" className="space-y-6">
          <KPICards 
            dateRange={dateRange} 
            mode="marginal" 
            type="inbound" 
          />
          <DailyChart 
            dateRange={dateRange} 
            metric="gross" 
            mode="marginal" 
          />
        </TabsContent>
        
        <TabsContent value="outward" className="space-y-6">
          <KPICards 
            dateRange={dateRange} 
            mode="marginal" 
            type="outward" 
          />
          <DailyChart 
            dateRange={dateRange} 
            metric="gross" 
            mode="marginal" 
          />
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Revenue Analysis</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Mode:</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as 'marginal' | 'flat')}
                  className="px-3 py-1 border rounded-md bg-background"
                >
                  <option value="marginal">Marginal</option>
                  <option value="flat">Flat</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Metric:</label>
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value as 'gross' | 'revenue')}
                  className="px-3 py-1 border rounded-md bg-background"
                >
                  <option value="gross">Gross Sale</option>
                  <option value="revenue">Revenue</option>
                </select>
              </div>
            </div>
          </div>
          
          <KPICards 
            dateRange={dateRange} 
            mode={mode} 
            type="revenue" 
          />
          <DailyChart 
            dateRange={dateRange} 
            metric={metric} 
            mode={mode} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
