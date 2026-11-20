'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Phone, ShoppingBag } from 'lucide-react'

const travelBenefits = [
  'Single-use and hygienic',
  'Easy to pack',
  'Delivered to your door',
]

export default function FinalCTASection() {
  return (
    <section
      className="bg-light-bg px-4 py-16 sm:px-6 sm:py-24"
      aria-labelledby="final-cta-heading"
    >
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] bg-green-primary text-white shadow-[0_24px_70px_rgba(23,35,45,0.18)] sm:rounded-[36px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full border border-gold-accent/20"
        />
        <div className="grid lg:grid-cols-2">
          <div className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <motion.p
              className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-green-light"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="h-px w-8 bg-gold-accent" aria-hidden="true" />
              Ready to travel fresh?
            </motion.p>

            <motion.h2
              id="final-cta-heading"
              className="max-w-xl font-serif text-4xl leading-[1.08] sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Make every stay
              <span className="mt-1 block italic text-gold-accent">feel fresh.</span>
            </motion.h2>

            <motion.p
              className="mt-5 max-w-lg text-sm leading-7 text-white/80 sm:mt-6 sm:text-base"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Order your Butterfly Fresh Ride disposable travel bedding kit today. Fresh comfort,
              delivered to your door.
            </motion.p>

            <motion.div
              className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/shop"
                id="final-cta-shop"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold-accent px-6 text-sm font-bold text-navy-dark transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent focus-visible:ring-offset-2 focus-visible:ring-offset-green-primary"
              >
                <ShoppingBag size={17} aria-hidden="true" />
                Shop bedding kits
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                id="final-cta-contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-green-primary"
              >
                <Phone size={16} aria-hidden="true" />
                Contact our team
              </Link>
            </motion.div>

            <motion.ul
              className="mt-8 grid gap-x-5 gap-y-3 text-xs text-white/80 sm:grid-cols-2 sm:text-sm"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              {travelBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold-accent">
                    <Check size={13} strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  {benefit}
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            className="relative min-h-[300px] overflow-hidden sm:min-h-[420px] lg:min-h-[540px]"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <Image
              src="/images/lifestyle/Butterflys_prod.webp"
              alt="Butterfly Fresh Ride bedding kit displayed with folded sheets on a bed"
              fill
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/75 via-transparent to-green-primary/10 lg:bg-gradient-to-r lg:from-green-primary/20 lg:via-transparent lg:to-transparent" />

            <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-silver/80 bg-light-bg/95 px-4 py-2.5 text-xs font-bold text-green-primary shadow-lg sm:right-6 sm:top-6 sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-gold-accent" aria-hidden="true" />
              Your 3-piece travel kit
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-8 lg:hidden">
              <p className="font-serif text-2xl">Comfort that travels with you.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
