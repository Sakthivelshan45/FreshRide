import ExcelJS from 'exceljs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { extractEmbeddedLogoPngBase64, ORDER_EXPORT_BRAND } from '@/lib/admin/order-export-branding'
import {
  buildOrderExportSearchCondition,
  EMPTY_ORDER_EXPORT_FILTERS,
  getOrderExportDateBounds,
  parseOrderExportFilters,
} from '@/lib/admin/orders-export'
import type { ExportOrderRow } from '@/lib/admin/export-orders-pdf'
import type { OrderExportFilters } from '@/lib/admin/orders-export'

const MAX_ROWS = 5000
const QUERY_PAGE_SIZE = 1000
const ORDER_SELECT =
  'order_number, customer_name, customer_phone, customer_email, shipping_address, status, fulfillment_status, payment_method, subtotal, discount, shipping, total, tracking_number, created_at, order_items(quantity, variant_name, unit_price)'

export const runtime = 'nodejs'

type SourceOrder = {
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string
  shipping_address: unknown
  status: string
  fulfillment_status: string
  payment_method: string
  subtotal: number
  discount: number
  shipping: number
  total: number
  tracking_number: string | null
  created_at: string
  order_items: { quantity: number; variant_name: string; unit_price: number }[] | null
}

function getAddressValue(address: unknown, key: string) {
  if (typeof address !== 'object' || address === null || Array.isArray(address)) return ''
  const value = (address as Record<string, unknown>)[key]
  return typeof value === 'string' ? value.trim() : ''
}

function formatIstDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

function getIstDate(value: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value)
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

function getPaymentStatus(status: string) {
  if (status === 'paid') return 'Paid'
  if (status === 'failed') return 'Failed'
  return 'Pending'
}

function toExportRow(order: SourceOrder): ExportOrderRow {
  const address = [
    getAddressValue(order.shipping_address, 'line1'),
    getAddressValue(order.shipping_address, 'line2'),
    getAddressValue(order.shipping_address, 'city'),
    getAddressValue(order.shipping_address, 'state'),
    getAddressValue(order.shipping_address, 'pincode'),
  ].filter(Boolean).join(', ')

  return {
    orderNumber: order.order_number,
    customerName: order.customer_name,
    phone: order.customer_phone,
    email: order.customer_email,
    addressAndPin: address,
    items: (order.order_items ?? [])
      .map((item) => `${item.variant_name} × ${item.quantity}`)
      .join('; '),
    paymentMethod: order.payment_method === 'cod' ? 'COD' : 'Razorpay',
    paymentStatus: getPaymentStatus(order.status),
    orderStatus: order.fulfillment_status,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping: Number(order.shipping),
    total: Number(order.total),
    courier: '',
    trackingNumber: order.tracking_number ?? '',
    createdAt: formatIstDate(order.created_at),
  }
}

const orderColumns: {
  header: string
  key: keyof ExportOrderRow
  width: number
  numFmt?: string
}[] = [
  { header: 'Order number', key: 'orderNumber', width: 16 },
  { header: 'Customer name', key: 'customerName', width: 21 },
  { header: 'Phone', key: 'phone', width: 14 },
  { header: 'Email', key: 'email', width: 25 },
  { header: 'Address and PIN', key: 'addressAndPin', width: 34 },
  { header: 'Items', key: 'items', width: 28 },
  { header: 'Payment method', key: 'paymentMethod', width: 14 },
  { header: 'Payment status', key: 'paymentStatus', width: 14 },
  { header: 'Order status', key: 'orderStatus', width: 14 },
  { header: 'Subtotal', key: 'subtotal', width: 12, numFmt: '"₹"#,##0.00' },
  { header: 'Discount', key: 'discount', width: 12, numFmt: '"₹"#,##0.00' },
  { header: 'Shipping', key: 'shipping', width: 12, numFmt: '"₹"#,##0.00' },
  { header: 'Total', key: 'total', width: 12, numFmt: '"₹"#,##0.00' },
  { header: 'Courier', key: 'courier', width: 13 },
  { header: 'AWB/tracking number', key: 'trackingNumber', width: 20 },
  { header: 'Created date', key: 'createdAt', width: 20 },
]

function describeFilters(filters: OrderExportFilters) {
  return [
    filters.status ? `Status: ${filters.status}` : '',
    filters.from ? `From: ${filters.from}` : '',
    filters.to ? `To: ${filters.to}` : '',
    filters.search ? `Search: ${filters.search}` : '',
  ].filter(Boolean).join(' | ') || 'None'
}

