'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/lib/ui/button'
import { Calendar } from '@/lib/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/lib/ui/popover'
import { format, startOfMonth, endOfMonth, getYear, getMonth } from 'date-fns'
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'

interface DateRangePickerProps {
  from: Date
  to: Date
  onDateRangeChange: (from: Date, to: Date) => void
  onQuickFilter: (filter: string) => void
}

export function DateRangePicker({ from, to, onDateRangeChange, onQuickFilter }: DateRangePickerProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from,
    to
  })
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)
  const [tempMonth, setTempMonth] = useState(`${getYear(from)}-${String(getMonth(from) + 1).padStart(2, '0')}`)

  // Sync state with props when they change externally
  useEffect(() => {
    setDateRange({ from, to })
    
    // Check if the date range indicates "All Months"
    // If range starts from 2020-01-01 and ends today, or spans more than 12 months, treat as "All Months"
    const fromYear = getYear(from)
    const fromMonth = getMonth(from)
    const fromDay = from.getDate()
    const toYear = getYear(to)
    const today = new Date()
    const daysDiff = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
    
    // Consider it "All Months" if:
    // 1. Starts from 2020-01-01 and ends today (or very close to today)
    // 2. Spans more than 365 days (approximately 12 months)
    const isAllMonths = (fromYear === 2020 && fromMonth === 0 && fromDay === 1 && 
                         toYear === getYear(today) && to.getMonth() === getMonth(today)) ||
                        daysDiff > 365
    
    if (isAllMonths) {
      setTempMonth('all')
    } else {
      setTempMonth(`${getYear(from)}-${String(getMonth(from) + 1).padStart(2, '0')}`)
    }
  }, [from, to])

  const handleGet = () => {
    if (dateRange?.from && dateRange?.to) {
      onDateRangeChange(dateRange.from, dateRange.to)
    }
  }

  const handleMonthChange = (monthValue: string) => {
    setTempMonth(monthValue)
    
    // Handle "All Months" option
    if (monthValue === 'all') {
      // Set date range from a very early date to today (shows all data)
      const allStartDate = new Date(2020, 0, 1) // January 1, 2020
      const today = new Date()
      setDateRange({ from: allStartDate, to: today })
      return
    }
    
    // Handle specific month selection
    const [year, month] = monthValue.split('-').map(Number)
    const monthStart = startOfMonth(new Date(year, month - 1))
    const monthEnd = endOfMonth(new Date(year, month - 1))
    setDateRange({ from: monthStart, to: monthEnd })
  }

  // Generate month options (All Months + last 12 months + current month)
  const getMonthOptions = () => {
    const options = [{ value: 'all', label: 'All Months' }]
    const today = new Date()
    for (let i = 0; i <= 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = format(date, 'MMMM yyyy')
      options.push({ value, label })
    }
    return options
  }

  return (
    <div className="bg-white rounded-xl shadow-xl border p-3 w-fit" style={{ borderColor: 'rgba(224, 30, 31, 0.5)' }}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* From Date */}
        <div className="min-w-[140px]">
          <Popover open={fromOpen} onOpenChange={setFromOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-8 text-sm",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {dateRange?.from ? format(dateRange.from, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange?.from}
                onSelect={(date) => {
                  if (date) {
                    setDateRange({ from: date, to: dateRange?.to })
                    setFromOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Separator */}
        <div className="flex items-center justify-center">
          <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
        </div>

        {/* To Date */}
        <div className="min-w-[140px]">
          <Popover open={toOpen} onOpenChange={setToOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-8 text-sm",
                  !dateRange?.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {dateRange?.to ? format(dateRange.to, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange?.to}
                onSelect={(date) => {
                  if (date) {
                    setDateRange({ from: dateRange?.from, to: date })
                    setToOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Month Select */}
        <div className="min-w-[140px]">
          <select
            value={tempMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E01E1F]/20 focus:border-[#E01E1F] transition-all cursor-pointer h-8"
          >
            {getMonthOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Get Button */}
        <div className="self-end">
          <Button
            onClick={handleGet}
            className="px-5 py-1.5 h-8 bg-gradient-to-r from-[#E01E1F] to-[#FEA519] text-white hover:opacity-90 transition-all font-semibold text-sm rounded-lg shadow-md hover:shadow-lg"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}
