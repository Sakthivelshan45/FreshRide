// 'use client'

// import Image from 'next/image'
// import Link from 'next/link'
// import { motion } from 'framer-motion'
// import { ArrowDown, ShoppingBag, ArrowRight } from 'lucide-react'

// export default function HeroSection() {
//   return (
//     <section
//       id="hero"
//       className="relative min-h-screen flex items-center overflow-hidden"
//       aria-label="Butterfly Fresh Ride hero"
//     >
//       {/* ── Background: Real product lifestyle image ── */}
//       <div className="absolute inset-0 z-0">
//         <Image
//           src="/images/lifestyle/hero_bg.jpg"
//           alt="Butterfly Fresh Ride disposable travel bedding on a luxury sleeper bus berth"
//           fill
//           priority
//           className="object-cover object-center"
//           sizes="100vw"
//         />
//       </div>

//       {/* ── Cinematic dark overlay (stronger on left for text, fades right) ── */}
//       <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#071510]/95 via-[#0D2018]/80 to-[#1A4731]/30" />
//       {/* Bottom fade */}
//       <div className="absolute bottom-0 left-0 right-0 z-10 h-40 bg-gradient-to-t from-[#071510]/60 to-transparent" />

//       {/* ── Animated floating product image (right side, desktop only) ── */}
//       <motion.div
//         className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:block w-[340px] xl:w-[420px]"
//         initial={{ opacity: 0, x: 60 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 1.2, delay: 0.8 }}
//       >
//         <motion.div
//           animate={{ y: [0, -14, 0] }}
//           transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
//           className="relative"
//         >
//           {/* Glow behind product */}
//           <div className="absolute inset-0 bg-gold-accent/10 blur-3xl rounded-full scale-110" />
//           <Image
//             src="/images/products/kit_flatlay.jpg"
//             alt="Butterfly Fresh Ride 3-piece disposable travel bedding kit"
//             width={420}
//             height={320}
//             className="relative z-10 drop-shadow-2xl"
//           />
//           {/* Kit label badge */}
//           <motion.div
//             className="absolute -bottom-4 -left-4 bg-gold-accent text-white px-4 py-2 shadow-xl"
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 1.4, duration: 0.5 }}
//           >
//             <p className="text-xs font-bold tracking-widest uppercase">3-Piece Kit</p>
//             <p className="text-[10px] text-white/80">Bedsheet · Pillow Cover · Blanket</p>
//           </motion.div>
//         </motion.div>
//       </motion.div>

//       {/* ── Main content ── */}
//       <div className="relative z-20 container-wide w-full pt-24 pb-16 sm:pt-28 lg:pt-36 lg:pb-24">
//         <div className="max-w-xl lg:max-w-2xl">

//           {/* Eyebrow */}
//           <motion.p
//             className="eyebrow text-green-light mb-4"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.7, delay: 0.2 }}
//           >
//             YOUR COMFORT ON THE GO
//           </motion.p>

//           {/* Main headline */}
//           <motion.h1
//             className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.1] mb-5"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.9, delay: 0.35 }}
//           >
//             Your Journey.
//             <br />
//             <span className="text-gold-accent">Your Comfort.</span>
//             <br />
//             Your Fresh Start.
//           </motion.h1>

//           {/* Sub-copy */}
//           <motion.p
//             className="text-white/75 text-sm sm:text-base lg:text-lg leading-relaxed mb-7 max-w-lg"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.55 }}
//           >
//             Fresh disposable bedding for every overnight journey. Each kit includes a bedsheet,
//             pillow cover &amp; blanket — packed clean, used once, disposed hygienically.
//           </motion.p>

//           {/* Kit chips */}
//           <motion.div
//             className="flex flex-wrap gap-2 mb-8"
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.7, delay: 0.7 }}
//           >
//             {[
//               { emoji: '🛏️', label: 'Bedsheet' },
//               { emoji: '🪡', label: 'Pillow Cover' },
//               { emoji: '🌙', label: 'Blanket' },
//             ].map((item) => (
//               <span
//                 key={item.label}
//                 className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-white/25 text-white/85 bg-white/10 backdrop-blur-sm"
//               >
//                 <span>{item.emoji}</span>
//                 {item.label}
//               </span>
//             ))}
//           </motion.div>

