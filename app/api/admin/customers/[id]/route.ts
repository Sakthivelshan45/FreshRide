import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const customerIdSchema = z.string().uuid()

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsedId = customerIdSchema.safeParse(id)
  if (!parsedId.success) {
    return NextResponse.json({ error: 'Invalid customer ID.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { data: adminProfile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Customer details admin check failed:', profileError)
    return NextResponse.json({ error: 'Could not verify admin access.' }, { status: 500 })
  }
  if (!adminProfile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const supabaseAdmin = createAdminClient()
  const customerId = parsedId.data

  const { data: profile, error: customerError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, phone, avatar_path, is_admin, created_at')
    .eq('id', customerId)
    .maybeSingle()

  if (customerError) {
    console.error('Customer details profile lookup failed:', customerError)
    return NextResponse.json({ error: 'Could not load customer details.' }, { status: 500 })
  }
  if (!profile) {
    return NextResponse.json({ error: 'Customer not found.' }, { status: 404 })
  }

  const { data: authResult, error: authError } = await supabaseAdmin.auth.admin.getUserById(customerId)
  if (authError) {
    console.error('Customer details auth lookup failed:', authError)
    return NextResponse.json({ error: 'Could not load customer email.' }, { status: 500 })
  }

  const { data: addresses, error: addressesError } = await supabaseAdmin
    .from('addresses')
    .select('id, name, phone, line1, line2, city, state, pincode, is_default, created_at')
    .eq('user_id', customerId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (addressesError) {
    console.error('Customer details address lookup failed:', addressesError)
    return NextResponse.json({ error: 'Could not load customer addresses.' }, { status: 500 })
  }

  const { data: orders, count: orderCount, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select(
      'id, order_number, status, fulfillment_status, payment_method, total, created_at, shipping_address',
      { count: 'exact' }
    )
    .eq('user_id', customerId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (ordersError) {
    console.error('Customer details order lookup failed:', ordersError)
    return NextResponse.json({ error: 'Could not load customer orders.' }, { status: 500 })
  }

  const orderIds = orders.map((order) => order.id)
  const itemsByOrder = new Map<string, {
    variant_name: string
    quantity: number
    unit_price: number
    total_price: number
  }[]>()

  if (orderIds.length > 0) {
    const { data: orderItems, error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .select('order_id, variant_name, quantity, unit_price, total_price')
      .in('order_id', orderIds)

    if (orderItemsError) {
      console.error('Customer details order items lookup failed:', orderItemsError)
      return NextResponse.json({ error: 'Could not load customer order items.' }, { status: 500 })
    }

    for (const item of orderItems) {
      const currentItems = itemsByOrder.get(item.order_id) ?? []
      currentItems.push({
        variant_name: item.variant_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })
      itemsByOrder.set(item.order_id, currentItems)
    }
  }

  let avatarUrl: string | null = null
  if (profile.avatar_path) {
    const { data: avatar, error: avatarError } = await supabaseAdmin
      .storage
      .from('profile-avatars')
      .createSignedUrl(profile.avatar_path, 60 * 60)

    if (avatarError) {
      console.error('Customer details avatar URL creation failed:', avatarError)
    } else {
      avatarUrl = avatar.signedUrl
    }
  }

  return NextResponse.json({
    customer: {
      id: profile.id,
      full_name: profile.full_name,
      email: authResult.user.email ?? null,
      phone: profile.phone,
      avatar_url: avatarUrl,
      is_admin: profile.is_admin,
      created_at: profile.created_at,
    },
    addresses,
    order_count: orderCount ?? 0,
    orders: orders.map((order) => ({
      ...order,
      items: itemsByOrder.get(order.id) ?? [],
    })),
  })
}
