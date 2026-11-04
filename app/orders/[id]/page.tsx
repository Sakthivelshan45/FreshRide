'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const payment = searchParams.get('payment')
  const isPaid = payment === 'paid'
  const isCOD = payment === 'cod'

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-light-bg">
        <div className="container-wide section-padding">
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
                {isCOD ? 'Your Order Has Been Received!' : isPaid ? 'Payment Confirmed!' : 'Order Placed!'}
              </h1>
              <p className="text-green-secondary mb-2">
                {isCOD
                  ? 'Thank you. We have received your Cash on Delivery order.'
                  : 'Thank you for your order. Your order ID is:'}
              </p>
              <p className="font-mono text-sm bg-white border border-silver px-4 py-2 inline-block mb-6 text-navy-dark">
                {params.id}
              </p>

              {isCOD && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-4 mb-6 text-left">
                  <strong>Cash on Delivery:</strong> Please keep the exact amount ready at the time of delivery.
                </div>
              )}

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
        </div>
      </main>
      <Footer />
    </>
  )
}
