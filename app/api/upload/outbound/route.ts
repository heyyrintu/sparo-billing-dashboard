import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { parseOutboundExcel } from '@/lib/parser/parseOutbound'
import { generateChecksum } from '@/lib/utils'
import { PrismaClient } from '@prisma/client'
import { refreshDailySummary, refreshMonthlyRevenue, getAffectedDates, getAffectedMonths } from '@/lib/services/aggregation'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

export async function GET() {
  return NextResponse.json({ 
    endpoint: 'outbound-upload',
    method: 'POST',
    status: 'ready' 
  })
}

export async function POST(request: NextRequest) {
  let session = null
  try {
    session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!file.name.endsWith('.xlsx')) {
      return NextResponse.json({ error: 'Only .xlsx files are allowed' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const checksum = generateChecksum(buffer)
    
    // Check if file already exists
    const existingUpload = await prisma.uploadLog.findFirst({
      where: { checksum, fileType: 'OUTBOUND' }
    })

    if (existingUpload) {
      return NextResponse.json({ 
        error: 'File with same content already uploaded',
        uploadId: existingUpload.id 
      }, { status: 409 })
    }

    // Parse Excel file
    const parsedData = parseOutboundExcel(buffer)

    // Store file
    const uploadDir = join(process.cwd(), 'data', 'uploads', 
      new Date().getFullYear().toString(),
      (new Date().getMonth() + 1).toString().padStart(2, '0'),
      new Date().getDate().toString().padStart(2, '0')
    )
    
    await mkdir(uploadDir, { recursive: true })
    const filePath = join(uploadDir, `${checksum}.xlsx`)
    await writeFile(filePath, buffer)

    // Upsert data into database (deduplication handled in parser)
    const upsertPromises = parsedData.map(row => 
      prisma.outboundFact.upsert({
        where: {
          invoiceNo_invoiceDate: {
            invoiceNo: row.invoiceNo,
            invoiceDate: row.invoiceDate
          }
        },
        update: {
          dispatchedDate: row.dispatchedDate,
          partyName: row.partyName,
          invoiceQty: row.invoiceQty,
          boxes: row.boxes,
          grossTotal: row.grossTotal,
          sourceFile: filePath.replace(process.cwd(), ''),
          sourceChecksum: checksum
        },
        create: {
          invoiceNo: row.invoiceNo,
          invoiceDate: row.invoiceDate,
          dispatchedDate: row.dispatchedDate,
          partyName: row.partyName,
          invoiceQty: row.invoiceQty,
          boxes: row.boxes,
          grossTotal: row.grossTotal,
          sourceFile: filePath.replace(process.cwd(), ''),
          sourceChecksum: checksum
        }
      })
    )

    await Promise.all(upsertPromises)

    // Refresh daily summaries and monthly revenue for affected dates
    const affectedDates = await getAffectedDates(parsedData.map(row => row.invoiceDate))
    const affectedMonths = await getAffectedMonths(parsedData.map(row => row.invoiceDate))
    
    await Promise.all([
      refreshDailySummary(affectedDates),
      refreshMonthlyRevenue(affectedMonths)
    ])

    // Log upload
    await prisma.uploadLog.create({
      data: {
        filename: file.name,
        fileType: 'OUTBOUND',
        uploadedBy: session.user.id,
        rowCount: parsedData.length,
        checksum,
        status: 'SUCCESS',
        message: `Successfully uploaded ${parsedData.length} rows`
      }
    })

    return NextResponse.json({
      success: true,
      rowCount: parsedData.length,
      message: `Successfully uploaded ${parsedData.length} outbound records`
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    // Log failed upload
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      await prisma.uploadLog.create({
        data: {
          filename: file?.name || 'unknown',
          fileType: 'OUTBOUND',
          uploadedBy: session?.user?.id || 'unknown',
          rowCount: 0,
          checksum: '',
          status: 'FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      })
    } catch (logError) {
      console.error('Failed to log upload error:', logError)
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Upload failed'
    }, { status: 500 })
  }
}
