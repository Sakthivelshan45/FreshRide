



// 'use client'

// import { useState, useEffect, useRef } from 'react'
// import Image from 'next/image'
// import { motion } from 'framer-motion'
// import { ShoppingBag, Zap, Filter } from 'lucide-react'
// import { useCartStore } from '@/hooks/useCartStore'
// import { formatPrice, calculateDiscount } from '@/lib/utils/helpers'
// import { useRouter } from 'next/navigation'

// // ADD YOUR IMAGE FILENAMES HERE (files inside public/images/lifestyle).
// // Names are case-sensitive on Vercel, so match them exactly.
// const HERO_IMAGES = [
//   '/images/lifestyle/view.png',
//   '/images/lifestyle/hotel_empty.png',
//   '/images/lifestyle/unfold.png',
//   '/images/lifestyle/bus_bulk.png',
//   '/images/lifestyle/b2b.png',
//   '/images/lifestyle/bus_traval.png',
//   '/images/lifestyle/spa_empty.png',
//   '/images/lifestyle/spa1.png',
//   '/images/lifestyle/spa2.png',
//   '/images/lifestyle/spa3.png',
//   '/images/lifestyle/loom.png',
//   '/images/lifestyle/loom3.png',
//   '/images/lifestyle/hotel.png',
//   '/images/lifestyle/hospital_use.png',
//   '/images/lifestyle/hospital_empty.png',
// ]

// const HERO_INTERVAL_MS = 3000

// interface Variant {
//   id: string
//   name: string
//   price: number
//   compare_price: number | null
//   pack_quantity: number
//   stock: number
//   is_active: boolean
//   sort_order: number
// }

// interface ShopClientProps {
//   variants: Variant[]
//   productId: string
//   productName: string
//   productImage: string
// }

// export default function ShopClient({ variants, productId, productName, productImage }: ShopClientProps) {
//   const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'quantity'>('quantity')
//   const [activeSlide, setActiveSlide] = useState(0)
//   const [paused, setPaused] = useState(false)
//   const heroRef = useRef<HTMLDivElement>(null)
//   const addItem = useCartStore((s) => s.addItem)
//   const router = useRouter()

//   // Change the hero image every 3 seconds (pauses while the mouse is over it)
//   useEffect(() => {
//     if (paused || HERO_IMAGES.length < 2) return
//     const timer = setInterval(() => {
//       setActiveSlide((prev) => (prev + 1) % HERO_IMAGES.length)
//     }, HERO_INTERVAL_MS)
//     return () => clearInterval(timer)
//   }, [paused])

//   const scrollToProducts = () => {
//     const el = heroRef.current
//     if (!el) return
//     const bottom = window.scrollY + el.getBoundingClientRect().bottom
//     window.scrollTo({ top: bottom - 80, behavior: 'smooth' })
//   }

//   const sorted = [...variants].sort((a, b) => {
//     if (sortBy === 'price_asc') return a.price - b.price
//     if (sortBy === 'price_desc') return b.price - a.price
//     return a.pack_quantity - b.pack_quantity
//   })

//   const handleAddToCart = (v: Variant) => {
//     addItem({
//       variantId: v.id,
//       productId,
//       name: productName,
//       variantName: v.name,
//       price: v.price,
//       comparePrice: v.compare_price,
//       image: productImage,
//       packQuantity: v.pack_quantity,
//       stock: v.stock,
//     })
//   }

//   const handleBuyNow = (v: Variant) => {
//     handleAddToCart(v)
//     router.push('/checkout')
//   }

//   return (
//     <div className="container-wide section-padding">
//       {/* Dynamic landing hero */}

//       <div
//         ref={heroRef}
//         className="relative mb-12 overflow-hidden bg-light-bg md:min-h-[540px] md:flex md:items-center"
//         onMouseEnter={() => setPaused(true)}
//         onMouseLeave={() => setPaused(false)}
//       >
//         {/* The image sits above the copy on mobile and fills the hero on desktop. */}
//         <div className="relative mx-3 mt-4 aspect-[16/9] overflow-hidden rounded-md md:absolute md:inset-0 md:m-0 md:h-full md:w-full md:aspect-auto md:rounded-none">
//           {HERO_IMAGES.map((src, i) => (
//             <Image
//               key={src}
//               src={src}
//               alt="Butterfly Fresh Ride disposable travel bedding kit"
//               fill
//               priority={i === 0}
//               sizes="100vw"
//               className={`object-cover transition-opacity duration-1000 ease-in-out ${
//                 i === activeSlide ? 'opacity-100' : 'opacity-0'
//               }`}
//             />
//           ))}

