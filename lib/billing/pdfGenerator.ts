import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { BillingData, AdditionalActivity } from '@/lib/types'
import { formatIndianNumber, formatIndianCurrency } from '@/lib/utils'

export function generateInvoicePDF(
  billingData: BillingData,
  selectedMonth: string,
  additionalActivities: AdditionalActivity[],
  includeManagementFee: boolean = false
) {
  const doc = new jsPDF()

  // Format month for display
  const [year, month] = selectedMonth.split('-')
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthDisplay = `${monthNames[parseInt(month) - 1]}-${year.slice(2)}`

  // Calculate totals
  const additionalTotal = additionalActivities.reduce((sum, activity) => sum + activity.total, 0)
  const managementFee = includeManagementFee ? (billingData.totalRevenue + additionalTotal) * 0.10 : 0
  const subtotal = billingData.totalRevenue + additionalTotal + managementFee
  const gst = subtotal * 0.18
  const grandTotal = subtotal + gst

  // Header
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, 210, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Drona Logitech P Ltd.', 14, 16)

  // Customer Info
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Customer Name:', 14, 32)
  doc.setFont('helvetica', 'normal')
  doc.text('Spario B2B', 60, 32)
  doc.setFont('helvetica', 'bold')
  doc.text('Date:', 150, 32)
  doc.setFont('helvetica', 'normal')
  doc.text(monthDisplay, 170, 32)

  doc.setFont('helvetica', 'bold')
  doc.text('Location:', 14, 38)
  doc.setFont('helvetica', 'normal')
  doc.text('Gurgaon', 60, 38)

  // Main table data
  const tableData: any[] = []

  // Header row
  tableData.push([
    { content: 'Activities', styles: { fontStyle: 'bold', fillColor: [219, 234, 254] } },
    { content: 'Sales Value', styles: { fontStyle: 'bold', fillColor: [219, 234, 254] } },
    { content: 'Minimum Billing', styles: { fontStyle: 'bold', fillColor: [219, 234, 254] } },
    { content: 'Rate %', styles: { fontStyle: 'bold', fillColor: [219, 234, 254], halign: 'right' } },
    { content: formatIndianCurrency(billingData.totalRevenue), styles: { fontStyle: 'bold', fillColor: [219, 234, 254], halign: 'center' } }
  ])

  // Minimum Guarantee
  tableData.push([
    'Minimum Guarantee',
    '',
    formatIndianNumber(6000000),
    '',
    ''
  ])

  // Total Sale Value
  tableData.push([
    { content: `Total Sale Value ${monthDisplay}`, styles: { fontStyle: 'bold' } },
    { content: formatIndianNumber(billingData.grossSale), styles: { fontStyle: 'bold', halign: 'right' } },
    '',
    '',
    ''
  ])

  // Slab breakdown
  billingData.slabBreakdown.forEach((slab) => {
    tableData.push([
      formatIndianNumber(parseFloat(slab.range.split(' - ')[0])),
      '',
      '',
      `${slab.rate.toFixed(2)}%`,
      { content: formatIndianCurrency(slab.amount), halign: 'center' }
    ])
  })

  // Additional Activities Header
  tableData.push([
    { content: 'Any Additional Activity', styles: { fontStyle: 'bold', fillColor: [219, 234, 254] } },
    { content: 'Qty', styles: { fontStyle: 'bold', fillColor: [219, 234, 254], halign: 'center' } },
    { content: 'Rate', styles: { fontStyle: 'bold', fillColor: [219, 234, 254], halign: 'right' } },
    '',
    { content: formatIndianCurrency(additionalTotal), styles: { fontStyle: 'bold', fillColor: [219, 234, 254], halign: 'center' } }
  ])

  // Additional Activities
  additionalActivities.forEach((activity) => {
    tableData.push([
      activity.name || '',
      { content: activity.qty.toString(), halign: 'center' },
      { content: activity.rate.toString(), halign: 'right' },
      '',
      { content: formatIndianCurrency(activity.total), halign: 'center' }
    ])
  })

  // Management Fee (only if included)
  if (includeManagementFee) {
    tableData.push([
      { content: 'Management Fee..@ 10%', styles: { fontStyle: 'bold', fillColor: [239, 246, 255] } },
      '',
      '',
      '',
      { content: formatIndianCurrency(managementFee), styles: { halign: 'center' } }
    ])
  }

  // Total
  tableData.push([
    { content: 'Total', styles: { fontStyle: 'bold', fontSize: 8, fillColor: [243, 244, 246] } },
    '',
    '',
    '',
    { content: formatIndianCurrency(subtotal), styles: { fontStyle: 'bold', fontSize: 7, halign: 'center', fillColor: [243, 244, 246] } }
  ])

  // GST
  tableData.push([
    { content: 'GST. @ 18%', styles: { fontStyle: 'bold', fontSize: 7 } },
    '',
    '',
    '',
    { content: formatIndianCurrency(gst), styles: { fontSize: 6.5, halign: 'center' } }
  ])

  // Grand Total
  tableData.push([
    { content: 'Grand Total', styles: { fontStyle: 'bold', fontSize: 9, fillColor: [220, 252, 231] } },
    '',
    '',
    '',
    { content: formatIndianCurrency(grandTotal), styles: { fontStyle: 'bold', fontSize: 8, halign: 'center', fillColor: [220, 252, 231], textColor: [22, 101, 52] } }
  ])

  // Generate table
  autoTable(doc, {
    startY: 45,
    head: [],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 2.5,
      overflow: 'linebreak',
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 50, halign: 'left', fontSize: 7 }, // Activities - wider for long names
      1: { cellWidth: 38, halign: 'right', fontSize: 6.5 }, // Sales Value - smaller font for long numbers
      2: { cellWidth: 32, halign: 'right', fontSize: 6.5 }, // Minimum Billing
      3: { cellWidth: 18, halign: 'right', fontSize: 7 }, // Rate %
      4: { cellWidth: 42, halign: 'center', fontSize: 6.5 } // Total Amount - centered
    },
    margin: { left: 14, right: 14 }
  })

  // Save the PDF
  const filename = `Spario_Invoice_${monthDisplay}.pdf`
  doc.save(filename)
}