//           {/* CTAs */}
//           <motion.div
//             className="flex flex-col sm:flex-row gap-3"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.85 }}
//           >
//             <Link href="/shop" className="btn-gold flex items-center gap-2 justify-center sm:justify-start">
//               <ShoppingBag size={16} />
//               SHOP YOUR KIT
//             </Link>
//             <Link
//               href="#product-intro"
//               className="btn-outline border-white/50 text-white hover:bg-white hover:text-green-primary flex items-center gap-2 justify-center sm:justify-start"
//             >
//               SEE WHAT&apos;S INSIDE
//               <ArrowRight size={15} />
//             </Link>
//           </motion.div>

//           {/* Trust badges */}
//           <motion.div
//             className="flex flex-wrap gap-4 mt-8"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 1.1, duration: 0.8 }}
//           >
//             {['✓ Single-use hygiene', '✓ Bulk supply available', '✓ Pan India delivery'].map((badge) => (
//               <span key={badge} className="text-xs text-green-light/80">{badge}</span>
//             ))}
//           </motion.div>
//         </div>
//       </div>

//       {/* ── Scroll indicator ── */}
//       {/* <motion.div
//         className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 1.6, duration: 0.8 }}
//       >
//         <span className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Scroll</span>
//         <div className="w-[1px] h-10 bg-white/20 relative overflow-hidden">
//           <div className="absolute inset-x-0 top-0 h-1/2 bg-white/60 scroll-indicator-dot" />
//         </div>
//         <ArrowDown size={14} className="text-white/40 animate-bounce" />
//       </motion.div> */}
//     </section>
//   )
// }











// 'use client'

// import Image from 'next/image'
// import Link from 'next/link'
// import dynamic from 'next/dynamic'
// import { motion } from 'framer-motion'
// import { ArrowDown, ShoppingBag, ArrowRight } from 'lucide-react'

// // Three.js must only load in the browser
// const HeroScene3D = dynamic(() => import('./HeroScene3D'), {
//   ssr: false,
//   loading: () => null,
// })

// export default function HeroSection() {
//   return (
//     <section
//       id="hero"
//       className="relative min-h-screen flex items-center overflow-hidden"
//       aria-label="Butterfly Fresh Ride hero"
//     >
//       {/* ── Background: Real product lifestyle image ── */}
//       <div className="absolute inset-0 z-0">
//         <Image
//           src="/images/lifestyle/hero_bg.jpg"
//           alt="Butterfly Fresh Ride disposable travel bedding on a luxury sleeper bus berth"
//           fill
//           priority
//           className="object-cover object-center"
//           sizes="100vw"
//         />
//       </div>

//       {/* ── Cinematic dark overlay ── */}
//       <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#071510]/95 via-[#0D2018]/80 to-[#1A4731]/30" />
//       <div className="absolute bottom-0 left-0 right-0 z-10 h-40 bg-gradient-to-t from-[#071510]/60 to-transparent" />

//       {/* ── 3D product scene (right side, desktop only) ── */}
//       <motion.div
//         className="absolute right-0 top-0 bottom-0 z-20 hidden lg:block w-[50%] xl:w-[52%]"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1.2, delay: 0.6 }}
//       >
//         {/* Glow behind product */}
//         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square bg-gold-accent/10 blur-3xl rounded-full" />
//         <div className="relative w-full h-full">
//           <HeroScene3D />
//         </div>

//         {/* Kit label badge */}
//         <motion.div
//           className="absolute bottom-24 left-[18%] bg-gold-accent text-white px-4 py-2 shadow-xl pointer-events-none"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ delay: 1.4, duration: 0.5 }}
//         >
//           <p className="text-xs font-bold tracking-widest uppercase">3-Piece Kit</p>
//           <p className="text-[10px] text-white/80">Bedsheet · Pillow Cover · Blanket</p>
//         </motion.div>
//       </motion.div>