//           {HERO_IMAGES.length > 1 && (
//             <div className="absolute bottom-4 right-6 z-10 flex gap-2">
//               {HERO_IMAGES.map((_, i) => (
//                 <button
//                   key={i}
//                   aria-label={`Show image ${i + 1}`}
//                   onClick={() => setActiveSlide(i)}
//                   className={`h-2 rounded-full transition-all duration-300 ${
//                     i === activeSlide ? 'w-6 bg-green-primary' : 'w-2 bg-white/80'
//                   }`}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Left-side fade keeps the desktop text readable while leaving the right side clear */}
//         <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.75)_0%,transparent_10%)] md:block" />

//         {/* Text content */}
//         <div className="relative z-10 mx-auto w-full max-w-xl px-6 py-10 text-center md:mx-0 md:px-14 md:py-12 md:text-left">
//           <p className="eyebrow mb-3">Butterfly Fresh Ride</p>
//           <h1 className="font-serif text-4xl lg:text-5xl text-navy-dark leading-tight mb-4">
//             Shop Disposable
//             <br />
//             <span className="text-green-primary">Travel Bedding Kits</span>
//           </h1>
//           <p className="mx-auto max-w-md text-navy-dark/80 mb-8 md:mx-0">
//             Choose the pack size that fits your needs. All kits include bedsheet, pillow cover and blanket.
//             Free shipping on orders above ₹999.
//           </p>
//           <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
//             <button
//               onClick={scrollToProducts}
//               className="btn-primary w-full max-w-xs justify-center text-sm px-8 py-3 sm:w-auto"
//             >
//               Shop the kits
//             </button>
//             {/* Change '/contact' to your enquiry / bulk order page */}
//             <button
//               onClick={() => router.push('/contact')}
//               className="btn-outline w-full max-w-xs justify-center text-sm px-8 py-3 sm:w-auto"
//             >
//               Bulk orders for operators
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="mb-12 text-center">
//         <p className="eyebrow mb-3">Butterfly Fresh Ride</p>
//         <h1 className="font-serif text-4xl lg:text-5xl text-navy-dark leading-tight mb-4">
//            Better sleep starts with 

//           <br />
//           <span className="text-green-primary">FreshRide Travel Bedding Kits</span>
//         </h1>
//       </div>

//       {/* Sort bar */}
//       <div className="flex items-center gap-3 mb-8 pb-6 border-b border-silver">
//         <Filter size={16} className="text-green-secondary" />
//         <span className="text-sm text-green-secondary">Sort by:</span>
//         {[
//           { value: 'quantity', label: 'Pack Size' },
//           { value: 'price_asc', label: 'Price: Low to High' },
//           { value: 'price_desc', label: 'Price: High to Low' },
//         ].map((opt) => (
//           <button
//             key={opt.value}
//             onClick={() => setSortBy(opt.value as typeof sortBy)}
//             className={`text-xs px-3 py-1.5 border transition-all ${
//               sortBy === opt.value
//                 ? 'bg-green-primary text-white border-green-primary'
//                 : 'text-navy-dark border-silver hover:border-green-primary'
//             }`}
//           >
//             {opt.label}
//           </button>
//         ))}
//       </div>

//       {/* Products grid */}
//       <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
//         {sorted.map((variant, i) => {
//           const discount = calculateDiscount(variant.price, variant.compare_price)
//           const pricePerKit = (variant.price / variant.pack_quantity).toFixed(0)

//           return (
//             <motion.div
//               key={variant.id}
//               className="group border border-silver hover:border-green-primary hover:shadow-lg transition-all duration-300 flex flex-col"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.4, delay: i * 0.07 }}
//             >
//               {/* Image */}
//               <div className="relative aspect-square bg-light-bg overflow-hidden">
//                 <Image
//                   src={productImage}
//                   alt={`${productName} — ${variant.name}`}
//                   fill
//                   sizes="(max-width: 640px) 100vw, 25vw"
//                   className="object-cover group-hover:scale-105 transition-transform duration-500"
//                 />
//                 {discount > 0 && (
//                   <div className="absolute top-3 left-3 bg-gold-accent text-white text-[10px] font-bold px-2.5 py-1">
//                     {discount}% OFF
//                   </div>
//                 )}
//               </div>

//               <div className="p-5 flex flex-col flex-1">
//                 <h2 className="font-serif text-lg text-navy-dark mb-1">{variant.name}</h2>
//                 <p className="text-xs text-green-secondary mb-3">
//                   {variant.pack_quantity} kit{variant.pack_quantity > 1 ? 's' : ''} · ₹{pricePerKit}/kit
//                 </p>

//                 <div className="flex items-baseline gap-2 mb-3">
//                   <span className="text-xl font-bold text-navy-dark">{formatPrice(variant.price)}</span>
//                   {variant.compare_price && variant.compare_price > variant.price && (
//                     <span className="text-sm text-green-secondary line-through">{formatPrice(variant.compare_price)}</span>
//                   )}
//                 </div>

