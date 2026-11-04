'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Zap } from 'lucide-react'
import { useCartStore } from '@/hooks/useCartStore'
import { formatPrice, calculateDiscount } from '@/lib/utils/helpers'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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

interface ProductPackagesProps {
  variants: Variant[]
  productId: string
  productName: string
  productImage: string
}

export default function ProductPackages({ variants, productId, productName, productImage }: ProductPackagesProps) {
  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

  const handleAddToCart = (variant: Variant) => {
    addItem({
      variantId: variant.id,
      productId,
      name: productName,
      variantName: variant.name,
      price: variant.price,
      comparePrice: variant.compare_price,
      image: productImage,
      packQuantity: variant.pack_quantity,
      stock: variant.stock,
    })
  }

  const handleBuyNow = (variant: Variant) => {
    handleAddToCart(variant)
    router.push('/checkout')
  }

  return (
    <section className="section-padding bg-white" id="packages" aria-label="Product packages">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.p
            className="eyebrow mb-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Choose Your Pack
          </motion.p>
          <motion.h2
            className="font-serif text-3xl sm:text-4xl lg:text-5xl text-navy-dark leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Product Packages &amp;
            <br />
            <span className="text-green-primary">Pricing</span>
          </motion.h2>
          <motion.p
            className="text-green-secondary mt-4 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Free shipping on orders above ₹999. All prices include GST.
          </motion.p>
        </div>

        {variants.length === 0 ? (
          <div className="text-center py-16 text-green-secondary">
            <p>Products are being configured. Please check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {variants.map((variant, i) => {
              const discount = calculateDiscount(variant.price, variant.compare_price)
              const isBestValue = i === 2 // Third pack marked as best value

              return (
                <motion.div
                  key={variant.id}
                  className={`relative flex flex-col border-2 transition-all duration-300 hover:shadow-xl group ${
                    isBestValue
                      ? 'border-green-primary shadow-lg'
                      : 'border-silver hover:border-green-secondary'
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  {/* Best value badge */}
                  {isBestValue && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-primary text-white text-[10px] font-semibold tracking-widest uppercase px-4 py-1">
                      Best Value
                    </div>
                  )}

                  {/* Discount badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 right-3 bg-gold-accent text-white text-[10px] font-bold px-2.5 py-1">
                      {discount}% OFF
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative aspect-square bg-light-bg overflow-hidden">
                    <Image
                      src={productImage}
                      alt={`${productName} — ${variant.name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-serif text-xl text-navy-dark mb-1">{variant.name}</h3>
                    <p className="text-green-secondary text-sm mb-4">
                      {variant.pack_quantity} kit{variant.pack_quantity > 1 ? 's' : ''} — bedsheet + pillow cover + blanket
                    </p>

                    {/* Price */}
                    <div className="mb-5 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-navy-dark">
                        {formatPrice(variant.price)}
                      </span>
                      {variant.compare_price && variant.compare_price > variant.price && (
                        <span className="text-sm text-green-secondary line-through">
                          {formatPrice(variant.compare_price)}
                        </span>
                      )}
                    </div>

                    {/* Stock indicator */}
                    <div className="mb-5">
                      {variant.stock > 10 ? (
                        <span className="text-xs text-green-600 font-medium">✓ In Stock</span>
                      ) : variant.stock > 0 ? (
                        <span className="text-xs text-amber-600 font-medium">Only {variant.stock} left</span>
                      ) : (
                        <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                      )}
                    </div>

                    <div className="mt-auto space-y-2">
                      <button
                        id={`add-to-cart-${variant.id}`}
                        onClick={() => handleAddToCart(variant)}
                        disabled={variant.stock === 0}
                        className="btn-outline w-full justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag size={14} />
                        Add to Cart
                      </button>
                      <button
                        id={`buy-now-${variant.id}`}
                        onClick={() => handleBuyNow(variant)}
                        disabled={variant.stock === 0}
                        className={`w-full justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 py-3 px-5 font-semibold tracking-wide uppercase transition-all duration-300 ${
                          isBestValue
                            ? 'btn-primary'
                            : 'bg-navy-dark text-white hover:bg-green-primary'
                        }`}
                      >
                        <Zap size={14} />
                        Buy Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
