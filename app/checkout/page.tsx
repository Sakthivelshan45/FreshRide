'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, type CheckoutFormData } from '@/lib/validations/schemas'
import { useCartStore } from '@/hooks/useCartStore'
import { formatPrice, INDIAN_STATES } from '@/lib/utils/helpers'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Truck } from 'lucide-react'

export default function CheckoutPage() {
  const { items, getSubtotal, getDiscount, getShipping, getTotal, couponCode, clearCart } = useCartStore()
  const router = useRouter()
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const orderSubmitted = useRef(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cod' },
  })

  useEffect(() => {
    if (items.length === 0 && !orderSubmitted.current) router.replace('/cart')
  }, [items.length, router])

  const onSubmit = async (formData: CheckoutFormData) => {
    if (items.length === 0) return
    setPlacing(true)
    setError('')

    try {
      // Create order on server (COD only)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          items,
          subtotal: getSubtotal(),
          discount: getDiscount(),
          shipping: getShipping(),
          total: getTotal(),
          couponCode,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderData.success) throw new Error(orderData.error)

      orderSubmitted.current = true
      router.push(`/orders/${orderData.orderId}?payment=cod`)
      clearCart()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
      setPlacing(false)
    }
  }

  if (items.length === 0) return null

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-light-bg">
        <div className="container-wide section-padding">
          <h1 className="font-serif text-4xl text-navy-dark mb-10">Checkout</h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Shipping Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping details */}
                <div className="bg-white border border-silver p-6">
                  <h2 className="font-serif text-xl text-navy-dark mb-5 flex items-center gap-2">
                    <Truck size={20} className="text-green-primary" />
                    Delivery Details
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Full Name *</label>
                      <input {...register('fullName')} id="checkout-name" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Email *</label>
                      <input {...register('email')} type="email" id="checkout-email" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Mobile Number *</label>
                      <input {...register('phone')} type="tel" id="checkout-phone" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                    {/* Address line 1 */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Address Line 1 *</label>
                      <input {...register('addressLine1')} id="checkout-addr1" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" />
                      {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}
                    </div>
                    {/* Address line 2 */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Address Line 2</label>
                      <input {...register('addressLine2')} id="checkout-addr2" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" placeholder="Apartment, flat, landmark (optional)" />
                    </div>
                    {/* City */}
                    <div>
                      <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">City *</label>
                      <input {...register('city')} id="checkout-city" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    {/* Pincode */}
                    <div>
                      <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">PIN Code *</label>
                      <input {...register('pincode')} id="checkout-pin" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" maxLength={6} />
                      {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                    </div>
                    {/* State */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">State *</label>
                      <select {...register('state')} id="checkout-state" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary bg-white">
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                    </div>
                    {/* Notes */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Order Notes</label>
                      <textarea {...register('notes')} id="checkout-notes" rows={2} className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary resize-none" placeholder="Any special delivery instructions..." />
                    </div>
                  </div>
                </div>

                {/* Payment method - COD only */}
                <div className="bg-white border border-silver p-6">
                  <h2 className="font-serif text-xl text-navy-dark mb-5 flex items-center gap-2">
                    <Truck size={20} className="text-green-primary" />
                    Payment Method
                  </h2>
                  <label className="flex items-center gap-4 p-4 border-2 border-green-primary bg-light-bg cursor-default">
                    <input type="radio" {...register('paymentMethod')} value="cod" defaultChecked className="accent-[#1A4731]" readOnly />
                    <div>
                      <p className="font-medium text-sm text-navy-dark">Cash on Delivery</p>
                      <p className="text-xs text-green-secondary">Pay when your order arrives — No advance payment needed</p>
                    </div>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4">
                    {error}
                  </div>
                )}
              </div>

              {/* Right: Order summary */}
              <div className="space-y-4">
                <div className="bg-white border border-silver p-5">
                  <h3 className="font-serif text-xl text-navy-dark mb-5">Order Summary</h3>
                  <div className="space-y-4 mb-5">
                    {items.map((item) => (
                      <div key={item.variantId} className="flex gap-3">
                        <div className="relative w-12 h-12 flex-shrink-0 bg-light-bg">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-navy-dark truncate">{item.variantName}</p>
                          <p className="text-xs text-green-secondary">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-xs font-medium text-navy-dark">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm border-t border-silver pt-4">
                    <div className="flex justify-between text-green-secondary">
                      <span>Subtotal</span><span>{formatPrice(getSubtotal())}</span>
                    </div>
                    {getDiscount() > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span><span>-{formatPrice(getDiscount())}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-green-secondary">
                      <span>Shipping</span>
                      <span>{getShipping() === 0 ? <span className="text-green-600">Free</span> : formatPrice(getShipping())}</span>
                    </div>
                    <div className="flex justify-between font-bold text-navy-dark text-base border-t border-silver pt-2">
                      <span>Total</span><span>{formatPrice(getTotal())}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="checkout-place-order"
                    disabled={placing}
                    className="btn-primary w-full justify-center mt-6 disabled:opacity-60"
                  >
                    <ShieldCheck size={16} />
                    {placing ? 'Processing...' : 'Place Order (COD)'}
                  </button>

                  <div className="mt-4 flex items-center gap-2 text-xs text-green-light justify-center">
                    <ShieldCheck size={12} />
                    <span>Secured by 256-bit SSL encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