//                 <div className="mb-4">
//                   {variant.stock > 10 ? (
//                     <span className="text-xs text-green-600">✓ In Stock</span>
//                   ) : variant.stock > 0 ? (
//                     <span className="text-xs text-amber-600">Only {variant.stock} left</span>
//                   ) : (
//                     <span className="text-xs text-red-500">Out of Stock</span>
//                   )}
//                 </div>

//                 <div className="mt-auto space-y-2">
//                   <button
//                     id={`shop-add-${variant.id}`}
//                     onClick={() => handleAddToCart(variant)}
//                     disabled={variant.stock === 0}
//                     className="btn-outline w-full justify-center text-xs py-2.5 disabled:opacity-50"
//                   >
//                     <ShoppingBag size={13} />
//                     Add to Cart
//                   </button>
//                   <button
//                     id={`shop-buy-${variant.id}`}
//                     onClick={() => handleBuyNow(variant)}
//                     disabled={variant.stock === 0}
//                     className="btn-primary w-full justify-center text-xs py-2.5 disabled:opacity-50"
//                   >
//                     <Zap size={13} />
//                     Buy Now
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }


'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag, Zap, Filter } from 'lucide-react'
import { useCartStore } from '@/hooks/useCartStore'
import { formatPrice, calculateDiscount } from '@/lib/utils/helpers'
import { useRouter } from 'next/navigation'

// ADD YOUR IMAGE FILENAMES HERE (files inside public/images/lifestyle).
// Names are case-sensitive on Vercel, so match them exactly.
const HERO_IMAGES = [
  '/images/lifestyle/hospital.png',
  '/images/lifestyle/hotel_empty.png',
  '/images/lifestyle/unfold.png',
  '/images/lifestyle/bus_bulk.png',
  '/images/lifestyle/b2b.png',
  '/images/lifestyle/bus_traval.png',
  '/images/lifestyle/spa_empty.png',
  '/images/lifestyle/spa1.png',
  '/images/lifestyle/spa2.png',
  '/images/lifestyle/spa3.png',
  '/images/lifestyle/loom.png',
  '/images/lifestyle/loom3.png',
  '/images/lifestyle/hotel.png',
  '/images/lifestyle/hospital_use.png',
  '/images/lifestyle/hospital_empty.png',
]

const HERO_INTERVAL_MS = 3000

interface Variant {
  id: string
  name: string
  price: number
  compare_price: number | null
  pack_quantity: number
  stock: number
  is_active: boolean
  sort_order: number
}

interface ShopClientProps {
  variants: Variant[]
  productId: string
  productName: string
  productImage: string
}

