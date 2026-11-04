import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOrderNumber } from '@/lib/utils/helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formData, items, subtotal, discount, shipping, total, couponCode } = body

    const supabase = await createClient()
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
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
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
      .select()
      .single()

    if (orderError) throw orderError

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      variant_id: item.variantId,
      variant_name: item.variantName,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id)
      throw itemsError
    }

    if (formData.paymentMethod === 'cod') {
      // Update order status for COD
      const { error: codError } = await supabase
        .from('orders')
        .update({ status: 'confirmed', payment_status: 'pending' })
        .eq('id', order.id)

      if (codError) throw codError
      return NextResponse.json({ success: true, orderId: order.id, orderNumber })
    }

    // Create Razorpay order
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
    await supabase.from('payments').insert({
      order_id: order.id,
      razorpay_order_id: razorpayOrder.id,
      amount: total,
      status: 'pending',
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber,
      razorpayOrder,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create order. Please try again.' }, { status: 500 })
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
