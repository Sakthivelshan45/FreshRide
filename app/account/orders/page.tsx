import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/helpers'
import { ShoppingBag, Package } from 'lucide-react'

export const metadata: Metadata = { title: 'My Orders | Butterfly Fresh Ride' }

export default async function MyOrdersPage() {
  let orders: any[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) orders = data
    }
  } catch {
    // Supabase not configured
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

  return (
    <div className="min-h-screen bg-light-bg pt-20">
      <div className="container-wide section-padding max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl text-navy-dark">My Orders</h1>
          <Link href="/shop" className="btn-outline text-xs py-2 px-4">
            <ShoppingBag size={13} />
            Shop More
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-silver">
            <Package size={48} className="text-silver mx-auto mb-4" />
            <h2 className="font-serif text-xl text-navy-dark mb-2">No Orders Yet</h2>
            <p className="text-green-secondary text-sm mb-6">Your order history will appear here once you make a purchase.</p>
            <Link href="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-silver p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-green-secondary mb-1">Order Number</p>
                    <p className="font-mono text-sm font-medium text-navy-dark">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-secondary mb-1">Date</p>
                    <p className="text-sm text-navy-dark">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-secondary mb-1">Total</p>
                    <p className="text-sm font-bold text-navy-dark">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>
                <div className="border-t border-silver pt-3">
                  <p className="text-xs text-green-secondary mb-2">{order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}</p>
                  {order.tracking_number && (
                    <p className="text-xs text-green-secondary">Tracking: <span className="font-mono text-navy-dark">{order.tracking_number}</span></p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