//       {/* ── Main content ── */}
//       <div className="relative z-30 container-wide w-full pt-24 pb-16 sm:pt-28 lg:pt-36 lg:pb-24 pointer-events-none">
//         <div className="max-w-xl lg:max-w-2xl pointer-events-auto">

//           <motion.p
//             className="eyebrow text-green-light mb-4"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.7, delay: 0.2 }}
//           >
//             YOUR COMFORT ON THE GO
//           </motion.p>

//           <motion.h1
//             className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.1] mb-5"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.9, delay: 0.35 }}
//           >
//             Your Journey.
//             <br />
//             <span className="text-gold-accent">Your Comfort.</span>
//             <br />
//             Your Fresh Start.
//           </motion.h1>

//           <motion.p
//             className="text-white/75 text-sm sm:text-base lg:text-lg leading-relaxed mb-7 max-w-lg"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.55 }}
//           >
//             Fresh disposable bedding for every overnight journey. Each kit includes a bedsheet,
//             pillow cover &amp; blanket — packed clean, used once and disposed hygienically. 
//             <br /><br />
//             Fresh sheets. Better sleep. Better journeys.
//           </motion.p>

//           {/* <motion.div
//             className="flex flex-wrap gap-2 mb-8"
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.7, delay: 0.7 }}
//           >
//             {[
//               { emoji: '🛏️', label: 'Bedsheet' },
//               { emoji: '🪡', label: 'Pillow Cover' },
//               { emoji: '🌙', label: 'Blanket' },
//             ].map((item) => (
//               <span
//                 key={item.label}
//                 className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-white/25 text-white/85 bg-white/10 backdrop-blur-sm"
//               >
//                 <span>{item.emoji}</span>
//                 {item.label}
//               </span>
//             ))}
//           </motion.div> */}

//           <motion.div
//             className="flex flex-col sm:flex-row gap-3"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.85 }}
//           >
//             <Link href="/shop" className="btn-gold flex items-center gap-2 justify-center sm:justify-start">
//               <ShoppingBag size={16} />
//               SHOP YOUR KIT
//             </Link>
//             <Link
//               href="#product-intro"
//               className="btn-outline border-white/50 text-white hover:bg-white hover:text-green-primary flex items-center gap-2 justify-center sm:justify-start"
//             >
//               SEE WHAT&apos;S INSIDE
//               <ArrowRight size={15} />
//             </Link>
//           </motion.div>

//           <motion.div
//             className="flex flex-wrap gap-4 mt-8"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 1.1, duration: 0.8 }}
//           >
//             {['✓ Single-use hygiene', '✓ Bulk supply available', '✓ Pan India delivery'].map((badge) => (
//               <span key={badge} className="text-xs text-green-light/80">{badge}</span>
//             ))}
//           </motion.div>
//         </div>
//       </div>

//       {/* ── Scroll indicator ── */}
//       {/* <motion.div
//         className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 1.6, duration: 0.8 }}
//       >
//         <span className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Scroll</span>
//         <div className="w-[1px] h-10 bg-white/20 relative overflow-hidden">
//           <div className="absolute inset-x-0 top-0 h-1/2 bg-white/60 scroll-indicator-dot" />
//         </div>
//         <ArrowDown size={14} className="text-white/40 animate-bounce" />
//       </motion.div> */}
//     </section>
//   )
// }










































































'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Recycle, Plane } from 'lucide-react'

/* ═══════════════════════════════════════════════════
   Dynamic 3D scene – SSR disabled, with loading state
   ═══════════════════════════════════════════════════ */

const loadHeroScene = () => import('./HeroScene3D')

const HeroScene3D = dynamic(loadHeroScene, {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-transparent" aria-hidden="true">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-gold-accent" />
    </div>
  ),
})

/* ═══════════════════════════════════════════════════
   Static fallback when WebGL is unavailable
   ═══════════════════════════════════════════════════ */

