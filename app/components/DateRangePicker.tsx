'use client'

import { useState } from 'react'
import { Button } from '@/lib/ui/button'
import { Badge } from '@/lib/ui/badge'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

interface DateRangePickerProps {
  from: Date
  to: Date
  onDateRangeChange: (from: Date, to: Date) => void
  onQuickFilter: (filter: string) => void
}

export function DateRangePicker({ from, to, onDateRangeChange, onQuickFilter }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const quickFilters = [
    { key: 'today', label: 'Today' },
    { key: 'wtd', label: 'WTD' },
    { key: 'mtd', label: 'MTD' },
    { key: 'last30', label: 'Last 30 Days' }
  ]

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    const date = new Date(value)
    if (field === 'from') {
      onDateRangeChange(date, to)
    } else {
      onDateRangeChange(from, date)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Date Range</h2>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {format(from, 'MMM dd, yyyy')} - {format(to, 'MMM dd, yyyy')}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {quickFilters.map((filter) => (
          <Button
            key={filter.key}
            variant="outline"
            size="sm"
            onClick={() => onQuickFilter(filter.key)}
            className="h-8"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">From Date</label>
          <input
            type="date"
            value={format(from, 'yyyy-MM-dd')}
            onChange={(e) => handleDateChange('from', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">To Date</label>
          <input
            type="date"
            value={format(to, 'yyyy-MM-dd')}
            onChange={(e) => handleDateChange('to', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          />
        </div>
      </div>
    </div>
  )
}
