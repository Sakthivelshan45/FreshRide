import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateOrderNumber } from '@/lib/utils/helpers'
import { cashOnDeliveryOrderSchema } from '@/lib/validations/schemas'

const FREE_SHIPPING_THRESHOLD = 999
const SHIPPING_COST = 99

export async function POST(request: NextRequest) {
  const reference = randomUUID()
  let stage = 'request'

  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Request body must be valid JSON.' },
        { status: 400 }
      )
    }

    const parsed = cashOnDeliveryOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid order details.' },
        { status: 400 }
      )
    }

    const { formData, items, couponCode } = parsed.data
    const supabaseAdmin = createAdminClient()
    const cleanupOrder = async (orderId: string) => {
      const { error } = await supabaseAdmin.from('orders').delete().eq('id', orderId)
      if (error) throw error
    }
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError && authError.name !== 'AuthSessionMissingError') throw authError

    stage = 'validate_variants'
    const variantIds = items.map((item) => item.variantId)
    const { data: variants, error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .select('id, name, price, stock, is_active, product_id')
      .in('id', variantIds)

    if (variantsError) throw variantsError
    if (!variants || variants.length !== variantIds.length) {
      return NextResponse.json(
        { success: false, error: 'One or more products are no longer available.' },
        { status: 400 }
      )
    }

    const variantMap = new Map(variants.map((variant) => [variant.id, variant]))
    for (const item of items) {
      const variant = variantMap.get(item.variantId)
      if (!variant || !variant.is_active || variant.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: 'A product is unavailable or has insufficient stock.' },
          { status: 400 }
        )
      }
    }

    const productIds = [...new Set(variants.map((variant) => variant.product_id))]
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, is_active')
      .in('id', productIds)
    if (productsError) throw productsError
    if (!products || products.length !== productIds.length || products.some((product) => !product.is_active)) {
      return NextResponse.json(
        { success: false, error: 'A product is no longer available.' },
        { status: 400 }
      )
    }

    const orderItems = items.map((item) => {
      const variant = variantMap.get(item.variantId)!
      const unitPrice = Number(variant.price)
      return {
        variant_id: item.variantId,
        variant_name: variant.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: unitPrice * item.quantity,
      }
    })
    if (orderItems.some((item) => !Number.isFinite(item.unit_price) || item.unit_price <= 0)) {
      return NextResponse.json(
        { success: false, error: 'A product has an invalid price.' },
        { status: 400 }
      )
    }
    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0)

    let discount = 0
    let coupon: { id: string; used_count: number } | null = null
    if (couponCode) {
      stage = 'validate_coupon'
      const { data: couponData, error: couponError } = await supabaseAdmin
        .from('coupons')
        .select('id, code, type, value, min_order, max_uses, used_count, expires_at')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle()

      if (couponError) throw couponError
      if (
        !couponData ||
        (couponData.expires_at && new Date(couponData.expires_at) < new Date()) ||
        (couponData.min_order !== null && subtotal < couponData.min_order) ||
        (couponData.max_uses !== null && couponData.used_count >= couponData.max_uses) ||
        couponData.value <= 0 ||
        (couponData.type === 'percent' && couponData.value > 100)
      ) {
        return NextResponse.json(
          { success: false, error: 'The coupon is invalid, expired, or not applicable to this order.' },
          { status: 400 }
        )
      }

      coupon = { id: couponData.id, used_count: couponData.used_count }
      discount = couponData.type === 'percent'
        ? Math.round((subtotal * couponData.value) / 100)
        : Number(couponData.value)
      discount = Math.min(discount, subtotal)
    }

    const afterDiscount = subtotal - discount
    const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const total = afterDiscount + shipping
    if (!Number.isSafeInteger(Math.round(total * 100)) || total <= 0) {
      return NextResponse.json(
        { success: false, error: 'Order total must be greater than zero.' },
        { status: 400 }
      )
    }

    const orderId = randomUUID()
    const orderNumber = generateOrderNumber()
    const { error: orderError } = await supabaseAdmin.from('orders').insert({
      id: orderId,
      order_number: orderNumber,
      user_id: user?.id ?? null,
      customer_name: formData.fullName,
      customer_email: formData.email,
      customer_phone: formData.phone,
      shipping_address: {
        name: formData.fullName,
        phone: formData.phone,
        line1: formData.addressLine1,
        line2: formData.addressLine2 ?? '',
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      status: 'created',
      fulfillment_status: 'pending',
      payment_method: 'cod',
      subtotal,
      discount,
      shipping,
      total,
      amount: total,
      currency: 'INR',
      notes: formData.notes || null,
    })
    if (orderError) throw orderError

    stage = 'save_items'
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems.map((item) => ({ ...item, order_id: orderId })))
    if (itemsError) {
      await cleanupOrder(orderId)
      throw itemsError
    }

    if (coupon) {
      stage = 'reserve_coupon'
      const { data: updatedCoupon, error: couponUpdateError } = await supabaseAdmin
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('id', coupon.id)
        .eq('used_count', coupon.used_count)
        .select('id')
        .maybeSingle()

      if (couponUpdateError) {
        await cleanupOrder(orderId)
        throw couponUpdateError
      }
      if (!updatedCoupon) {
        await cleanupOrder(orderId)
        return NextResponse.json(
          { success: false, error: 'This coupon was just used up. Please try another coupon.' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json({ success: true, orderId, orderNumber })
  } catch {
    console.error(`Order creation failed at ${stage} (reference ${reference}).`)
    return NextResponse.json(
      { success: false, error: `Could not complete your order. Reference: ${reference}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
    if (profileError) throw profileError

    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    if (!profile?.is_admin) query = query.eq('user_id', user.id)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch {
    console.error('Order history could not be loaded.')
    return NextResponse.json(
      { success: false, error: 'Could not load orders.' },
      { status: 500 }
    )
  }
}
