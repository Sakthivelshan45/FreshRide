'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Zap, Plus, Minus, ChevronRight, Star, Shield, Truck, RotateCcw } from 'lucide-react'
import { useCartStore } from '@/hooks/useCartStore'
import { formatPrice, calculateDiscount } from '@/lib/utils/helpers'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Variant { id: string; name: string; price: number; compare_price: number | null; pack_quantity: number; stock: number; is_active: boolean; sort_order: number }
interface ProductImage { url: string; alt: string | null; is_primary: boolean }
interface Product { id: string; name: string; slug: string; description: string | null; short_description: string | null; variants: Variant[]; images: ProductImage[] }

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

  const discount = calculateDiscount(selectedVariant?.price, selectedVariant?.compare_price)
  const mainImage = product.images[activeImage]?.url || '/images/products/three_piece_kit.png'

  const handleAdd = () => {
    if (!selectedVariant) return
    for (let i = 0; i < qty; i++) {
      addItem({
        variantId: selectedVariant.id,
        productId: product.id,
        name: product.name,
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        comparePrice: selectedVariant.compare_price,
        image: mainImage,
        packQuantity: selectedVariant.pack_quantity,
        stock: selectedVariant.stock,
      })
    }
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  const handleBuyNow = () => {
    handleAdd()
    router.push('/checkout')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-light-bg py-3 border-b border-silver">
        <div className="container-wide flex items-center gap-2 text-xs text-green-secondary">
          <Link href="/" className="hover:text-green-primary">Home</Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-green-primary">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-navy-dark">Fresh Ride Kit</span>
        </div>
      </div>

      <div className="container-wide py-12">
        <div className="grid lg:grid-cols-2 gap-14">
          {/* Image gallery */}
          <div>
            {/* Main image */}
            <div className="relative aspect-square bg-light-bg mb-4 overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.div key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                  <Image src={mainImage} alt={product.images[activeImage]?.alt || product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                </motion.div>
              </AnimatePresence>
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-gold-accent text-white text-xs font-bold px-3 py-1.5">{discount}% OFF</div>
              )}
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`relative w-20 h-20 border-2 transition-colors ${i === activeImage ? 'border-green-primary' : 'border-silver hover:border-green-secondary'}`}>
                    <Image src={img.url} alt={img.alt || ''} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <p className="eyebrow mb-3">Butterfly Fresh Ride</p>
            <h1 className="font-serif text-3xl lg:text-4xl text-navy-dark leading-tight mb-4">{product.name}</h1>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-gold-accent fill-gold-accent" />)}</div>
              <span className="text-xs text-green-secondary">4.8 · Sample rating</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-navy-dark">{formatPrice(selectedVariant?.price)}</span>
              {selectedVariant?.compare_price && selectedVariant.compare_price > selectedVariant.price && (
                <span className="text-lg text-green-secondary line-through">{formatPrice(selectedVariant.compare_price)}</span>
              )}
              {discount > 0 && <span className="text-sm text-green-600 font-medium">Save {discount}%</span>}
            </div>

            <p className="text-green-secondary text-sm leading-relaxed mb-7">{product.short_description || product.description}</p>

            {/* Kit contents */}
            <div className="flex gap-4 mb-7 p-4 bg-light-bg">
              {['🛏️ Bedsheet', '🛏️ Pillow Cover', '🌙 Blanket'].map(item => (
                <span key={item} className="text-xs font-medium text-navy-dark">{item}</span>
              ))}
            </div>

            {/* Variant selector */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-dark mb-3">Pack Size</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedVariant(v); setQty(1) }}
                    disabled={v.stock === 0}
                    className={`px-4 py-2 text-sm border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      selectedVariant?.id === v.id ? 'border-green-primary bg-green-primary text-white' : 'border-silver text-navy-dark hover:border-green-primary'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-dark mb-3">Quantity</p>
              <div className="flex items-center border border-silver w-fit">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-light-bg"><Minus size={14} /></button>
                <span className="w-12 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(selectedVariant?.stock || 10, qty + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-light-bg"><Plus size={14} /></button>
              </div>
              {selectedVariant && selectedVariant.stock <= 10 && selectedVariant.stock > 0 && (
                <p className="text-xs text-amber-600 mt-2">Only {selectedVariant.stock} left in stock</p>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button id="pdp-add-cart" onClick={handleAdd} disabled={!selectedVariant || selectedVariant.stock === 0}
                className={`btn-outline flex-1 justify-center ${addedToCart ? 'bg-green-50 border-green-500 text-green-700' : ''}`}>
                <ShoppingBag size={16} />
                {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
              <button id="pdp-buy-now" onClick={handleBuyNow} disabled={!selectedVariant || selectedVariant.stock === 0} className="btn-primary flex-1 justify-center">
                <Zap size={16} />
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-silver">
              {[
                { icon: Shield, label: 'Secure Payment' },
                { icon: Truck, label: 'Fast Delivery' },
                { icon: RotateCcw, label: 'Easy Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <Icon size={20} className="text-green-primary" />
                  <span className="text-xs text-green-secondary">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product description */}
        <div className="mt-16 grid lg:grid-cols-3 gap-12" id="specifications">
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl text-navy-dark mb-5">Product Details</h2>
            <p className="text-green-secondary leading-relaxed mb-6">{product.description}</p>
            <div className="bg-light-bg p-6">
              <h3 className="font-medium text-navy-dark mb-4">What&apos;s Included in Every Kit</h3>
              <ul className="space-y-2 text-sm text-green-secondary">
                <li>✓ 1 × Disposable Bedsheet</li>
                <li>✓ 1 × Disposable Pillow Cover</li>
                <li>✓ 1 × Disposable Blanket</li>
                <li>✓ Compact sealed packaging for hygiene</li>
              </ul>
            </div>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-navy-dark mb-5">Shipping &amp; Returns</h2>
            <div className="space-y-4 text-sm text-green-secondary">
              <div><p className="font-medium text-navy-dark mb-1">Free Shipping</p><p>On all orders above ₹999. Standard charge applies below this threshold.</p></div>
              <div><p className="font-medium text-navy-dark mb-1">Delivery Time</p><p>3–7 business days across India.</p></div>
              <div><p className="font-medium text-navy-dark mb-1">Return Policy</p><p>Unopened sealed packs can be returned within 7 days. Opened kits cannot be returned due to hygiene requirements.</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
