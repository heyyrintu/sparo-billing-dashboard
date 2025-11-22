'use client'

import { useState, useEffect, useMemo } from 'react'
import { BaseCard } from '@/components/BaseCard'
import { ChartContainer } from '@mui/x-charts/ChartContainer'
import { BarPlot } from '@mui/x-charts/BarChart'
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis'
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis'
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip'
import { BarLabel } from '@mui/x-charts/BarChart'
import { formatIndianNumber, formatDateLocal } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

interface BoxesBarChartProps {
  dateRange: { from: Date; to: Date }
  type: 'inbound' | 'outward' | 'revenue'
}

type ViewMode = 'day' | 'week' | 'month'

interface ChartDataPoint {
  label: string
  boxes: number
  date: string
}

export function BoxesBarChart({ dateRange, type }: BoxesBarChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
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
          view: viewMode,
          type
        })

        const response = await fetch(`/api/boxes-chart?${params}`)
        if (cancelled) return
        
        if (response.ok) {
          const data = await response.json()
          if (!cancelled) {
            setChartData(Array.isArray(data) ? data : [])
          }
        } else {
          if (!cancelled) {
            console.error('Failed to fetch boxes chart data:', response.statusText)
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
  }, [dateKey.from, dateKey.to, viewMode, type])

  // Get color for each bar based on value (gradient effect)
  const getBarColor = (value: number, maxValue: number) => {
    if (maxValue === 0) return '#E01E1F'
    const ratio = value / maxValue
    if (ratio > 0.75) return '#E01E1F'
    if (ratio > 0.5) return '#F44336'
    if (ratio > 0.25) return '#FF6B35'
    return '#FEA519'
  }

  const maxBoxes = chartData.length > 0 ? Math.max(...chartData.map(item => item.boxes)) : 0
  const barColors = chartData.map((item) => getBarColor(item.boxes, maxBoxes))

  if (loading) {
    return (
      <BaseCard borderColor="rgba(224, 30, 31, 0.5)" padding="lg">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Boxes Count</h3>
              <p className="text-sm text-gray-500 mt-1">Analyzing data...</p>
            </div>
          </div>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#E01E1F] border-t-transparent"></div>
        </div>
      </BaseCard>
    )
  }

  return (
    <BaseCard borderColor="rgba(224, 30, 31, 0.5)" padding="lg" className="overflow-hidden">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#E01E1F]" />
              {type === 'inbound' ? 'Inbound' : type === 'outward' ? 'Outbound' : 'Outbound'} Box Count Analysis
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {viewMode === 'month' ? 'Monthly' : viewMode === 'week' ? 'Weekly' : 'Daily'} distribution overview
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                viewMode === 'day'
                  ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                viewMode === 'week'
                  ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                viewMode === 'month'
                  ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="-mx-8 -mb-8 bg-gradient-to-br from-gray-50 to-white rounded-lg overflow-hidden shadow-inner" style={{ height: '400px' }}>
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-3 shadow-sm">
              <TrendingUp className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium">No data available</p>
            <p className="text-xs text-gray-400 mt-1">for the selected period</p>
          </div>
        ) : (
          <ChartContainer
            xAxis={[
              {
                id: 'x-axis',
                data: chartData.map((item) => item.label),
                scaleType: 'band',
                label: viewMode === 'month' ? 'Month' : viewMode === 'week' ? 'Week' : 'Day',
              },
            ]}
            series={[
              {
                id: 'boxes',
                data: chartData.map((item) => item.boxes),
                label: 'Box Count',
                type: 'bar',
                valueFormatter: (value: number | null) => value !== null ? formatIndianNumber(value) : '',
              },
            ]}
            yAxis={[
              {
                id: 'y-axis',
                label: 'Box Count',
                valueFormatter: (value: number | null) => value !== null ? formatIndianNumber(value) : '',
              },
            ]}
            height={400}
            margin={{ top: 50, right: 20, left: 60, bottom: 40 }}
            colors={barColors}
          >
            <BarPlot 
              borderRadius={10}
              barLabel={(item: any) => formatIndianNumber(item.value ?? 0)}
            />
            <ChartsXAxis />
            <ChartsYAxis />
            <ChartsTooltip />
          </ChartContainer>
        )}
      </div>
    </BaseCard>
  )
}
