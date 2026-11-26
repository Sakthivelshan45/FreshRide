import { createAdminClient } from '@/lib/supabase/admin'
import { verifyRazorpaySignature } from '@/lib/razorpay/signature'
import { NextRequest, NextResponse } from 'next/server'

interface RazorpayPaymentEntity {
  id?: unknown
  order_id?: unknown
  amount?: unknown
  currency?: unknown
}

interface RazorpayWebhookEvent {
  event?: unknown
  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity
    }
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('Razorpay webhook is not configured.')
    return NextResponse.json({ error: 'Webhook processing is unavailable.' }, { status: 500 })
  }

  const receivedSignature = request.headers.get('x-razorpay-signature')
  if (!receivedSignature) {
    return NextResponse.json({ error: 'Missing signature header.' }, { status: 400 })
  }
  if (!verifyRazorpaySignature(rawBody, receivedSignature, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  let event: RazorpayWebhookEvent
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid webhook body.' }, { status: 400 })
  }

  if (event.event !== 'payment.captured' && event.event !== 'payment.failed') {
    return NextResponse.json({ status: 'ok' })
  }

  const payment = event.payload?.payment?.entity
  if (
    !payment ||
    typeof payment.id !== 'string' ||
    typeof payment.order_id !== 'string' ||
    typeof payment.amount !== 'number' ||
    typeof payment.currency !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid payment event.' }, { status: 400 })
  }

  try {
    const supabaseAdmin = createAdminClient()
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, amount, currency, status, fulfillment_status, razorpay_payment_id')
      .eq('razorpay_order_id', payment.order_id)
      .maybeSingle()

    if (orderError) throw orderError
    if (!order) return NextResponse.json({ status: 'ok' })

    if (
      Math.round(Number(order.amount) * 100) !== payment.amount ||
      order.currency !== payment.currency
    ) {
      return NextResponse.json({ error: 'Payment amount or currency does not match the order.' }, { status: 400 })
    }

    if (event.event === 'payment.failed' && order.status === 'paid') {
      return NextResponse.json({ status: 'ok' })
    }

    if (event.event === 'payment.captured') {
      if (order.fulfillment_status === 'cancelled' && order.status === 'paid') {
        return NextResponse.json({ status: 'ok' })
      }

      if (order.status === 'paid' && order.razorpay_payment_id !== payment.id) {
        return NextResponse.json({ error: 'Order is already paid by a different payment.' }, { status: 409 })
      }
      if (order.status !== 'paid') {
        const { data: updatedOrder, error: updateError } = await supabaseAdmin
          .from('orders')
          .update({
            status: 'paid',
            fulfillment_status: 'confirmed',
            razorpay_payment_id: payment.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id)
          .in('status', ['created', 'failed'])
          .select('id')
          .maybeSingle()

        if (updateError) throw updateError
        if (!updatedOrder) {
          const { data: currentOrder, error: currentOrderError } = await supabaseAdmin
            .from('orders')
            .select('status, razorpay_payment_id')
            .eq('id', order.id)
            .maybeSingle()

          if (currentOrderError) throw currentOrderError
          if (
            currentOrder?.status !== 'paid' ||
            currentOrder.razorpay_payment_id !== payment.id
          ) {
            throw new Error('Order payment state changed before capture was recorded.')
          }
        }
      }

      const { error: paymentUpdateError } = await supabaseAdmin
        .from('payments')
        .update({ razorpay_payment_id: payment.id, status: 'paid' })
        .eq('order_id', order.id)
        .eq('razorpay_order_id', payment.order_id)
        .neq('status', 'refunded')

      if (paymentUpdateError) throw paymentUpdateError
    } else if (order.status === 'created') {
      const { data: failedOrder, error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .eq('status', 'created')
        .select('id')
        .maybeSingle()

      if (updateError) throw updateError
      if (failedOrder) {
        const { error: paymentUpdateError } = await supabaseAdmin
          .from('payments')
          .update({ razorpay_payment_id: payment.id, status: 'failed' })
          .eq('order_id', order.id)
          .eq('razorpay_order_id', payment.order_id)
          .eq('status', 'pending')

        if (paymentUpdateError) throw paymentUpdateError
      } else {
        const { data: currentOrder, error: currentOrderError } = await supabaseAdmin
          .from('orders')
          .select('status')
          .eq('id', order.id)
          .maybeSingle()

        if (currentOrderError) throw currentOrderError
        if (currentOrder?.status === 'paid') {
          return NextResponse.json({ status: 'ok' })
        }
        if (currentOrder?.status !== 'failed') {
          throw new Error('Order payment state changed before capture was recorded.')
        }
        const { error: paymentUpdateError } = await supabaseAdmin
          .from('payments')
          .update({ razorpay_payment_id: payment.id, status: 'failed' })
          .eq('order_id', order.id)
          .eq('razorpay_order_id', payment.order_id)
          .eq('status', 'pending')

        if (paymentUpdateError) throw paymentUpdateError
      }
    } else if (order.status === 'failed') {
      const { error: paymentUpdateError } = await supabaseAdmin
        .from('payments')
        .update({ razorpay_payment_id: payment.id, status: 'failed' })
        .eq('order_id', order.id)
        .eq('razorpay_order_id', payment.order_id)
        .eq('status', 'pending')

      if (paymentUpdateError) throw paymentUpdateError
    }

    return NextResponse.json({ status: 'ok' })
  } catch {
    console.error('Razorpay webhook processing failed.')
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 })
  }
}
