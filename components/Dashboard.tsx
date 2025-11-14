'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/ui/tabs'
import { DateRangePicker } from '@/components/DateRangePicker'
import { KPICards } from '@/components/KPICards'
import { DailyChart } from '@/components/DailyChart'
import { BoxesBarChart } from '@/components/BoxesBarChart'
import { GrossSalesBarChart } from '@/components/GrossSalesBarChart'
import { subDays, startOfMonth } from 'date-fns'

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
      {/* Date Range Picker */}
      <DateRangePicker
        from={dateRange.from}
        to={dateRange.to}
        onDateRangeChange={handleDateRangeChange}
        onQuickFilter={handleQuickFilter}
      />
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <TabsList className="grid w-full grid-cols-3 bg-transparent gap-2 h-auto p-1.5">
            <TabsTrigger 
              value="inbound"
              className="px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-800 data-[state=active]:to-gray-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-gray-50 data-[state=inactive]:to-gray-100 data-[state=inactive]:hover:from-gray-100 data-[state=inactive]:hover:to-gray-200"
            >
              Inbound
            </TabsTrigger>
            <TabsTrigger 
              value="outward"
              className="px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-800 data-[state=active]:to-gray-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-gray-50 data-[state=inactive]:to-gray-100 data-[state=inactive]:hover:from-gray-100 data-[state=inactive]:hover:to-gray-200"
            >
              Outward
            </TabsTrigger>
            <TabsTrigger 
              value="revenue"
              className="px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-800 data-[state=active]:to-gray-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-gray-50 data-[state=inactive]:to-gray-100 data-[state=inactive]:hover:from-gray-100 data-[state=inactive]:hover:to-gray-200"
            >
              Revenue
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="inbound" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="outward" className="space-y-6">
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
          <BoxesBarChart 
            dateRange={dateRange} 
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
