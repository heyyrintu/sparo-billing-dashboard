'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppSidebar } from '@/components/AppSidebar'
import { InvoiceTable } from '@/components/InvoiceTable'
import { generateInvoicePDF } from '@/lib/billing/pdfGenerator'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BillingData, AdditionalActivity } from '@/lib/types'

export function Billing() {
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [includeManagementFee, setIncludeManagementFee] = useState(false)
  const [additionalActivities, setAdditionalActivities] = useState<AdditionalActivity[]>([
    { id: '1', name: 'BARCODE LABELS', qty: 8499, rate: 2, total: 16998 },
    { id: '2', name: 'ADOC MP', qty: 115, rate: 750, total: 86250 },
    { id: '3', name: 'OT HOURS', qty: 0, rate: 0, total: 0 },
    { id: '4', name: 'OT NIGHT FOOD', qty: 36, rate: 80, total: 2880 }
  ])

  // Initialize with current month
  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    setSelectedMonth(`${year}-${month}`)
  }, [])

  // Fetch billing data when month changes
  useEffect(() => {
    if (!selectedMonth) return

    const fetchBillingData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/billing?month=${selectedMonth}`)
        
        if (response.ok) {
          const data = await response.json()
          setBillingData(data)
        } else {
          console.error('Failed to fetch billing data:', response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch billing data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBillingData()
  }, [selectedMonth])

  // Generate month options (last 12 months + current month)
  const getMonthOptions = () => {
    const options = []
    const today = new Date()
    for (let i = 0; i <= 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      options.push({ value, label })
    }
    return options
  }

  const handleAddActivity = useCallback(() => {
    const newActivity: AdditionalActivity = {
      id: Date.now().toString(),
      name: '',
      qty: 0,
      rate: 0,
      total: 0
    }
    setAdditionalActivities(prev => [...prev, newActivity])
  }, [])

  const handleRemoveActivity = useCallback((id: string) => {
    setAdditionalActivities(prev => prev.filter(activity => activity.id !== id))
  }, [])

  const handleUpdateActivity = useCallback((id: string, field: 'name' | 'qty' | 'rate', value: string | number) => {
    setAdditionalActivities(prev => prev.map(activity => {
      if (activity.id !== id) return activity

      const updated = { ...activity, [field]: value }
      
      // Recalculate total
      if (field === 'qty' || field === 'rate') {
        updated.total = updated.qty * updated.rate
      }

      return updated
    }))
  }, [])

  const handleDownloadPDF = useCallback(() => {
    if (!billingData) return
    generateInvoicePDF(billingData, selectedMonth, additionalActivities, includeManagementFee)
  }, [billingData, selectedMonth, additionalActivities, includeManagementFee])

  if (loading || !billingData) {
    return (
      <div className={cn(
        "flex w-full flex-1 flex-col overflow-hidden md:flex-row",
        "h-screen"
      )}>
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-y-auto items-center justify-center">
          <div className="text-muted-foreground">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E01E1F]"></div>
                <p>Loading billing data...</p>
              </div>
            ) : (
              <p>No billing data available</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex w-full flex-1 flex-col overflow-hidden md:flex-row",
      "h-screen"
    )}>
      <AppSidebar />
      
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-4 md:p-8 dark:border-neutral-700 dark:bg-neutral-900">
          {/* Header with Month Picker and Download Button */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Billing Invoice</h1>
              <p className="text-gray-600">Generate and download monthly invoices</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Month Picker */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Month:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E01E1F]/20 focus:border-[#E01E1F] transition-all cursor-pointer"
                >
                  {getMonthOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#E01E1F] to-[#FEA519] text-white hover:opacity-90 transition-all font-semibold rounded-lg shadow-md hover:shadow-lg"
              >
                <Download className="h-5 w-5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="flex-1 overflow-auto">
            <InvoiceTable
              billingData={billingData}
              selectedMonth={selectedMonth}
              additionalActivities={additionalActivities}
              includeManagementFee={includeManagementFee}
              onAddActivity={handleAddActivity}
              onRemoveActivity={handleRemoveActivity}
              onUpdateActivity={handleUpdateActivity}
              onToggleManagementFee={setIncludeManagementFee}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

