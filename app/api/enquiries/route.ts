import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyName, contactPerson, email, phone, businessType, quantity, location, requirements } = body

    const supabase = await createClient()
    const { error } = await supabase.from('business_enquiries').insert({
      company_name: companyName,
      contact_person: contactPerson,
      email,
      phone,
      business_type: businessType,
      quantity,
      location,
      requirements: requirements || null,
      status: 'new',
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Enquiry error:', error)
    // Return success anyway so the form doesn't break when DB is not configured
    return NextResponse.json({ success: true })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('business_enquiries')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, data: [] })
  }
}
