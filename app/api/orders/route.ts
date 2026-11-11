import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import type { CartProduct } from '@/hooks/useCartStore'
import { createClient } from '@/lib/supabase/server'
import { generateOrderNumber } from '@/lib/utils/helpers'

export async function POST(request: NextRequest) {
  const reference = randomUUID()
  let stage = 'request'

  try {
    const body = await request.json()
    const { formData, items, subtotal, discount, shipping, total } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Your cart is empty. Add items before placing an order.' }, { status: 400 })
    }

    stage = 'database_connection'
    const supabase = await createClient()
    const orderId = randomUUID()
    const orderNumber = generateOrderNumber()

    const shippingAddress = {
      name: formData.fullName,
      phone: formData.phone,
      line1: formData.addressLine1,
      line2: formData.addressLine2 || '',
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
    }

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    // Create the order
    stage = 'save_order'
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        order_number: orderNumber,
        user_id: user?.id || null,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: shippingAddress,
        status: 'pending',
        payment_method: formData.paymentMethod,
        payment_status: 'pending',
        subtotal,
        discount,
        shipping,
        total,
        notes: formData.notes || null,
      })

    if (orderError) throw orderError

    // Insert order items
    stage = 'validate_items'
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const variantIds = [...new Set(
      (items as CartProduct[])
        .map((item) => item.variantId)
        .filter((id): id is string => typeof id === 'string' && uuidPattern.test(id))
    )]
    const { data: variants, error: variantsError } = variantIds.length
      ? await supabase.from('product_variants').select('id').in('id', variantIds)
      : { data: [], error: null }
    if (variantsError) throw variantsError
    const existingVariantIds = new Set((variants ?? []).map((variant) => variant.id))

    stage = 'save_items'
    const orderItems = items.map((item: CartProduct) => ({
      order_id: orderId,
      // Cart data is persisted in the browser and can outlive a deleted variant.
      // Keep the order's item snapshot even if its optional variant reference is stale.
      variant_id: existingVariantIds.has(item.variantId) ? item.variantId : null,
      variant_name: item.variantName,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }))

    let { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError?.code === '23503') {
      const snapshotItems = orderItems.map((item) => ({ ...item, variant_id: null }))
      const retry = await supabase.from('order_items').insert(snapshotItems)
      itemsError = retry.error
    }

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', orderId)
      throw itemsError
    }

    if (formData.paymentMethod === 'cod') {
      // Keep COD orders in a pending state until admin confirmation/fulfillment.
      // This avoids falsely showing a COD order as already confirmed when it still
      // needs acceptance and dispatch processing.
      return NextResponse.json({ success: true, orderId, orderNumber })
    }

    // Create Razorpay order
    stage = 'create_payment'
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // in paise
      currency: 'INR',
      receipt: orderNumber,
    })

    // Store razorpay order id
    stage = 'save_payment'
    const { error: paymentError } = await supabase.from('payments').insert({
      order_id: orderId,
      razorpay_order_id: razorpayOrder.id,
      amount: total,
      status: 'pending',
    })
    if (paymentError) throw paymentError

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      razorpayOrder,
    })
  } catch (error) {
    console.error(`Order creation failed at ${stage} (reference ${reference}):`, error)
    const errorMessages: Record<string, string> = {
      request: 'The order request could not be read.',
      database_connection: 'Could not connect to the order service.',
      save_order: 'Could not save your order.',
      validate_items: 'Could not validate the products in your cart.',
      save_items: 'Could not save the items in your order. Please refresh your cart and try again.',
      create_payment: 'Could not start online payment.',
      save_payment: 'Could not save the payment details.',
    }

    return NextResponse.json({
      success: false,
      error: `${errorMessages[stage] || 'Could not complete your order.'} Reference: ${reference}`,
      stage,
      reference,
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()

    let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
    if (!profile?.is_admin) query = query.eq('user_id', user.id)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, data: [] })
  }
}