function formatExportDate(value: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

function makeWorkbook(
  rows: ExportOrderRow[],
  filters: OrderExportFilters,
  exportedAt: Date,
  logoBase64: string
) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = ORDER_EXPORT_BRAND.name
  workbook.lastModifiedBy = ORDER_EXPORT_BRAND.name
  const sheet = workbook.addWorksheet('Orders')

  sheet.columns = orderColumns.map(({ key, width, numFmt }) => ({
    key,
    width,
    ...(numFmt ? { style: { numFmt } } : {}),
  }))
  sheet.mergeCells('A1:B4')
  sheet.mergeCells('C1:P1')
  sheet.mergeCells('C2:P2')
  sheet.mergeCells('C3:P3')
  sheet.mergeCells('C4:P4')
  sheet.mergeCells('A5:P5')
  sheet.getCell('C1').value = ORDER_EXPORT_BRAND.name
  sheet.getCell('C1').font = { name: 'Aptos Display', size: 18, bold: true, color: { argb: 'FF1A4731' } }
  sheet.getCell('C2').value = ORDER_EXPORT_BRAND.tagline
  sheet.getCell('C2').font = { name: 'Aptos', size: 10, italic: true, color: { argb: 'FF4A7C59' } }
  sheet.getCell('C3').value = ORDER_EXPORT_BRAND.address
  sheet.getCell('C3').font = { name: 'Aptos', size: 9, color: { argb: 'FF475569' } }
  sheet.getCell('C4').value =
    `${ORDER_EXPORT_BRAND.phones.join(' | ')}  |  ${ORDER_EXPORT_BRAND.email}`
  sheet.getCell('C4').font = { name: 'Aptos', size: 9, color: { argb: 'FF475569' } }
  sheet.getCell('A5').value =
    `Exported: ${formatExportDate(exportedAt)} IST  |  Filters: ${describeFilters(filters)}`
  sheet.getRow(5).height = 30
  sheet.getRow(5).font = { name: 'Aptos', size: 9, color: { argb: 'FF1A4731' } }
  sheet.getRow(5).alignment = { vertical: 'middle', wrapText: true }
  sheet.getRow(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF4EF' } }

  orderColumns.forEach(({ header }, index) => {
    const cell = sheet.getCell(6, index + 1)
    cell.value = header
    cell.font = { name: 'Aptos', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A4731' } }
  })
  sheet.getRow(1).height = 28
  sheet.getRow(2).height = 20
  sheet.getRow(3).height = 22
  sheet.getRow(4).height = 20
  sheet.getRow(6).height = 34
  sheet.addRows(rows)
  rows.forEach((rowData, index) => {
    const row = sheet.getRow(index + 7)
    const estimatedLines = Math.max(
      1,
      ...orderColumns.map(({ key, width }) =>
        Math.ceil(String(rowData[key] ?? '').length / width)
      )
    )
    row.height = Math.min(72, Math.max(28, estimatedLines * 14))
    row.alignment = { vertical: 'top', wrapText: true }
    if (index % 2 === 1) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F8F6' } }
    }
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = { bottom: { style: 'hair', color: { argb: 'FFDCE5DF' } } }
    })
  })
  sheet.autoFilter = { from: 'A6', to: 'P6' }
  sheet.views = [{ state: 'frozen', ySplit: 6, zoomScale: 80, showGridLines: false }]
  sheet.properties.defaultRowHeight = 20
  sheet.pageSetup = {
    paperSize: 9,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printTitlesRow: '6:6',
    printArea: `A1:P${rows.length + 6}`,
  }
  const logoId = workbook.addImage({ base64: logoBase64, extension: 'png' })
  sheet.addImage(logoId, { tl: { col: 0, row: 0 }, ext: { width: 88, height: 64 } })
  return workbook
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const format = params.get('format') ?? 'xlsx'
  if (format !== 'xlsx' && format !== 'json') {
    return NextResponse.json({ error: 'Unsupported export format.' }, { status: 400 })
  }

  const parsedFilters = parseOrderExportFilters(params)
  if (parsedFilters.error) {
    return NextResponse.json({ error: parsedFilters.error }, { status: 400 })
  }
  const filters = parsedFilters.filters ?? EMPTY_ORDER_EXPORT_FILTERS

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError && authError.name !== 'AuthSessionMissingError') {
      console.error('Admin orders export authentication failed.')
      return NextResponse.json({ error: 'Could not verify admin access.' }, { status: 500 })
    }
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
    if (profileError) {
      console.error('Admin orders export role lookup failed.')
      return NextResponse.json({ error: 'Could not verify admin access.' }, { status: 500 })
    }
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

    const supabaseAdmin = createAdminClient()
    const sourceOrders: SourceOrder[] = []
    let matchingCount = 0
    let offset = 0

    while (sourceOrders.length <= MAX_ROWS) {
      let query = supabaseAdmin
        .from('orders')
        .select(ORDER_SELECT, { count: 'exact' })
        .order('created_at', { ascending: false })
      const bounds = getOrderExportDateBounds(filters)
      if (filters.status) query = query.eq('fulfillment_status', filters.status)
      if (bounds.fromInclusive) query = query.gte('created_at', bounds.fromInclusive)
      if (bounds.toExclusive) query = query.lt('created_at', bounds.toExclusive)
      if (filters.search) {
        query = query.or(buildOrderExportSearchCondition(filters.search))
      }
      const { data, error, count } = await query.range(offset, offset + QUERY_PAGE_SIZE - 1)
      if (error) throw error

      if (offset === 0) matchingCount = count ?? data.length
      if (!data.length) break
      sourceOrders.push(...(data as SourceOrder[]))
      offset += data.length
      if (sourceOrders.length > MAX_ROWS || sourceOrders.length >= matchingCount) break
    }

    const truncated = matchingCount > MAX_ROWS
    const rows = sourceOrders.slice(0, MAX_ROWS).map(toExportRow)
    if (format === 'json') {
      return NextResponse.json(
        { rows, truncated },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const exportedAt = new Date()
    const logoSvg = await readFile(join(process.cwd(), 'public', 'images', 'logo.svg'), 'utf8')
    const logoBase64 = extractEmbeddedLogoPngBase64(logoSvg)
    const workbook = makeWorkbook(rows, filters, exportedAt, logoBase64)
    const file = Buffer.from(await workbook.xlsx.writeBuffer())
    const filename = `orders-${getIstDate(exportedAt)}.xlsx`
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
        'X-Export-Truncated': String(truncated),
      },
    })
  } catch (error) {
    console.error(
      'Admin orders export failed.',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return NextResponse.json({ error: 'Could not export orders.' }, { status: 500 })
  }
}
