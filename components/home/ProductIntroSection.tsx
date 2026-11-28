// 'use client'

// import { memo, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
// import {
//   motion,
//   useScroll,
//   useTransform,
//   useSpring,
//   useReducedMotion,
//   useInView,
// } from 'framer-motion'
// import type { MotionValue } from 'framer-motion'
// import type { CSSProperties } from 'react'
// import Image from 'next/image'
// import Link from 'next/link'
// import { ArrowRight, ShoppingBag } from 'lucide-react'

// /** Scroll duration per story scene at phone and desktop breakpoints. */
// const SCROLL_PER_SCENE_VH = { mobile: 200, desktop: 160 } as const
// /** Fade distance around each scene boundary, as a fraction of total story progress. */
// const SCENE_FADE_WINDOW = 0.04
// /** Delay scene activation until its text has started becoming visible. */
// const ACTIVE_SCENE_THRESHOLD = 0.005
// /** The clean sweep completes after this fraction of the first scene. */
// const SWEEP_LENGTH = 0.85
// /** Multiplier for desktop card parallax travel. */
// const DESKTOP_PARALLAX_STRENGTH = 1.6
// /** Multiplier for phone card parallax travel. */
// const MOBILE_PARALLAX_STRENGTH = 0.8

// /** Encode spaces and parentheses in local product image paths. */
// const img = (name: string) => encodeURI(`/images/products/${name}`)

// type Card = {
//   src: string
//   alt: string
//   pos: string
//   speed: number
//   rotate: number
//   from?: 'left' | 'right' | 'top' | 'bottom'
//   tag?: string
//   contain?: boolean
//   width?: number
//   height?: number
//   sizes?: string
// }

// /** Content and media for a single story scene. */
// type Chapter = {
//   kicker: string
//   title: string
//   body: string
//   bg: string
//   cards: Card[]
//   cta?: boolean
//   sweep?: boolean // murky → fresh "clean sweep" reveal driven by scroll
//   badge?: boolean // rotating seal
// }

// const chapters: Chapter[] = [
//   {
//     kicker: 'Overnight journey. Hundreds of strangers.',
//     title: 'Ever wonder who slept here before you?',
//     body: 'Every berth has a story. Most of them, you would rather not know.',
//     bg: 'fresh_ride (15).png',
//     cards: [],
//     sweep: true,
//   },
//   {
//     kicker: 'Introducing Fresh Ride',
//     title: 'Meet your own clean berth.',
//     body: 'A soft, quilted disposable bedding kit with a bedsheet, pillow cover and blanket — a clean, familiar layer for your berth.',
//     bg: 'fresh_ride_new (4).png',
//     cards: [
//       { src: 'fresh (4).png', alt: 'Fresh Ride layers', contain: true, width: 1122, height: 1402, sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 34vw, 20vw', from: 'left', pos: 'sm:left-auto sm:right-[30%] sm:top-[10%] sm:bottom-auto sm:w-[34%] lg:w-[20%]', speed: 40, rotate: -3 },
//       { src: 'fresh (7).png', alt: 'Fresh Ride kit details', contain: true, width: 1672, height: 941, sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 34vw, 20vw', from: 'top', pos: 'sm:left-auto sm:right-[8%] sm:top-[30%] sm:bottom-auto sm:w-[34%] lg:w-[20%]', speed: -50, rotate: 3 },
//       { src: 'fresh_ride (22).png', alt: 'Fresh Ride kit details', contain: true, width: 1254, height: 1254, sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 34vw, 20vw', from: 'bottom', pos: 'sm:left-auto sm:right-[22%] sm:top-auto sm:bottom-[6%] sm:w-[34%] lg:w-[20%]', speed: -50, rotate: -2 },
//     ],
//   },
//   {
//     kicker: 'Set up in seconds',
//     title: 'Unfold. Lay. Sleep.',
//     body: 'No fuss, no tools. Spread it over the berth and you are done.',
//     bg: 'fresh_ride (9).png',
//     cards: [
//       { src: 'unfold.png', alt: 'Opening the kit', from: 'right', sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 34vw, 20vw', pos: 'sm:left-auto sm:right-[30%] sm:top-[10%] sm:bottom-auto sm:w-[34%] lg:w-[20%]', speed: 30, rotate: -4, tag: '01 · Unfold' },
//       { src: 'lay.png', alt: 'Unfolding on the berth', from: 'left', sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 34vw, 20vw', pos: 'sm:left-auto sm:right-[8%] sm:top-[30%] sm:bottom-auto sm:w-[34%] lg:w-[20%]', speed: -30, rotate: 3, tag: '02 · Lay' },
//       { src: 'fresh_ride (1).png', alt: 'Passenger laying it down', from: 'bottom', sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 34vw, 20vw', pos: 'sm:left-auto sm:right-[22%] sm:top-auto sm:bottom-[6%] sm:w-[34%] lg:w-[20%]', speed: 55, rotate: -2, tag: '03 · Sleep' },
//     ],
//   },
//   {
//     kicker: 'Comfort that travels',
//     title: 'Sleep like it is your own bed.',
//     body: 'Soft quilted surface, clean every single trip, wherever the track takes you.',
//     bg: 'fresh_ride (19).png',
//     cards: [
//       { src: 'sleep1.png', alt: 'Sleeping comfortably', from: 'top', sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 40vw, 26vw', pos: 'sm:left-auto sm:right-[6%] sm:top-[12%] sm:bottom-auto sm:w-[40%] lg:w-[26%]', speed: 40, rotate: 3 },
//       { src: 'sleep2.png', alt: 'Relaxing on the berth', from: 'right', sizes: '(max-width: 639px) 52vw, (max-width: 1023px) 36vw, 22vw', pos: 'sm:left-auto sm:right-[30%] sm:top-[38%] sm:bottom-auto sm:w-[36%] lg:w-[22%]', speed: -40, rotate: -3 },
//       { src: 'fresh_ride (22).png', alt: 'Settled in for the night', from: 'left', sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 36vw, 22vw', pos: 'sm:left-auto sm:right-[8%] sm:top-auto sm:bottom-[6%] sm:w-[36%] lg:w-[22%]', speed: 25, rotate: 2 },
//     ],
//   },
//   {
//     kicker: 'Journey done',
//     title: 'Wake up fresh.',
//     body: 'When the journey is over, dispose of it responsibly — and step off feeling rested.',
//     bg: 'fresh_ride_new (1).png',
//     cards: [],
//     cta: true,
//     badge: true,
//   },
// ]

