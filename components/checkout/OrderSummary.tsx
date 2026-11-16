'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils/helpers'

interface OrderSummaryData {
  orderNumber: string
  amount: number
  currency: string
  paymentStatus: string
  items: {
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
}

const paymentStatusLabels: Record<string, string> = {
  created: 'Awaiting payment',
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
}

export default function OrderSummary({ orderId }: { orderId: string | null }) {
  const [summary, setSummary] = useState<OrderSummaryData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId) return

    const controller = new AbortController()
    fetch(`/api/razorpay/order?order=${encodeURIComponent(orderId)}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Could not load the order summary.')
        setSummary(data.order as OrderSummaryData)
      })
      .catch((fetchError: unknown) => {
        if (!controller.signal.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Could not load the order summary.')
        }
      })

    return () => controller.abort()
  }, [orderId])

  if (!orderId) return null

  if (error) {
    return <p role="status" className="text-sm text-red-600 mb-6">{error}</p>
  }

  if (!summary) {
    return <p role="status" className="text-sm text-green-secondary mb-6">Loading order summary…</p>
  }

  return (
    <div className="bg-white border border-silver p-5 mb-6 text-left">
      <div className="flex justify-between gap-4 text-sm mb-3">
        <span className="text-green-secondary">Order</span>
        <span className="font-mono text-navy-dark">{summary.orderNumber}</span>
      </div>
      <div className="flex justify-between gap-4 text-sm mb-3">
        <span className="text-green-secondary">Payment status</span>
        <span className="text-navy-dark">
          {paymentStatusLabels[summary.paymentStatus] ?? summary.paymentStatus}
        </span>
      </div>
      <div className="divide-y divide-silver">
        {summary.items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex justify-between gap-4 py-3 text-sm">
            <span className="text-navy-dark">{item.name} × {item.quantity}</span>
            <span className="text-navy-dark">{formatPrice(item.totalPrice)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-4 border-t border-silver pt-3 font-semibold text-navy-dark">
        <span>Total ({summary.currency})</span>
        <span>{formatPrice(summary.amount)}</span>
      </div>
    </div>
  )
}
