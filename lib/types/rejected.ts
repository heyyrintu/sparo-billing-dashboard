export interface RejectedRow {
  rowNumber: number
  data: Record<string, any>
  reason: string
  fileType: 'INBOUND' | 'OUTBOUND'
  filename: string
  uploadDate: Date
}

export interface RejectedRowsLog {
  id: string
  uploadId: string
  filename: string
  fileType: 'INBOUND' | 'OUTBOUND'
  rejectedRows: RejectedRow[]
  totalRows: number
  rejectedCount: number
  createdAt: Date
}