// /** Reveal a scene headline word by word, or show it immediately for reduced motion. */
// const RevealTitle = memo(function RevealTitle({
//   text,
//   active,
//   reducedMotion,
// }: {
//   text: string
//   active: boolean
//   reducedMotion: boolean
// }) {
//   return (
//     <h2 className="font-serif text-[2.25rem] sm:text-5xl lg:text-7xl text-white leading-[1.08] sm:leading-[1.05] mb-4 sm:mb-5">
//       {text.split(' ').map((w, i) => (
//         <span key={i} className="inline-block overflow-hidden align-bottom pr-[0.25em] pb-[0.08em]">
//           <motion.span
//             className="inline-block"
//             initial={reducedMotion ? false : { opacity: 0, y: 40, filter: 'blur(10px)' }}
//             animate={
//               reducedMotion || active
//                 ? { opacity: 1, y: 0, filter: 'blur(0px)' }
//                 : { opacity: 0, y: 40, filter: 'blur(10px)' }
//             }
//             transition={{
//               duration: reducedMotion ? 0 : 0.7,
//               delay: reducedMotion || !active ? 0 : 0.1 + i * 0.09,
//               ease: [0.22, 1, 0.36, 1],
//             }}
//           >
//             {w}
//           </motion.span>
//         </span>
//       ))}
//     </h2>
//   )
// })

// /** Responsive brand seal, with scroll rotation disabled for reduced motion. */
// const Seal = memo(function Seal({
//   progress,
//   reducedMotion,
// }: {
//   progress: MotionValue<number>
//   reducedMotion: boolean
// }) {
//   const rotate = useTransform(progress, [0, 1], reducedMotion ? [0, 0] : [0, 900])
//   return (
//     <div className="absolute right-4 top-24 w-24 h-24 flex items-center justify-center md:right-[8%] md:top-1/2 md:-translate-y-1/2 md:w-52 md:h-52 lg:w-64 lg:h-64">
//       <motion.svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ rotate }}>
//         <defs>
//           <path id="seal-circle" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
//         </defs>
//         <text className="fill-white/90" style={{ fontSize: 13, letterSpacing: '0.32em', textTransform: 'uppercase' }}>
//           <textPath href="#seal-circle">Fresh • Hygienic • Disposable • Ready to sleep •</textPath>
//         </text>
//       </motion.svg>
//       <div className="relative w-14 h-14 md:w-28 md:h-28 lg:w-36 lg:h-36 rounded-full border border-gold-accent/70 flex flex-col items-center justify-center text-center backdrop-blur-sm bg-black/20">
//         <span className="font-serif text-sm md:text-2xl lg:text-3xl text-white leading-none">Fresh</span>
//         <span className="font-serif text-sm md:text-2xl lg:text-3xl text-gold-accent leading-none">Ride</span>
//       </div>
//     </div>
//   )
// })

// /** Render one scroll-linked scene and keep inactive controls out of the accessibility tree. */
// const ChapterScene = memo(function ChapterScene({
//   c,
//   index,
//   total,
//   progress,
//   active,
//   reducedMotion,
//   loadBackground,
//   preloadFirst,
//   preloadNext,
//   isMobile,
//   isShortMobile,
// }: {
//   c: Chapter
//   index: number
//   total: number
//   progress: MotionValue<number>
//   active: boolean
//   reducedMotion: boolean
//   loadBackground: boolean
//   preloadFirst: boolean
//   preloadNext: boolean
//   isMobile: boolean
//   isShortMobile: boolean
// }) {
//   const size = 1 / total
//   const start = index * size
//   const end = start + size
//   const fadeWindow = SCENE_FADE_WINDOW
//   const first = index === 0
//   const last = index === total - 1

//   // Text and cards fade inside the wider background transition window.
//   const contentOpacity = useTransform(
//     progress,
//     [start, start + 0.03, end - 0.05, end - 0.02],
//     [first ? 1 : 0, 1, 1, last ? 1 : 0]
//   )

//   const opacity = useTransform(
//     progress,
//     [start - fadeWindow, start + fadeWindow, end - fadeWindow, end + fadeWindow],
//     [first ? 1 : 0, 1, 1, last ? 1 : 0]
//   )
//   const bgScale = useTransform(progress, [start, end], reducedMotion ? [1, 1] : [1.05, 1.2])
//   const textY = useTransform(
//     progress,
//     [start - fadeWindow, start + fadeWindow, end - fadeWindow, end + fadeWindow],
//     reducedMotion ? [0, 0, 0, 0] : [first ? 0 : 50, 0, 0, last ? 0 : -50]
//   )
//   const pointer = useTransform(opacity, (v): 'auto' | 'none' => (v > 0.5 ? 'auto' : 'none'))
//   const sceneOpacity = reducedMotion ? (active ? 1 : 0) : opacity
//   const visibleContentOpacity = reducedMotion ? (active ? 1 : 0) : contentOpacity
//   const showSweep = c.sweep && !reducedMotion

//   // The clean copy completes its left-to-right wipe before this scene ends.
//   const sweepEnd = size * SWEEP_LENGTH
//   const clip = useTransform(progress, [0, sweepEnd], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'])
//   const edgeLeft = useTransform(progress, [0, sweepEnd], ['0%', '100%'])
//   const edgeOpacity = useTransform(progress, [0, 0.01, sweepEnd - 0.01, sweepEnd], [0, 1, 1, 0])
//   const backgroundLoadingProps = first && preloadFirst
//     ? { preload: true as const }
//     : { loading: preloadNext ? 'eager' as const : 'lazy' as const }

