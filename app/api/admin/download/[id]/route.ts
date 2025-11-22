import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication removed - allow all requests
    const { id } = await params

    const upload = await prisma.uploadLog.findUnique({
      where: { id }
    })

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
    }

    // Note: sourceFile field not in schema - files are not persisted after upload
    // Return metadata about the upload instead
    return NextResponse.json({
      error: 'File download not available - files are processed and not stored',
      upload: {
        filename: upload.filename,
        fileType: upload.fileType,
        uploadedBy: upload.uploadedBy,
        rowCount: upload.rowCount,
        status: upload.status,
        createdAt: upload.createdAt
      }
    }, { status: 404 })

  } catch (error) {
    console.error('Download API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Download failed'
    }, { status: 500 })
  }
}
