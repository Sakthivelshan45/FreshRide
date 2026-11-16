import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateOrderNumber } from '@/lib/utils/helpers'
import { razorpayCreateOrderSchema } from '@/lib/validations/schemas'

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

    const parsed = razorpayCreateOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid order details.' },
        { status: 400 }
      )
    }

    const { items, customer, couponCode } = parsed.data
    const uniqueVariantIds = items.map((item) => item.variant_id)
    const supabaseAdmin = createAdminClient()
    const cleanupOrder = async (orderId: string) => {
      const { error } = await supabaseAdmin.from('orders').delete().eq('id', orderId)
      if (error) throw error
    }

    stage = 'validate_variants'
    const { data: variants, error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .select('id, name, price, stock, is_active, product_id')
      .in('id', uniqueVariantIds)

    if (variantsError) throw variantsError
    if (!variants || variants.length !== uniqueVariantIds.length) {
      return NextResponse.json(
        { success: false, error: 'One or more products are no longer available.' },
        { status: 400 }
      )
    }

    const variantMap = new Map(variants.map((variant) => [variant.id, variant]))
    for (const item of items) {
      const variant = variantMap.get(item.variant_id)
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
      const variant = variantMap.get(item.variant_id)!
      const unitPrice = Number(variant.price)
      return {
        variant_id: item.variant_id,
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
    const amount = Math.round(total * 100)
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Order total must be greater than zero.' },
        { status: 400 }
      )
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!keyId || !keySecret || !publicKeyId || keyId !== publicKeyId) {
      console.error(`Razorpay configuration is incomplete (reference ${reference}).`)
      return NextResponse.json(
        { success: false, error: 'Online payment is temporarily unavailable.' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError && authError.name !== 'AuthSessionMissingError') throw authError
    const userId = user?.id ?? null

    stage = 'create_payment'
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const orderNumber = generateOrderNumber()
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        customer_name: customer.fullName,
        customer_email: customer.email,
      },
    })
    if (razorpayOrder.amount !== amount || razorpayOrder.currency !== 'INR') {
      throw new Error('Razorpay order amount or currency did not match the server total.')
    }

    const orderId = randomUUID()
    const shippingAddress = {
      name: customer.fullName,
      phone: customer.phone,
      line1: customer.addressLine1,
      line2: customer.addressLine2 ?? '',
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
    }

    stage = 'save_order'
    const { error: orderError } = await supabaseAdmin.from('orders').insert({
      id: orderId,
      order_number: orderNumber,
      user_id: userId,
      customer_name: customer.fullName,
      customer_email: customer.email,
      customer_phone: customer.phone,
      shipping_address: shippingAddress,
      status: 'created',
      fulfillment_status: 'pending',
      payment_method: 'razorpay',
      subtotal,
      discount,
      shipping,
      total,
      amount: total,
      currency: 'INR',
      razorpay_order_id: razorpayOrder.id,
      notes: customer.notes || null,
    })

    if (orderError) throw orderError

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems.map((item) => ({ ...item, order_id: orderId })))
    if (itemsError) {
      await cleanupOrder(orderId)
      throw itemsError
    }

    const { error: paymentError } = await supabaseAdmin.from('payments').insert({
      order_id: orderId,
      razorpay_order_id: razorpayOrder.id,
      amount: total,
      status: 'pending',
    })
    if (paymentError) {
      await cleanupOrder(orderId)
      throw paymentError
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

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: publicKeyId,
    })
  } catch {
    console.error(`Razorpay order creation failed at ${stage} (reference ${reference}).`)
    return NextResponse.json(
      { success: false, error: 'Could not create order. Please try again.' },
      { status: 500 }
    )
  }
}
