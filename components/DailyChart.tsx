'use client'

import { useState, useEffect, useMemo } from 'react'
import { BaseCard } from '@/components/BaseCard'
import { LineChart } from '@mui/x-charts/LineChart'
import { formatIndianCurrency, formatIndianNumber, formatDateLocal } from '@/lib/utils'
import type { DailyData } from '@/lib/types'

interface DailyChartProps {
  dateRange: { from: Date; to: Date }
  metric: 'gross' | 'revenue'
  mode: 'marginal' | 'flat'
}

export function DailyChart({ dateRange, metric, mode }: DailyChartProps) {
  const [chartData, setChartData] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)

  // Memoize date strings to prevent unnecessary re-fetches
  const dateKey = useMemo(() => ({
    from: formatDateLocal(dateRange.from),
    to: formatDateLocal(dateRange.to)
  }), [dateRange.from, dateRange.to])

  useEffect(() => {
    let cancelled = false
    
    const fetchChartData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          from: dateKey.from,
          to: dateKey.to,
          metric,
          mode
        })

        const response = await fetch(`/api/daily?${params}`)
        if (cancelled) return
        
        if (response.ok) {
          const data = await response.json()
          if (!cancelled) {
            setChartData(Array.isArray(data) ? data : [])
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch chart data:', error)
          setChartData([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchChartData()
    
    return () => {
      cancelled = true
    }
  }, [dateKey.from, dateKey.to, metric, mode])

  if (loading) {
    return (
      <BaseCard borderColor="rgba(224, 30, 31, 0.5)">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Daily {metric === 'gross' ? 'Gross Sale' : 'Revenue'} Trend</h3>
          <p className="text-sm text-muted-foreground">
            {metric === 'gross' ? 'Gross Sale' : 'Revenue'} over time ({mode} mode)
          </p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </BaseCard>
    )
  }

  if (chartData.length === 0) {
    return (
      <BaseCard borderColor="rgba(224, 30, 31, 0.5)">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Daily {metric === 'gross' ? 'Gross Sale' : 'Revenue'} Trend</h3>
          <p className="text-sm text-muted-foreground">
            {metric === 'gross' ? 'Gross Sale' : 'Revenue'} over time ({mode} mode)
          </p>
        </div>
        <div className="h-80 flex items-center justify-center text-muted-foreground">
          No data available for the selected period
        </div>
      </BaseCard>
    )
  }

  return (
    <BaseCard borderColor="rgba(224, 30, 31, 0.5)" padding="lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Daily {metric === 'gross' ? 'Gross Sale' : 'Revenue'} Trend</h3>
        <p className="text-sm text-muted-foreground">
          {metric === 'gross' ? 'Gross Sale' : 'Revenue'} over time ({mode} mode)
        </p>
      </div>
      <div>
        <div className="h-80 bg-white rounded-lg">
          <LineChart
            xAxis={[
              {
                id: 'x-axis',
                data: chartData.map((item) => item.date),
                scaleType: 'point',
                valueFormatter: (value: string) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                },
              },
            ]}
            series={[
              {
                id: metric === 'gross' ? 'grossSale' : 'revenue',
                data: chartData.map((item) => (metric === 'gross' ? item.grossSale : item.revenue)),
                label: metric === 'gross' ? 'Gross Sale' : 'Revenue',
                valueFormatter: (value: number | null) => {
                  if (value === null) return ''
                  if (metric === 'gross' || metric === 'revenue') {
                    return formatIndianCurrency(value)
                  }
                  return formatIndianNumber(value)
                },
                curve: 'monotoneX',
              },
            ]}
            yAxis={[
              {
                id: 'y-axis',
                valueFormatter: (value: number | null) => {
                  if (value === null) return ''
                  if (metric === 'gross' || metric === 'revenue') {
                    return `₹${(value / 100000).toFixed(0)}L`
                  }
                  return formatIndianNumber(value)
                },
              },
            ]}
            height={320}
            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
            colors={['#E01E1F']}
          />
        </div>
      </div>
    </BaseCard>
  )
}
