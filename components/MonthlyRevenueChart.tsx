'use client'

import { useState, useEffect, useMemo } from 'react'
import { BaseCard } from '@/components/BaseCard'
import { formatIndianCurrency, formatCrores, formatDateLocal } from '@/lib/utils'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface MonthlyRevenueChartProps {
  mode: 'marginal' | 'flat'
  metric: 'gross' | 'revenue'
}

interface ChartDataPoint {
  label: string
  grossSale: number
  revenue: number
  date: string
}

export function MonthlyRevenueChart({ mode, metric }: MonthlyRevenueChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    
    const fetchChartData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          mode
        })

        const response = await fetch(`/api/monthly-revenue-chart?${params}`)
        if (cancelled) return
        
        if (response.ok) {
          const data = await response.json()
          if (!cancelled) {
            setChartData(Array.isArray(data) ? data : [])
          }
        } else {
          if (!cancelled) {
            console.error('Failed to fetch monthly revenue chart data:', response.statusText)
            setChartData([])
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
  }, [mode])

  const chartTitle = useMemo(() => {
    if (metric === 'gross') {
      return 'Month-on-Month Gross Sales'
    }
    return `Month-on-Month Revenue (${mode === 'marginal' ? 'Marginal' : 'Flat'})`
  }, [metric, mode])

  // Prepare chart data for recharts
  const chartDataFormatted = useMemo(() => {
    return chartData.map((item) => {
      const value = metric === 'gross' ? item.grossSale : item.revenue
      return {
        month: item.label,
        value,
        formattedValue: metric === 'gross' ? formatCrores(value) : formatIndianCurrency(value),
      }
    })
  }, [chartData, metric])

  // Get color for each bar based on value (gradient effect)
  const getBarColor = (value: number, maxValue: number) => {
    if (maxValue === 0) return '#E01E1F'
    const ratio = value / maxValue
    if (ratio > 0.75) return '#E01E1F'
    if (ratio > 0.5) return '#F44336'
    if (ratio > 0.25) return '#FF6B35'
    return '#FEA519'
  }

  const maxValue = useMemo(() => {
    const values = chartDataFormatted.map(item => item.value)
    return values.length > 0 ? Math.max(...values) : 0
  }, [chartDataFormatted])

  const chartConfig: ChartConfig = {
    value: {
      label: metric === 'gross' ? 'Gross Sales' : 'Revenue',
      color: '#E01E1F',
    },
  } satisfies ChartConfig


  if (loading) {
    return (
      <BaseCard borderColor="rgba(224, 30, 31, 0.5)" padding="lg" className="overflow-hidden">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">{chartTitle}</h3>
          <p className="text-sm text-muted-foreground">Loading data...</p>
        </div>
        <div className="-mx-8 -mb-8 bg-gradient-to-br from-gray-50 to-white rounded-lg overflow-hidden shadow-inner h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E01E1F]"></div>
        </div>
      </BaseCard>
    )
  }

  return (
    <BaseCard borderColor="rgba(224, 30, 31, 0.5)" padding="lg" className="overflow-hidden">
      <div className="-mx-8 -mb-8 bg-gradient-to-br from-gray-50 to-white rounded-lg overflow-hidden shadow-inner" style={{ height: '400px', width: '100%' }}>
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E01E1F]"></div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No data available.
          </div>
        ) : (
          <div className="w-full h-full p-2">
            {/* Title inside chart */}
            <div className="text-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{chartTitle}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {metric === 'gross' ? 'Gross sales trend by month' : 'Revenue trend by month'}
              </p>
            </div>
            
            <ChartContainer config={chartConfig} className="h-[calc(100%-80px)] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartDataFormatted}
                  margin={{ top: 10, right: 5, left: 40, bottom: 20 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 9, fill: '#6B7280' }}
                    width={40}
                    tickFormatter={(value) => 
                      metric === 'gross' ? formatCrores(value) : formatIndianCurrency(value)
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="value"
                    fill="#E01E1F"
                    radius={[8, 8, 0, 0]}
                  >
                    {chartDataFormatted.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getBarColor(entry.value, maxValue)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </div>
    </BaseCard>
  )
}

