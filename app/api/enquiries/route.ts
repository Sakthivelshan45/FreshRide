import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { businessEnquirySchema } from '@/lib/validations/schemas'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body.', fieldErrors: {} },
      { status: 400 }
    )
  }

  const parsed = businessEnquirySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Please correct the highlighted fields.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('business_enquiries').insert({
      company_name: parsed.data.companyName,
      contact_person: parsed.data.contactPerson,
      email: parsed.data.email,
      phone: parsed.data.phone,
      business_type: parsed.data.businessType,
      quantity: parsed.data.quantity,
      location: parsed.data.location,
      requirements: parsed.data.requirements || null,
      status: 'new',
    })

    if (error) {
      console.error('Enquiry insert failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Could not submit enquiry. Please try again or WhatsApp us.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Enquiry submission failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Could not submit enquiry. Please try again or WhatsApp us.',
      },
      { status: 500 }
    )
  }
}

function parsePositiveInteger(value: string | null, defaultValue: number) {
  if (value === null) return defaultValue

  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed >= 1 ? parsed : null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }
    if (authError) {
      console.error('Enquiry admin authentication failed:', authError)
      return NextResponse.json(
        { success: false, error: 'Could not verify admin access.' },
        { status: 500 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
    if (profileError) {
      console.error('Enquiry admin role lookup failed:', profileError)
      return NextResponse.json(
        { success: false, error: 'Could not verify admin access.' },
        { status: 500 }
      )
    }
    if (!profile?.is_admin) {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 })
    }

    const page = parsePositiveInteger(request.nextUrl.searchParams.get('page'), 1)
    const requestedLimit = parsePositiveInteger(request.nextUrl.searchParams.get('limit'), 20)
    if (page === null || requestedLimit === null) {
      return NextResponse.json(
        { success: false, error: 'Page and limit must be positive integers.' },
        { status: 400 }
      )
    }

    const limit = Math.min(requestedLimit, 100)
    const from = (page - 1) * limit
    const to = from + limit
    if (!Number.isSafeInteger(from) || !Number.isSafeInteger(to)) {
      return NextResponse.json(
        { success: false, error: 'Page is out of range.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('business_enquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to)
    if (error) {
      console.error('Enquiry list query failed:', error)
      return NextResponse.json(
        { success: false, error: 'Could not load enquiries.' },
        { status: 500 }
      )
    }

    const enquiries = data ?? []
    return NextResponse.json({
      success: true,
      data: enquiries.slice(0, limit),
      page,
      limit,
      hasMore: enquiries.length > limit,
    })
  } catch (error) {
    console.error('Enquiry list request failed:', error)
    return NextResponse.json(
      { success: false, error: 'Could not load enquiries.' },
      { status: 500 }
    )
  }
}
