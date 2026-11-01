import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/helpers'
import { ArrowLeft, ShoppingBag, Search } from 'lucide-react'

export const metadata: Metadata = { title: 'Orders | Admin' }

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

export default async function AdminOrdersPage() {
  let orders: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(quantity, variant_name, unit_price)')
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) orders = data
  } catch {
    // DB not configured
  }

  const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0)
  const pending = orders.filter(o => o.status === 'pending').length
  const delivered = orders.filter(o => o.status === 'delivered').length

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

      <div className="max-w-6xl mx-auto p-8">
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
          <div className="bg-white border border-silver">
            <div className="p-5 border-b border-silver">
              <h3 className="font-medium text-navy-dark">All Orders ({orders.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-light-bg">
                  <tr>
                    {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-green-secondary uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EEF0]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-light-bg">
                      <td className="px-4 py-3 font-mono text-xs text-navy-dark">{order.order_number}</td>
                      <td className="px-4 py-3">
                        <p className="text-navy-dark font-medium text-xs">{order.customer_name}</p>
                        <p className="text-green-light text-[10px]">{order.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-green-secondary text-xs">{order.order_items?.length || 0}</td>
                      <td className="px-4 py-3 font-bold text-navy-dark text-xs">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : order.payment_method === 'cod' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {order.payment_status === 'paid' ? 'Paid' : order.payment_method === 'cod' ? 'COD' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-green-secondary text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="text-green-primary hover:underline text-xs">
                          View
                        </Link>
                      </td>
                    </tr>
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
