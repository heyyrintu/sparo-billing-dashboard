'use client'

import { useState, useEffect } from 'react'
import { BaseCard } from '@/components/BaseCard'
import { ChartContainer } from '@mui/x-charts/ChartContainer'
import { BarPlot } from '@mui/x-charts/BarChart'
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis'
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis'
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip'
import { BarLabel } from '@mui/x-charts/BarChart'
import { formatCrores } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

interface GrossSalesBarChartProps {
  dateRange: { from: Date; to: Date }
  type: 'inbound' | 'outward' | 'revenue'
}

type ViewMode = 'day' | 'week' | 'month'

interface ChartDataPoint {
  label: string
  grossSale: number
  date: string
}

export function GrossSalesBarChart({ dateRange, type }: GrossSalesBarChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          from: dateRange.from.toISOString().split('T')[0],
          to: dateRange.to.toISOString().split('T')[0],
          view: viewMode,
          type
        })

        const response = await fetch(`/api/gross-sales-chart?${params}`)
        if (response.ok) {
          const data = await response.json()
          setChartData(Array.isArray(data) ? data : [])
        } else {
          console.error('Failed to fetch gross sales chart data:', response.statusText)
          setChartData([])
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
        setChartData([])
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [dateRange, viewMode, type])

  if (loading) {
    return (
      <BaseCard borderColor="rgba(224, 30, 31, 0.5)" padding="lg" className="overflow-hidden">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E01E1F]"></div>
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
              {type === 'inbound' ? 'Inbound' : type === 'outward' ? 'Outbound' : 'Outbound'} Gross Sales Analysis
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
                id: 'grossSale',
                data: chartData.map((item) => item.grossSale),
                label: 'Gross Sales',
                type: 'bar',
                valueFormatter: (value: number) => formatCrores(value),
              },
            ]}
            yAxis={[
              {
                id: 'y-axis',
                label: 'Gross Sales (CR)',
                valueFormatter: (value: number) => formatCrores(value),
              },
            ]}
            height={400}
            margin={{ top: 50, right: 20, left: 75, bottom: 40 }}
            colors={['#E01E1F']}
          >
            <BarPlot borderRadius={10} />
            <ChartsXAxis />
            <ChartsYAxis />
            <ChartsTooltip />
            <BarLabel
              position="top"
              style={{
                fill: '#1f2937',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'system-ui',
                textShadow: '0 1px 2px rgba(255,255,255,0.8)',
              }}
              valueFormatter={(value: number) => formatCrores(value)}
            />
          </ChartContainer>
        )}
      </div>
    </BaseCard>
  )
}