//   return (
//     <motion.div
//       className="absolute inset-0"
//       aria-hidden={!active}
//       inert={!active}
//       style={{ opacity: sceneOpacity, pointerEvents: reducedMotion ? (active ? 'auto' : 'none') : pointer }}
//     >
//       <motion.div className="absolute inset-0 will-change-transform" style={{ scale: bgScale }}>
//         {loadBackground && (
//           <Image
//             src={img(c.bg)}
//             alt=""
//             fill
//             sizes="100vw"
//             {...backgroundLoadingProps}
//             className={`object-cover ${
//               showSweep
//                 ? 'sepia-[.7] saturate-[.6] contrast-[.8] brightness-[.55] blur-[1.5px] sm:blur-[3px]'
//                 : ''
//             }`}
//           />
//         )}
//         {showSweep && loadBackground && (
//           <>
//             {/* clean copy wiped in from the left */}
//             <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
//               <Image src={img(c.bg)} alt="" fill sizes="100vw" loading="lazy" className="object-cover" />
//             </motion.div>
//             {/* glowing sweep edge */}
//             <motion.div
//               className="absolute top-0 bottom-0 w-[3px] -ml-[1px] bg-white pointer-events-none"
//               style={{
//                 left: edgeLeft,
//                 opacity: edgeOpacity,
//                 boxShadow: '0 0 30px 12px rgba(255,255,255,0.55), 0 0 90px 40px rgba(180,255,210,0.25)',
//               }}
//             />
//           </>
//         )}
//       </motion.div>

//       {/* readability overlays: bottom-up on phones (text sits low), left-to-right on larger screens */}
//       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10 sm:hidden" />
//       <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
//       <div className="absolute inset-x-0 bottom-0 h-1/3 hidden sm:block bg-gradient-to-t from-black/60 to-transparent" />

//       {/* Floating cards use motion values for all scroll-driven movement. */}
//       {loadBackground && c.cards.map((card, i) => (
//         <FloatingCard
//           key={card.src}
//           card={card}
//           progress={progress}
//           start={start}
//           end={end}
//           mpos={mobilePositions[c.cards.length]?.[i] ?? mobilePositions[3][i % 3]}
//           contentOpacity={visibleContentOpacity}
//           reducedMotion={reducedMotion}
//           isMobile={isMobile}
//           isShortMobile={isShortMobile}
//         />
//       ))}

//       {c.badge && <Seal progress={progress} reducedMotion={reducedMotion} />}

//       {/* text: bottom-anchored on phones (respects the home-bar safe area), centred on larger screens */}
//       <motion.div
//         style={{ y: textY, opacity: visibleContentOpacity }}
//         className="container-wide relative h-full flex items-end sm:items-center pb-[calc(env(safe-area-inset-bottom)+2.25rem)] sm:pb-0"
//       >
//         <div className="max-w-xl w-full pl-4 pr-4 sm:pr-0 sm:pl-8 lg:pl-8">
//           <motion.p
//             className="text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gold-accent mb-3 sm:mb-4"
//             animate={{ opacity: active ? 1 : 0, x: reducedMotion || active ? 0 : -20 }}
//             transition={{ duration: reducedMotion ? 0 : 0.6 }}
//           >
//             {c.kicker}
//           </motion.p>
//           <RevealTitle text={c.title} active={active} reducedMotion={reducedMotion} />
//           <motion.p
//             className="text-white/85 text-[15px] sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-md"
//             animate={{ opacity: active ? 1 : 0, y: reducedMotion || active ? 0 : 16 }}
//             transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion || !active ? 0 : 0.5 }}
//           >
//             {c.body}
//           </motion.p>
//           {c.cta && (
//             <motion.div
//               className="flex flex-col sm:flex-row gap-3 sm:gap-4"
//               animate={{ opacity: active ? 1 : 0, y: reducedMotion || active ? 0 : 16 }}
//               transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion || !active ? 0 : 0.7 }}
//             >
//               <Link
//                 href="/shop"
//                 className="btn-primary w-full sm:w-auto justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
//               >
//                 <ShoppingBag size={16} />SHOP NOW
//               </Link>
//               <Link
//                 href="/product/fresh-ride-kit#specifications"
//                 className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 border border-white/70 text-white text-sm font-semibold tracking-wider uppercase hover:bg-white hover:text-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
//               >
//                 Product Specifications <ArrowRight size={15} />
//               </Link>
//             </motion.div>
//           )}
//         </div>
//       </motion.div>
//     </motion.div>
//   )
// })

// /** Phone-specific card layouts, indexed by card count, filling the area above the text. */
// const mobilePositions: Record<number, string[]> = {
//   2: ['left-[5%] top-[12%] w-[60%]', 'right-[4%] top-[27%] w-[52%]'],
//   3: ['left-[4%] top-[11%] w-[48%]', 'right-[4%] top-[21%] w-[48%]', 'left-[16%] top-[33%] w-[48%]'],
// }

// /** Read a media query after hydration so server and initial client markup match. */
// function useMediaQuery(query: string) {
//   const [matches, setMatches] = useState(false)

//   useEffect(() => {
//     const mediaQuery = window.matchMedia(query)
//     const updateMatches = () => setMatches(mediaQuery.matches)
//     const frame = window.requestAnimationFrame(updateMatches)
//     mediaQuery.addEventListener('change', updateMatches)
//     return () => {
//       window.cancelAnimationFrame(frame)
//       mediaQuery.removeEventListener('change', updateMatches)
//     }
//   }, [query])

//   return matches
// }

// /** Apply Framer Motion's reduced-motion preference after hydration to keep SSR markup stable. */
// function useHydratedReducedMotion() {
//   const preference = useReducedMotion()
//   const [hydrated, setHydrated] = useState(false)

//   useEffect(() => {
//     const frame = window.requestAnimationFrame(() => setHydrated(true))
//     return () => window.cancelAnimationFrame(frame)
//   }, [])

//   return hydrated && Boolean(preference)
// }