function StaticFallback() {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-transparent"
    >
      <Image
        src="/images/products/three_piece_kit.png"
        alt="Butterfly Fresh Ride disposable bedding kit — bedsheet, pillow cover and blanket"
        width={420}
        height={340}
        className="object-contain drop-shadow-xl"
        priority
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   Trust badges data
   ═══════════════════════════════════════════════════ */

const TRUST_BADGES = [
  { Icon: ShieldCheck, label: 'Hygienic' },
  { Icon: Recycle, label: 'Disposable' },
  { Icon: Plane, label: 'Travel-Ready' },
] as const

/* ═══════════════════════════════════════════════════
   Hero Section
   ═══════════════════════════════════════════════════ */

export default function HeroSection() {
  const prefersReduced = useReducedMotion() ?? false
  const [webGLOk, setWebGLOk] = useState(true)
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  )

  // Track which layout is visible, so only one 3D canvas is ever mounted
  useEffect(() => {
    void loadHeroScene()
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update)
      return () => mq.removeEventListener('change', update)
    }
    mq.addListener(update)
    return () => mq.removeListener(update)
  }, [])

  // Detect WebGL support once on mount
  useEffect(() => {
    try {
      const c = document.createElement('canvas')
      if (!c.getContext('webgl2') && !c.getContext('webgl')) {
        setWebGLOk(false)
      }
    } catch {
      setWebGLOk(false)
    }
  }, [])

  /** Framer-motion entrance props — disabled when reduced motion is preferred */
  const entrance = (delay: number) =>
    prefersReduced
      ? {}
      : {
          initial: { opacity: 0, y: 22 } as const,
          animate: { opacity: 1, y: 0 } as const,
          transition: {
            duration: 0.75,
            delay,
            ease: 'easeOut' as const,
          },
        }

  /* ── 3D or fallback visual (desktop can use the live scene again when post-processing is stable) ── */
  const renderVisual = (lowPower: boolean) =>
    webGLOk ? (
      <HeroScene3D reducedMotion={prefersReduced} lowPower={lowPower} />
    ) : (
      <StaticFallback />
    )

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: '#FAFAF8' }}
      aria-label="Butterfly Fresh Ride hero"
    >
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Image
          src="/images/lifestyle/hero_bg.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-gradient-to-r from-[#071510]/90 via-[#0D2018]/70 to-[#1A4731]/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-[#071510]/55 to-transparent"
      />

      {/* ── Subtle decorative background gradients ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-[18%] -right-[8%] w-[52%] h-[52%] rounded-full"
          style={{
            background: 'radial-gradient(circle, #C8A96E 0%, transparent 70%)',
            opacity: 0.04,
          }}
        />
        <div
          className="absolute -bottom-[12%] -left-[8%] w-[40%] h-[40%] rounded-full"
          style={{
            background: 'radial-gradient(circle, #E9ECEF 0%, transparent 70%)',
            opacity: 0.06,
          }}
        />
        {/* Fine horizontal rule halfway down for depth */}
        {/* <div
          className="absolute left-0 right-0 top-[55%] h-px"
          style={{ backgroundColor: 'rgba(32,37,43,0.025)' }}
        /> */}
      </div>

      {/* ────────────────────────────────────────────
           DESKTOP LAYOUT  (≥ 1024 px)
           ──────────────────────────────────────────── */}
      <div className="relative z-10 container-wide hidden lg:flex items-center min-h-screen">
        {/* Left column — typography + CTAs */}
        <div className="w-[46%] xl:w-[44%] py-24 pr-8 xl:pr-12">
          {/* Eyebrow / trust statement */}
          <motion.p
            className="text-[0.68rem] pt-4 font-semibold tracking-[0.22em] uppercase mb-5"
            style={{ color: '#C8A96E' }}
            {...entrance(0.15)}
          >
            Designed for Travel&nbsp;·&nbsp;Made for Freshness
          </motion.p>

          {/* Headline */}
          <motion.h1
            className="font-serif text-[2.7rem] xl:text-[3.35rem] 2xl:text-[3.75rem] leading-[1.12] mb-6"
            style={{ color: '#FFFFFF' }}
            {...entrance(0.3)}
          >
            Every Journey Deserves
            <br />
            a{' '}
            <span style={{ color: '#C8A96E' }}>Fresh&nbsp;Beginning.</span>
          </motion.h1>

          {/* Supporting description */}
          <motion.p
            className="text-[0.94rem] xl:text-[0.98rem] leading-[1.72] mb-9 max-w-[26rem]"
            style={{ color: 'rgba(255,255,255,0.78)' }}
            {...entrance(0.45)}
          >
            Experience a cleaner, more comfortable way to travel with
            Butterfly Fresh Ride&apos;s convenient disposable bedding
            solutions&nbsp;— hygienic, compact and ready for every
            overnight journey.
          </motion.p>

          {/* CTA buttons */}
          <motion.div className="flex gap-3.5" {...entrance(0.6)}>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-[0.82rem] font-semibold tracking-wide text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#C8A96E]/25 hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: '#C8A96E' }}
            >
              Explore Products
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <Link
              href="/business"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-[0.82rem] font-semibold tracking-wide transition-all duration-300 hover:bg-[#20252B] hover:text-white hover:scale-[1.02] active:scale-[0.98]"
              style={{
                  color: '#FFFFFF',
                  border: '1.5px solid rgba(255,255,255,0.45)',
              }}
            >
              Bulk Order Enquiry
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex items-center gap-5 mt-10 pt-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}
            {...entrance(0.75)}
          >
            {TRUST_BADGES.map(({ Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: 'rgba(255,255,255,0.72)' }}
              >
                <Icon size={13} />
                {label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right column — 3D product showcase */}
        <div className="flex-1 h-[82vh] relative">
          {renderVisual(false)}
        </div>
      </div>

      {/* ────────────────────────────────────────────
           MOBILE LAYOUT  (< 1024 px)
           ──────────────────────────────────────────── */}
      <div className="relative z-10 container-wide lg:hidden flex flex-col items-center pt-28 sm:pt-32 pb-10">
        {/* Eyebrow */}
        <motion.p
          className="text-[0.62rem] sm:text-[0.65rem] font-semibold tracking-[0.2em] uppercase mb-4 text-center"
          style={{ color: '#C8A96E' }}
          {...entrance(0.1)}
        >
          Designed for Travel&nbsp;·&nbsp;Made for Freshness
        </motion.p>

        {/* Headline */}
        <motion.h1
          className="font-serif text-[1.85rem] sm:text-[2.2rem] md:text-[2.5rem] leading-[1.15] mb-4 text-center px-2"
          style={{ color: '#FFFFFF' }}
          {...entrance(0.2)}
        >
          Every Journey Deserves
          <br />
          a <span style={{ color: '#C8A96E' }}>Fresh&nbsp;Beginning.</span>
        </motion.h1>

        {/* Description — shorter on mobile */}
        <motion.p
          className="text-[0.85rem] sm:text-sm leading-relaxed text-center max-w-sm mb-5 px-2"
          style={{ color: 'rgba(255,255,255,0.8)' }}
          {...entrance(0.3)}
        >
          Cleaner, more comfortable travel with convenient disposable
          bedding solutions&nbsp;— hygienic, compact and journey&#8209;ready.
        </motion.p>

        {/* 3D product visual */}
        <motion.div
          className="w-full h-[42vh] sm:h-[48vh] my-2"
          {...entrance(0.35)}
        >
          {renderVisual(true)}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 w-full px-4 sm:px-0 sm:w-auto mt-5"
          {...entrance(0.5)}
        >
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-[0.82rem] font-semibold tracking-wide text-white transition-all duration-200 active:scale-[0.97]"
            style={{ backgroundColor: '#C8A96E' }}
          >
            Explore Products
            <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
          <Link
            href="/business"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-[0.82rem] font-semibold tracking-wide transition-all duration-200 active:scale-[0.97]"
            style={{
              color: '#FFFFFF',
              border: '1.5px solid rgba(255,255,255,0.45)',
            }}
          >
            Bulk Order Enquiry
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="flex items-center gap-4 mt-7"
          {...entrance(0.6)}
        >
          {TRUST_BADGES.map(({ Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1 text-[0.62rem] sm:text-[0.65rem] font-medium"
              style={{ color: 'rgba(255,255,255,0.72)' }}
            >
              <Icon size={12} />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}