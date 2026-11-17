import type { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/helpers'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import type { Database } from '@/types/database'
import OrdersExportControls from '@/components/admin/OrdersExportControls'
import {
  buildOrderExportSearchCondition,
  EMPTY_ORDER_EXPORT_FILTERS,
  getOrderExportDateBounds,
  parseOrderExportFilters,
} from '@/lib/admin/orders-export'

export const metadata: Metadata = { title: 'Orders | Admin' }

type AdminOrder = Pick<
  Database['public']['Tables']['orders']['Row'],
  | 'id'
  | 'order_number'
  | 'customer_name'
  | 'customer_email'
  | 'customer_phone'
  | 'shipping_address'
  | 'status'
  | 'fulfillment_status'
  | 'payment_method'
  | 'total'
  | 'notes'
  | 'created_at'
> & {
  order_items: Pick<
    Database['public']['Tables']['order_items']['Row'],
    'quantity' | 'variant_name' | 'unit_price'
  >[]
}

function getAddressValue(address: AdminOrder['shipping_address'], key: string): string | undefined {
  if (typeof address !== 'object' || address === null || Array.isArray(address)) return undefined
  const value = address[key]
  return typeof value === 'string' ? value : undefined
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

const statusLabels: Record<string, string> = {
  pending: 'Awaiting Confirmation',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

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
    if (filters.search) {
      query = query.or(buildOrderExportSearchCondition(filters.search))
    }
    const { data } = await query.limit(100)
    if (data) orders = data
  } catch {
    // DB not configured
  }

  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.total, 0)
  const pending = orders.filter(o => o.fulfillment_status === 'pending').length
  const delivered = orders.filter(o => o.fulfillment_status === 'delivered').length

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

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: orders.length },
            { label: 'Pending', value: pending },
            { label: 'Delivered', value: delivered },
            { label: 'Revenue (Paid)', value: formatPrice(totalRevenue) },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-silver p-4">
              <p className="text-xl font-bold text-navy-dark">{s.value}</p>
              <p className="text-xs text-green-secondary mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 text-sm">
            No orders yet, or database is not configured.
          </div>
        ) : (
          <div className="border border-silver bg-white">
            <div className="border-b border-silver p-4 sm:p-5">
              <h3 className="font-medium text-navy-dark">All Orders ({orders.length})</h3>
            </div>
            <div className="space-y-3 p-3 lg:hidden">
              {orders.map((order) => (
                <article key={order.id} className="border border-silver p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-green-secondary">Order</p>
                      <p className="break-all font-mono text-xs font-semibold text-navy-dark">{order.order_number}</p>
                      <p className="mt-1 text-xs text-green-secondary">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <p className="shrink-0 text-right text-sm font-bold text-navy-dark">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`text-[10px] px-2 py-1 ${order.status === 'paid' ? 'bg-green-100 text-green-700' : order.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {order.status === 'paid' ? 'Paid' : order.status === 'failed' ? 'Failed' : order.payment_method === 'cod' ? 'COD' : 'Pending'}
                    </span>
                    <span className={`text-[10px] px-2 py-1 ${statusColors[order.fulfillment_status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[order.fulfillment_status] || order.fulfillment_status}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-silver pt-3">
                    <p className="text-xs font-semibold text-navy-dark">Customer</p>
                    <p className="mt-1 break-words text-sm text-navy-dark">{order.customer_name}</p>
                    <p className="break-words text-xs text-green-secondary">{order.customer_email || 'No email provided'}</p>
                    <p className="text-xs text-green-secondary">{order.customer_phone}</p>
                  </div>

                  <div className="mt-4 border-t border-silver pt-3">
                    <p className="text-xs font-semibold text-navy-dark">
                      Items ({order.order_items?.length || 0})
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(order.order_items || []).map((item, index) => (
                        <span key={`${order.id}-mobile-${index}`} className="max-w-full break-words bg-light-bg px-2 py-1 text-xs text-green-secondary">
                          {item.variant_name || 'Item'} × {item.quantity || 0}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 border-t border-silver pt-3">
                    <div>
                      <p className="text-xs font-semibold text-navy-dark">Delivery address</p>
                      <p className="mt-1 break-words text-xs text-green-secondary">
                        {getAddressValue(order.shipping_address, 'line1') || '-'}
                      </p>
                      {getAddressValue(order.shipping_address, 'line2') && (
                        <p className="break-words text-xs text-green-secondary">
                          {getAddressValue(order.shipping_address, 'line2')}
                        </p>
                      )}
                      <p className="break-words text-xs text-green-secondary">
                        {[
                          getAddressValue(order.shipping_address, 'city'),
                          getAddressValue(order.shipping_address, 'state'),
                          getAddressValue(order.shipping_address, 'pincode'),
                        ]
                          .filter(Boolean)
                          .join(', ') || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-navy-dark">Order notes</p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-xs text-green-secondary">
                        {order.notes || 'No customer note'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead className="bg-light-bg">
                  <tr>
                    {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-green-secondary uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EEF0]">
                  {orders.map((order) => (
                    <Fragment key={order.id}>
                    <tr className="hover:bg-light-bg">
                      <td className="px-4 py-3 font-mono text-xs text-navy-dark">{order.order_number}</td>
                      <td className="px-4 py-3">
                        <p className="text-navy-dark font-medium text-xs">{order.customer_name}</p>
                        <p className="text-green-light text-[10px]">{order.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-green-secondary text-xs">{order.order_items?.length || 0}</td>
                      <td className="px-4 py-3 font-bold text-navy-dark text-xs">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 ${order.status === 'paid' ? 'bg-green-100 text-green-700' : order.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {order.status === 'paid' ? 'Paid' : order.status === 'failed' ? 'Failed' : order.payment_method === 'cod' ? 'COD' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 ${statusColors[order.fulfillment_status] || 'bg-gray-100 text-gray-700'}`}>
                          {statusLabels[order.fulfillment_status] || order.fulfillment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-green-secondary text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <p className="font-semibold text-navy-dark mb-2">Customer Details</p>
                            <p>{order.customer_name}</p>
                            <p>{order.customer_email || 'No email provided'}</p>
                            <p>{order.customer_phone}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-navy-dark mb-2">Delivery Address</p>
                            <p>{getAddressValue(order.shipping_address, 'line1') || '-'}</p>
                            {getAddressValue(order.shipping_address, 'line2') && <p>{getAddressValue(order.shipping_address, 'line2')}</p>}
                            <p>
                              {[
                                getAddressValue(order.shipping_address, 'city'),
                                getAddressValue(order.shipping_address, 'state'),
                                getAddressValue(order.shipping_address, 'pincode'),
                              ]
                                .filter(Boolean)
                                .join(', ') || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-navy-dark mb-2">Order Notes</p>
                            <p className="whitespace-pre-wrap text-green-secondary">
                              {order.notes || 'No customer note'}
                            </p>
                          </div>
                          <div className="md:col-span-3 border-t border-silver pt-3">
                            <p className="font-semibold text-navy-dark mb-2">Items</p>
                            <div className="flex flex-wrap gap-2">
                              {(order.order_items || []).map((item: { variant_name?: string; quantity?: number }, index: number) => (
                                <span key={`${order.id}-${index}`} className="bg-white border border-silver px-2 py-1">
                                  {item.variant_name || 'Item'} × {item.quantity || 0}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
