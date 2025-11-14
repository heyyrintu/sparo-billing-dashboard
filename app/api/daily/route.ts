import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { DailyParamsSchema } from '@/lib/parser/validation'
import { computeRevenueMarginal, computeRevenueFlat } from '@/lib/revenue/calculator'
import type { DailyData } from '@/lib/types'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Authentication removed - allow all requests

    const { searchParams } = new URL(request.url)
    const params = DailyParamsSchema.parse({
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      metric: searchParams.get('metric') || 'gross',
      mode: searchParams.get('mode') || 'marginal'
    })

    const fromDate = new Date(params.from)
    // Subtract 1 day from fromDate
    fromDate.setDate(fromDate.getDate() - 1)
    const toDate = new Date(params.to)
    // Set toDate to end of day to include all data on that date
    toDate.setHours(23, 59, 59, 999)
    
    // Get daily data
    const dailyData = await prisma.dailySummary.findMany({
      where: {
        day: {
          gte: fromDate,
          lte: toDate
        }
      },
      orderBy: { day: 'asc' }
    })

    // Transform data for chart
    const chartData: DailyData[] = dailyData.map(day => {
      const grossSale = Number(day.grossSale)
      const revenue = params.mode === 'marginal' 
        ? computeRevenueMarginal(grossSale)
        : computeRevenueFlat(grossSale)

      return {
        date: day.day.toISOString().split('T')[0],
        grossSale,
        revenue,
        invoiceCount: day.outboundInvoices,
        invoiceQty: Number(day.outboundQty),
        boxes: Number(day.outboundBoxes)
      }
    })

    return NextResponse.json(chartData)

  } catch (error) {
    console.error('Daily API error:', error)
    
    if (error instanceof Error && error.message.includes('Invalid date format')) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch daily data'
    }, { status: 500 })
  }
}
