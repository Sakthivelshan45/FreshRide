'use client'

import { useCartStore } from '@/hooks/useCartStore'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { formatPrice } from '@/lib/utils/helpers'
import { useState } from 'react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getDiscount, getShipping, getTotal, couponCode, applyCoupon, removeCoupon } = useCartStore()
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const applyCouponCode = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), subtotal: getSubtotal() }),
      })
      const data = await res.json()
      if (data.success) {
        applyCoupon(data.code, data.discount)
      } else {
        setCouponError(data.error || 'Invalid coupon code')
      }
    } catch {
      setCouponError('Failed to apply coupon. Please try again.')
    } finally {
      setCouponLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="pt-24 min-h-screen bg-light-bg">
          <div className="container-wide section-padding text-center">
            <div className="max-w-md mx-auto">
              <ShoppingBag size={64} className="text-silver mx-auto mb-6" />
              <h1 className="font-serif text-3xl text-navy-dark mb-4">Your Cart is Empty</h1>
              <p className="text-green-secondary mb-8">
                You haven&apos;t added any products yet. Explore our disposable travel bedding kits.
              </p>
              <Link href="/shop" className="btn-primary">
                <ShoppingBag size={16} />
                Shop Now
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-light-bg">
        <div className="container-wide section-padding">
          <h1 className="font-serif text-4xl text-navy-dark mb-10">Your Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, i) => (
                <motion.div
                  key={item.variantId}
                  className="bg-white border border-silver p-5 flex gap-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="relative w-20 h-20 flex-shrink-0 bg-light-bg">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-dark text-sm">{item.name}</p>
                    <p className="text-xs text-green-secondary mb-3">{item.variantName} · {item.packQuantity} kit{item.packQuantity > 1 ? 's' : ''}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Quantity */}
                      <div className="flex items-center border border-silver">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-light-bg transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-light-bg transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      {/* Price */}
                      <span className="text-navy-dark font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="ml-auto text-green-secondary hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order summary */}
            <div className="space-y-4">
              {/* Coupon */}
              <div className="bg-white border border-silver p-5">
                <h3 className="font-medium text-sm text-navy-dark mb-3 flex items-center gap-2">
                  <Tag size={15} className="text-green-primary" />
                  Apply Coupon
                </h3>
                {couponCode ? (
                  <div className="flex items-center justify-between bg-light-bg px-3 py-2">
                    <span className="text-sm text-green-primary font-medium">{couponCode} applied ✓</span>
                    <button onClick={removeCoupon} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 border border-silver px-3 py-2 text-sm focus:outline-none focus:border-green-primary"
                      onKeyDown={(e) => e.key === 'Enter' && applyCouponCode()}
                    />
                    <button
                      onClick={applyCouponCode}
                      disabled={couponLoading}
                      className="btn-outline text-xs px-3 py-2 whitespace-nowrap"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
              </div>

              {/* Summary */}
              <div className="bg-white border border-silver p-5">
                <h3 className="font-serif text-xl text-navy-dark mb-5">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-green-secondary">
                    <span>Subtotal</span>
                    <span>{formatPrice(getSubtotal())}</span>
                  </div>
                  {getDiscount() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({couponCode})</span>
                      <span>-{formatPrice(getDiscount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-green-secondary">
                    <span>Shipping</span>
                    <span>{getShipping() === 0 ? <span className="text-green-600">Free</span> : formatPrice(getShipping())}</span>
                  </div>
                  {getShipping() > 0 && (
                    <p className="text-xs text-green-light">Add {formatPrice(999 - getSubtotal() + getDiscount())} more for free shipping</p>
                  )}
                  <div className="border-t border-silver pt-3 flex justify-between font-bold text-navy-dark">
                    <span>Total</span>
                    <span className="text-xl">{formatPrice(getTotal())}</span>
                  </div>
                </div>

                <Link href="/checkout" id="cart-checkout-btn" className="btn-primary w-full justify-center mt-6 text-sm">
                  Proceed to Checkout
                  <ArrowRight size={15} />
                </Link>

                <Link href="/shop" className="block text-center text-xs text-green-secondary hover:text-green-primary mt-4">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
