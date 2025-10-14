import * as XLSX from 'xlsx'
import { z } from 'zod'
import { normalizeColumnName, coerceDate, coerceNumber, isBlankRow, hasRequiredFields } from '@/lib/utils'
import { InboundRowSchema, type InboundRow } from './validation'

const REQUIRED_COLUMNS = [
  'invoice_qty',
  'boxes'
]

const COLUMN_MAPPINGS: Record<string, string[]> = {
  'received_date': ['grn_date', 'grn date', 'grndate', 'received_date', 'received date', 'receiveddate', 'date', 'received', 'inward date', 'inwarddate'],
  'party_name': ['party_name', 'party name', 'partyname', 'customer', 'client', 'supplier'],
  'invoice_qty': ['invoice_qty', 'invoice qty', 'invoiceqty', 'quantity', 'qty', 'invoice_quantity', 'invoice quantity', 'invoice', 'invoices'],
  'boxes': ['boxes', 'no_of_boxes', 'no of boxes', 'noofboxes', 'box_count', 'no_of_box', 'no of box', 'bags/box', 'bags_box', 'bags box', 'bags', 'bag'],
  'type': ['type', 'category', 'item_type', 'item type'],
  'article_no': ['article_no', 'article no', 'articleno', 'article_number', 'article number', 'sku', 'item_code']
}

function findColumnIndex(headers: string[], targetColumn: string): number {
  const normalizedHeaders = headers.map(normalizeColumnName)
  const possibleNames = COLUMN_MAPPINGS[targetColumn] || [targetColumn]
  
  for (const name of possibleNames) {
    const normalizedName = normalizeColumnName(name)
    const index = normalizedHeaders.indexOf(normalizedName)
    if (index !== -1) return index
  }
  
  return -1
}

function mapRowToInbound(row: any[], headers: string[]): Partial<InboundRow> {
  const columnMap: Record<string, number> = {}
  
  // Map required columns
  for (const col of REQUIRED_COLUMNS) {
    const index = findColumnIndex(headers, col)
    if (index === -1) {
      throw new Error(`Required column not found: ${col}. Available columns: ${headers.join(', ')}`)
    }
    columnMap[col] = index
  }
  
  // Map optional columns (including received_date which we'll use current date if not found)
  const optionalColumns = ['received_date', 'party_name', 'type', 'article_no']
  for (const col of optionalColumns) {
    const index = findColumnIndex(headers, col)
    if (index !== -1) {
      columnMap[col] = index
    }
  }
  
  const result: any = {}
  
  // Extract and coerce values
  // Use received date if available, otherwise use current date
  if (columnMap.received_date !== undefined && row[columnMap.received_date]) {
    const parsedDate = coerceDate(row[columnMap.received_date])
    result.receivedDate = parsedDate || new Date() // Fall back to current date if parsing fails
  } else {
    result.receivedDate = new Date()
  }
  
  if (columnMap.party_name !== undefined) {
    result.partyName = String(row[columnMap.party_name] || '').trim() || undefined
  }
  
  if (columnMap.invoice_qty !== undefined) {
    result.invoiceQty = coerceNumber(row[columnMap.invoice_qty])
  }
  
  if (columnMap.boxes !== undefined) {
    result.boxes = coerceNumber(row[columnMap.boxes])
  }
  
  if (columnMap.type !== undefined) {
    result.type = String(row[columnMap.type] || '').trim() || undefined
  }
  
  if (columnMap.article_no !== undefined) {
    result.articleNo = String(row[columnMap.article_no] || '').trim() || undefined
  }
  
  return result
}

export function parseInboundExcel(buffer: Buffer): InboundRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  
  // Find the "PIPO & BIBO Inward" sheet or similar
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('inward') || 
    name.toLowerCase().includes('inbound') ||
    name.toLowerCase().includes('pipo') ||
    name.toLowerCase().includes('bibo') ||
    name.toLowerCase().includes('received')
  )
  
  if (!sheetName) {
    throw new Error('Could not find "PIPO & BIBO Inward" or similar sheet in Excel file')
  }
  
  const worksheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
  
  if (jsonData.length < 2) {
    throw new Error('Excel file must contain at least a header row and one data row')
  }
  
  // Trim whitespace from all headers
  const rawHeaders = jsonData[0] as string[]
  const headers = rawHeaders.map(h => String(h || '').trim())
  const rows = jsonData.slice(1) as any[][]
  
  console.log('Inbound Excel - Available columns:', headers)
  console.log('Looking for columns: GRN Date (for date), Invoice Qty, Bags/Box')
  
  const parsedRows: InboundRow[] = []
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    
    // Skip blank rows - check if row is empty or has no meaningful data
    if (!row || row.length === 0) continue
    
    // Convert array to object for blank row checking
    const rowObj = headers.reduce((obj, header, index) => {
      obj[header] = row[index]
      return obj
    }, {} as Record<string, any>)
    
    if (isBlankRow(rowObj)) continue
    
    try {
      const mappedRow = mapRowToInbound(row, headers)
      
      // Additional validation after mapping - only check required fields
      if (mappedRow.invoiceQty === null || 
          mappedRow.invoiceQty === undefined ||
          mappedRow.boxes === null || 
          mappedRow.boxes === undefined) {
        console.log(`Skipping row ${i + 2}: Missing required fields (Invoice Qty or Boxes)`)
        continue
      }
      
      // Ensure receivedDate is never null (fallback to current date)
      if (!mappedRow.receivedDate || !(mappedRow.receivedDate instanceof Date)) {
        console.log(`Row ${i + 2}: Using current date as fallback for invalid/missing GRN Date`)
        mappedRow.receivedDate = new Date()
      }
      
      // Validate the row with Zod
      const validatedRow = InboundRowSchema.parse(mappedRow)
      parsedRows.push(validatedRow)
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Row ${i + 2}: ${error.errors.map(e => e.message).join(', ')}`)
      }
      throw new Error(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  if (parsedRows.length === 0) {
    throw new Error('No valid data rows found in Excel file')
  }
  
  return parsedRows
}
