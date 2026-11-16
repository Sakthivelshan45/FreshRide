'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Suspense } from 'react'
import OrderSummary from '@/components/checkout/OrderSummary'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')

  return (
    <div className="max-w-lg mx-auto text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full bg-green-primary flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle size={40} className="text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="font-serif text-3xl text-navy-dark mb-3">
          Payment Confirmed!
        </h1>
        <p className="text-green-secondary mb-2">
          Thank you for your purchase. Your payment has been verified successfully.
        </p>
        {orderId && (
          <p className="font-mono text-sm bg-white border border-silver px-4 py-2 inline-block mb-6 text-navy-dark">
            Order ID: {orderId}
          </p>
        )}
        <OrderSummary orderId={orderId} />

        <div className="bg-white border border-silver p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <Package size={20} className="text-green-primary" />
            <h2 className="font-medium text-navy-dark">What&apos;s Next?</h2>
          </div>
          <ul className="space-y-2 text-sm text-green-secondary">
            <li>✓ You will receive an order confirmation email shortly.</li>
            <li>✓ Our team will process your order within 1 business day.</li>
            <li>✓ You will receive tracking details once your order is dispatched.</li>
            <li>✓ Estimated delivery: 3–7 business days.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop" className="btn-primary">
            Continue Shopping
            <ArrowRight size={15} />
          </Link>
          <Link href="/account/orders" className="btn-outline">
            View My Orders
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-light-bg">
        <div className="container-wide section-padding">
          <Suspense
            fallback={
              <div className="max-w-lg mx-auto text-center py-20">
                <div className="w-20 h-20 rounded-full bg-silver animate-pulse mx-auto mb-6" />
                <div className="h-8 bg-silver animate-pulse rounded w-3/4 mx-auto mb-4" />
                <div className="h-4 bg-silver animate-pulse rounded w-1/2 mx-auto" />
              </div>
            }
          >
            <OrderSuccessContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
