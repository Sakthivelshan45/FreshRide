'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag, Zap, Filter } from 'lucide-react'
import { useCartStore } from '@/hooks/useCartStore'
import { formatPrice, calculateDiscount } from '@/lib/utils/helpers'
import { useRouter } from 'next/navigation'

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
  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

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
    <div className="container-wide section-padding">
      {/* Header */}
      <div className="mb-12">
        <p className="eyebrow mb-3">Butterfly Fresh Ride</p>
        <h1 className="font-serif text-4xl lg:text-5xl text-navy-dark leading-tight mb-4">
          Shop Disposable
          <br />
          <span className="text-green-primary">Travel Bedding Kits</span>
        </h1>
        <p className="text-green-secondary max-w-xl">
          Choose the pack size that fits your needs. All kits include bedsheet, pillow cover and blanket.
          Free shipping on orders above ₹999.
        </p>
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
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 25vw"
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
  )
}
