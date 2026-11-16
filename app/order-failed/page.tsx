'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { XCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { Suspense } from 'react'
import OrderSummary from '@/components/checkout/OrderSummary'

function OrderFailedContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')

  return (
    <div className="max-w-lg mx-auto text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-6"
      >
        <XCircle size={40} className="text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="font-serif text-3xl text-navy-dark mb-3">
          Payment Failed
        </h1>
        <p className="text-green-secondary mb-2">
          We could not confirm your payment. If your account was debited, your bank will process the refund.
        </p>
        {orderId && (
          <p className="font-mono text-sm bg-white border border-silver px-4 py-2 inline-block mb-6 text-navy-dark">
            Order ID: {orderId}
          </p>
        )}
        <OrderSummary orderId={orderId} />

        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-5 mb-8 text-left">
          <p className="font-semibold mb-2">What happened?</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Your bank may have declined the transaction.</li>
            <li>There may have been a temporary network issue.</li>
            <li>If any amount was deducted, it will be refunded to your account within 5–7 business days.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/checkout" className="btn-primary">
            <RefreshCw size={15} />
            Try Again
          </Link>
          <Link href="/shop" className="btn-outline">
            Continue Shopping
            <ArrowRight size={15} />
          </Link>
        </div>

        <p className="mt-6 text-xs text-green-light">
          Need help?{' '}
          <a
            href={`https://wa.me/916235958246?text=${encodeURIComponent(`Hi, my payment failed for order ${orderId ?? ''}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-primary underline"
          >
            Contact us on WhatsApp
          </a>
        </p>
      </motion.div>
    </div>
  )
}

export default function OrderFailedPage() {
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
            <OrderFailedContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
