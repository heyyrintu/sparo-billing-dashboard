import * as XLSX from 'xlsx'
import { z } from 'zod'
import { normalizeColumnName, coerceDate, coerceNumber, isBlankRow, hasRequiredFields } from '@/lib/utils'
import { OutboundRowSchema, type OutboundRow } from './validation'

const REQUIRED_COLUMNS = [
  'invoice_no',
  'invoice_qty',
  'boxes',
  'gross_total'
]

const COLUMN_MAPPINGS: Record<string, string[]> = {
  'invoice_no': ['Invoice No.'],
  'invoice_date': ['Invoice Date'],
  'dispatched_date': ['dispatched_date', 'dispatched date', 'dispatcheddate', 'dispatch_date', 'dispatch date', 'dispatch'],
  'party_name': ['party_name', 'party name', 'partyname', 'customer', 'client', 'party'],
  'invoice_qty': ['Invoice Qty'],
  'boxes': ['No. Of Box'],
  'gross_total': ['INVOICE GROSS TOTAL VALUE']
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

function mapRowToOutbound(row: any[], headers: string[]): Partial<OutboundRow> {
  const columnMap: Record<string, number> = {}
  
  // Map required columns - be more lenient
  for (const col of REQUIRED_COLUMNS) {
    const index = findColumnIndex(headers, col)
    if (index === -1) {
      // Don't throw immediately - try to provide better error message
      throw new Error(`Required column not found: ${col}. Available columns: ${headers.join(', ')}`)
    }
    columnMap[col] = index
  }
  
  // Map optional columns (invoice_date, dispatched_date, party_name)
  const optionalColumns = ['invoice_date', 'dispatched_date', 'party_name']
  for (const col of optionalColumns) {
    const index = findColumnIndex(headers, col)
    if (index !== -1) {
      columnMap[col] = index
    }
  }
  
  const result: any = {}
  
  // Extract and coerce values
  if (columnMap.invoice_no !== undefined) {
    const invoiceValue = row[columnMap.invoice_no]
    const invoiceStr = invoiceValue ? String(invoiceValue).trim() : ''
    // Keep invoice number as-is, undefined if blank
    result.invoiceNo = invoiceStr || undefined
  }
  
  // Use invoice date if available, otherwise use current date
  if (columnMap.invoice_date !== undefined && row[columnMap.invoice_date]) {
    const parsedDate = coerceDate(row[columnMap.invoice_date])
    result.invoiceDate = parsedDate || new Date() // Fall back to current date if parsing fails
  } else {
    result.invoiceDate = new Date()
  }
  
  if (columnMap.dispatched_date !== undefined && row[columnMap.dispatched_date]) {
    const parsedDispatchDate = coerceDate(row[columnMap.dispatched_date])
    result.dispatchedDate = parsedDispatchDate // Keep as undefined if parsing fails (it's optional)
  }
  
  if (columnMap.party_name !== undefined) {
    result.partyName = String(row[columnMap.party_name] || '').trim() || undefined
  }
  
  if (columnMap.invoice_qty !== undefined) {
    const rawValue = row[columnMap.invoice_qty]
    result.invoiceQty = coerceNumber(rawValue)
    // Default to 0 if null (including empty cells, null, undefined, or unparseable)
    if (result.invoiceQty === null) {
      result.invoiceQty = 0
    }
  }
  
  if (columnMap.boxes !== undefined) {
    const rawValue = row[columnMap.boxes]
    result.boxes = coerceNumber(rawValue)
    // Default to 0 if null (including empty cells, null, undefined, or unparseable)
    if (result.boxes === null) {
      result.boxes = 0
    }
  }
  
  if (columnMap.gross_total !== undefined) {
    const rawValue = row[columnMap.gross_total]
    result.grossTotal = coerceNumber(rawValue)
    // Default to 0 if null (including empty cells, null, undefined, or unparseable)
    if (result.grossTotal === null) {
      result.grossTotal = 0
    }
  }
  
  return result
}

export interface ParseResult {
  validRows: OutboundRow[]
  rejectedRows: Array<{
    rowNumber: number
    data: Record<string, any>
    reason: string
  }>
}

export function parseOutboundExcel(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  
  // Find the "Outward MIS" sheet (exact match, case-insensitive)
  const sheetName = workbook.SheetNames.find(name => 
    name.trim().toLowerCase() === 'outward mis'
  )
  
  if (!sheetName) {
    throw new Error('Could not find "Outward MIS" sheet in Excel file. Available sheets: ' + workbook.SheetNames.join(', '))
  }
  
  const worksheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
  
  if (jsonData.length < 3) {
    throw new Error('Excel file must contain at least a totals row, header row, and one data row')
  }
  
  // Skip row 1 (totals), read row 2 as headers
  const rawHeaders = jsonData[1] as string[]
  const headers = rawHeaders.map(h => String(h || '').trim())
  const rows = jsonData.slice(2) as any[][] // Data starts from row 3
  
  console.log('Outbound Excel - Available columns:', headers)
  console.log('Looking for columns: Invoice Date (for sorting), Invoice No., Invoice Qty, No. of Box, Invoice Gross Total Value')
  
  const parsedRows: OutboundRow[] = []
  const rejectedRows: Array<{
    rowNumber: number
    data: Record<string, any>
    reason: string
  }> = []
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + 3 // +3 because Excel rows start at 1, row 1 is totals, row 2 is headers
    
    // Convert array to object for easier handling
    const rowObj = headers.reduce((obj, header, index) => {
      obj[header] = row[index]
      return obj
    }, {} as Record<string, any>)
    
    // Skip truly blank rows - but be lenient with partial data
    if (!row || row.length === 0) {
      continue // Skip silently - don't even add to rejected
    }
    
    // Only reject if truly blank (all values are empty/null/undefined)
    if (isBlankRow(rowObj)) {
      continue // Skip silently - don't even add to rejected
    }
    
    try {
      const mappedRow = mapRowToOutbound(row, headers)
      
      // Additional validation after mapping - ensure all required fields exist
      // Note: These should already be set in mapRowToOutbound, but double-check here
      if (mappedRow.invoiceQty === null || mappedRow.invoiceQty === undefined) {
        mappedRow.invoiceQty = 0
      }
      if (mappedRow.boxes === null || mappedRow.boxes === undefined) {
        mappedRow.boxes = 0
      }
      if (mappedRow.grossTotal === null || mappedRow.grossTotal === undefined) {
        mappedRow.grossTotal = 0
      }
      
      // Skip auto-generation - keep invoice number as-is or undefined
      
      // IMPORTANT: Don't reject rows with 0 grossTotal - they might be valid
      // But we should log a warning if critical fields are 0
      if (mappedRow.grossTotal === 0 && mappedRow.invoiceQty === 0 && mappedRow.boxes === 0) {
        // This looks like an empty row, but we'll accept it since it passed blank row check
        console.warn(`Row ${rowNumber}: All numeric fields are 0 - might be empty row`)
      }
      
      // Validate the row with Zod
      const validatedRow = OutboundRowSchema.parse(mappedRow)
      
      // Add all rows - no deduplication (duplicates are counted in qty/boxes/gross calculations)
      parsedRows.push(validatedRow)
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        rejectedRows.push({
          rowNumber,
          data: rowObj,
          reason: `Validation error: ${error.errors.map(e => e.message).join(', ')}`
        })
      } else {
        rejectedRows.push({
          rowNumber,
          data: rowObj,
          reason: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }
  
  if (parsedRows.length === 0 && rejectedRows.length === 0) {
    throw new Error('No data rows found in Excel file')
  }
  
  return {
    validRows: parsedRows,
    rejectedRows
  }
}
