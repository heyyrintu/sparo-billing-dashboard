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
  'invoice_no': ['invoice_no', 'invoice_number', 'invoice no', 'invoiceno', 'invoice no.', 'invoice_no.'],
  'invoice_date': ['invoice_date', 'invoice date', 'invoicedate', 'date', 'inv date', 'inv_date'],
  'dispatched_date': ['dispatched_date', 'dispatched date', 'dispatcheddate', 'dispatch_date', 'dispatch date', 'dispatch'],
  'party_name': ['party_name', 'party name', 'partyname', 'customer', 'client', 'party'],
  'invoice_qty': ['invoice_qty', 'invoice qty', 'invoiceqty', 'quantity', 'qty', 'invoice quantity', 'invoice_quantity'],
  'boxes': ['boxes', 'no_of_box', 'no of box', 'noofbox', 'box_count', 'no. of box', 'no.of box', 'box', 'no of boxes'],
  'gross_total': ['invoice_gross_total_value', 'invoice gross total value', 'gross_total', 'gross total', 'grosstotal', 'total_value', 'total value', 'total', 'invoice gross total', 'gross']
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
  
  // Map required columns
  for (const col of REQUIRED_COLUMNS) {
    const index = findColumnIndex(headers, col)
    if (index === -1) {
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
    result.invoiceNo = String(row[columnMap.invoice_no] || '').trim()
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
    result.invoiceQty = coerceNumber(row[columnMap.invoice_qty])
  }
  
  if (columnMap.boxes !== undefined) {
    result.boxes = coerceNumber(row[columnMap.boxes])
  }
  
  if (columnMap.gross_total !== undefined) {
    result.grossTotal = coerceNumber(row[columnMap.gross_total])
  }
  
  return result
}

export function parseOutboundExcel(buffer: Buffer): OutboundRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  
  // Find the "Outward MIS" sheet
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('outward') || 
    name.toLowerCase().includes('outbound') ||
    name.toLowerCase().includes('mis')
  )
  
  if (!sheetName) {
    throw new Error('Could not find "Outward MIS" sheet in Excel file')
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
  
  console.log('Outbound Excel - Available columns:', headers)
  console.log('Looking for columns: Invoice Date (for sorting), Invoice No., Invoice Qty, No. of Box, Invoice Gross Total Value')
  
  const parsedRows: OutboundRow[] = []
  const seenKeys = new Set<string>()
  
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
      const mappedRow = mapRowToOutbound(row, headers)
      
      // Additional validation after mapping - only check required fields
      if (!mappedRow.invoiceNo || 
          mappedRow.invoiceQty === null || 
          mappedRow.invoiceQty === undefined ||
          mappedRow.boxes === null || 
          mappedRow.boxes === undefined ||
          mappedRow.grossTotal === null ||
          mappedRow.grossTotal === undefined) {
        console.log(`Skipping row ${i + 2}: Missing required fields (Invoice No, Invoice Qty, Boxes, or Gross Total)`)
        continue
      }
      
      // Validate the row with Zod
      const validatedRow = OutboundRowSchema.parse(mappedRow)
      
      // Deduplicate on (invoiceNo, invoiceDate)
      const key = `${validatedRow.invoiceNo}-${validatedRow.invoiceDate.toISOString().split('T')[0]}`
      
      if (seenKeys.has(key)) {
        // Replace existing row (latest wins)
        const existingIndex = parsedRows.findIndex(r => 
          r.invoiceNo === validatedRow.invoiceNo && 
          r.invoiceDate.toISOString().split('T')[0] === validatedRow.invoiceDate.toISOString().split('T')[0]
        )
        if (existingIndex !== -1) {
          parsedRows[existingIndex] = validatedRow
        }
      } else {
        seenKeys.add(key)
        parsedRows.push(validatedRow)
      }
      
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
