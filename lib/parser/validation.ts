import { z } from 'zod'

export const OutboundRowSchema = z.object({
  invoiceNo: z.string().optional(), // Optional - blank invoices are included in calculations but not counted
  invoiceDate: z.date(),
  dispatchedDate: z.date().optional(),
  partyName: z.string().optional(),
  invoiceQty: z.number().min(0, 'Invoice Qty must be non-negative').default(0),
  boxes: z.number().min(0, 'Boxes must be non-negative').default(0),
  grossTotal: z.number().min(0, 'Gross Total must be non-negative').default(0),
})

export const InboundRowSchema = z.object({
  receivedDate: z.date(),
  invoiceNo: z.string().optional(),
  invoiceValue: z.number().min(0, 'Invoice Value must be non-negative').default(0),
  partyName: z.string().optional(),
  invoiceQty: z.number().min(0, 'Invoice Qty must be non-negative').default(0),
  boxes: z.number().min(0, 'Boxes must be non-negative').default(0),
  type: z.string().optional(),
  articleNo: z.string().optional(),
})

// Note: File class only exists in browser, so we check if it's available
export const UploadRequestSchema = z.object({
  file: typeof File !== 'undefined' ? z.instanceof(File, { message: 'File is required' }) : z.any(),
  fileType: z.enum(['inbound', 'outbound']),
})

export const KPIParamsSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  mode: z.enum(['marginal', 'flat']).default('marginal'),
})

export const DailyParamsSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  metric: z.enum(['gross', 'revenue']).default('gross'),
  mode: z.enum(['marginal', 'flat']).default('marginal'),
})

export type OutboundRow = z.infer<typeof OutboundRowSchema>
export type InboundRow = z.infer<typeof InboundRowSchema>
export type UploadRequest = z.infer<typeof UploadRequestSchema>
export type KPIParams = z.infer<typeof KPIParamsSchema>
export type DailyParams = z.infer<typeof DailyParamsSchema>