// /** A single responsive card node with scroll-driven parallax and natural sizing when contained. */
// const FloatingCard = memo(function FloatingCard({
//   card,
//   progress,
//   start,
//   end,
//   mpos,
//   contentOpacity,
//   reducedMotion,
//   isMobile,
//   isShortMobile,
// }: {
//   card: Card
//   progress: MotionValue<number>
//   start: number
//   end: number
//   mpos: string
//   contentOpacity: MotionValue<number> | number
//   reducedMotion: boolean
//   isMobile: boolean
//   isShortMobile: boolean
// }) {
//   const enterX = card.from === 'left' ? -140 : card.from === 'right' ? 140 : 0
//   const enterY = card.from === 'top' ? -120 : card.from === 'bottom' ? 120 : 0
//   const yDesktop = useTransform(
//     progress,
//     [start, start + 0.1, end],
//     reducedMotion
//       ? [0, 0, 0]
//       : [
//           enterY + card.speed * DESKTOP_PARALLAX_STRENGTH,
//           card.speed * DESKTOP_PARALLAX_STRENGTH,
//           -card.speed * DESKTOP_PARALLAX_STRENGTH,
//         ]
//   )
//   const xDesktop = useTransform(progress, [start, start + 0.1, end], reducedMotion ? [0, 0, 0] : [enterX, 0, 0])
//   const yMobile = useTransform(
//     progress,
//     [start, start + 0.1, end],
//     reducedMotion
//       ? [0, 0, 0]
//       : [
//           enterY * 0.6 + card.speed * MOBILE_PARALLAX_STRENGTH,
//           card.speed * MOBILE_PARALLAX_STRENGTH,
//           -card.speed * MOBILE_PARALLAX_STRENGTH,
//         ]
//   )
//   const xMobile = useTransform(progress, [start, start + 0.1], reducedMotion ? [0, 0] : [enterX * 0.6, 0])
//   const scale = useTransform(progress, [start, start + 0.06], reducedMotion ? [1, 1] : [0.85, 1])
//   const imageSizes = card.sizes ?? '(max-width: 639px) 60vw, (max-width: 1023px) 40vw, 26vw'
//   const naturalRatio = card.contain === true && card.width !== undefined && card.height !== undefined

//   return (
//     <motion.div
//       className={`absolute overflow-hidden rounded-sm shadow-2xl ring-1 ring-white/30 ${
//         naturalRatio ? 'bg-white' : 'aspect-[4/3]'
//       } ${isShortMobile ? 'hidden' : ''} ${mpos} ${card.pos}`}
//       style={{
//         x: isMobile ? xMobile : xDesktop,
//         y: isMobile ? yMobile : yDesktop,
//         scale,
//         rotate: card.rotate,
//         opacity: contentOpacity,
//       }}
//     >
//       {naturalRatio ? (
//         <Image
//           src={img(card.src)}
//           alt={card.alt}
//           width={card.width}
//           height={card.height}
//           sizes={imageSizes}
//           loading="lazy"
//           className="block h-auto w-full object-contain"
//         />
//       ) : (
//         <Image
//           src={img(card.src)}
//           alt={card.alt}
//           fill
//           sizes={imageSizes}
//           loading="lazy"
//           className={card.contain ? 'object-contain' : 'object-cover'}
//         />
//       )}
//       {card.tag && (
//         <span className="absolute left-2 bottom-2 uppercase bg-black/60 text-white backdrop-blur-sm px-1.5 py-0.5 text-[8px] tracking-[0.15em] sm:px-2 sm:py-1 sm:text-[10px] sm:tracking-[0.2em]">
//           {card.tag}
//         </span>
//       )}
//     </motion.div>
//   )
// })

// /** Return the active scene index once its content is visibly fading in. */
// function getActiveIndex(value: number, total: number) {
//   return Math.min(total - 1, Math.max(0, Math.floor((value - ACTIVE_SCENE_THRESHOLD) * total)))
// }

// /** Scroll-driven product story with responsive, SSR-safe scroll sizing. */
// export default function ProductIntroSection() {
//   const ref = useRef<HTMLDivElement>(null)
//   const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
//   const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 })
//   const total = chapters.length
//   const reducedMotion = useHydratedReducedMotion()
//   const sectionNearViewport = useInView(ref, { margin: '200px 0px' })
//   const isMobile = useMediaQuery('(max-width: 639px)')
//   const isShortMobile = useMediaQuery('(max-width: 639px) and (max-height: 620px)')
//   const subscribeToProgress = useCallback((onChange: () => void) => {
//     let currentIndex = getActiveIndex(progress.get(), total)
//     return progress.on('change', (value) => {
//       const nextIndex = getActiveIndex(value, total)
//       if (currentIndex === nextIndex) return
//       currentIndex = nextIndex
//       onChange()
//     })
//   }, [progress, total])
//   const getCurrentIndex = useCallback(
//     () => getActiveIndex(progress.get(), total),
//     [progress, total]
//   )
//   const activeIndex = useSyncExternalStore(subscribeToProgress, getCurrentIndex, () => 0)

//   useEffect(() => {
//     if (process.env.NODE_ENV === 'production') return

//     const unsupportedCounts = new Set(
//       chapters
//         .map((chapter) => chapter.cards.length)
//         .filter((count) => count > 0 && !mobilePositions[count])
//     )
//     unsupportedCounts.forEach((count) => {
//       console.warn(`ProductIntroSection has no mobile card positions for ${count} cards.`)
//     })
//   }, [])

//   const scrollHeightStyle: CSSProperties & {
//     '--product-intro-mobile-height': string
//     '--product-intro-desktop-height': string
//   } = {
//     '--product-intro-mobile-height': `${total * SCROLL_PER_SCENE_VH.mobile}vh`,
//     '--product-intro-desktop-height': `${total * SCROLL_PER_SCENE_VH.desktop}vh`,
//   }

