'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/ui/card'
import { Badge } from '@/lib/ui/badge'
import { formatIndianCurrency, formatIndianNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { KPIData } from '@/lib/types'

interface KPICardsProps {
  dateRange: { from: Date; to: Date }
  mode: 'marginal' | 'flat'
  type: 'inbound' | 'outward' | 'revenue'
}

export function KPICards({ dateRange, mode, type }: KPICardsProps) {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          from: dateRange.from.toISOString().split('T')[0],
          to: dateRange.to.toISOString().split('T')[0],
          mode
        })

        const response = await fetch(`/api/kpi?${params}`)
        if (response.ok) {
          const data = await response.json()
          setKpiData(data)
        }
      } catch (error) {
        console.error('Failed to fetch KPI data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchKPIData()
  }, [dateRange, mode])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!kpiData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No data available for the selected period</p>
      </div>
    )
  }

  const getDeltaIcon = (delta: { absolute: number; percentage: number }) => {
    if (delta.absolute > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (delta.absolute < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getDeltaBadge = (delta: { absolute: number; percentage: number }) => {
    if (delta.absolute === 0) return <Badge variant="secondary">No change</Badge>
    
    const isPositive = delta.absolute > 0
    const variant = isPositive ? 'success' : 'destructive'
    
    return (
      <Badge variant={variant}>
        {isPositive ? '+' : ''}{delta.percentage.toFixed(1)}%
      </Badge>
    )
  }

  const kpiCards = []

  if (type === 'inbound') {
    kpiCards.push(
      <Card key="invoice-qty">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invoice Qty</CardTitle>
          {getDeltaIcon(kpiData.delta.invoiceQty)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatIndianNumber(kpiData.invoiceQty)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.invoiceQty)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.invoiceQty.absolute > 0 ? '+' : ''}{formatIndianNumber(kpiData.delta.invoiceQty.absolute)}
            </span>
          </div>
        </CardContent>
      </Card>,
      <Card key="boxes">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Boxes</CardTitle>
          {getDeltaIcon(kpiData.delta.boxes)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatIndianNumber(kpiData.boxes)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.boxes)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.boxes.absolute > 0 ? '+' : ''}{formatIndianNumber(kpiData.delta.boxes.absolute)}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  } else if (type === 'outward') {
    kpiCards.push(
      <Card key="gross-sale">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gross Sale</CardTitle>
          {getDeltaIcon(kpiData.delta.grossSale)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatIndianCurrency(kpiData.grossSale)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.grossSale)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.grossSale.absolute > 0 ? '+' : ''}{formatIndianCurrency(kpiData.delta.grossSale.absolute)}
            </span>
          </div>
        </CardContent>
      </Card>,
      <Card key="invoice-count">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invoice Count</CardTitle>
          {getDeltaIcon(kpiData.delta.invoiceCount)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatIndianNumber(kpiData.invoiceCount)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.invoiceCount)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.invoiceCount.absolute > 0 ? '+' : ''}{formatIndianNumber(kpiData.delta.invoiceCount.absolute)}
            </span>
          </div>
        </CardContent>
      </Card>,
      <Card key="invoice-qty">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invoice Qty</CardTitle>
          {getDeltaIcon(kpiData.delta.invoiceQty)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatIndianNumber(kpiData.invoiceQty)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.invoiceQty)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.invoiceQty.absolute > 0 ? '+' : ''}{formatIndianNumber(kpiData.delta.invoiceQty.absolute)}
            </span>
          </div>
        </CardContent>
      </Card>,
      <Card key="boxes">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Boxes</CardTitle>
          {getDeltaIcon(kpiData.delta.boxes)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatIndianNumber(kpiData.boxes)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.boxes)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.boxes.absolute > 0 ? '+' : ''}{formatIndianNumber(kpiData.delta.boxes.absolute)}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  } else if (type === 'revenue') {
    kpiCards.push(
      <Card key="gross-sale">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gross Sale</CardTitle>
          {getDeltaIcon(kpiData.delta.grossSale)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatIndianCurrency(kpiData.grossSale)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.grossSale)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.grossSale.absolute > 0 ? '+' : ''}{formatIndianCurrency(kpiData.delta.grossSale.absolute)}
            </span>
          </div>
        </CardContent>
      </Card>,
      <Card key="revenue">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue ({mode})</CardTitle>
          {getDeltaIcon(kpiData.delta.revenue)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatIndianCurrency(kpiData.revenue)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.revenue)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.revenue.absolute > 0 ? '+' : ''}{formatIndianCurrency(kpiData.delta.revenue.absolute)}
            </span>
          </div>
        </CardContent>
      </Card>,
      <Card key="avg-ticket">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatIndianCurrency(kpiData.avgTicket)}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Gross Sale ÷ Invoices
          </p>
        </CardContent>
      </Card>,
      <Card key="gross-per-unit">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gross per Unit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatIndianCurrency(kpiData.grossPerUnit)}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Gross Sale ÷ Qty
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards}
    </div>
  )
}
