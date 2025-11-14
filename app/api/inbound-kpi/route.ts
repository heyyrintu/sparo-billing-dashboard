import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { KPIParamsSchema } from '@/lib/parser/validation'
import { calculateDelta, getPreviousPeriodDates } from '@/lib/utils'
import type { InboundKPIData } from '@/lib/types'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = KPIParamsSchema.parse({
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      mode: searchParams.get('mode') || 'marginal'
    })

    const fromDate = new Date(params.from)
    // Subtract 1 day from fromDate
    fromDate.setDate(fromDate.getDate() - 1)
    const toDate = new Date(params.to)
    // Set toDate to end of day to include all data on that date
    toDate.setHours(23, 59, 59, 999)

    const inboundData = await prisma.inboundFact.findMany({
      where: {
        receivedDate: {
          gte: fromDate,
          lte: toDate
        }
      }
    })

    const currentTotals = inboundData.reduce(
      (acc, row) => ({
        invoiceCount: acc.invoiceCount + 1, // Count all rows
        invoiceValue: acc.invoiceValue + Number(row.invoiceValue),
        invoiceQty: acc.invoiceQty + Number(row.invoiceQty),
        boxes: acc.boxes + Number(row.boxes)
      }),
      {
        invoiceCount: 0,
        invoiceValue: 0,
        invoiceQty: 0,
        boxes: 0
      }
    )

    const { from: prevFrom, to: prevTo } = getPreviousPeriodDates(fromDate, toDate)

    const previousInboundData = await prisma.inboundFact.findMany({
      where: {
        receivedDate: {
          gte: prevFrom,
          lte: prevTo
        }
      }
    })

    const previousTotals = previousInboundData.reduce(
      (acc, row) => ({
        invoiceCount: acc.invoiceCount + 1, // Count all rows
        invoiceValue: acc.invoiceValue + Number(row.invoiceValue),
        invoiceQty: acc.invoiceQty + Number(row.invoiceQty),
        boxes: acc.boxes + Number(row.boxes)
      }),
      {
        invoiceCount: 0,
        invoiceValue: 0,
        invoiceQty: 0,
        boxes: 0
      }
    )

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

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch inbound KPI data'
      },
      { status: 500 }
    )
  }
}

