import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { uploadId: string } }
) {
  try {
    // Authentication removed - allow all requests

    // Check if rejectedRow model exists (Prisma client might need regeneration)
    if (!(prisma as any).rejectedRow) {
      return NextResponse.json({ 
        error: 'Rejected rows feature not available. Please restart the server after running: npx prisma generate' 
      }, { status: 503 })
    }

    // Get rejected rows for this upload
    const rejectedRows = await (prisma as any).rejectedRow.findMany({
      where: {
        uploadLogId: params.uploadId
      },
      orderBy: {
        rowNumber: 'asc'
      }
    })

    if (rejectedRows.length === 0) {
      return NextResponse.json({ 
        error: 'No rejected rows found for this upload' 
      }, { status: 404 })
    }

    // Get upload log info
    const uploadLog = await prisma.uploadLog.findUnique({
      where: { id: params.uploadId }
    })

    if (!uploadLog) {
      return NextResponse.json({ 
        error: 'Upload not found' 
      }, { status: 404 })
    }

    // Prepare data for Excel
    const excelData = rejectedRows.map(rejected => {
      const rowData = JSON.parse(rejected.rowData)
      return {
        'Row Number': rejected.rowNumber,
        'Reason': rejected.reason,
        ...rowData
      }
    })

    // Create workbook
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    
    // Set column widths
    const maxWidth = 50
    const wcols = excelData.length > 0 
      ? Object.keys(excelData[0]).map(() => ({ wch: maxWidth }))
      : []
    worksheet['!cols'] = wcols

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rejected Rows')

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    })

    // Generate filename
    const filename = `rejected-rows-${uploadLog.filename.replace('.xlsx', '')}-${params.uploadId.slice(0, 8)}.xlsx`

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Rejected rows export error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to export rejected rows'
    }, { status: 500 })
  }
}

