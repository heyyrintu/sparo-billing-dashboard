import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { KPIParamsSchema } from '@/lib/parser/validation'
import { calculateDelta, getPreviousPeriodDates } from '@/lib/utils'
import type { InboundKPIData } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = KPIParamsSchema.parse({
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      mode: searchParams.get('mode') || 'marginal'
    })

    const fromDate = new Date(params.from)
    // Set fromDate to start of day to include all data on that date
    fromDate.setHours(0, 0, 0, 0)
    const toDate = new Date(params.to)
    // Set toDate to end of day to include all data on that date
    toDate.setHours(23, 59, 59, 999)

    // Use database aggregation for better performance
    const currentTotalsResult = await prisma.inboundFact.aggregate({
      where: {
        receivedDate: {
          gte: fromDate,
          lte: toDate
        }
      },
      _count: { id: true },
      _sum: {
        invoiceValue: true,
        invoiceQty: true,
        boxes: true
      }
    })

    const currentTotals = {
      invoiceCount: currentTotalsResult._count.id,
      invoiceValue: Number(currentTotalsResult._sum.invoiceValue || 0),
      invoiceQty: Number(currentTotalsResult._sum.invoiceQty || 0),
      boxes: Number(currentTotalsResult._sum.boxes || 0)
    }

    const { from: prevFrom, to: prevTo } = getPreviousPeriodDates(fromDate, toDate)

    const previousTotalsResult = await prisma.inboundFact.aggregate({
      where: {
        receivedDate: {
          gte: prevFrom,
          lte: prevTo
        }
      },
      _count: { id: true },
      _sum: {
        invoiceValue: true,
        invoiceQty: true,
        boxes: true
      }
    })

    const previousTotals = {
      invoiceCount: previousTotalsResult._count.id,
      invoiceValue: Number(previousTotalsResult._sum.invoiceValue || 0),
      invoiceQty: Number(previousTotalsResult._sum.invoiceQty || 0),
      boxes: Number(previousTotalsResult._sum.boxes || 0)
    }

    const response: InboundKPIData = {
      invoiceCount: currentTotals.invoiceCount,
      invoiceValue: currentTotals.invoiceValue,
      invoiceQty: currentTotals.invoiceQty,
      boxes: currentTotals.boxes,
      delta: {
        invoiceCount: calculateDelta(currentTotals.invoiceCount, previousTotals.invoiceCount),
        invoiceValue: calculateDelta(currentTotals.invoiceValue, previousTotals.invoiceValue),
        invoiceQty: calculateDelta(currentTotals.invoiceQty, previousTotals.invoiceQty),
        boxes: calculateDelta(currentTotals.boxes, previousTotals.boxes)
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Inbound KPI API error:', error)

    if (error instanceof Error && error.message.includes('Invalid date format')) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
    }

    // Check for database connection errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      if (errorMessage.includes('can\'t reach database') || 
          errorMessage.includes('connection') ||
          errorMessage.includes('p1001') ||
          errorMessage.includes('p1000')) {
        return NextResponse.json({ 
          error: 'Database connection failed. Please check your DATABASE_URL and ensure PostgreSQL is running.',
          details: error.message
        }, { status: 503 })
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch inbound KPI data'
      },
      { status: 500 }
    )
  }
}

