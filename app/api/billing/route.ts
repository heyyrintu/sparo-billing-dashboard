import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { REVENUE_SLABS } from '@/lib/revenue/slabs'
import type { BillingData, SlabBreakdown } from '@/lib/types'

const MINIMUM_GUARANTEE = 60000000 // 6,00,000 in rupees (6 crores)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const monthParam = searchParams.get('month') // Format: "2025-10"

    if (!monthParam) {
      return NextResponse.json({ error: 'month parameter is required (format: YYYY-MM)' }, { status: 400 })
    }

    // Parse month and year
    const [year, month] = monthParam.split('-').map(Number)
    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid month format. Use YYYY-MM' }, { status: 400 })
    }

    const monthStart = startOfMonth(new Date(year, month - 1, 1))
    const monthEnd = endOfMonth(new Date(year, month - 1, 1))

    // Fetch gross sales for the month from DailySummary
    const dailySummaries = await prisma.dailySummary.findMany({
      where: {
        day: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    })

    const grossSale = dailySummaries.reduce((sum, day) => sum + Number(day.grossSale), 0)

    // Apply minimum guarantee
    const billingAmount = Math.max(grossSale, MINIMUM_GUARANTEE)

    // Calculate tiered revenue breakdown
    const amountInCrores = billingAmount / 10000000 // Convert to crores
    const slabBreakdown: SlabBreakdown[] = []
    let totalRevenue = 0

    for (const slab of REVENUE_SLABS) {
      if (amountInCrores <= slab.min) break

      const slabAmount = Math.min(
        amountInCrores - slab.min,
        slab.max ? slab.max - slab.min : amountInCrores - slab.min
      )

      if (slabAmount > 0) {
        const slabRevenueInCrores = (slabAmount * slab.rate) / 100
        const slabRevenueInRupees = slabRevenueInCrores * 10000000

        slabBreakdown.push({
          range: slab.max 
            ? `${slab.min * 10000000} - ${slab.max * 10000000}` 
            : `${slab.min * 10000000}+`,
          rate: slab.rate,
          amount: slabRevenueInRupees
        })

        totalRevenue += slabRevenueInRupees
      }
    }

    const response: BillingData = {
      grossSale,
      minGuarantee: MINIMUM_GUARANTEE,
      slabBreakdown,
      totalRevenue
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Billing API error:', error)

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
      error: error instanceof Error ? error.message : 'Failed to fetch billing data'
    }, { status: 500 })
  }
}

