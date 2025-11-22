import { NextRequest, NextResponse } from 'next/server'
import { parseInboundExcel } from '@/lib/parser/parseInbound'
import { generateChecksum } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { refreshDailySummary, getAffectedDates } from '@/lib/services/aggregation'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  return NextResponse.json({ 
    endpoint: 'inbound-upload',
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
      where: { checksum, fileType: 'INBOUND' }
    })

    let isReupload = false
    if (existingUpload) {
      isReupload = true
      // Get dates of old data before deletion for refreshing summaries
      const oldData = await prisma.inboundFact.findMany({
        where: { sourceChecksum: checksum },
        select: { receivedDate: true }
      })
      const oldDates = oldData.map(row => row.receivedDate)
      
      // Delete old data
      await prisma.inboundFact.deleteMany({
        where: { sourceChecksum: checksum }
      })
      
      // Delete old upload log and rejected rows
      await prisma.uploadLog.delete({
        where: { id: existingUpload.id }
      }).catch(() => {}) // Ignore if already deleted
      
      // Refresh daily summaries for old dates
      if (oldDates.length > 0) {
        const affectedDates = await getAffectedDates(oldDates)
        await refreshDailySummary(affectedDates)
      }
    }

    // Parse Excel file
    const parseResult = parseInboundExcel(buffer)

    // Store file
    const uploadDir = join(process.cwd(), 'data', 'uploads', 
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
      const result = await prisma.inboundFact.createMany({
        data: batch.map(row => ({
          receivedDate: row.receivedDate,
          invoiceNo: row.invoiceNo,
          invoiceValue: row.invoiceValue ?? 0,
          partyName: row.partyName,
          invoiceQty: row.invoiceQty,
          boxes: row.boxes,
          type: row.type,
          articleNo: row.articleNo,
          sourceFile: filePath.replace(process.cwd(), ''),
          sourceChecksum: checksum
        }))
      })
      totalInserted += result.count
    }
    
    const insertedRows = { count: totalInserted }

    // Refresh daily summaries for affected dates
    const affectedDates = await getAffectedDates(parseResult.validRows.map(row => row.receivedDate))
    await refreshDailySummary(affectedDates)

    // Log upload
    const uploadLog = await prisma.uploadLog.create({
      data: {
        filename: file.name,
        fileType: 'INBOUND',
        uploadedBy: userId,
        rowCount: insertedRows.count,
        checksum,
        status: 'SUCCESS',
        message: `Successfully uploaded ${insertedRows.count} rows${parseResult.rejectedRows.length > 0 ? `, ${parseResult.rejectedRows.length} rows rejected` : ''}`
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
              fileType: 'INBOUND',
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
      rowCount: insertedRows.count,
      rejectedCount: parseResult.rejectedRows.length,
      uploadId: uploadLog.id,
      message: `${isReupload ? 'Re-uploaded' : 'Successfully uploaded'} ${insertedRows.count} inbound records${parseResult.rejectedRows.length > 0 ? `, ${parseResult.rejectedRows.length} rows rejected` : ''}`
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
          fileType: 'INBOUND',
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
