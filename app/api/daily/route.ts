import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DailyParamsSchema } from '@/lib/parser/validation'
import { computeRevenueMarginal, computeRevenueFlat } from '@/lib/revenue/calculator'
import type { DailyData } from '@/lib/types'

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
    // Set fromDate to start of day to include all data on that date
    fromDate.setHours(0, 0, 0, 0)
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

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch daily data'
    }, { status: 500 })
  }
}
