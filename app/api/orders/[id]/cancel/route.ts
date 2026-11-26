import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'processing'] as const

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ success: false, error: 'Invalid order.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Please sign in to cancel an order.' }, { status: 401 })
  }

  try {
    const supabaseAdmin = createAdminClient()
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, status, fulfillment_status, payment_method, amount, razorpay_payment_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (orderError) throw orderError
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 })
    }
    if (!CANCELLABLE_STATUSES.some((status) => status === order.fulfillment_status)) {
      return NextResponse.json(
        { success: false, error: 'This order can no longer be cancelled.' },
        { status: 409 }
      )
    }

    let razorpayCredentials: { keyId: string; keySecret: string } | null = null
    if (order.payment_method === 'razorpay') {
      if (order.status !== 'paid' || !order.razorpay_payment_id) {
        return NextResponse.json(
          { success: false, error: 'Only paid online orders can be cancelled here.' },
          { status: 409 }
        )
      }

      const keyId = process.env.RAZORPAY_KEY_ID
      const keySecret = process.env.RAZORPAY_KEY_SECRET
      if (!keyId || !keySecret) {
        console.error('Razorpay refunds are not configured.')
        return NextResponse.json(
          { success: false, error: 'Online refunds are temporarily unavailable. Please contact support.' },
          { status: 500 }
        )
      }
      razorpayCredentials = { keyId, keySecret }
    }

    const { data: cancelledOrder, error: cancelError } = await supabaseAdmin
      .from('orders')
      .update({ fulfillment_status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('status', order.status)
      .eq('fulfillment_status', order.fulfillment_status)
      .select('id')
      .maybeSingle()

    if (cancelError) throw cancelError
    if (!cancelledOrder) {
      return NextResponse.json(
        { success: false, error: 'This order has changed and can no longer be cancelled.' },
        { status: 409 }
      )
    }

    if (order.payment_method === 'razorpay' && order.razorpay_payment_id && razorpayCredentials) {
      const refundAmount = Math.round(Number(order.amount) * 100)
      if (!Number.isSafeInteger(refundAmount) || refundAmount <= 0) {
        console.error(`Invalid refund amount for cancelled order ${id}.`)
        return NextResponse.json(
          { success: false, cancelled: true, error: 'The order was cancelled, but its refund could not be started. Please contact support.' },
          { status: 500 }
        )
      }

      let refund
      try {
        const Razorpay = (await import('razorpay')).default
        const razorpay = new Razorpay({ key_id: razorpayCredentials.keyId, key_secret: razorpayCredentials.keySecret })
        refund = await razorpay.payments.refund(order.razorpay_payment_id, {
          amount: refundAmount,
          receipt: `cancel-${id.replace(/-/g, '')}`,
        })
      } catch {
        console.error(`Razorpay refund could not be initiated for cancelled order ${id}.`)
        return NextResponse.json(
          { success: false, cancelled: true, error: 'The order was cancelled, but its refund could not be started. Please contact support.' },
          { status: 502 }
        )
      }

      if (refund.status === 'failed') {
        console.error(`Razorpay rejected the refund for cancelled order ${id}.`)
        return NextResponse.json(
          { success: false, cancelled: true, error: 'The order was cancelled, but its refund could not be completed. Please contact support.' },
          { status: 502 }
        )
      }

      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .update({ status: 'refunded' })
        .eq('order_id', id)
        .eq('razorpay_payment_id', order.razorpay_payment_id)
        .neq('status', 'refunded')

      if (paymentError) {
        console.error(`Refund was initiated but payment status could not be updated for order ${id}.`)
        return NextResponse.json(
          { success: false, cancelled: true, error: 'The order was cancelled and the refund was initiated, but its status could not be saved. Please contact support.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        cancelled: true,
        message: 'Order cancelled. The refund was initiated to your original payment method.',
      })
    }

    return NextResponse.json({ success: true, cancelled: true, message: 'Order cancelled.' })
  } catch {
    console.error('Order cancellation failed.')
    return NextResponse.json(
      { success: false, error: 'Could not cancel this order. Please try again.' },
      { status: 500 }
    )
  }
}
