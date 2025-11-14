import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, eachWeekOfInterval, eachDayOfInterval } from 'date-fns'

const prisma = new PrismaClient()

interface ChartDataPoint {
  label: string
  grossSale: number
  date: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const view = searchParams.get('view') || 'month'
    const type = searchParams.get('type') || 'outward'

    if (!from || !to) {
      return NextResponse.json({ error: 'from and to dates are required' }, { status: 400 })
    }

    const fromDate = new Date(from)
    // Subtract 1 day from fromDate
    fromDate.setDate(fromDate.getDate() - 1)
    const toDate = new Date(to)
    // Set toDate to end of day to include all data on that date
    toDate.setHours(23, 59, 59, 999)

    let chartData: ChartDataPoint[] = []

    if (view === 'month') {
      // Get all months that have data
      const outboundData = await prisma.outboundFact.findMany({
        select: {
          invoiceDate: true
        }
      })
      
      // Extract unique months
      const monthSet = new Set<string>()
      outboundData.forEach(row => {
        const month = startOfMonth(new Date(row.invoiceDate))
        monthSet.add(format(month, 'yyyy-MM'))
      })
      
      const allMonths = Array.from(monthSet).map(monthStr => {
        const [year, month] = monthStr.split('-').map(Number)
        return new Date(year, month - 1, 1)
      }).sort((a, b) => a.getTime() - b.getTime())
      
      // Calculate gross sales for each month
      for (const month of allMonths) {
        const monthStart = startOfMonth(month)
        const monthEnd = endOfMonth(month)

        const data = await prisma.outboundFact.findMany({
          where: {
            invoiceDate: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        })
        const grossSale = data.reduce((sum, row) => sum + Number(row.grossTotal), 0)

        chartData.push({
          label: format(month, 'MMM yyyy'),
          grossSale,
          date: format(month, 'yyyy-MM')
        })
      }
    } else if (view === 'week') {
      // Get all weeks in the range
      const weeks = eachWeekOfInterval({ start: fromDate, end: toDate }, { weekStartsOn: 1 })
      
      for (const week of weeks) {
        const weekStart = startOfWeek(week, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(week, { weekStartsOn: 1 })
        
        // Adjust to date range boundaries
        const actualStart = weekStart < fromDate ? fromDate : weekStart
        const actualEnd = weekEnd > toDate ? toDate : weekEnd

        const data = await prisma.outboundFact.findMany({
          where: {
            invoiceDate: {
              gte: actualStart,
              lte: actualEnd
            }
          }
        })
        const grossSale = data.reduce((sum, row) => sum + Number(row.grossTotal), 0)

        chartData.push({
          label: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`,
          grossSale,
          date: format(weekStart, 'yyyy-MM-dd')
        })
      }
    } else {
      // day view
      const days = eachDayOfInterval({ start: fromDate, end: toDate })
      
      for (const day of days) {
        const dayStart = startOfDay(day)
        const dayEnd = endOfDay(day)

        const data = await prisma.outboundFact.findMany({
          where: {
            invoiceDate: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        })
        const grossSale = data.reduce((sum, row) => sum + Number(row.grossTotal), 0)

        chartData.push({
          label: format(day, 'MMM dd'),
          grossSale,
          date: format(day, 'yyyy-MM-dd')
        })
      }
    }

    return NextResponse.json(chartData)

  } catch (error) {
    console.error('Gross sales chart API error:', error)
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch chart data'
    }, { status: 500 })
  }
}

