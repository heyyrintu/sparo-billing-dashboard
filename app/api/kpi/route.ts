import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { KPIParamsSchema } from '@/lib/parser/validation'
import { calculateDelta, getPreviousPeriodDates } from '@/lib/utils'
import { computeRevenueMarginal, computeRevenueFlat } from '@/lib/revenue/calculator'
import type { KPIData } from '@/lib/types'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = process.env.DISABLE_AUTH === 'true'
      ? ({ user: { id: 'dev-user' } } as any)
      : await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = KPIParamsSchema.parse({
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      mode: searchParams.get('mode') || 'marginal'
    })

    const fromDate = new Date(params.from)
    const toDate = new Date(params.to)
    
    // Get current period data
    const currentData = await prisma.dailySummary.findMany({
      where: {
        day: {
          gte: fromDate,
          lte: toDate
        }
      },
      orderBy: { day: 'asc' }
    })

    // Calculate current period totals
    const currentTotals = currentData.reduce((acc, day) => ({
      grossSale: acc.grossSale + Number(day.grossSale),
      invoiceCount: acc.invoiceCount + day.outboundInvoices,
      invoiceQty: acc.invoiceQty + Number(day.outboundQty),
      boxes: acc.boxes + Number(day.outboundBoxes)
    }), {
      grossSale: 0,
      invoiceCount: 0,
      invoiceQty: 0,
      boxes: 0
    })

    // Calculate revenue based on mode
    const revenue = params.mode === 'marginal' 
      ? computeRevenueMarginal(currentTotals.grossSale)
      : computeRevenueFlat(currentTotals.grossSale)

    // Calculate derived metrics
    const avgTicket = currentTotals.invoiceCount > 0 
      ? currentTotals.grossSale / currentTotals.invoiceCount 
      : 0
    
    const grossPerUnit = currentTotals.invoiceQty > 0 
      ? currentTotals.grossSale / currentTotals.invoiceQty 
      : 0

    // Get previous period data for delta calculation
    const { from: prevFrom, to: prevTo } = getPreviousPeriodDates(fromDate, toDate)
    
    const previousData = await prisma.dailySummary.findMany({
      where: {
        day: {
          gte: prevFrom,
          lte: prevTo
        }
      },
      orderBy: { day: 'asc' }
    })

    const previousTotals = previousData.reduce((acc, day) => ({
      grossSale: acc.grossSale + Number(day.grossSale),
      invoiceCount: acc.invoiceCount + day.outboundInvoices,
      invoiceQty: acc.invoiceQty + Number(day.outboundQty),
      boxes: acc.boxes + Number(day.outboundBoxes)
    }), {
      grossSale: 0,
      invoiceCount: 0,
      invoiceQty: 0,
      boxes: 0
    })

    const previousRevenue = params.mode === 'marginal' 
      ? computeRevenueMarginal(previousTotals.grossSale)
      : computeRevenueFlat(previousTotals.grossSale)

    // Calculate deltas
    const kpiData: KPIData = {
      grossSale: currentTotals.grossSale,
      revenue,
      invoiceCount: currentTotals.invoiceCount,
      invoiceQty: currentTotals.invoiceQty,
      boxes: currentTotals.boxes,
      avgTicket,
      grossPerUnit,
      delta: {
        grossSale: calculateDelta(currentTotals.grossSale, previousTotals.grossSale),
        revenue: calculateDelta(revenue, previousRevenue),
        invoiceCount: calculateDelta(currentTotals.invoiceCount, previousTotals.invoiceCount),
        invoiceQty: calculateDelta(currentTotals.invoiceQty, previousTotals.invoiceQty),
        boxes: calculateDelta(currentTotals.boxes, previousTotals.boxes)
      }
    }

    return NextResponse.json(kpiData)

  } catch (error) {
    console.error('KPI API error:', error)
    
    if (error instanceof Error && error.message.includes('Invalid date format')) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch KPI data'
    }, { status: 500 })
  }
}
