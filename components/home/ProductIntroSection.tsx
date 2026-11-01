'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'

export default function ProductIntroSection() {
  return (
    <section id="product-intro" className="section-padding bg-light-bg">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image side */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/images/products/three_piece_kit.png"
                alt="Butterfly Fresh Ride 3-piece disposable travel bedding kit — bedsheet, pillow cover and blanket"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 right-4 sm:-bottom-6 sm:-right-6 bg-green-primary text-white p-4 sm:p-5 shadow-2xl">
              <p className="text-2xl sm:text-3xl font-serif font-bold">3</p>
              <p className="text-[10px] tracking-widest text-green-light uppercase">Pieces</p>
              <p className="text-xs text-gold-accent mt-1">in every kit</p>
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <p className="eyebrow mb-4">Introducing Fresh Ride</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-navy-dark leading-tight mb-6">
              One Kit. Three Pieces.
              <br />
              <span className="text-green-primary">Complete Comfort.</span>
            </h2>
            <p className="text-green-secondary text-base leading-relaxed mb-8">
              The Butterfly Fresh Ride disposable travel bedding kit is your all-in-one bedding solution for overnight journeys. Every kit includes a soft bedsheet, a clean pillow cover and a comfortable blanket — everything you need for a fresh, hygienic night of rest.
            </p>

            {/* Kit contents */}
            <div className="space-y-3 mb-8">
              {[
                { label: 'Bedsheet', desc: 'Full-size sheet for your sleeping berth' },
                { label: 'Pillow Cover', desc: 'Fits standard travel pillows comfortably' },
                { label: 'Blanket', desc: 'Lightweight and warm for overnight travel' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-accent mt-2 flex-shrink-0" />
                  <div>
                    <span className="text-navy-dark font-semibold text-sm">{item.label}</span>
                    <span className="text-green-secondary text-sm"> — {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop" className="btn-primary">
                <ShoppingBag size={16} />
                SHOP NOW
              </Link>
              <Link href="/product/fresh-ride-kit#specifications" className="btn-outline flex items-center gap-2">
                Product Specifications
                <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
