import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}

export interface KPIData {
  grossSale: number
  revenue: number
  invoiceCount: number
  invoiceQty: number
  boxes: number
  avgTicket: number
  grossPerUnit: number
  delta: {
    grossSale: { absolute: number; percentage: number }
    revenue: { absolute: number; percentage: number }
    invoiceCount: { absolute: number; percentage: number }
    invoiceQty: { absolute: number; percentage: number }
    boxes: { absolute: number; percentage: number }
  }
}

export interface DailyData {
  date: string
  grossSale: number
  revenue: number
  invoiceCount: number
  invoiceQty: number
  boxes: number
}

export interface UploadLogEntry {
  id: string
  filename: string
  fileType: 'INBOUND' | 'OUTBOUND'
  uploadedBy: string
  rowCount: number
  checksum: string
  status: 'SUCCESS' | 'FAILED'
  message?: string
  createdAt: Date
}
