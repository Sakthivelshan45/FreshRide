'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Phone } from 'lucide-react'

export default function FinalCTASection() {
  return (
    <section className="bg-green-primary py-24 relative overflow-hidden" aria-label="Final call to action">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              white,
              white 1px,
              transparent 1px,
              transparent 30px
            )`,
          }}
        />
      </div>

      <div className="container-wide relative z-10 text-center">
        <motion.p
          className="eyebrow text-green-light mb-4"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ready to Travel Fresh?
        </motion.p>

        <motion.h2
          className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Make Every Stay
          <br />
          <span className="text-gold-accent">Feel Fresh.</span>
        </motion.h2>

        <motion.p
          className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-10"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Order your Butterfly Fresh Ride disposable travel bedding kit today. Fresh comfort, delivered to your door.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/shop"
            id="final-cta-shop"
            className="btn-gold flex items-center gap-2 text-base py-4 px-8"
          >
            <ShoppingBag size={18} />
            SHOP DISPOSABLE BEDDING KITS
          </Link>
          <Link
            href="/contact"
            id="final-cta-contact"
            className="btn-outline border-white/50 text-white hover:bg-white hover:text-green-primary flex items-center gap-2 text-base py-4 px-8"
          >
            <Phone size={18} />
            CONTACT OUR TEAM
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
