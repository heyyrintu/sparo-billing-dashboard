import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatIndianNumber(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(amount)
}

export function formatCrores(amount: number): string {
  const crores = amount / 10000000
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(crores) + ' CR'
}

/**
 * Format a date as YYYY-MM-DD in local timezone (not UTC)
 * This prevents timezone conversion issues when converting dates to strings
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function calculateDelta(current: number, previous: number): {
  absolute: number
  percentage: number
} {
  const absolute = current - previous
  const percentage = previous === 0 ? 0 : (absolute / previous) * 100
  
  return { absolute, percentage }
}

export function getPreviousPeriodDates(from: Date, to: Date): { from: Date; to: Date } {
  const duration = to.getTime() - from.getTime()
  const toPrevious = new Date(from.getTime() - 1)
  const fromPrevious = new Date(toPrevious.getTime() - duration)
  
  return { from: fromPrevious, to: toPrevious }
}

export function generateChecksum(buffer: Buffer): string {
  const crypto = require('crypto')
  return crypto.createHash('md5').update(buffer).digest('hex')
}

export function normalizeColumnName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '_')
}

export function coerceDate(value: any): Date | null {
  if (!value) return null
  
  if (value instanceof Date) return value
  
  // Handle Excel serial date numbers
  if (typeof value === 'number') {
    // Excel dates are stored as days since 1900-01-01
    // But there's a leap year bug in Excel where 1900 is treated as a leap year
    // Dates >= 60 need adjustment (March 1, 1900 and later)
    const excelEpoch = new Date(1899, 11, 30) // December 30, 1899
    const date = new Date(excelEpoch.getTime() + value * 86400000) // 86400000 ms per day
    if (isNaN(date.getTime())) {
      console.warn(`Failed to parse Excel date number: ${value}`)
      return null
    }
    return date
  }
  
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return null
    
    // Try to parse DD-MM-YYYY format (e.g., "19-10-2024")
    const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/)
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1], 10)
      const month = parseInt(ddmmyyyyMatch[2], 10) - 1 // JS months are 0-indexed
      const year = parseInt(ddmmyyyyMatch[3], 10)
      const date = new Date(year, month, day)
      if (isNaN(date.getTime())) {
        console.warn(`Failed to parse DD-MM-YYYY date: ${trimmed}`)
        return null
      }
      return date
    }
    
    // Try standard date parsing
    const date = new Date(trimmed)
    if (isNaN(date.getTime())) {
      console.warn(`Failed to parse date string: ${trimmed}`)
      return null
    }
    return date
  }
  
  return null
}

export function coerceNumber(value: any): number | null {
  // Handle empty values
  if (value === null || value === undefined || value === '') return null
  
  // Handle string values
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '' || trimmed === '-' || trimmed.toLowerCase() === 'na' || trimmed.toLowerCase() === 'n/a') {
      return null
    }
    
    // Remove currency symbols, commas, spaces
    const cleaned = trimmed
      .replace(/[₹$,]/g, '') // Remove currency symbols and commas
      .replace(/\s/g, '') // Remove spaces
      .replace(/\(/g, '-') // Handle negative in parentheses: (100) -> -100
      .replace(/\)/g, '')
    
    // Try to parse
    const num = Number(cleaned)
    if (!isNaN(num)) {
      return num
    }
    
    // Try to extract number from text like "100 units" or "Rs. 100"
    const numberMatch = cleaned.match(/[-]?\d+\.?\d*/)
    if (numberMatch) {
      return Number(numberMatch[0])
    }
    
    // If still can't parse, return null
    return null
  }
  
  // Handle number values
  if (typeof value === 'number') {
    return isNaN(value) ? null : value
  }
  
  // Handle boolean (convert to 1 or 0)
  if (typeof value === 'boolean') {
    return value ? 1 : 0
  }
  
  // Handle Excel errors (like #N/A, #VALUE!, etc.)
  if (typeof value === 'string' && value.startsWith('#')) {
    return null
  }
  
  // Try direct conversion
  const num = Number(value)
  return isNaN(num) ? null : num
}

export function isBlankRow(row: Record<string, any>): boolean {
  const values = Object.values(row)
  // Consider row blank only if all values are truly empty
  return values.length === 0 || values.every(value => {
    if (value === null || value === undefined) return true
    if (value === '') return true
    if (typeof value === 'string' && value.trim() === '') return true
    if (typeof value === 'number' && isNaN(value)) return true
    return false
  })
}

export function hasRequiredFields(row: Record<string, any>, requiredFields: string[]): boolean {
  return requiredFields.every(field => {
    const value = row[field]
    return value !== null && 
           value !== undefined && 
           value !== '' && 
           !(typeof value === 'string' && value.trim() === '') &&
           !(typeof value === 'number' && isNaN(value))
  })
}
