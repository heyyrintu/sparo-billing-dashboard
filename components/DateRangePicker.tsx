'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/lib/ui/button'
import { format, startOfMonth, endOfMonth, getYear, getMonth } from 'date-fns'

interface DateRangePickerProps {
  from: Date
  to: Date
  onDateRangeChange: (from: Date, to: Date) => void
  onQuickFilter: (filter: string) => void
}

export function DateRangePicker({ from, to, onDateRangeChange, onQuickFilter }: DateRangePickerProps) {
  const [tempFrom, setTempFrom] = useState(format(from, 'yyyy-MM-dd'))
  const [tempTo, setTempTo] = useState(format(to, 'yyyy-MM-dd'))
  const [tempMonth, setTempMonth] = useState(`${getYear(from)}-${String(getMonth(from) + 1).padStart(2, '0')}`)

  // Sync state with props when they change externally
  useEffect(() => {
    setTempFrom(format(from, 'yyyy-MM-dd'))
    setTempTo(format(to, 'yyyy-MM-dd'))
    
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
    const fromDate = new Date(tempFrom)
    const toDate = new Date(tempTo)
    onDateRangeChange(fromDate, toDate)
  }

  const handleMonthChange = (monthValue: string) => {
    setTempMonth(monthValue)
    
    // Handle "All Months" option
    if (monthValue === 'all') {
      // Set date range from a very early date to today (shows all data)
      const allStartDate = new Date(2020, 0, 1) // January 1, 2020
      const today = new Date()
      setTempFrom(format(allStartDate, 'yyyy-MM-dd'))
      setTempTo(format(today, 'yyyy-MM-dd'))
      return
    }
    
    // Handle specific month selection
    const [year, month] = monthValue.split('-').map(Number)
    const monthStart = startOfMonth(new Date(year, month - 1))
    const monthEnd = endOfMonth(new Date(year, month - 1))
    const fromStr = format(monthStart, 'yyyy-MM-dd')
    const toStr = format(monthEnd, 'yyyy-MM-dd')
    console.log('Month selected:', monthValue, 'From:', fromStr, 'To:', toStr)
    setTempFrom(fromStr)
    setTempTo(toStr)
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
    <div
      className="rounded-lg p-[2px]"
      style={{
        background: 'linear-gradient(to right, rgba(224, 30, 31, 0.5), rgba(254, 165, 25, 0.5))',
      }}
    >
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
        {/* From Date */}
        <div className="flex-1 min-w-[150px]">
          <input
            type="date"
            value={tempFrom}
            onChange={(e) => setTempFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Separator */}
        <div className="text-gray-400 text-xl font-bold self-center">--</div>

        {/* To Date */}
        <div className="flex-1 min-w-[150px]">
          <input
            type="date"
            value={tempTo}
            onChange={(e) => setTempTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Separator */}
        <div className="text-gray-400 text-xl font-bold self-center">--</div>

        {/* Month Select */}
        <div className="flex-1 min-w-[150px]">
          <select
            value={tempMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
            className="px-6 py-2 bg-gradient-to-r from-[#E01E1F] to-[#FEA519] text-white hover:opacity-90 transition-opacity font-medium"
          >
            Get
          </Button>
        </div>
      </div>
      </div>
    </div>
  )
}
