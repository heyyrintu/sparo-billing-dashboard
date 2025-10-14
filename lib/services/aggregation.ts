import { PrismaClient } from '@prisma/client'
import { computeMonthlyRevenue } from '@/lib/revenue/calculator'

const prisma = new PrismaClient()

export async function refreshDailySummary(dates: Date[]): Promise<void> {
  for (const date of dates) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    // Get outbound data for the day
    const outboundData = await prisma.outboundFact.findMany({
      where: {
        invoiceDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })
    
    // Get inbound data for the day
    const inboundData = await prisma.inboundFact.findMany({
      where: {
        receivedDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })
    
    // Calculate aggregates
    const outboundInvoices = outboundData.length
    const outboundQty = outboundData.reduce((sum, row) => sum + Number(row.invoiceQty), 0)
    const outboundBoxes = outboundData.reduce((sum, row) => sum + Number(row.boxes), 0)
    const grossSale = outboundData.reduce((sum, row) => sum + Number(row.grossTotal), 0)
    
    const inboundQty = inboundData.reduce((sum, row) => sum + Number(row.invoiceQty), 0)
    const inboundBoxes = inboundData.reduce((sum, row) => sum + Number(row.boxes), 0)
    
    // Upsert daily summary
    await prisma.dailySummary.upsert({
      where: { day: startOfDay },
      update: {
        outboundInvoices,
        outboundQty,
        outboundBoxes,
        grossSale,
        inboundQty,
        inboundBoxes
      },
      create: {
        day: startOfDay,
        outboundInvoices,
        outboundQty,
        outboundBoxes,
        grossSale,
        inboundQty,
        inboundBoxes
      }
    })
  }
}

export async function refreshMonthlyRevenue(months: Date[]): Promise<void> {
  for (const month of months) {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999)
    
    // Get outbound data for the month
    const outboundData = await prisma.outboundFact.findMany({
      where: {
        invoiceDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })
    
    // Calculate monthly gross sale
    const grossSale = outboundData.reduce((sum, row) => sum + Number(row.grossTotal), 0)
    
    // Calculate revenue using both modes
    const { marginal, flat } = computeMonthlyRevenue(grossSale)
    
    // Upsert monthly revenue
    await prisma.monthlyRevenue.upsert({
      where: { month: startOfMonth },
      update: {
        grossSale,
        revenueMarginal: marginal,
        revenueFlat: flat,
        lastRecalcAt: new Date()
      },
      create: {
        month: startOfMonth,
        grossSale,
        revenueMarginal: marginal,
        revenueFlat: flat
      }
    })
  }
}

export async function getAffectedDates(invoiceDates: Date[]): Promise<Date[]> {
  const uniqueDates = [...new Set(invoiceDates.map(date => 
    new Date(date.getFullYear(), date.getMonth(), date.getDate())
  ))]
  
  return uniqueDates.sort((a, b) => a.getTime() - b.getTime())
}

export async function getAffectedMonths(invoiceDates: Date[]): Promise<Date[]> {
  const uniqueMonths = [...new Set(invoiceDates.map(date => 
    new Date(date.getFullYear(), date.getMonth(), 1)
  ))]
  
  return uniqueMonths.sort((a, b) => a.getTime() - b.getTime())
}
