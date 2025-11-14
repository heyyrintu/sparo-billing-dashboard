import * as XLSX from 'xlsx'
import { z } from 'zod'
import { normalizeColumnName, coerceDate, coerceNumber, isBlankRow } from '@/lib/utils'
import { InboundRowSchema, type InboundRow } from './validation'

const REQUIRED_COLUMNS = [
  'received_date',
  'invoice_no',
  'invoice_value',
  'invoice_qty',
  'boxes'
]

const COLUMN_MAPPINGS: Record<string, string[]> = {
  'received_date': ['received date', 'received_date', 'receiveddate', 'inward date', 'inwarddate', 'grn_date', 'grn date', 'grndate', 'date', 'received'],
  'invoice_no': [
    'stn_no./invoice_no.',
    'stn_no./invoice_no',
    'stn_no/invoice_no',
    'stn_no_invoice_no',
    'stn_no',
    'invoice_no',
    'invoice no',
    'invoice_no.',
    'invoice number',
    'invoice_number',
    'stn_invoice_no',
    'stn no./invoice no.',
    'stn no./invoice no',
    'stn no/invoice no',
    'stn no invoice no',
  ],
  'invoice_value': [
    'invoice_value',
    'invoice value',
    'invoice_value_(rs)',
    'invoice_value_in_inr',
    'value',
    'total_value',
    'total value',
    'invoice_total_value',
    'invoice total value',
  ],
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
  
  // Map optional columns
  const optionalColumns = ['party_name', 'type', 'article_no']
  for (const col of optionalColumns) {
    const index = findColumnIndex(headers, col)
    if (index !== -1) {
      columnMap[col] = index
    }
  }
  
  const result: any = {}
  
  // Extract and coerce values
  // Use received date from the dedicated column, fallback to current date if missing
  if (row[columnMap.received_date]) {
    const parsedDate = coerceDate(row[columnMap.received_date])
    result.receivedDate = parsedDate || new Date() // Fall back to current date if parsing fails
  } else {
    result.receivedDate = new Date()
  }

  if (columnMap.invoice_no !== undefined) {
    const invoiceRaw = row[columnMap.invoice_no]
    const invoice = invoiceRaw !== undefined && invoiceRaw !== null ? String(invoiceRaw).trim() : ''
    result.invoiceNo = invoice || undefined
  }

  if (columnMap.invoice_value !== undefined) {
    const rawValue = row[columnMap.invoice_value]
    result.invoiceValue = coerceNumber(rawValue)
    if (result.invoiceValue === null) {
      result.invoiceValue = 0
    }
  } else {
    result.invoiceValue = 0
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
  
  if (columnMap.type !== undefined) {
    result.type = String(row[columnMap.type] || '').trim() || undefined
  }
  
  if (columnMap.article_no !== undefined) {
    result.articleNo = String(row[columnMap.article_no] || '').trim() || undefined
  }
  
  return result
}

export interface ParseResult {
  validRows: InboundRow[]
  rejectedRows: Array<{
    rowNumber: number
    data: Record<string, any>
    reason: string
  }>
}

export function parseInboundExcel(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  
  // Strictly require the "PIPO & BIBO Inward" sheet (case-insensitive match)
  const targetSheetName = 'pipo & bibo inward'
  const sheetName = workbook.SheetNames.find(
    (name) => name.trim().toLowerCase() === targetSheetName
  )
  
  if (!sheetName) {
    throw new Error('Could not find the "PIPO & BIBO Inward" sheet in the Excel file')
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
  console.log('Looking for columns: Received Date, STN No./Invoice No., Invoice Value, Invoice Qty, Bags/Box')
  
  const parsedRows: InboundRow[] = []
  const rejectedRows: Array<{
    rowNumber: number
    data: Record<string, any>
    reason: string
  }> = []
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + 2 // +2 because Excel rows start at 1 and we have header row
    
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
      const mappedRow = mapRowToInbound(row, headers)
      
      // Additional validation after mapping - be more lenient
      // Ensure numeric fields default to 0 if they're still null
      if (mappedRow.invoiceQty === null || mappedRow.invoiceQty === undefined) {
        mappedRow.invoiceQty = 0
      }
      if (mappedRow.boxes === null || mappedRow.boxes === undefined) {
        mappedRow.boxes = 0
      }
      
      // Ensure receivedDate is never null (fallback to current date)
      if (!mappedRow.receivedDate || !(mappedRow.receivedDate instanceof Date)) {
        mappedRow.receivedDate = new Date()
      }
      
      // Validate the row with Zod
      const validatedRow = InboundRowSchema.parse(mappedRow)
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
