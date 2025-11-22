import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, eachMonthOfInterval, eachWeekOfInterval, eachDayOfInterval } from 'date-fns'

interface ChartDataPoint {
  label: string
  boxes: number
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
    // Set fromDate to start of day to include all data on that date
    fromDate.setHours(0, 0, 0, 0)
    const toDate = new Date(to)
    // Set toDate to end of day to include all data on that date
    toDate.setHours(23, 59, 59, 999)

    let chartData: ChartDataPoint[] = []

    if (view === 'month') {
      // Get all unique months that have data (not limited by date range)
      let allMonths: Date[] = []
      
      if (type === 'inbound') {
        // Get all dates from inbound data and extract unique months
        const allDates = await prisma.inboundFact.findMany({
          select: {
            receivedDate: true
          }
        })
        
        // Extract unique months
        const monthSet = new Set<string>()
        allDates.forEach(row => {
          const month = startOfMonth(new Date(row.receivedDate))
          monthSet.add(format(month, 'yyyy-MM'))
        })
        
        allMonths = Array.from(monthSet)
          .map(monthStr => {
            const [year, month] = monthStr.split('-').map(Number)
            return new Date(year, month - 1, 1)
          })
          .sort((a, b) => a.getTime() - b.getTime())
      } else {
        // Get all dates from outbound data and extract unique months
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
        
        allMonths = Array.from(monthSet)
          .map(monthStr => {
            const [year, month] = monthStr.split('-').map(Number)
            return new Date(year, month - 1, 1)
          })
          .sort((a, b) => a.getTime() - b.getTime())
      }
      
      // Use Promise.all for parallel queries - aggregate ALL data for each month
      const monthDataPromises = allMonths.map(async (month) => {
        const monthStart = startOfMonth(month)
        const monthEnd = endOfMonth(month)

        if (type === 'inbound') {
          const result = await prisma.inboundFact.aggregate({
            where: {
              receivedDate: {
                gte: monthStart,
                lte: monthEnd
              }
            },
            _sum: {
              boxes: true
            }
          })
          return {
            label: format(month, 'MMM yyyy'),
            boxes: Number(result._sum.boxes || 0),
            date: format(month, 'yyyy-MM')
          }
        } else {
          const result = await prisma.outboundFact.aggregate({
            where: {
              invoiceDate: {
                gte: monthStart,
                lte: monthEnd
              }
            },
            _sum: {
              boxes: true
            }
          })
          return {
            label: format(month, 'MMM yyyy'),
            boxes: Number(result._sum.boxes || 0),
            date: format(month, 'yyyy-MM')
          }
        }
      })

      chartData = await Promise.all(monthDataPromises)
    } else if (view === 'week') {
      // Get all weeks in the range
      const weeks = eachWeekOfInterval({ start: fromDate, end: toDate }, { weekStartsOn: 1 })
      
      // Use Promise.all for parallel queries
      const weekDataPromises = weeks.map(async (week) => {
        const weekStart = startOfWeek(week, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(week, { weekStartsOn: 1 })
        
        // Adjust to date range boundaries
        const actualStart = weekStart < fromDate ? fromDate : weekStart
        const actualEnd = weekEnd > toDate ? toDate : weekEnd

        if (type === 'inbound') {
          const result = await prisma.inboundFact.aggregate({
            where: {
              receivedDate: {
                gte: actualStart,
                lte: actualEnd
              }
            },
            _sum: {
              boxes: true
            }
          })
          return {
            label: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`,
            boxes: Number(result._sum.boxes || 0),
            date: format(weekStart, 'yyyy-MM-dd')
          }
        } else {
          const result = await prisma.outboundFact.aggregate({
            where: {
              invoiceDate: {
                gte: actualStart,
                lte: actualEnd
              }
            },
            _sum: {
              boxes: true
            }
          })
          return {
            label: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`,
            boxes: Number(result._sum.boxes || 0),
            date: format(weekStart, 'yyyy-MM-dd')
          }
        }
      })

      chartData = await Promise.all(weekDataPromises)
    } else {
      // day view - use DailySummary for better performance
      if (type === 'inbound') {
        // For inbound, we need to query InboundFact
        const days = eachDayOfInterval({ start: fromDate, end: toDate })
        
        const dayDataPromises = days.map(async (day) => {
          const dayStart = startOfDay(day)
          const dayEnd = endOfDay(day)

          const result = await prisma.inboundFact.aggregate({
            where: {
              receivedDate: {
                gte: dayStart,
                lte: dayEnd
              }
            },
            _sum: {
              boxes: true
            }
          })

          return {
            label: format(day, 'MMM dd'),
            boxes: Number(result._sum.boxes || 0),
            date: format(day, 'yyyy-MM-dd')
          }
        })

        chartData = await Promise.all(dayDataPromises)
      } else {
        // For outbound, use DailySummary which is pre-aggregated
        const dailySummaries = await prisma.dailySummary.findMany({
          where: {
            day: {
              gte: fromDate,
              lte: toDate
            }
          },
          orderBy: { day: 'asc' }
        })

        chartData = dailySummaries.map(day => ({
          label: format(day.day, 'MMM dd'),
          boxes: Number(day.outboundBoxes),
          date: format(day.day, 'yyyy-MM-dd')
        }))
      }
    }

    return NextResponse.json(chartData)

  } catch (error) {
    console.error('Boxes chart API error:', error)
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch chart data'
    }, { status: 500 })
  }
}
