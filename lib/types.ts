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

export interface InboundKPIData {
  invoiceCount: number
  invoiceValue: number
  invoiceQty: number
  boxes: number
  delta: {
    invoiceCount: { absolute: number; percentage: number }
    invoiceValue: { absolute: number; percentage: number }
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

export interface AdditionalActivity {
  id: string
  name: string
  qty: number
  rate: number
  total: number
}

export interface SlabBreakdown {
  range: string
  rate: number
  amount: number
}

export interface BillingData {
  grossSale: number
  minGuarantee: number
  slabBreakdown: SlabBreakdown[]
  totalRevenue: number
}
