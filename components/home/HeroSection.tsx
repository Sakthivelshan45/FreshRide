'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowDown, ShoppingBag, ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-label="Butterfly Fresh Ride hero"
    >
      {/* ── Background: Real product lifestyle image ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/lifestyle/hero_bg.jpg"
          alt="Butterfly Fresh Ride disposable travel bedding on a luxury sleeper bus berth"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* ── Cinematic dark overlay (stronger on left for text, fades right) ── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#071510]/95 via-[#0D2018]/80 to-[#1A4731]/30" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 z-10 h-40 bg-gradient-to-t from-[#071510]/60 to-transparent" />

      {/* ── Animated floating product image (right side, desktop only) ── */}
      <motion.div
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:block w-[340px] xl:w-[420px]"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          {/* Glow behind product */}
          <div className="absolute inset-0 bg-gold-accent/10 blur-3xl rounded-full scale-110" />
          <Image
            src="/images/products/kit_flatlay.jpg"
            alt="Butterfly Fresh Ride 3-piece disposable travel bedding kit"
            width={420}
            height={320}
            className="relative z-10 drop-shadow-2xl"
          />
          {/* Kit label badge */}
          <motion.div
            className="absolute -bottom-4 -left-4 bg-gold-accent text-white px-4 py-2 shadow-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <p className="text-xs font-bold tracking-widest uppercase">3-Piece Kit</p>
            <p className="text-[10px] text-white/80">Bedsheet · Pillow Cover · Blanket</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Main content ── */}
      <div className="relative z-20 container-wide w-full pt-24 pb-16 sm:pt-28 lg:pt-36 lg:pb-24">
        <div className="max-w-xl lg:max-w-2xl">

          {/* Eyebrow */}
          <motion.p
            className="eyebrow text-green-light mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            YOUR COMFORT ON THE GO
          </motion.p>

          {/* Main headline */}
          <motion.h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.1] mb-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
          >
            Your Journey.
            <br />
            <span className="text-gold-accent">Your Comfort.</span>
            <br />
            Your Fresh Start.
          </motion.h1>

          {/* Sub-copy */}
          <motion.p
            className="text-white/75 text-sm sm:text-base lg:text-lg leading-relaxed mb-7 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            Fresh disposable bedding for every overnight journey. Each kit includes a bedsheet,
            pillow cover &amp; blanket — packed clean, used once, disposed hygienically.
          </motion.p>

          {/* Kit chips */}
          <motion.div
            className="flex flex-wrap gap-2 mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            {[
              { emoji: '🛏️', label: 'Bedsheet' },
              { emoji: '🪡', label: 'Pillow Cover' },
              { emoji: '🌙', label: 'Blanket' },
            ].map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-white/25 text-white/85 bg-white/10 backdrop-blur-sm"
              >
                <span>{item.emoji}</span>
                {item.label}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
          >
            <Link href="/shop" className="btn-gold flex items-center gap-2 justify-center sm:justify-start">
              <ShoppingBag size={16} />
              SHOP YOUR KIT
            </Link>
            <Link
              href="#product-intro"
              className="btn-outline border-white/50 text-white hover:bg-white hover:text-green-primary flex items-center gap-2 justify-center sm:justify-start"
            >
              SEE WHAT&apos;S INSIDE
              <ArrowRight size={15} />
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-wrap gap-4 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            {['✓ Single-use hygiene', '✓ Bulk supply available', '✓ Pan India delivery'].map((badge) => (
              <span key={badge} className="text-xs text-green-light/80">{badge}</span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <span className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        <div className="w-[1px] h-10 bg-white/20 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/60 scroll-indicator-dot" />
        </div>
        <ArrowDown size={14} className="text-white/40 animate-bounce" />
      </motion.div>
    </section>
  )
}
