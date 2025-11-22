import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { computeRevenueMarginal, computeRevenueFlat } from '@/lib/revenue/calculator'

interface MonthlyChartDataPoint {
  label: string
  grossSale: number
  revenue: number
  date: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'marginal'

    // Get all unique months that have data
    const allDates = await prisma.outboundFact.findMany({
      select: {
        invoiceDate: true
      }
    })
    
    // Extract unique months
    const monthSet = new Set<string>()
    allDates.forEach(row => {
      const month = startOfMonth(new Date(row.invoiceDate))
      monthSet.add(format(month, 'yyyy-MM'))
    })
    
    const allMonths = Array.from(monthSet)
      .map(monthStr => {
        const [year, month] = monthStr.split('-').map(Number)
        return new Date(year, month - 1, 1)
      })
      .sort((a, b) => a.getTime() - b.getTime())
    
    // Use Promise.all for parallel queries - aggregate ALL data for each month
    const monthDataPromises = allMonths.map(async (month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      // Get gross sales for the month
      const result = await prisma.outboundFact.aggregate({
        where: {
          invoiceDate: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          grossTotal: true
        }
      })

      const grossSale = Number(result._sum.grossTotal || 0)
      
      // Calculate revenue based on mode
      const revenue = mode === 'marginal' 
        ? computeRevenueMarginal(grossSale)
        : computeRevenueFlat(grossSale)

      return {
        label: format(month, 'MMM yyyy'),
        grossSale,
        revenue,
        date: format(month, 'yyyy-MM')
      }
    })

    const chartData = await Promise.all(monthDataPromises)

    return NextResponse.json(chartData)

  } catch (error) {
    console.error('Monthly revenue chart API error:', error)
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch monthly revenue chart data'
    }, { status: 500 })
  }
}

