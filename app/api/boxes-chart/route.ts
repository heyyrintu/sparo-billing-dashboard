import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, eachMonthOfInterval, eachWeekOfInterval, eachDayOfInterval } from 'date-fns'

const prisma = new PrismaClient()

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
    const toDate = new Date(to)

    let chartData: ChartDataPoint[] = []

    if (view === 'month') {
      // Get all months that have data (not just in the date range)
      let allMonths: Date[] = []
      
      if (type === 'inbound') {
        // Get all inbound data to extract unique months
        const inboundData = await prisma.inboundFact.findMany({
          select: {
            receivedDate: true
          }
        })
        
        // Extract unique months
        const monthSet = new Set<string>()
        inboundData.forEach(row => {
          const month = startOfMonth(new Date(row.receivedDate))
          monthSet.add(format(month, 'yyyy-MM'))
        })
        
        allMonths = Array.from(monthSet).map(monthStr => {
          const [year, month] = monthStr.split('-').map(Number)
          return new Date(year, month - 1, 1)
        }).sort((a, b) => a.getTime() - b.getTime())
      } else {
        // Get all outbound data to extract unique months
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
        
        allMonths = Array.from(monthSet).map(monthStr => {
          const [year, month] = monthStr.split('-').map(Number)
          return new Date(year, month - 1, 1)
        }).sort((a, b) => a.getTime() - b.getTime())
      }
      
      // Calculate boxes for each month
      for (const month of allMonths) {
        const monthStart = startOfMonth(month)
        const monthEnd = endOfMonth(month)

        let boxes = 0
        
        if (type === 'inbound') {
          const data = await prisma.inboundFact.findMany({
            where: {
              receivedDate: {
                gte: monthStart,
                lte: monthEnd
              }
            }
          })
          boxes = data.reduce((sum, row) => sum + Number(row.boxes), 0)
        } else {
          // outward or revenue (both use outbound data)
          const data = await prisma.outboundFact.findMany({
            where: {
              invoiceDate: {
                gte: monthStart,
                lte: monthEnd
              }
            }
          })
          boxes = data.reduce((sum, row) => sum + Number(row.boxes), 0)
        }

        chartData.push({
          label: format(month, 'MMM yyyy'),
          boxes,
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

        let boxes = 0
        
        if (type === 'inbound') {
          const data = await prisma.inboundFact.findMany({
            where: {
              receivedDate: {
                gte: actualStart,
                lte: actualEnd
              }
            }
          })
          boxes = data.reduce((sum, row) => sum + Number(row.boxes), 0)
        } else {
          const data = await prisma.outboundFact.findMany({
            where: {
              invoiceDate: {
                gte: actualStart,
                lte: actualEnd
              }
            }
          })
          boxes = data.reduce((sum, row) => sum + Number(row.boxes), 0)
        }

        chartData.push({
          label: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`,
          boxes,
          date: format(weekStart, 'yyyy-MM-dd')
        })
      }
    } else {
      // day view
      const days = eachDayOfInterval({ start: fromDate, end: toDate })
      
      for (const day of days) {
        const dayStart = startOfDay(day)
        const dayEnd = endOfDay(day)

        let boxes = 0
        
        if (type === 'inbound') {
          const data = await prisma.inboundFact.findMany({
            where: {
              receivedDate: {
                gte: dayStart,
                lte: dayEnd
              }
            }
          })
          boxes = data.reduce((sum, row) => sum + Number(row.boxes), 0)
        } else {
          const data = await prisma.outboundFact.findMany({
            where: {
              invoiceDate: {
                gte: dayStart,
                lte: dayEnd
              }
            }
          })
          boxes = data.reduce((sum, row) => sum + Number(row.boxes), 0)
        }

        chartData.push({
          label: format(day, 'MMM dd'),
          boxes,
          date: format(day, 'yyyy-MM-dd')
        })
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

