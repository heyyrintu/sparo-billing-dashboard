import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = process.env.DISABLE_AUTH === 'true'
      ? ({ user: { id: 'dev-user' } } as any)
      : await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const fileType = searchParams.get('fileType')
    const status = searchParams.get('status')

    const where: any = {}
    if (fileType) where.fileType = fileType
    if (status) where.status = status

    const uploads = await prisma.uploadLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.uploadLog.count({ where })

    return NextResponse.json(uploads)

  } catch (error) {
    console.error('Upload log API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch upload log'
    }, { status: 500 })
  }
}
