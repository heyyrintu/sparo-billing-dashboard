import { NextRequest, NextResponse } from 'next/server'
import { parseOutboundExcel } from '@/lib/parser/parseOutbound'
import { generateChecksum } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { refreshDailySummary, refreshMonthlyRevenue, getAffectedDates, getAffectedMonths } from '@/lib/services/aggregation'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  return NextResponse.json({ 
    endpoint: 'outbound-upload',
    method: 'POST',
    status: 'ready' 
  })
}

export async function POST(request: NextRequest) {
  // Authentication removed - allow all requests
  const userId = 'anonymous'
  
  try {

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
    
    // Check if file already exists - if so, delete old data and re-upload
    const existingUpload = await prisma.uploadLog.findFirst({
      where: { checksum, fileType: 'OUTBOUND' }
    })

    let isReupload = false
    if (existingUpload) {
      isReupload = true
      // Get dates of old data before deletion for refreshing summaries
      const oldData = await prisma.outboundFact.findMany({
        where: { sourceChecksum: checksum },
        select: { invoiceDate: true }
      })
      const oldDates = oldData.map(row => row.invoiceDate)
      
      // Delete old data
      await prisma.outboundFact.deleteMany({
        where: { sourceChecksum: checksum }
      })
      
      // Delete old upload log and rejected rows
      await prisma.uploadLog.delete({
        where: { id: existingUpload.id }
      }).catch(() => {}) // Ignore if already deleted
      
      // Refresh daily summaries and monthly revenue for old dates
      if (oldDates.length > 0) {
        const affectedDates = await getAffectedDates(oldDates)
        const affectedMonths = await getAffectedMonths(oldDates)
        await Promise.all([
          refreshDailySummary(affectedDates),
          refreshMonthlyRevenue(affectedMonths)
        ])
      }
    }

    // Parse Excel file
    const parseResult = parseOutboundExcel(buffer)

    // Store file - use /tmp in serverless environments (Vercel), otherwise use data/uploads
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    const baseDir = isServerless ? '/tmp' : join(process.cwd(), 'data', 'uploads')
    const uploadDir = join(baseDir, 
      new Date().getFullYear().toString(),
      (new Date().getMonth() + 1).toString().padStart(2, '0'),
      new Date().getDate().toString().padStart(2, '0')
    )
    
    await mkdir(uploadDir, { recursive: true })
    const filePath = join(uploadDir, `${checksum}.xlsx`)
    await writeFile(filePath, buffer)

    // Insert data into database using batching to avoid timeout
    const batchSize = 100
    let totalInserted = 0
    
    for (let i = 0; i < parseResult.validRows.length; i += batchSize) {
      const batch = parseResult.validRows.slice(i, i + batchSize)
      const result = await prisma.outboundFact.createMany({
        data: batch.map(row => ({
          invoiceNo: row.invoiceNo,
          invoiceDate: row.invoiceDate,
          dispatchedDate: row.dispatchedDate,
          partyName: row.partyName,
          invoiceQty: row.invoiceQty,
          boxes: row.boxes,
          grossTotal: row.grossTotal,
          sourceFile: isServerless ? `/tmp/uploads/${checksum}.xlsx` : filePath.replace(process.cwd(), ''),
          sourceChecksum: checksum
        }))
      })
      totalInserted += result.count
    }

    // Refresh daily summaries and monthly revenue for affected dates
    const affectedDates = await getAffectedDates(parseResult.validRows.map(row => row.invoiceDate))
    const affectedMonths = await getAffectedMonths(parseResult.validRows.map(row => row.invoiceDate))
    
    await Promise.all([
      refreshDailySummary(affectedDates),
      refreshMonthlyRevenue(affectedMonths)
    ])

    // Log upload
    const uploadLog = await prisma.uploadLog.create({
      data: {
        filename: file.name,
        fileType: 'OUTBOUND',
        uploadedBy: userId,
        rowCount: parseResult.validRows.length,
        checksum,
        status: 'SUCCESS',
        message: `Successfully uploaded ${parseResult.validRows.length} rows${parseResult.rejectedRows.length > 0 ? `, ${parseResult.rejectedRows.length} rows rejected` : ''}`
      }
    })

    // Save rejected rows to database
    if (parseResult.rejectedRows.length > 0) {
      try {
        if ((prisma as any).rejectedRow) {
          await (prisma as any).rejectedRow.createMany({
            data: parseResult.rejectedRows.map(rejected => ({
              uploadLogId: uploadLog.id,
              rowNumber: rejected.rowNumber,
              rowData: JSON.stringify(rejected.data),
              reason: rejected.reason,
              fileType: 'OUTBOUND',
              filename: file.name
            }))
          })
        } else {
          console.warn('RejectedRow model not available. Please run: npx prisma generate')
        }
      } catch (error) {
        console.error('Failed to save rejected rows:', error)
        // Continue even if rejected rows can't be saved
      }
    }

    return NextResponse.json({
      success: true,
      rowCount: parseResult.validRows.length,
      rejectedCount: parseResult.rejectedRows.length,
      uploadId: uploadLog.id,
      message: `${isReupload ? 'Re-uploaded' : 'Successfully uploaded'} ${parseResult.validRows.length} outbound records${parseResult.rejectedRows.length > 0 ? `, ${parseResult.rejectedRows.length} rows rejected` : ''}`
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
          uploadedBy: userId,
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
