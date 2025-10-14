import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { readFile } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const upload = await prisma.uploadLog.findUnique({
      where: { id: params.id }
    })

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
    }

    // Construct file path
    const filePath = join(process.cwd(), upload.sourceFile)
    
    try {
      const fileBuffer = await readFile(filePath)
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${upload.filename}"`,
        },
      })
    } catch (fileError) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

  } catch (error) {
    console.error('Download API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Download failed'
    }, { status: 500 })
  }
}
