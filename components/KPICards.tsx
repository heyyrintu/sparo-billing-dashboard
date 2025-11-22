'use client'

import { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/lib/ui/badge'
import { formatIndianCurrency, formatIndianNumber, formatDateLocal } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { BaseCard } from '@/components/BaseCard'
import type { KPIData, InboundKPIData } from '@/lib/types'

interface KPICardsProps {
  dateRange: { from: Date; to: Date }
  mode: 'marginal' | 'flat'
  type: 'inbound' | 'outward' | 'revenue'
}

export function KPICards({ dateRange, mode, type }: KPICardsProps) {
  const [kpiData, setKpiData] = useState<KPIData | InboundKPIData | null>(null)
  const [loading, setLoading] = useState(true)

  // Memoize date strings to prevent unnecessary re-fetches
  const dateKey = useMemo(() => ({
    from: formatDateLocal(dateRange.from),
    to: formatDateLocal(dateRange.to)
  }), [dateRange.from, dateRange.to])

  useEffect(() => {
    let cancelled = false
    
    const fetchKPIData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          from: dateKey.from,
          to: dateKey.to,
          mode
        })

        const endpoint = type === 'inbound' ? '/api/inbound-kpi' : '/api/kpi'
        const response = await fetch(`${endpoint}?${params}`)
        if (cancelled) return
        
        if (response.ok) {
          const data = await response.json()
          if (!cancelled) {
            setKpiData(data)
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch KPI data:', error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchKPIData()
    
    return () => {
      cancelled = true
    }
  }, [dateKey.from, dateKey.to, mode, type])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <BaseCard key={i} className="animate-pulse">
            <div className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
            <div>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          </BaseCard>
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

  const isInboundData = (data: KPIData | InboundKPIData | null): data is InboundKPIData => {
    return !!data && 'invoiceValue' in data && !('grossSale' in data)
  }

  const isStandardKPIData = (data: KPIData | InboundKPIData | null): data is KPIData => {
    return !!data && 'grossSale' in data
  }

  const kpiCards = []

  if (type === 'inbound') {
    if (!isInboundData(kpiData)) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No inbound data available for the selected period</p>
        </div>
      )
    }

    kpiCards.push(
      <BaseCard key="invoice-count" borderColor="rgba(59, 130, 246, 0.5)">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">Invoice Count</p>
          {getDeltaIcon(kpiData.delta.invoiceCount)}
        </div>
        <div>
          <div className="text-3xl font-bold">{formatIndianNumber(kpiData.invoiceCount)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.invoiceCount)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.invoiceCount.absolute > 0 ? '+' : ''}{formatIndianNumber(kpiData.delta.invoiceCount.absolute)}
            </span>
          </div>
        </div>
      </BaseCard>,
      <BaseCard key="invoice-value" borderColor="rgba(224, 30, 31, 0.5)">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">Invoice Value</p>
          {getDeltaIcon(kpiData.delta.invoiceValue)}
        </div>
        <div>
          <div className="text-3xl font-bold gradient-text-red">{formatIndianCurrency(kpiData.invoiceValue)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.invoiceValue)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.invoiceValue.absolute > 0 ? '+' : ''}{formatIndianCurrency(kpiData.delta.invoiceValue.absolute)}
            </span>
          </div>
        </div>
      </BaseCard>,
      <BaseCard key="invoice-qty" borderColor="rgba(254, 165, 25, 0.5)">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">Invoice Qty</p>
          {getDeltaIcon(kpiData.delta.invoiceQty)}
        </div>
        <div>
          <div className="text-3xl font-bold gradient-text-yellow">{formatIndianNumber(kpiData.invoiceQty)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.invoiceQty)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.invoiceQty.absolute > 0 ? '+' : ''}{formatIndianNumber(kpiData.delta.invoiceQty.absolute)}
            </span>
          </div>
        </div>
      </BaseCard>,
      <BaseCard key="boxes" borderColor="rgba(16, 185, 129, 0.5)">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">Bags/Box</p>
          {getDeltaIcon(kpiData.delta.boxes)}
        </div>
        <div>
          <div className="text-3xl font-bold">{formatIndianNumber(kpiData.boxes)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.boxes)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.boxes.absolute > 0 ? '+' : ''}{formatIndianNumber(kpiData.delta.boxes.absolute)}
            </span>
          </div>
        </div>
      </BaseCard>
    )
  } else if (type === 'outward') {
    if (!isStandardKPIData(kpiData)) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No outbound data available for the selected period</p>
        </div>
      )
    }
    kpiCards.push(
      <BaseCard key="invoice-count" borderColor="rgba(59, 130, 246, 0.5)">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">Invoice Count</p>
          {getDeltaIcon(kpiData.delta.invoiceCount)}
        </div>
        <div>
          <div className="text-3xl font-bold">{formatIndianNumber(kpiData.invoiceCount)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.invoiceCount)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.invoiceCount.absolute > 0 ? '+' : ''}{formatIndianNumber(kpiData.delta.invoiceCount.absolute)}
            </span>
          </div>
        </div>
      </BaseCard>,
      <BaseCard key="boxes" borderColor="rgba(16, 185, 129, 0.5)">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">Boxes</p>
          {getDeltaIcon(kpiData.delta.boxes)}
        </div>
        <div>
          <div className="text-3xl font-bold">{formatIndianNumber(kpiData.boxes)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.boxes)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.boxes.absolute > 0 ? '+' : ''}{formatIndianNumber(kpiData.delta.boxes.absolute)}
            </span>
          </div>
        </div>
      </BaseCard>,
      <BaseCard key="invoice-qty" borderColor="rgba(254, 165, 25, 0.5)">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">Invoice Qty</p>
          {getDeltaIcon(kpiData.delta.invoiceQty)}
        </div>
        <div>
          <div className="text-3xl font-bold gradient-text-yellow">{formatIndianNumber(kpiData.invoiceQty)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.invoiceQty)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.invoiceQty.absolute > 0 ? '+' : ''}{formatIndianNumber(kpiData.delta.invoiceQty.absolute)}
            </span>
          </div>
        </div>
      </BaseCard>,
      <BaseCard key="gross-sale" borderColor="rgba(224, 30, 31, 0.5)">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">Gross Sale</p>
          {getDeltaIcon(kpiData.delta.grossSale)}
        </div>
        <div>
          <div className="text-3xl font-bold gradient-text-red">{formatIndianCurrency(kpiData.grossSale)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.grossSale)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.grossSale.absolute > 0 ? '+' : ''}{formatIndianCurrency(kpiData.delta.grossSale.absolute)}
            </span>
          </div>
        </div>
      </BaseCard>
    )
  } else if (type === 'revenue') {
    if (!isStandardKPIData(kpiData)) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No revenue data available for the selected period</p>
        </div>
      )
    }
    kpiCards.push(
      <BaseCard key="gross-sale" borderColor="rgba(224, 30, 31, 0.5)">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">Gross Sale</p>
          {getDeltaIcon(kpiData.delta.grossSale)}
        </div>
        <div>
          <div className="text-3xl font-bold gradient-text-red">{formatIndianCurrency(kpiData.grossSale)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.grossSale)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.grossSale.absolute > 0 ? '+' : ''}{formatIndianCurrency(kpiData.delta.grossSale.absolute)}
            </span>
          </div>
        </div>
      </BaseCard>,
      <BaseCard key="revenue" borderColor="rgba(59, 130, 246, 0.5)">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">Revenue ({mode})</p>
          {getDeltaIcon(kpiData.delta.revenue)}
        </div>
        <div>
          <div className="text-3xl font-bold">{formatIndianCurrency(kpiData.revenue)}</div>
          <div className="flex items-center space-x-2 mt-2">
            {getDeltaBadge(kpiData.delta.revenue)}
            <span className="text-xs text-muted-foreground">
              {kpiData.delta.revenue.absolute > 0 ? '+' : ''}{formatIndianCurrency(kpiData.delta.revenue.absolute)}
            </span>
          </div>
        </div>
      </BaseCard>,
      <BaseCard key="avg-ticket" borderColor="rgba(254, 165, 25, 0.5)">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">Avg Ticket</p>
        </div>
        <div>
          <div className="text-3xl font-bold gradient-text-yellow">{formatIndianCurrency(kpiData.avgTicket)}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Gross Sale ÷ Invoices
          </p>
        </div>
      </BaseCard>,
      <BaseCard key="gross-per-unit" borderColor="rgba(16, 185, 129, 0.5)">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">Gross per Unit</p>
        </div>
        <div>
          <div className="text-3xl font-bold">{formatIndianCurrency(kpiData.grossPerUnit)}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Gross Sale ÷ Qty
          </p>
        </div>
      </BaseCard>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards}
    </div>
  )
}
