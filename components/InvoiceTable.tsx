'use client'

import { formatIndianNumber, formatIndianCurrency } from '@/lib/utils'
import type { BillingData, AdditionalActivity } from '@/lib/types'
import { Trash2, Plus } from 'lucide-react'

interface InvoiceTableProps {
  billingData: BillingData
  selectedMonth: string
  additionalActivities: AdditionalActivity[]
  includeManagementFee: boolean
  onAddActivity: () => void
  onRemoveActivity: (id: string) => void
  onUpdateActivity: (id: string, field: 'name' | 'qty' | 'rate', value: string | number) => void
  onToggleManagementFee: (value: boolean) => void
}

export function InvoiceTable({
  billingData,
  selectedMonth,
  additionalActivities,
  includeManagementFee,
  onAddActivity,
  onRemoveActivity,
  onUpdateActivity,
  onToggleManagementFee
}: InvoiceTableProps) {
  // Calculate additional activities total
  const additionalTotal = additionalActivities.reduce((sum, activity) => sum + activity.total, 0)

  // Calculate management fee (10% of total revenue) - optional
  const managementFee = includeManagementFee ? (billingData.totalRevenue + additionalTotal) * 0.10 : 0

  // Calculate subtotal
  const subtotal = billingData.totalRevenue + additionalTotal + managementFee

  // Calculate GST (18%)
  const gst = subtotal * 0.18

  // Calculate grand total
  const grandTotal = subtotal + gst

  // Format the selected month for display
  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month) - 1]}-${year.slice(2)}`
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <h1 className="text-3xl font-bold">Drona Logitech P Ltd.</h1>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-3 border-b border-gray-300">
        <div className="p-3 border-r border-gray-300 bg-gray-100 font-semibold">Customer Name :-</div>
        <div className="p-3 border-r border-gray-300 bg-yellow-100 font-semibold">Spario B2B</div>
        <div className="p-3 bg-gray-100 font-semibold">Date:- <span className="ml-2">{formatMonthDisplay(selectedMonth)}</span></div>
      </div>

      <div className="grid grid-cols-3 border-b border-gray-300">
        <div className="p-3 border-r border-gray-300 bg-gray-100 font-semibold">Location:-</div>
        <div className="p-3 border-r border-gray-300 bg-yellow-100 font-semibold">Gurgaon</div>
        <div className="p-3"></div>
      </div>

      <div className="grid grid-cols-4 border-b-2 border-gray-400">
        <div className="p-3 border-r border-gray-300 bg-gray-100 font-semibold">Particulars.</div>
        <div className="p-3 border-r border-gray-300 bg-gray-100 font-semibold">Type of Products.</div>
        <div className="p-3 border-r border-gray-300 bg-gray-100 font-semibold">Cost/Pc</div>
        <div className="p-3 bg-gray-100 font-semibold">Total Amount</div>
      </div>

      {/* Main Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-100 border-b-2 border-blue-400">
            <th className="p-3 text-left font-bold border-r border-gray-300">Activities</th>
            <th className="p-3 text-left font-bold border-r border-gray-300">Sales Value</th>
            <th className="p-3 text-left font-bold border-r border-gray-300">Minimum Billing</th>
            <th className="p-3 text-right font-bold border-r border-gray-300">Rate %</th>
            <th className="p-3 text-right font-bold">{formatIndianCurrency(billingData.totalRevenue)}</th>
          </tr>
        </thead>
        <tbody>
          {/* Minimum Guarantee Row */}
          <tr className="border-b border-gray-300">
            <td className="p-3 border-r border-gray-300">Minimum Guarantee</td>
            <td className="p-3 border-r border-gray-300"></td>
            <td className="p-3 text-right border-r border-gray-300 font-semibold">{formatIndianNumber(6000000)}</td>
            <td className="p-3 border-r border-gray-300"></td>
            <td className="p-3"></td>
          </tr>

          {/* Total Sale Value Row */}
          <tr className="border-b border-gray-300 bg-gray-50">
            <td className="p-3 border-r border-gray-300 font-semibold">Total Sale Value {formatMonthDisplay(selectedMonth)}</td>
            <td className="p-3 text-right border-r border-gray-300 font-bold">{formatIndianNumber(billingData.grossSale)}</td>
            <td className="p-3 border-r border-gray-300"></td>
            <td className="p-3 border-r border-gray-300"></td>
            <td className="p-3"></td>
          </tr>

          {/* Slab Breakdown Rows */}
          {billingData.slabBreakdown.map((slab, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="p-3 border-r border-gray-300">{formatIndianNumber(parseFloat(slab.range.split(' - ')[0]))}</td>
              <td className="p-3 border-r border-gray-300"></td>
              <td className="p-3 border-r border-gray-300"></td>
              <td className="p-3 text-right border-r border-gray-300">{slab.rate.toFixed(2)}%</td>
              <td className="p-3 text-right font-semibold">{formatIndianCurrency(slab.amount)}</td>
            </tr>
          ))}

          {/* Additional Activities Section */}
          <tr className="bg-blue-100 border-b-2 border-blue-400">
            <th className="p-3 text-left font-bold border-r border-gray-300">Any Additional Activity</th>
            <th className="p-3 text-left font-bold border-r border-gray-300">Qty</th>
            <th className="p-3 text-left font-bold border-r border-gray-300">Rate</th>
            <th className="p-3 text-right font-bold" colSpan={2}>{formatIndianCurrency(additionalTotal)}</th>
          </tr>

          {/* Additional Activity Rows */}
          {additionalActivities.map((activity) => (
            <tr key={activity.id} className="border-b border-gray-300 hover:bg-gray-50">
              <td className="p-2 border-r border-gray-300">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={activity.name}
                    onChange={(e) => onUpdateActivity(activity.id, 'name', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Activity name"
                  />
                  <button
                    onClick={() => onRemoveActivity(activity.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Remove row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
              <td className="p-2 border-r border-gray-300">
                <input
                  type="number"
                  value={activity.qty || ''}
                  onChange={(e) => onUpdateActivity(activity.id, 'qty', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Qty"
                />
              </td>
              <td className="p-2 border-r border-gray-300">
                <input
                  type="number"
                  value={activity.rate || ''}
                  onChange={(e) => onUpdateActivity(activity.id, 'rate', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rate"
                />
              </td>
              <td className="p-2 text-right font-semibold" colSpan={2}>{formatIndianCurrency(activity.total)}</td>
            </tr>
          ))}

          {/* Add Row Button */}
          <tr className="border-b border-gray-300">
            <td colSpan={5} className="p-2">
              <button
                onClick={onAddActivity}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Add Activity</span>
              </button>
            </td>
          </tr>

          {/* Management Fee */}
          <tr className="border-b-2 border-blue-400 bg-blue-50">
            <td className="p-3 border-r border-gray-300">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeManagementFee}
                  onChange={(e) => onToggleManagementFee(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-bold">Management Fee..@ 10%</span>
              </div>
            </td>
            <td className="p-3 border-r border-gray-300"></td>
            <td className="p-3 border-r border-gray-300"></td>
            <td className="p-3 border-r border-gray-300"></td>
            <td className="p-3 text-right font-semibold">{includeManagementFee ? formatIndianCurrency(managementFee) : '-'}</td>
          </tr>

          {/* Subtotal */}
          <tr className="border-b-2 border-gray-400 bg-gray-100">
            <td className="p-3 border-r border-gray-300 font-bold text-lg">Total</td>
            <td className="p-3 border-r border-gray-300"></td>
            <td className="p-3 border-r border-gray-300"></td>
            <td className="p-3 border-r border-gray-300"></td>
            <td className="p-3 text-right font-bold text-lg">{formatIndianCurrency(subtotal)}</td>
          </tr>

          {/* GST */}
          <tr className="border-b-2 border-gray-400 bg-gray-50">
            <td className="p-3 border-r border-gray-300 font-bold">GST. @ 18%</td>
            <td className="p-3 border-r border-gray-300"></td>
            <td className="p-3 border-r border-gray-300"></td>
            <td className="p-3 border-r border-gray-300"></td>
            <td className="p-3 text-right font-semibold">{formatIndianCurrency(gst)}</td>
          </tr>

          {/* Grand Total */}
          <tr className="bg-green-100 border-b-4 border-green-600">
            <td className="p-4 border-r border-gray-300 font-bold text-xl">Grand Total</td>
            <td className="p-4 border-r border-gray-300"></td>
            <td className="p-4 border-r border-gray-300"></td>
            <td className="p-4 border-r border-gray-300"></td>
            <td className="p-4 text-right font-bold text-xl text-green-800">{formatIndianCurrency(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* Remarks Row */}
      <div className="grid grid-cols-5 border-t border-gray-300">
        <div className="p-3 col-span-4 border-r border-gray-300 bg-gray-100 font-semibold">Remarks</div>
        <div className="p-3 bg-gray-100"></div>
      </div>
    </div>
  )
}

