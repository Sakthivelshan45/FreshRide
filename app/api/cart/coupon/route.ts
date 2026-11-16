import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const couponRequestSchema = z.object({
  code: z.string().trim().min(1).max(50),
  subtotal: z.number().finite().nonnegative(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body must be valid JSON.' },
      { status: 400 }
    )
  }

  const parsed = couponRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Enter a valid coupon code.' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', parsed.data.code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw error
    if (
      !coupon ||
      (coupon.expires_at && new Date(coupon.expires_at) < new Date()) ||
      (coupon.min_order !== null && parsed.data.subtotal < coupon.min_order) ||
      (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) ||
      coupon.value <= 0 ||
      (coupon.type === 'percent' && coupon.value > 100)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid, expired, or inapplicable coupon code.' },
        { status: 400 }
      )
    }

    const discount = coupon.type === 'percent'
      ? Math.round((parsed.data.subtotal * coupon.value) / 100)
      : Number(coupon.value)

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discount: Math.min(discount, parsed.data.subtotal),
    })
  } catch {
    console.error('Coupon validation could not be completed.')
    return NextResponse.json(
      { success: false, error: 'Could not validate this coupon. Please try again.' },
      { status: 500 }
    )
  }
}