//   return (
//     <>
//       <a
//         href="#product-intro-end"
//         className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-3 focus:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-accent"
//       >
//         Skip product story
//       </a>
//       <section
//         id="product-intro"
//         ref={ref}
//         className="relative bg-black h-[var(--product-intro-mobile-height)] sm:h-[var(--product-intro-desktop-height)]"
//         style={scrollHeightStyle}
//       >
//         {/* dvh follows the visible phone screen as its browser address bar changes height. */}
//         <div className="sticky top-0 h-[100vh] supports-[height:100dvh]:h-[100dvh] overflow-hidden">
//           <div className="absolute inset-x-0 top-0 z-20 h-1 bg-white/20" aria-hidden="true">
//             <motion.div className="h-full origin-left bg-gold-accent" style={{ scaleX: progress }} />
//           </div>
//           {chapters.map((c, i) => (
//             <ChapterScene
//               key={c.title}
//               c={c}
//               index={i}
//               total={total}
//               progress={progress}
//               active={activeIndex === i}
//               reducedMotion={reducedMotion}
//               loadBackground={sectionNearViewport && i >= activeIndex - 1 && i <= activeIndex + 1}
//               preloadFirst={sectionNearViewport && activeIndex === 0}
//               preloadNext={sectionNearViewport && i === activeIndex + 1}
//               isMobile={isMobile}
//               isShortMobile={isShortMobile}
//             />
//           ))}
//         </div>
//       </section>
//       <div id="product-intro-end" tabIndex={-1} />
//     </>
//   )
// }















'use client'

