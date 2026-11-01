import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json()
    const supabase = await createClient()

    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (!coupon) return NextResponse.json({ success: false, error: 'Invalid or expired coupon code' })
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
      return NextResponse.json({ success: false, error: 'This coupon has expired' })
    if (coupon.min_order && subtotal < coupon.min_order)
      return NextResponse.json({ success: false, error: `Minimum order of ₹${coupon.min_order} required for this coupon` })
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses)
      return NextResponse.json({ success: false, error: 'This coupon has reached its usage limit' })

    const discount = coupon.type === 'percent'
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value

    return NextResponse.json({ success: true, code: coupon.code, discount })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to validate coupon' })
  }
}
