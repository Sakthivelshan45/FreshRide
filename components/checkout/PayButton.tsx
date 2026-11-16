'use client'

import { useState, useCallback } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { useCartStore, type CartProduct } from '@/hooks/useCartStore'
import { ShieldCheck, Loader2 } from 'lucide-react'

// Razorpay types for the checkout popup
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  modal: { ondismiss: () => void }
  prefill: { name: string; email: string; contact: string }
  theme: { color: string }
  notes?: Record<string, string>
}

interface RazorpayInstance {
  open: () => void
  on: (event: 'payment.failed', handler: (response: { error?: { description?: string } }) => void) => void
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface CustomerDetails {
  fullName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  notes?: string
}

interface PayButtonProps {
  customer: CustomerDetails
  disabled?: boolean
  onOrderVerified: () => void
}

export default function PayButton({ customer, disabled, onOrderVerified }: PayButtonProps) {
  const router = useRouter()
  const { items, couponCode, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const handlePayment = useCallback(async () => {
    if (!scriptLoaded) {
      setError('Payment system is loading. Please wait a moment and try again.')
      return
    }

    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // ── Step 1: Create order on server ──────────────────
      const cartItems = items.map((item: CartProduct) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
      }))

      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          customer,
          couponCode: couponCode || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Could not create order.')
        setLoading(false)
        return
      }

      if (!window.Razorpay) {
        throw new Error('Payment system is unavailable. Please try again.')
      }

      // ── Step 2: Open Razorpay popup ─────────────────────
      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'Fresh Ride',
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: customer.fullName,
          email: customer.email,
          contact: `+91${customer.phone}`,
        },
        theme: {
          color: '#1A4731',
        },
        handler: async (response: RazorpayResponse) => {
          // ── Step 3: Verify payment on server ────────────
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyRes.ok && verifyData.success) {
              onOrderVerified()
              clearCart()
              router.push(`/order-success?order=${data.orderId}`)
            } else {
              router.push(`/order-failed?order=${data.orderId}`)
            }
          } catch {
            router.push(`/order-failed?order=${data.orderId}`)
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setError('Payment was cancelled. You can try again.')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => {
        setLoading(false)
        router.push(`/order-failed?order=${data.orderId}`)
      })
      rzp.open()
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }, [items, customer, couponCode, clearCart, onOrderVerified, router, scriptLoaded])

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onReady={() => setScriptLoaded(true)}
        onError={() => setError('Could not load payment system. Please refresh the page.')}
      />

      <button
        type="button"
        onClick={handlePayment}
        disabled={disabled || loading}
        className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShieldCheck size={16} />
            Pay with Razorpay
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm p-3">
          <p>{error}</p>
          <button
            onClick={() => {
              setError('')
              handlePayment()
            }}
            className="text-red-700 underline text-xs mt-1 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-green-light justify-center">
        <ShieldCheck size={12} />
        <span>Secured by Razorpay · 256-bit SSL</span>
      </div>
    </>
  )
}
