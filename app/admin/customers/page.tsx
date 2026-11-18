import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import CustomersTable, { type CustomerRow } from '@/components/admin/CustomersTable'

export const metadata: Metadata = { title: 'Customers | Admin' }

export default async function AdminCustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/account/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) redirect('/account')

  const supabaseAdmin = createAdminClient()
  const { data: customers, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, phone, avatar_path, is_admin, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Admin customers query failed:', error)
    throw new Error('Could not load customers.')
  }

  const avatarPaths = customers.flatMap((customer) => customer.avatar_path ? [customer.avatar_path] : [])
  const avatarUrls = new Map<string, string>()
  if (avatarPaths.length > 0) {
    const { data: signedAvatars, error: avatarError } = await supabaseAdmin
      .storage
      .from('profile-avatars')
      .createSignedUrls(avatarPaths, 60 * 60)

    if (avatarError) {
      console.error('Admin customer avatar URL creation failed:', avatarError)
      throw new Error('Could not load customer photos.')
    }

    for (const avatar of signedAvatars) {
      if (avatar.error) {
        console.error(`Customer avatar URL creation failed for ${avatar.path ?? 'unknown profile'}:`, avatar.error)
      } else if (avatar.path && avatar.signedUrl) {
        avatarUrls.set(avatar.path, avatar.signedUrl)
      }
    }
  }

  const emails = new Map<string, string>()
  const authPageSize = 1000
  for (let page = 1; ; page += 1) {
    const { data, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: authPageSize,
    })
    if (authError) {
      console.error('Admin customer email lookup failed:', authError)
      throw new Error('Could not load customer emails.')
    }

    for (const authUser of data.users) {
      if (authUser.email) emails.set(authUser.id, authUser.email)
    }
    if (data.users.length < authPageSize) break
  }

  const orderCounts = new Map<string, number>()
  const orderPageSize = 1000
  for (let offset = 0; ; offset += orderPageSize) {
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('user_id')
      .order('id')
      .range(offset, offset + orderPageSize - 1)

    if (ordersError) {
      console.error('Admin customer order lookup failed:', ordersError)
      throw new Error('Could not load customer order counts.')
    }

    for (const order of orders) {
      if (order.user_id) {
        orderCounts.set(order.user_id, (orderCounts.get(order.user_id) ?? 0) + 1)
      }
    }
    if (orders.length < orderPageSize) break
  }

  const customerRows: CustomerRow[] = customers.map((customer) => ({
    id: customer.id,
    full_name: customer.full_name,
    email: emails.get(customer.id) ?? null,
    avatar_url: customer.avatar_path ? avatarUrls.get(customer.avatar_path) ?? null : null,
    phone: customer.phone,
    orders: orderCounts.get(customer.id) ?? 0,
    is_admin: customer.is_admin,
    created_at: customer.created_at,
  }))

  return (
    <div className="min-h-screen bg-light-bg px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-navy-dark">Customers</h1>
            <p className="mt-1 text-sm text-green-secondary">
              {customerRows.length.toLocaleString('en-IN')} registered {customerRows.length === 1 ? 'user' : 'users'}
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-2 text-sm text-green-800 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2"
          >
            <ArrowLeft aria-hidden="true" size={15} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
        <CustomersTable customers={customerRows} />
      </div>
    </div>
  )
}
