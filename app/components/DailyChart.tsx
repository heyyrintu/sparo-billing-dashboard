'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatIndianCurrency, formatIndianNumber } from '@/lib/utils'
import type { DailyData } from '@/lib/types'

interface DailyChartProps {
  dateRange: { from: Date; to: Date }
  metric: 'gross' | 'revenue'
  mode: 'marginal' | 'flat'
}

export function DailyChart({ dateRange, metric, mode }: DailyChartProps) {
  const [chartData, setChartData] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          from: dateRange.from.toISOString().split('T')[0],
          to: dateRange.to.toISOString().split('T')[0],
          metric,
          mode
        })

        const response = await fetch(`/api/daily?${params}`)
        if (response.ok) {
          const data = await response.json()
          setChartData(data)
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [dateRange, metric, mode])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily {metric === 'gross' ? 'Gross Sale' : 'Revenue'} Trend</CardTitle>
          <CardDescription>
            {metric === 'gross' ? 'Gross Sale' : 'Revenue'} over time ({mode} mode)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily {metric === 'gross' ? 'Gross Sale' : 'Revenue'} Trend</CardTitle>
          <CardDescription>
            {metric === 'gross' ? 'Gross Sale' : 'Revenue'} over time ({mode} mode)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No data available for the selected period
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatValue = (value: number) => {
    if (metric === 'gross' || metric === 'revenue') {
      return formatIndianCurrency(value)
    }
    return formatIndianNumber(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">Gross Sale:</span>{' '}
              <span className="font-medium">{formatIndianCurrency(data.grossSale)}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Revenue:</span>{' '}
              <span className="font-medium">{formatIndianCurrency(data.revenue)}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Invoices:</span>{' '}
              <span className="font-medium">{formatIndianNumber(data.invoiceCount)}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Qty:</span>{' '}
              <span className="font-medium">{formatIndianNumber(data.invoiceQty)}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Boxes:</span>{' '}
              <span className="font-medium">{formatIndianNumber(data.boxes)}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily {metric === 'gross' ? 'Gross Sale' : 'Revenue'} Trend</CardTitle>
        <CardDescription>
          {metric === 'gross' ? 'Gross Sale' : 'Revenue'} over time ({mode} mode)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (metric === 'gross' || metric === 'revenue') {
                    return `₹${(value / 100000).toFixed(0)}L`
                  }
                  return formatIndianNumber(value)
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={metric === 'gross' ? 'grossSale' : 'revenue'}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
