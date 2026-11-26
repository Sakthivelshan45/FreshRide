'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

type CancelOrderButtonProps = {
  orderId: string
  orderNumber: string
  canCancel: boolean
}

export default function CancelOrderButton({ orderId, orderNumber, canCancel }: CancelOrderButtonProps) {
  const [cancelling, setCancelling] = useState(false)
  const [message, setMessage] = useState('')
  const [messageIsError, setMessageIsError] = useState(false)
  const [orderCancelled, setOrderCancelled] = useState(false)
  const router = useRouter()

  async function cancelOrder() {
    if (!window.confirm(`Cancel order ${orderNumber}?`)) return

    setCancelling(true)
    setMessage('')
    setMessageIsError(false)
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
      const result = await response.json() as { success?: boolean; cancelled?: boolean; error?: string; message?: string }

      if (!response.ok || !result.success) {
        if (result.cancelled) {
          setOrderCancelled(true)
          router.refresh()
        }
        setMessage(result.error || 'Could not cancel this order.')
        setMessageIsError(true)
        return
      }

      setOrderCancelled(true)
      setMessage(result.message || 'Order cancelled.')
      router.refresh()
    } catch {
      setMessage('Could not reach the server. Please try again.')
      setMessageIsError(true)
    } finally {
      setCancelling(false)
    }
  }

  if (!canCancel && !message) return null

  return (
    <div className="mt-4">
      {canCancel && !orderCancelled && (
        <button
          type="button"
          onClick={cancelOrder}
          disabled={cancelling}
          className="inline-flex items-center gap-2 border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X size={14} />
          {cancelling ? 'Cancelling…' : 'Cancel order'}
        </button>
      )}
      {message && (
        <p role="status" className={`mt-2 text-xs ${messageIsError ? 'text-red-700' : 'text-green-700'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
