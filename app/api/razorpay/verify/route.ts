import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { razorpayVerifySchema } from '@/lib/validations/schemas'
import { verifyRazorpaySignature } from '@/lib/razorpay/signature'

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

  const parsed = razorpayVerifySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid payment details.' },
      { status: 400 }
    )
  }

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    console.error('Razorpay verification is not configured.')
    return NextResponse.json(
      { success: false, error: 'Payment verification is unavailable.' },
      { status: 500 }
    )
  }

  try {
    const supabaseAdmin = createAdminClient()
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status, fulfillment_status, razorpay_payment_id')
      .eq('id', orderId)
      .eq('razorpay_order_id', razorpayOrderId)
      .maybeSingle()

    if (orderError) throw orderError
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      )
    }

    const signatureIsValid = verifyRazorpaySignature(
      `${razorpayOrderId}|${razorpayPaymentId}`,
      razorpaySignature,
      keySecret
    )

    if (!signatureIsValid) {
      if (order.status === 'created') {
        const { data: failedOrder, error: orderUpdateError } = await supabaseAdmin
          .from('orders')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', orderId)
          .eq('razorpay_order_id', razorpayOrderId)
          .eq('status', 'created')
          .select('id')
          .maybeSingle()

        if (orderUpdateError) throw orderUpdateError
        if (failedOrder) {
          const { error: paymentUpdateError } = await supabaseAdmin
            .from('payments')
            .update({ status: 'failed' })
            .eq('order_id', orderId)
            .eq('razorpay_order_id', razorpayOrderId)
            .eq('status', 'pending')

          if (paymentUpdateError) throw paymentUpdateError
        }
      }

      return NextResponse.json(
        { success: false, error: 'Invalid payment signature.' },
        { status: 400 }
      )
    }

    if (order.status === 'paid') {
      if (order.razorpay_payment_id === razorpayPaymentId) {
        if (order.fulfillment_status === 'cancelled') {
          return NextResponse.json({ success: true })
        }

        const { error: paymentUpdateError } = await supabaseAdmin
          .from('payments')
          .update({
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
            status: 'paid',
          })
          .eq('order_id', orderId)
          .eq('razorpay_order_id', razorpayOrderId)
          .neq('status', 'refunded')

        if (paymentUpdateError) throw paymentUpdateError
        return NextResponse.json({ success: true })
      }
      return NextResponse.json(
        { success: false, error: 'This order has already been paid.' },
        { status: 409 }
      )
    }

    if (order.status === 'failed') {
      return NextResponse.json(
        { success: false, error: 'This payment attempt has failed. Please create a new order.' },
        { status: 409 }
      )
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        fulfillment_status: 'confirmed',
        razorpay_payment_id: razorpayPaymentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('razorpay_order_id', razorpayOrderId)
      .eq('status', 'created')
      .select('id')
      .maybeSingle()

    if (updateError) throw updateError

    if (!updatedOrder) {
      const { data: currentOrder, error: currentOrderError } = await supabaseAdmin
        .from('orders')
        .select('status, razorpay_payment_id')
        .eq('id', orderId)
        .maybeSingle()

      if (currentOrderError) throw currentOrderError
      if (
        currentOrder?.status !== 'paid' ||
        currentOrder.razorpay_payment_id !== razorpayPaymentId
      ) {
        return NextResponse.json(
          { success: false, error: 'This order can no longer be marked as paid.' },
          { status: 409 }
        )
      }
    }

    const { error: paymentUpdateError } = await supabaseAdmin
      .from('payments')
      .update({
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        status: 'paid',
      })
      .eq('order_id', orderId)
      .eq('razorpay_order_id', razorpayOrderId)
      .neq('status', 'refunded')

    if (paymentUpdateError) throw paymentUpdateError
    return NextResponse.json({ success: true })
  } catch {
    console.error('Payment verification could not complete its database update.')
    return NextResponse.json(
      { success: false, error: 'Payment verification failed. Please contact support if charged.' },
      { status: 500 }
    )
  }
}
