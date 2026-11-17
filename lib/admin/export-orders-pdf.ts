import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { OrderExportFilters } from '@/lib/admin/orders-export'
import { extractEmbeddedLogoPngBase64, ORDER_EXPORT_BRAND } from '@/lib/admin/order-export-branding'

export type ExportOrderRow = {
  orderNumber: string
  customerName: string
  phone: string
  email: string
  addressAndPin: string
  items: string
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  subtotal: number
  discount: number
  shipping: number
  total: number
  courier: string
  trackingNumber: string
  createdAt: string
}

const headers = [
  'Order number',
  'Customer name',
  'Phone',
  'Email',
  'Address and PIN',
  'Items',
  'Payment method',
  'Payment status',
  'Order status',
  'Subtotal',
  'Discount',
  'Shipping',
  'Total',
  'Courier',
  'AWB/tracking number',
  'Created date',
]

function formatRupees(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatExportDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-IN', {
    ...options,
    timeZone: 'Asia/Kolkata',
  }).format(date)
}

function getIstFileDate(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${value('year')}-${value('month')}-${value('day')}`
}

async function loadTamilFont(doc: jsPDF) {
  const response = await fetch('/fonts/NotoSansTamil.ttf')
  if (!response.ok) throw new Error('Could not load the Tamil font for the PDF.')

  const bytes = new Uint8Array(await response.arrayBuffer())
  let binary = ''
  const chunkSize = 0x8000
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }

  doc.addFileToVFS('NotoSansTamil.ttf', btoa(binary))
  doc.addFont('NotoSansTamil.ttf', 'NotoSansTamil', 'normal')
}

async function loadBrandLogo() {
  const response = await fetch(ORDER_EXPORT_BRAND.logoPath)
  if (!response.ok) throw new Error('Could not load the company logo for the PDF.')
  const svg = await response.text()
  return `data:image/png;base64,${extractEmbeddedLogoPngBase64(svg)}`
}

function describeFilters(filters: OrderExportFilters) {
  return [
    filters.status ? `Status: ${filters.status}` : '',
    filters.from ? `From: ${filters.from}` : '',
    filters.to ? `To: ${filters.to}` : '',
    filters.search ? `Search: ${filters.search}` : '',
  ].filter(Boolean).join(' | ') || 'None'
}

function drawReportHeader(
  doc: jsPDF,
  logo: string,
  filters: OrderExportFilters,
  exportedAt: Date,
  truncated: boolean
) {
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setFillColor(26, 71, 49)
  doc.rect(0, 0, pageWidth, 2, 'F')
  doc.addImage(logo, 'PNG', 8, 6, 21, 15.2)

  doc.setTextColor(26, 71, 49)
  doc.setFontSize(13)
  doc.text(ORDER_EXPORT_BRAND.name, 34, 11)
  doc.setTextColor(74, 124, 89)
  doc.setFontSize(6)
  doc.text(ORDER_EXPORT_BRAND.tagline, 34, 16)
  doc.setTextColor(71, 85, 105)
  doc.setFontSize(5.5)
  doc.text(ORDER_EXPORT_BRAND.address, 34, 21, { maxWidth: pageWidth - 105 })
  doc.text(
    `${ORDER_EXPORT_BRAND.phones.join(' | ')}  |  ${ORDER_EXPORT_BRAND.email}`,
    34,
    26,
    { maxWidth: pageWidth - 105 }
  )

  doc.setTextColor(26, 71, 49)
  doc.setFontSize(9)
  doc.text('ORDER REPORT', pageWidth - 8, 11, { align: 'right' })
  doc.setTextColor(71, 85, 105)
  doc.setFontSize(5.5)
  doc.text(
    `Exported: ${formatExportDate(exportedAt, { dateStyle: 'medium', timeStyle: 'short' })} IST`,
    pageWidth - 8,
    17,
    { align: 'right' }
  )

  doc.setDrawColor(220, 229, 223)
  doc.setLineWidth(0.3)
  doc.line(8, 30, pageWidth - 8, 30)
  doc.setTextColor(71, 85, 105)
  doc.setFontSize(5.8)
  doc.text(`Filters: ${describeFilters(filters)}`, 8, 35, { maxWidth: pageWidth - 16 })
  if (truncated) {
    doc.setTextColor(161, 98, 7)
    doc.text('Showing the first 5,000 matching orders; results were truncated.', 8, 40)
  }
}

export async function exportOrdersPdf(
  rows: ExportOrderRow[],
  filters: OrderExportFilters,
  truncated = false
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  await loadTamilFont(doc)
  doc.setFont('NotoSansTamil', 'normal')
  const logo = await loadBrandLogo()
  const exportedAt = new Date()
  const tableTop = truncated ? 46 : 41

  const currency = (amount: number) => formatRupees(amount)
  autoTable(doc, {
    head: [headers],
    body: rows.map((row) => [
      row.orderNumber,
      row.customerName,
      row.phone,
      row.email,
      row.addressAndPin,
      row.items,
      row.paymentMethod,
      row.paymentStatus,
      row.orderStatus,
      currency(row.subtotal),
      currency(row.discount),
      currency(row.shipping),
      currency(row.total),
      row.courier,
      row.trackingNumber,
      row.createdAt,
    ]),
    startY: tableTop,
    margin: { left: 5, right: 5, top: tableTop, bottom: 5 },
    theme: 'grid',
    styles: {
      font: 'NotoSansTamil',
      fontSize: 5,
      cellPadding: 1.1,
      overflow: 'linebreak',
      valign: 'top',
      lineColor: [220, 229, 223],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [26, 71, 49],
      textColor: 255,
      fontStyle: 'normal',
      fontSize: 5.5,
    },
    alternateRowStyles: {
      fillColor: [245, 248, 246],
    },
    willDrawPage: () => {
      drawReportHeader(doc, logo, filters, exportedAt, truncated)
    },
    columnStyles: {
      0: { cellWidth: 16 },
      1: { cellWidth: 20 },
      2: { cellWidth: 15 },
      3: { cellWidth: 27 },
      4: { cellWidth: 31 },
      5: { cellWidth: 27 },
      6: { cellWidth: 15 },
      7: { cellWidth: 15 },
      8: { cellWidth: 15 },
      9: { cellWidth: 14 },
      10: { cellWidth: 13 },
      11: { cellWidth: 13 },
      12: { cellWidth: 14 },
      13: { cellWidth: 13 },
      14: { cellWidth: 20 },
      15: { cellWidth: 19 },
    },
  })

  doc.save(`orders-${getIstFileDate(exportedAt)}.pdf`)
}
