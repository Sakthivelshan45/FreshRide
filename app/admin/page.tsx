import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/helpers'
import { Package, ShoppingBag, MessageSquare, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import AdminDashboardRealtime from '@/components/admin/AdminDashboardRealtime'

export const metadata: Metadata = { title: 'Admin Dashboard | Butterfly Fresh Ride' }
export const dynamic = 'force-dynamic'

const ORDER_PAGE_SIZE = 1000
const REVENUE_PAGE_CONCURRENCY = 4

async function getTotalPaidRevenue(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paidOrderCount: number
) {
  let total = 0
  const pageCount = Math.ceil(paidOrderCount / ORDER_PAGE_SIZE)

  for (let firstPage = 0; firstPage < pageCount; firstPage += REVENUE_PAGE_CONCURRENCY) {
    const pageRequests = Array.from(
      { length: Math.min(REVENUE_PAGE_CONCURRENCY, pageCount - firstPage) },
      (_, index) => {
        const from = (firstPage + index) * ORDER_PAGE_SIZE
        return supabase
          .from('orders')
          .select('total')
          .eq('status', 'paid')
          .order('id', { ascending: true })
          .range(from, from + ORDER_PAGE_SIZE - 1)
      }
    )
    const pages = await Promise.all(pageRequests)

    for (const page of pages) {
      if (page.error) throw page.error
      total += (page.data ?? []).reduce((sum, order) => sum + Number(order.total ?? 0), 0)
    }
  }

  return total
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  const metadataName =
    typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : ''

  const displayName =
    profile?.full_name?.trim() ||
    metadataName.trim() ||
    user?.email?.split('@')[0] ||
    'Admin'

  const [
    { data: orders, error: ordersError },
    { data: products, error: productsError },
    { count: enquiryCount, error: enquiryCountError },
    { count: totalOrderCount, error: totalOrderCountError },
    { count: pendingOrderCount, error: pendingOrderCountError },
    { count: activeProductCount, error: activeProductCountError },
    { count: paidOrderCount, error: paidOrderCountError },
  ] = await Promise.all([
    supabase.from('orders').select('id, total, status, fulfillment_status, created_at, customer_name, order_number').order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('id, name, slug, is_active, product_variants(price, is_active)'),
    supabase.from('business_enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('fulfillment_status', 'pending'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
  ])

  if (ordersError) throw ordersError
  if (productsError) throw productsError
  if (enquiryCountError) throw enquiryCountError
  if (totalOrderCountError) throw totalOrderCountError
  if (pendingOrderCountError) throw pendingOrderCountError
  if (activeProductCountError) throw activeProductCountError
  if (paidOrderCountError) throw paidOrderCountError

  const safeOrders = (orders ?? []) as Array<{ id: string; total: number; status: string; fulfillment_status: string; created_at: string; customer_name: string; order_number: string }>
  const safeProducts = (products ?? []) as Array<{ id: string; name: string; slug: string; is_active: boolean; product_variants: { price: number; is_active: boolean }[] }>

  const totalRevenue = await getTotalPaidRevenue(supabase, paidOrderCount ?? 0)
  const pendingOrders = pendingOrderCount ?? 0
  const activeProducts = activeProductCount ?? 0
  const comingSoonProducts = safeProducts.filter(p => {
    const v = p.product_variants?.[0]
    return v && v.price === 0
  }).length

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminDashboardRealtime />
      <div className="mb-6 sm:mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl text-navy-dark mb-1">Dashboard</h1>
          <p className="text-green-secondary text-sm">
            Welcome back, {displayName}! Here&apos;s what&apos;s happening in your store.
          </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-green-primary', bg: 'bg-green-50', note: 'From paid orders' },
          { label: 'Total Orders', value: String(totalOrderCount ?? 0), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', note: `${pendingOrders} pending` },
          { label: 'Active Products', value: String(activeProducts), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', note: `${comingSoonProducts} coming soon` },
          { label: 'New Enquiries', value: String(enquiryCount ?? 0), icon: MessageSquare, color: 'text-gold-accent', bg: 'bg-amber-50', note: 'Needs follow-up' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-silver p-3 sm:p-5 rounded-sm">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bg} rounded flex items-center justify-center mb-2 sm:mb-3`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-navy-dark">{stat.value}</p>
            <p className="text-xs font-medium text-navy-dark mt-1">{stat.label}</p>
            <p className="text-[11px] text-green-secondary mt-0.5">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-silver">
          <div className="flex items-center justify-between p-5 border-b border-silver">
            <h2 className="font-medium text-navy-dark">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-green-primary hover:underline">View all</Link>
          </div>
          {safeOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-green-secondary">No orders yet.</div>
          ) : (
            <div className="divide-y divide-[#E8EEF0]">
              {safeOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-xs font-medium text-navy-dark">{order.customer_name}</p>
                    <p className="text-[10px] text-green-secondary font-mono">{order.order_number}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 ${statusColors[order.fulfillment_status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {order.fulfillment_status}
                    </span>
                    <span className="text-xs font-bold text-navy-dark">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products Overview */}
        <div className="bg-white border border-silver">
          <div className="flex items-center justify-between p-5 border-b border-silver">
            <h2 className="font-medium text-navy-dark">Products</h2>
            <Link href="/admin/products" className="text-xs text-green-primary hover:underline">Manage</Link>
          </div>
          {safeProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-green-secondary">No products found.</div>
          ) : (
            <div className="divide-y divide-[#E8EEF0]">
              {safeProducts.map((product) => {
                const price = product.product_variants?.[0]?.price ?? 0
                return (
                  <div key={product.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-2">
                      {product.is_active
                        ? <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                        : <AlertCircle size={14} className="text-gray-400 flex-shrink-0" />}
                      <p className="text-xs font-medium text-navy-dark">{product.name}</p>
                    </div>
                    <span className="text-xs text-green-secondary">
                      {price === 0 ? <span className="text-gold-accent font-medium">Coming Soon</span> : formatPrice(price)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/admin/products/new', label: '+ Add Product', style: 'bg-green-primary text-white hover:bg-green-secondary' },
          { href: '/admin/orders', label: '📦 View Orders', style: 'bg-white border border-silver text-navy-dark hover:border-green-primary' },
          { href: '/admin/enquiries', label: '💬 B2B Enquiries', style: 'bg-white border border-silver text-navy-dark hover:border-green-primary' },
          { href: '/admin/customers', label: '👥 Customers', style: 'bg-white border border-silver text-navy-dark hover:border-green-primary' },
        ].map((a) => (
          <Link key={a.href} href={a.href} className={`text-center text-sm font-medium py-3 px-4 transition-colors ${a.style}`}>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