import { memo, useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'

/** Scroll duration per story scene at phone and desktop breakpoints. */
const SCROLL_PER_SCENE_VH = { mobile: 200, desktop: 160 } as const
/** Fade distance around each scene boundary, as a fraction of total story progress. */
const SCENE_FADE_WINDOW = 0.04
/** Delay scene activation until its text has started becoming visible. */
const ACTIVE_SCENE_THRESHOLD = 0.005
/** The clean sweep completes after this fraction of the first scene. */
const SWEEP_LENGTH = 0.85
/** Multiplier for desktop card parallax travel. */
const DESKTOP_PARALLAX_STRENGTH = 1.6
/** Multiplier for phone card parallax travel. */
const MOBILE_PARALLAX_STRENGTH = 0.8

/**
 * Scroll progress only runs from 0 to 1. Framer turns scroll-linked transforms into native
 * animations, and the browser rejects keyframe offsets outside 0..1 ("Offsets must be
 * monotonically non-decreasing"). Edge scenes would otherwise use -0.04 and 1.04, so this drops
 * any out-of-range point. The dropped point always has the same output as its neighbour, so the
 * animation looks identical.
 */
function inRange(input: number[], output: number[]) {
  const keep = input.map((v) => v >= 0 && v <= 1)
  return {
    input: input.filter((_, i) => keep[i]),
    output: output.filter((_, i) => keep[i]),
  }
}

/** Encode spaces and parentheses in local product image paths. */
const img = (name: string) => encodeURI(`/images/products/${name}`)

type Card = {
  src: string
  alt: string
  pos: string
  speed: number
  rotate: number
  from?: 'left' | 'right' | 'top' | 'bottom'
  tag?: string
  contain?: boolean
  width?: number
  height?: number
  sizes?: string
}

/** Content and media for a single story scene. */
type Chapter = {
  kicker: string
  title: string
  body: string
  bg: string
  cards: Card[]
  cta?: boolean
  sweep?: boolean // murky -> fresh "clean sweep" reveal driven by scroll
  badge?: boolean // rotating seal
}

const chapters: Chapter[] = [
  {
    kicker: 'Overnight journey. Hundreds of strangers.',
    title: 'Ever wonder who slept here before you?',
    body: 'Every berth has a story. Most of them, you would rather not know.',
    bg: 'fresh_ride (15).png',
    cards: [],
    sweep: true,
  },
  {
    kicker: 'Introducing Fresh Ride',
    title: 'Meet your own clean berth.',
    body: 'A soft, quilted disposable bedding kit with a bedsheet, pillow cover and blanket — a clean, familiar layer for your berth.',
    bg: 'fresh_ride_new (4).png',
    cards: [
      { src: 'fresh (4).png', alt: 'Fresh Ride layers', contain: true, width: 1122, height: 1402, sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 34vw, 20vw', from: 'left', pos: 'sm:left-auto sm:right-[30%] sm:top-[10%] sm:bottom-auto sm:w-[34%] lg:w-[20%]', speed: 40, rotate: -3 },
      { src: 'fresh (7).png', alt: 'Fresh Ride kit details', contain: true, width: 1672, height: 941, sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 34vw, 20vw', from: 'top', pos: 'sm:left-auto sm:right-[8%] sm:top-[30%] sm:bottom-auto sm:w-[34%] lg:w-[20%]', speed: -50, rotate: 3 },
      { src: 'fresh_ride (22).png', alt: 'Fresh Ride kit details', contain: true, width: 1254, height: 1254, sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 34vw, 20vw', from: 'bottom', pos: 'sm:left-auto sm:right-[22%] sm:top-auto sm:bottom-[6%] sm:w-[34%] lg:w-[20%]', speed: -50, rotate: -2 },
    ],
  },
  {
    kicker: 'Set up in seconds',
    title: 'Unfold. Lay. Sleep.',
    body: 'No fuss, no tools. Spread it over the berth and you are done.',
    bg: 'fresh_ride (9).png',
    cards: [
      { src: 'unfold.png', alt: 'Opening the kit', from: 'right', sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 34vw, 20vw', pos: 'sm:left-auto sm:right-[30%] sm:top-[10%] sm:bottom-auto sm:w-[34%] lg:w-[20%]', speed: 30, rotate: -4, tag: '01 · Unfold' },
      { src: 'lay.png', alt: 'Unfolding on the berth', from: 'left', sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 34vw, 20vw', pos: 'sm:left-auto sm:right-[8%] sm:top-[30%] sm:bottom-auto sm:w-[34%] lg:w-[20%]', speed: -30, rotate: 3, tag: '02 · Lay' },
      { src: 'fresh_ride (1).png', alt: 'Passenger laying it down', from: 'bottom', sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 34vw, 20vw', pos: 'sm:left-auto sm:right-[22%] sm:top-auto sm:bottom-[6%] sm:w-[34%] lg:w-[20%]', speed: 55, rotate: -2, tag: '03 · Sleep' },
    ],
  },
  {
    kicker: 'Comfort that travels',
    title: 'Sleep like it is your own bed.',
    body: 'Soft quilted surface, clean every single trip, wherever the track takes you.',
    bg: 'fresh_ride (19).png',
    cards: [
      { src: 'sleep1.png', alt: 'Sleeping comfortably', from: 'top', sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 40vw, 26vw', pos: 'sm:left-auto sm:right-[6%] sm:top-[12%] sm:bottom-auto sm:w-[40%] lg:w-[26%]', speed: 40, rotate: 3 },
      { src: 'sleep2.png', alt: 'Relaxing on the berth', from: 'right', sizes: '(max-width: 639px) 52vw, (max-width: 1023px) 36vw, 22vw', pos: 'sm:left-auto sm:right-[30%] sm:top-[38%] sm:bottom-auto sm:w-[36%] lg:w-[22%]', speed: -40, rotate: -3 },
      { src: 'fresh_ride (22).png', alt: 'Settled in for the night', from: 'left', sizes: '(max-width: 639px) 48vw, (max-width: 1023px) 36vw, 22vw', pos: 'sm:left-auto sm:right-[8%] sm:top-auto sm:bottom-[6%] sm:w-[36%] lg:w-[22%]', speed: 25, rotate: 2 },
    ],
  },
  {
    kicker: 'Journey done',
    title: 'Wake up fresh.',
    body: 'When the journey is over, dispose of it responsibly — and step off feeling rested.',
    bg: 'fresh_ride_new (1).png',
    cards: [],
    cta: true,
    badge: true,
  },
]

/** Phone-specific card layouts, indexed by card count, filling the area above the text. */
const mobilePositions: Record<number, string[]> = {
  2: ['left-[5%] top-[12%] w-[60%]', 'right-[4%] top-[27%] w-[52%]'],
  3: ['left-[4%] top-[11%] w-[48%]', 'right-[4%] top-[21%] w-[48%]', 'left-[16%] top-[33%] w-[48%]'],
}

/**
 * Read a media query without extra re-render passes.
 * useSyncExternalStore returns `false` on the server, then the real value after hydration.
 */
function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    [query]
  )
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

/** Reveal a scene headline word by word (opacity + movement only, no blur filter). */
const RevealTitle = memo(function RevealTitle({
  text,
  active,
  reducedMotion,
}: {
  text: string
  active: boolean
  reducedMotion: boolean
}) {
  return (
    <h2 className="font-serif text-[2.25rem] sm:text-5xl lg:text-7xl text-white leading-[1.08] sm:leading-[1.05] mb-4 sm:mb-5">
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pr-[0.25em] pb-[0.08em]">
          <motion.span
            className="inline-block"
            initial={reducedMotion ? false : { opacity: 0, y: 40 }}
            animate={
              reducedMotion || active ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
            }
            transition={{
              duration: reducedMotion ? 0 : 0.6,
              delay: reducedMotion || !active ? 0 : 0.1 + i * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </h2>
  )
})

/** Responsive brand seal, with scroll rotation disabled for reduced motion. */
const Seal = memo(function Seal({
  progress,
  reducedMotion,
}: {
  progress: MotionValue<number>
  reducedMotion: boolean
}) {
  const rotate = useTransform(progress, [0, 1], reducedMotion ? [0, 0] : [0, 900])
  return (
    <div className="absolute right-4 top-24 w-24 h-24 flex items-center justify-center md:right-[8%] md:top-1/2 md:-translate-y-1/2 md:w-52 md:h-52 lg:w-64 lg:h-64">
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{ rotate }}
      >
        <defs>
          <path id="seal-circle" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
        </defs>
        <text className="fill-white/90" style={{ fontSize: 13, letterSpacing: '0.32em', textTransform: 'uppercase' }}>
          <textPath href="#seal-circle">Fresh • Hygienic • Disposable • Ready to sleep •</textPath>
        </text>
      </motion.svg>
      <div className="relative w-14 h-14 md:w-28 md:h-28 lg:w-36 lg:h-36 rounded-full border border-gold-accent/70 flex flex-col items-center justify-center text-center bg-black/40">
        <span className="font-serif text-sm md:text-2xl lg:text-3xl text-white leading-none">Fresh</span>
        <span className="font-serif text-sm md:text-2xl lg:text-3xl text-gold-accent leading-none">Ride</span>
      </div>
    </div>
  )
})

/**
 * Murky -> clean wipe using transforms only (runs on the GPU compositor).
 * The old version animated clip-path, a blurred sepia filter and a huge box-shadow every frame,
 * which forced a repaint of a full-screen image on each scroll tick.
 */
const SweepLayer = memo(function SweepLayer({
  progress,
  sweepEnd,
  src,
}: {
  progress: MotionValue<number>
  sweepEnd: number
  src: string
}) {
  // The wiper slides in from the left; the image inside slides the opposite way so it stays still.
  const wipeX = useTransform(progress, [0, sweepEnd], ['-100%', '0%'])
  const counterX = useTransform(progress, [0, sweepEnd], ['100%', '0%'])
  const edgeOpacity = useTransform(progress, [0, 0.01, sweepEnd - 0.01, sweepEnd], [0, 1, 1, 0])

  return (
    <>
      {/* cheap "murky" look: a flat tint instead of live sepia / blur filters */}
      <div className="absolute inset-0 bg-[#2a2216]/65" />
      <motion.div className="absolute inset-0 will-change-transform" style={{ x: wipeX }}>
        <div className="absolute inset-0 overflow-hidden">
          <motion.div className="absolute inset-0 will-change-transform" style={{ x: counterX }}>
            <Image src={src} alt="" fill sizes="100vw" loading="eager" className="object-cover" />
          </motion.div>
        </div>
        {/* glowing sweep edge: gradient + thin line, no box-shadow */}
        <motion.div
          className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-white/40 to-transparent"
          style={{ opacity: edgeOpacity }}
        />
        <motion.div
          className="pointer-events-none absolute inset-y-0 right-0 w-[2px] bg-white"
          style={{ opacity: edgeOpacity }}
        />
      </motion.div>
    </>
  )
})

/** A single responsive card with scroll-driven parallax and natural sizing when contained. */
const FloatingCard = memo(function FloatingCard({
  card,
  progress,
  start,
  end,
  mpos,
  contentOpacity,
  reducedMotion,
  isMobile,
  isShortMobile,
}: {
  card: Card
  progress: MotionValue<number>
  start: number
  end: number
  mpos: string
  contentOpacity: MotionValue<number> | number
  reducedMotion: boolean
  isMobile: boolean
  isShortMobile: boolean
}) {
  const strength = isMobile ? MOBILE_PARALLAX_STRENGTH : DESKTOP_PARALLAX_STRENGTH
  const enterScale = isMobile ? 0.6 : 1
  const enterX = (card.from === 'left' ? -140 : card.from === 'right' ? 140 : 0) * enterScale
  const enterY = (card.from === 'top' ? -120 : card.from === 'bottom' ? 120 : 0) * enterScale

  // Three motion values per card (was five).
  const x = useTransform(progress, [start, start + 0.1], reducedMotion ? [0, 0] : [enterX, 0])
  const y = useTransform(
    progress,
    [start, start + 0.1, end],
    reducedMotion
      ? [0, 0, 0]
      : [enterY + card.speed * strength, card.speed * strength, -card.speed * strength]
  )
  const scale = useTransform(progress, [start, start + 0.06], reducedMotion ? [1, 1] : [0.85, 1])

  const imageSizes = card.sizes ?? '(max-width: 639px) 60vw, (max-width: 1023px) 40vw, 26vw'
  const naturalRatio = card.contain === true && card.width !== undefined && card.height !== undefined

  return (
    <motion.div
      className={`absolute overflow-hidden rounded-sm shadow-xl ring-1 ring-white/30 ${
        naturalRatio ? 'bg-white' : 'aspect-[4/3]'
      } ${isShortMobile ? 'hidden' : ''} ${mpos} ${card.pos}`}
      style={{
        x,
        y,
        scale,
        rotate: card.rotate,
        opacity: contentOpacity,
        willChange: 'transform, opacity',
      }}
    >
      {naturalRatio ? (
        <Image
          src={img(card.src)}
          alt={card.alt}
          width={card.width}
          height={card.height}
          sizes={imageSizes}
          loading="eager"
          className="block h-auto w-full object-contain"
        />
      ) : (
        <Image
          src={img(card.src)}
          alt={card.alt}
          fill
          sizes={imageSizes}
          loading="eager"
          className={card.contain ? 'object-contain' : 'object-cover'}
        />
      )}
      {card.tag && (
        <span className="absolute left-2 bottom-2 uppercase bg-black/70 text-white px-1.5 py-0.5 text-[8px] tracking-[0.15em] sm:px-2 sm:py-1 sm:text-[10px] sm:tracking-[0.2em]">
          {card.tag}
        </span>
      )}
    </motion.div>
  )
})

/** Render one scroll-linked scene and keep inactive controls out of the accessibility tree. */
const ChapterScene = memo(function ChapterScene({
  c,
  index,
  total,
  progress,
  active,
  reducedMotion,
  preloadFirst,
  isMobile,
  isShortMobile,
}: {
  c: Chapter
  index: number
  total: number
  progress: MotionValue<number>
  active: boolean
  reducedMotion: boolean
  preloadFirst: boolean
  isMobile: boolean
  isShortMobile: boolean
}) {
  const size = 1 / total
  const start = index * size
  const end = start + size
  const fadeWindow = SCENE_FADE_WINDOW
  const first = index === 0
  const last = index === total - 1

  // Text and cards fade inside the wider background transition window.
  const contentOpacity = useTransform(
    progress,
    [start, start + 0.03, end - 0.05, end - 0.02],
    [first ? 1 : 0, 1, 1, last ? 1 : 0]
  )
  const fadePoints = [start - fadeWindow, start + fadeWindow, end - fadeWindow, end + fadeWindow]
  const opacityRange = inRange(fadePoints, [first ? 1 : 0, 1, 1, last ? 1 : 0])
  const opacity = useTransform(progress, opacityRange.input, opacityRange.output)
  const bgScale = useTransform(progress, [start, end], reducedMotion ? [1, 1] : [1.05, 1.2])
  const textYRange = inRange(
    fadePoints,
    reducedMotion ? [0, 0, 0, 0] : [first ? 0 : 50, 0, 0, last ? 0 : -50]
  )
  const textY = useTransform(progress, textYRange.input, textYRange.output)
  // Fully transparent scenes are removed from painting entirely.
  const visibility = useTransform(opacity, (v): 'visible' | 'hidden' => (v > 0.001 ? 'visible' : 'hidden'))

  const sceneOpacity = reducedMotion ? (active ? 1 : 0) : opacity
  const visibleContentOpacity = reducedMotion ? (active ? 1 : 0) : contentOpacity
  const showSweep = Boolean(c.sweep) && !reducedMotion

  return (
    <motion.div
      className="absolute inset-0"
      aria-hidden={!active}
      inert={!active}
      style={{
        opacity: sceneOpacity,
        visibility: reducedMotion ? (active ? 'visible' : 'hidden') : visibility,
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      <motion.div className="absolute inset-0 will-change-transform" style={{ scale: bgScale }}>
        <Image
          src={img(c.bg)}
          alt=""
          fill
          sizes="100vw"
          {...(first && preloadFirst ? { preload: true as const } : { loading: 'eager' as const })}
          className="object-cover"
        />
        {showSweep && <SweepLayer progress={progress} sweepEnd={size * SWEEP_LENGTH} src={img(c.bg)} />}
      </motion.div>

      {/* readability overlays: bottom-up on phones (text sits low), left-to-right on larger screens */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10 sm:hidden" />
      <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 hidden sm:block bg-gradient-to-t from-black/60 to-transparent" />

      {c.cards.map((card, i) => (
        <FloatingCard
          key={card.src}
          card={card}
          progress={progress}
          start={start}
          end={end}
          mpos={mobilePositions[c.cards.length]?.[i] ?? mobilePositions[3][i % 3]}
          contentOpacity={visibleContentOpacity}
          reducedMotion={reducedMotion}
          isMobile={isMobile}
          isShortMobile={isShortMobile}
        />
      ))}

      {c.badge && <Seal progress={progress} reducedMotion={reducedMotion} />}

      {/* text: bottom-anchored on phones (respects the home-bar safe area), centred on larger screens */}
      <motion.div
        style={{ y: textY, opacity: visibleContentOpacity }}
        className="container-wide relative h-full flex items-end sm:items-center pb-[calc(env(safe-area-inset-bottom)+2.25rem)] sm:pb-0"
      >
        <div className="max-w-xl w-full pl-4 pr-4 sm:pr-0 sm:pl-8 lg:pl-8">
          <motion.p
            className="text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gold-accent mb-3 sm:mb-4"
            animate={{ opacity: active ? 1 : 0, x: reducedMotion || active ? 0 : -20 }}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
          >
            {c.kicker}
          </motion.p>
          <RevealTitle text={c.title} active={active} reducedMotion={reducedMotion} />
          <motion.p
            className="text-white/85 text-[15px] sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-md"
            animate={{ opacity: active ? 1 : 0, y: reducedMotion || active ? 0 : 16 }}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion || !active ? 0 : 0.4 }}
          >
            {c.body}
          </motion.p>
          {c.cta && (
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              animate={{ opacity: active ? 1 : 0, y: reducedMotion || active ? 0 : 16 }}
              transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion || !active ? 0 : 0.55 }}
            >
              <Link
                href="/shop"
                className="btn-primary w-full sm:w-auto justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <ShoppingBag size={16} />SHOP NOW
              </Link>
              <Link
                href="/product/fresh-ride-kit#specifications"
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 border border-white/70 text-white text-sm font-semibold tracking-wider uppercase hover:bg-white hover:text-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Product Specifications <ArrowRight size={15} />
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
})

/** Return the active scene index once its content is visibly fading in. */
function getActiveIndex(value: number, total: number) {
  return Math.min(total - 1, Math.max(0, Math.floor((value - ACTIVE_SCENE_THRESHOLD) * total)))
}

/** Scroll-driven product story with responsive, SSR-safe scroll sizing. */
export default function ProductIntroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // No useSpring: scroll is already smooth, and a spring kept animating after scrolling stopped,
  // forcing extra frames and making the section feel like it lagged behind the finger.
  const progress = scrollYProgress
  const total = chapters.length
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  // Start loading one screen ahead so images are ready before the section reaches the viewport.
  const sectionNearViewport = useInView(ref, { margin: '100% 0px' })
  const isMobile = useMediaQuery('(max-width: 639px)')
  const isShortMobile = useMediaQuery('(max-width: 639px) and (max-height: 620px)')

  const subscribeToProgress = useCallback(
    (onChange: () => void) => {
      let currentIndex = getActiveIndex(progress.get(), total)
      return progress.on('change', (value) => {
        const nextIndex = getActiveIndex(value, total)
        if (currentIndex === nextIndex) return
        currentIndex = nextIndex
        onChange()
      })
    },
    [progress, total]
  )
  const getCurrentIndex = useCallback(() => getActiveIndex(progress.get(), total), [progress, total])
  const activeIndex = useSyncExternalStore(subscribeToProgress, getCurrentIndex, () => 0)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return

    const unsupportedCounts = new Set(
      chapters
        .map((chapter) => chapter.cards.length)
        .filter((count) => count > 0 && !mobilePositions[count])
    )
    unsupportedCounts.forEach((count) => {
      console.warn(`ProductIntroSection has no mobile card positions for ${count} cards.`)
    })
  }, [])

  const scrollHeightStyle: CSSProperties & {
    '--product-intro-mobile-height': string
    '--product-intro-desktop-height': string
  } = {
    '--product-intro-mobile-height': `${total * SCROLL_PER_SCENE_VH.mobile}vh`,
    '--product-intro-desktop-height': `${total * SCROLL_PER_SCENE_VH.desktop}vh`,
  }

  return (
    <>
      <a
        href="#product-intro-end"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-3 focus:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-accent"
      >
        Skip product story
      </a>
      <section
        id="product-intro"
        ref={ref}
        className="relative bg-black h-[var(--product-intro-mobile-height)] sm:h-[var(--product-intro-desktop-height)]"
        style={scrollHeightStyle}
      >
        {/* dvh follows the visible phone screen as its browser address bar changes height. */}
        <div className="sticky top-0 h-[100vh] supports-[height:100dvh]:h-[100dvh] overflow-hidden">
          <div className="absolute inset-x-0 top-0 z-20 h-1 bg-white/20" aria-hidden="true">
            <motion.div className="h-full origin-left bg-gold-accent" style={{ scaleX: progress }} />
          </div>
          {/* Only the active scene and its two neighbours are mounted, so at most 3 scenes
              compute transforms and hold full-screen layers at any moment (was all 5). */}
          {sectionNearViewport &&
            chapters.map((c, i) =>
              Math.abs(i - activeIndex) > 1 ? null : (
                <ChapterScene
                  key={c.title}
                  c={c}
                  index={i}
                  total={total}
                  progress={progress}
                  active={activeIndex === i}
                  reducedMotion={reducedMotion}
                  preloadFirst={activeIndex === 0}
                  isMobile={isMobile}
                  isShortMobile={isShortMobile}
                />
              )
            )}
        </div>
      </section>
      <div id="product-intro-end" tabIndex={-1} />
    </>
  )
}