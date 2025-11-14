import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Authentication removed - allow all requests

    // Check if rejectedRow model exists (Prisma client might need regeneration)
    if (!(prisma as any).rejectedRow) {
      return NextResponse.json({ 
        error: 'Rejected rows feature not available. Please restart the server after running: npx prisma generate',
        rejectedRows: [],
        total: 0,
        limit: 0,
        offset: 0
      }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get('uploadId')
    const fileType = searchParams.get('fileType')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (uploadId) where.uploadLogId = uploadId
    if (fileType) where.fileType = fileType

    const rejectedRows = await (prisma as any).rejectedRow.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' },
        { rowNumber: 'asc' }
      ],
      take: limit,
      skip: offset
    })

    const total = await (prisma as any).rejectedRow.count({ where })

    return NextResponse.json({
      rejectedRows,
      total,
      limit,
      offset
    })

  } catch (error) {
    console.error('Rejected rows API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch rejected rows'
    }, { status: 500 })
  }
}

