import ExcelJS from 'exceljs'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { BusinessEnquiry } from '@/types/database'
import type { ExportEnquiryRow } from '@/lib/admin/export-enquiries-pdf'

const MAX_ROWS = 5000
const QUERY_PAGE_SIZE = 1000
const ENQUIRY_SELECT =
  'company_name, contact_person, phone, email, requirements, business_type, location, status, created_at'

export const runtime = 'nodejs'

type SourceEnquiry = Pick<
  BusinessEnquiry,
  | 'company_name'
  | 'contact_person'
  | 'phone'
  | 'email'
  | 'requirements'
  | 'business_type'
  | 'location'
  | 'status'
  | 'created_at'
>

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

function toExportRow(enquiry: SourceEnquiry): ExportEnquiryRow {
  return {
    name: [enquiry.company_name, enquiry.contact_person].filter(Boolean).join(' - '),
    phone: enquiry.phone,
    email: enquiry.email,
    message: enquiry.requirements ?? '',
    sourcePage: [enquiry.business_type, enquiry.location].filter(Boolean).join(' - '),
    status: enquiry.status,
    createdAt: formatIstDate(enquiry.created_at),
  }
}

function makeWorkbook(rows: ExportEnquiryRow[]) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Enquiries')

  sheet.columns = [
    { header: 'Name', key: 'name', width: 32 },
    { header: 'Phone', key: 'phone', width: 18 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Message', key: 'message', width: 52 },
    { header: 'Source/page', key: 'sourcePage', width: 32 },
    { header: 'Status', key: 'status', width: 16 },
    { header: 'Created date', key: 'createdAt', width: 22 },
  ]

  sheet.addRows(rows)
  sheet.getRow(1).font = { bold: true }
  sheet.autoFilter = { from: 'A1', to: 'G1' }
  sheet.views = [{ state: 'frozen', ySplit: 1 }]
  return workbook
}

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get('format') ?? 'xlsx'
  if (format !== 'xlsx' && format !== 'json') {
    return NextResponse.json({ error: 'Unsupported export format.' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError && authError.name !== 'AuthSessionMissingError') {
      console.error('Admin enquiries export authentication failed.')
      return NextResponse.json({ error: 'Could not verify admin access.' }, { status: 500 })
    }
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
    if (profileError) {
      console.error('Admin enquiries export role lookup failed.')
      return NextResponse.json({ error: 'Could not verify admin access.' }, { status: 500 })
    }
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

    const supabaseAdmin = createAdminClient()
    const sourceEnquiries: SourceEnquiry[] = []
    let matchingCount = 0
    let offset = 0

    while (sourceEnquiries.length <= MAX_ROWS) {
      const { data, error, count } = await supabaseAdmin
        .from('business_enquiries')
        .select(ENQUIRY_SELECT, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + QUERY_PAGE_SIZE - 1)
      if (error) throw error

      if (offset === 0) matchingCount = count ?? data.length
      if (!data.length) break
      sourceEnquiries.push(...data)
      offset += data.length
      if (sourceEnquiries.length > MAX_ROWS || sourceEnquiries.length >= matchingCount) break
    }

    const truncated = matchingCount > MAX_ROWS
    const rows = sourceEnquiries.slice(0, MAX_ROWS).map(toExportRow)
    if (format === 'json') {
      return NextResponse.json(
        { rows, truncated },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const workbook = makeWorkbook(rows)
    const file = Buffer.from(await workbook.xlsx.writeBuffer())
    const filename = `enquiries-${getIstDate(new Date())}.xlsx`
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
      'Admin enquiries export failed.',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return NextResponse.json({ error: 'Could not export enquiries.' }, { status: 500 })
  }
}
