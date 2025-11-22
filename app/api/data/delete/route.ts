import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { refreshDailySummary, getAffectedDates } from '@/lib/services/aggregation'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type') // 'inbound' or 'outbound' or 'all'

    if (!dataType || !['inbound', 'outbound', 'all'].includes(dataType)) {
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be "inbound", "outbound", or "all"' },
        { status: 400 }
      )
    }

    let deletedCount = 0
    const affectedDates: Date[] = []

    if (dataType === 'inbound' || dataType === 'all') {
      // Get all dates before deletion for refreshing summaries
      const inboundDates = await prisma.inboundFact.findMany({
        select: { receivedDate: true }
      })
      affectedDates.push(...inboundDates.map(row => row.receivedDate))

      // Delete inbound data
      const inboundResult = await prisma.inboundFact.deleteMany({})
      deletedCount += inboundResult.count
    }

    if (dataType === 'outbound' || dataType === 'all') {
      // Get all dates before deletion for refreshing summaries
      const outboundDates = await prisma.outboundFact.findMany({
        select: { invoiceDate: true }
      })
      affectedDates.push(...outboundDates.map(row => row.invoiceDate))

      // Delete outbound data
      const outboundResult = await prisma.outboundFact.deleteMany({})
      deletedCount += outboundResult.count
    }

    // Refresh daily summaries for affected dates
    if (affectedDates.length > 0) {
      const uniqueDates = await getAffectedDates(affectedDates)
      await refreshDailySummary(uniqueDates)
    }

    // Also clear daily summaries and monthly revenue if deleting all
    if (dataType === 'all') {
      await prisma.dailySummary.deleteMany({})
      await prisma.monthlyRevenue.deleteMany({})
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} ${dataType} record(s)`,
      deletedCount
    })

  } catch (error) {
    console.error('Delete data error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete data'
      },
      { status: 500 }
    )
  }
}

