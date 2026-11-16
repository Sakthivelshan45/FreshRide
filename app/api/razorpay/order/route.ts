import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const orderIdSchema = z.string().uuid()

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('order')
  const parsedOrderId = orderIdSchema.safeParse(orderId)
  if (!parsedOrderId.success) {
    return NextResponse.json({ error: 'Invalid order ID.' }, { status: 400 })
  }

  try {
    const supabaseAdmin = createAdminClient()
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, amount, currency, status, order_items(variant_name, quantity, unit_price, total_price)')
      .eq('id', parsedOrderId.data)
      .eq('payment_method', 'razorpay')
      .maybeSingle()

    if (error) throw error
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })

    return NextResponse.json({
      order: {
        orderNumber: order.order_number,
        amount: Number(order.amount),
        currency: order.currency,
        paymentStatus: order.status,
        items: order.order_items.map((item) => ({
          name: item.variant_name,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
        })),
      },
    })
  } catch {
    console.error('Order summary could not be loaded.')
    return NextResponse.json({ error: 'Could not load the order summary.' }, { status: 500 })
  }
}
