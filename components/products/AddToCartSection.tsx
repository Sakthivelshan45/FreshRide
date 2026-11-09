'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/hooks/useCartStore'

type Variant = {
  id: string
  name: string
  price: number
  compare_price: number | null
  pack_quantity: number
  stock: number
  is_active: boolean
  sort_order: number
}

type Props = {
  product: { id: string; name: string; slug: string; image: string }
  variants: Variant[]
  isPriceComing: boolean
}

export default function AddToCartSection({ product, variants, isPriceComing }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? '')
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0]

  const handleAdd = () => {
    if (!selectedVariant || isPriceComing) return
    // addItem increments by 1 each call; call quantity times
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        variantId: selectedVariant.id,
        name: product.name,
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        comparePrice: selectedVariant.compare_price,
        image: product.image,
        packQuantity: selectedVariant.pack_quantity,
        stock: selectedVariant.stock,
      })
    }
    setQuantity(quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (isPriceComing) {
    return (
      <div className="pt-4 border-t border-silver space-y-4">
        <div className="bg-light-bg border border-silver p-4 text-sm text-green-secondary">
          <p className="font-semibold text-navy-dark mb-1">🕐 Price Coming Soon</p>
          <p>We are finalising pricing for this product. Check back soon or contact us for bulk enquiries.</p>
        </div>
        <a
          href="https://wa.me/916235958246?text=Hi%2C%20I%20am%20interested%20in%20buying%20Fresh%20Ride%20products%20in%20bulk."
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline w-full justify-center text-center"
        >
          Enquire on WhatsApp
        </a>
      </div>
    )
  }

  return (
    <div className="pt-4 border-t border-silver space-y-4">
      {/* Variant selector */}
      {variants.length > 1 && (
        <div>
          <p className="text-xs font-semibold text-navy-dark uppercase tracking-widest mb-2">Pack Size</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariantId(v.id)}
                className={`px-4 py-2 text-xs font-semibold border transition-colors ${
                  selectedVariantId === v.id
                    ? 'bg-green-primary text-white border-green-primary'
                    : 'bg-white text-navy-dark border-silver hover:border-green-primary'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <p className="text-xs font-semibold text-navy-dark uppercase tracking-widest mb-2">Quantity</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-9 h-9 border border-silver flex items-center justify-center hover:border-green-primary transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="text-navy-dark font-semibold w-6 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-9 h-9 border border-silver flex items-center justify-center hover:border-green-primary transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        disabled={!selectedVariant || selectedVariant.stock === 0}
        className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <ShoppingCart size={16} />
        {added ? 'Added to Cart!' : selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  )
}