export default function ShopClient({ variants, productId, productName, productImage }: ShopClientProps) {
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'quantity'>('quantity')
  const [activeSlide, setActiveSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

  // Change the hero image every 3 seconds (pauses while the mouse is over it)
  useEffect(() => {
    if (paused || HERO_IMAGES.length < 2) return
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_IMAGES.length)
    }, HERO_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [paused])

  const scrollToProducts = () => {
    const el = heroRef.current
    if (!el) return
    const bottom = window.scrollY + el.getBoundingClientRect().bottom
    window.scrollTo({ top: bottom - 80, behavior: 'smooth' })
  }

  const sorted = [...variants].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price
    if (sortBy === 'price_desc') return b.price - a.price
    return a.pack_quantity - b.pack_quantity
  })

  const handleAddToCart = (v: Variant) => {
    addItem({
      variantId: v.id,
      productId,
      name: productName,
      variantName: v.name,
      price: v.price,
      comparePrice: v.compare_price,
      image: productImage,
      packQuantity: v.pack_quantity,
      stock: v.stock,
    })
  }

  const handleBuyNow = (v: Variant) => {
    handleAddToCart(v)
    router.push('/checkout')
  }

  return (
    <>
      {/* Dynamic landing hero (full width, outside container-wide) */}
      <div
        ref={heroRef}
        className="relative overflow-hidden bg-light-bg md:min-h-[600px] md:flex md:items-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* The image sits above the copy on mobile and fills the hero on desktop. */}
        <div className="relative mx-3 mt-4 aspect-[16/9] overflow-hidden rounded-md md:absolute md:inset-0 md:m-0 md:h-full md:w-full md:aspect-auto md:rounded-none">
          {HERO_IMAGES.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt="Butterfly Fresh Ride disposable travel bedding kit"
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover transition-opacity duration-1000 ease-in-out ${
                i === activeSlide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {HERO_IMAGES.length > 1 && (
            <div className="absolute bottom-4 right-6 z-10 flex gap-2">
              {HERO_IMAGES.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => setActiveSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeSlide ? 'w-6 bg-green-primary' : 'w-2 bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Left-side fade keeps the desktop text readable while leaving the right side clear */}
        <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.75)_0%,transparent_10%)] md:block" />

        {/* Text content */}
        <div className="relative z-10 mx-auto w-full max-w-xl px-6 py-10 text-center md:mx-0 md:px-14 md:py-12 md:text-left">
          <p className="eyebrow mb-3">Butterfly Fresh Ride</p>
          <h1 className="font-serif text-4xl lg:text-5xl text-navy-dark leading-tight mb-4">
            Shop Disposable
            <br />
            <span className="text-green-primary">Travel Bedding Kits</span>
          </h1>
          <p className="mx-auto max-w-md text-navy-dark/80 mb-8 md:mx-0">
            Choose the pack size that fits your needs. All kits include bedsheet, pillow cover and blanket.
            Free shipping on orders above ₹999.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
            <button
              onClick={scrollToProducts}
              className="btn-primary w-full max-w-xs justify-center text-sm px-8 py-3 sm:w-auto"
            >
              Shop the kits
            </button>
            {/* Change '/contact' to your enquiry / bulk order page */}
            <button
              onClick={() => router.push('/contact')}
              className="btn-outline w-full max-w-xs justify-center text-sm px-8 py-3 sm:w-auto"
            >
              Bulk orders for operators
            </button>
          </div>
        </div>
      </div>

      {/* Everything below stays inside container-wide */}
      <div className="container-wide section-padding">
        <div className="mb-12 text-center">
          <p className="eyebrow mb-3">Butterfly Fresh Ride</p>
          <h2 className="font-serif text-4xl lg:text-4xl text-navy-dark leading-tight mb-4">
            Better sleep starts with
            <br />
            <span className="text-green-primary">FreshRide Travel Bedding Kits</span>
          </h2>
        </div>

        {/* Sort bar */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-silver">
          <Filter size={16} className="text-green-secondary" />
          <span className="text-sm text-green-secondary">Sort by:</span>
          {[
            { value: 'quantity', label: 'Pack Size' },
            { value: 'price_asc', label: 'Price: Low to High' },
            { value: 'price_desc', label: 'Price: High to Low' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value as typeof sortBy)}
              className={`text-xs px-3 py-1.5 border transition-all ${
                sortBy === opt.value
                  ? 'bg-green-primary text-white border-green-primary'
                  : 'text-navy-dark border-silver hover:border-green-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {sorted.map((variant, i) => {
            const discount = calculateDiscount(variant.price, variant.compare_price)
            const pricePerKit = (variant.price / variant.pack_quantity).toFixed(0)

            return (
              <motion.div
                key={variant.id}
                className="group border border-silver hover:border-green-primary hover:shadow-lg transition-all duration-300 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                {/* Image */}
                <div className="relative aspect-square bg-light-bg overflow-hidden">
                  <Image
                    src={productImage}
                    alt={`${productName} — ${variant.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-gold-accent text-white text-[10px] font-bold px-2.5 py-1">
                      {discount}% OFF
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-serif text-lg text-navy-dark mb-1">{variant.name}</h2>
                  <p className="text-xs text-green-secondary mb-3">
                    {variant.pack_quantity} kit{variant.pack_quantity > 1 ? 's' : ''} · ₹{pricePerKit}/kit
                  </p>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-bold text-navy-dark">{formatPrice(variant.price)}</span>
                    {variant.compare_price && variant.compare_price > variant.price && (
                      <span className="text-sm text-green-secondary line-through">{formatPrice(variant.compare_price)}</span>
                    )}
                  </div>

                  <div className="mb-4">
                    {variant.stock > 10 ? (
                      <span className="text-xs text-green-600">✓ In Stock</span>
                    ) : variant.stock > 0 ? (
                      <span className="text-xs text-amber-600">Only {variant.stock} left</span>
                    ) : (
                      <span className="text-xs text-red-500">Out of Stock</span>
                    )}
                  </div>

                  <div className="mt-auto space-y-2">
                    <button
                      id={`shop-add-${variant.id}`}
                      onClick={() => handleAddToCart(variant)}
                      disabled={variant.stock === 0}
                      className="btn-outline w-full justify-center text-xs py-2.5 disabled:opacity-50"
                    >
                      <ShoppingBag size={13} />
                      Add to Cart
                    </button>
                    <button
                      id={`shop-buy-${variant.id}`}
                      onClick={() => handleBuyNow(variant)}
                      disabled={variant.stock === 0}
                      className="btn-primary w-full justify-center text-xs py-2.5 disabled:opacity-50"
                    >
                      <Zap size={13} />
                      Buy Now
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </>
  )
}