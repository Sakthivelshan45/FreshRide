import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import OrdersExportControls from '@/components/admin/OrdersExportControls'
import OrdersLiveView, { type AdminOrder } from '@/components/admin/OrdersLiveView'
import {
  buildOrderExportSearchCondition,
  EMPTY_ORDER_EXPORT_FILTERS,
  getOrderExportDateBounds,
  parseOrderExportFilters,
} from '@/lib/admin/orders-export'

export const metadata: Metadata = { title: 'Orders | Admin' }

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const rawSearchParams = await searchParams
  const filterParams = new URLSearchParams()
  for (const key of ['status', 'from', 'to', 'search']) {
    const value = rawSearchParams[key]
    if (typeof value === 'string') filterParams.set(key, value)
  }
  const parsedFilters = parseOrderExportFilters(filterParams)
  const filters = parsedFilters.error ? EMPTY_ORDER_EXPORT_FILTERS : parsedFilters.filters
  let orders: AdminOrder[] = []

  try {
    const supabase = await createClient()
    let query = supabase
      .from('orders')
      .select('*, order_items(quantity, variant_name, unit_price)')
      .order('created_at', { ascending: false })
    const dateBounds = getOrderExportDateBounds(filters)
    if (filters.status) query = query.eq('fulfillment_status', filters.status)
    if (dateBounds.fromInclusive) query = query.gte('created_at', dateBounds.fromInclusive)
    if (dateBounds.toExclusive) query = query.lt('created_at', dateBounds.toExclusive)
    if (filters.search) query = query.or(buildOrderExportSearchCondition(filters.search))
    const { data } = await query.limit(100)
    if (data) orders = data
  } catch {
    // DB not configured
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <header className="bg-navy-dark text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag size={20} className="text-gold-accent" />
          <span className="font-medium">Order Management</span>
        </div>
        <Link href="/admin" className="text-xs text-green-light hover:text-white flex items-center gap-1">
          <ArrowLeft size={12} /> Dashboard
        </Link>
      </header>

      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <OrdersExportControls filters={filters} />
        <OrdersLiveView initialOrders={orders} filters={filters} />
      </div>
    </div>
  )
}
