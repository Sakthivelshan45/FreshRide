import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export type ExportEnquiryRow = {
  name: string
  phone: string
  email: string
  message: string
  sourcePage: string
  status: string
  createdAt: string
}

const headers = [
  'Name',
  'Phone',
  'Email',
  'Message',
  'Source/page',
  'Status',
  'Created date',
]

function formatExportDate(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
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

export async function exportEnquiriesPdf(rows: ExportEnquiryRow[], truncated = false) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  await loadTamilFont(doc)
  doc.setFont('NotoSansTamil', 'normal')

  const now = new Date()
  doc.setFontSize(15)
  doc.text('Enquiries', 5, 9)
  doc.setFontSize(7)
  doc.text(`Exported: ${formatExportDate(now)} IST`, 5, 15)
  if (truncated) {
    doc.text('Showing the first 5,000 enquiries; results were truncated.', 5, 20)
  }

  autoTable(doc, {
    head: [headers],
    body: rows.map((row) => [
      row.name,
      row.phone,
      row.email,
      row.message,
      row.sourcePage,
      row.status,
      row.createdAt,
    ]),
    startY: truncated ? 25 : 20,
    margin: { left: 5, right: 5, top: 5, bottom: 5 },
    theme: 'grid',
    styles: {
      font: 'NotoSansTamil',
      fontSize: 7,
      cellPadding: 1.5,
      overflow: 'linebreak',
      valign: 'top',
    },
    headStyles: {
      fillColor: [26, 71, 49],
      textColor: 255,
      fontStyle: 'normal',
    },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 25 },
      2: { cellWidth: 42 },
      3: { cellWidth: 76 },
      4: { cellWidth: 45 },
      5: { cellWidth: 20 },
      6: { cellWidth: 36 },
    },
  })

  doc.save(`enquiries-${getIstFileDate(now)}.pdf`)
}
