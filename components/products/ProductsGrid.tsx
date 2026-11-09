'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Tag } from 'lucide-react'

type Product = {
  id: string
  name: string
  slug: string
  short_description: string | null
  category: string | null
  feature_tags: string[] | null
  is_active: boolean
  product_images: { url: string; alt: string | null; is_primary: boolean }[]
  product_variants: { price: number; is_active: boolean }[]
}

const CATEGORIES = ['All', 'Sleep', 'Comfort', 'Bedding', 'Hygiene']

function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.product_images.find((i) => i.is_primary) ?? product.product_images[0]
  const lowestVariant = product.product_variants.sort((a, b) => a.price - b.price)[0]
  const price = lowestVariant?.price ?? 0
  const isPriceComing = price === 0

  return (
    <div className="bg-white border border-silver group flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-light-bg">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-light-bg">
            <ShoppingCart size={48} className="text-silver" />
          </div>
        )}
        {isPriceComing && (
          <span className="absolute top-3 left-3 bg-gold-accent text-white text-[10px] font-bold tracking-wide px-2 py-1 uppercase">
            Coming Soon
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <span className="text-[10px] text-green-secondary tracking-widest uppercase mb-1">{product.category}</span>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-serif text-navy-dark text-base font-semibold leading-snug hover:text-green-primary transition-colors mb-2">
            {product.name}
          </h3>
        </Link>
        {product.short_description && (
          <p className="text-green-secondary text-xs leading-relaxed mb-3 flex-1">{product.short_description}</p>
        )}

        {/* Tags */}
        {product.feature_tags && product.feature_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.feature_tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[10px] bg-light-bg text-green-secondary px-2 py-0.5 border border-silver"
              >
                <Tag size={8} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price / CTA */}
        {isPriceComing ? (
          <div className="mt-auto">
            <p className="text-xs text-gold-accent font-semibold mb-2">Price coming soon</p>
            <button
              disabled
              className="w-full text-center text-xs py-2.5 px-4 border border-silver text-silver cursor-not-allowed bg-light-bg tracking-wide uppercase font-semibold"
            >
              Add to Cart
            </button>
          </div>
        ) : (
          <div className="mt-auto">
            <p className="text-navy-dark font-bold text-sm mb-2">
              ₹{price.toLocaleString('en-IN')}
            </p>
            <Link
              href={`/products/${product.slug}`}
              className="btn-primary w-full justify-center text-center text-xs"
            >
              <ShoppingCart size={14} />
              View & Add to Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="bg-white border border-silver animate-pulse">
      <div className="aspect-square bg-light-bg" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-light-bg rounded w-1/3" />
        <div className="h-4 bg-light-bg rounded w-3/4" />
        <div className="h-3 bg-light-bg rounded w-full" />
        <div className="h-3 bg-light-bg rounded w-2/3" />
        <div className="h-9 bg-light-bg rounded mt-4" />
      </div>
    </div>
  )
}

export default function ProductsGrid({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === activeCategory)

  return (
    <section className="container-wide section-padding">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 text-xs font-semibold tracking-widest uppercase border transition-colors duration-200 ${
              activeCategory === cat
                ? 'bg-green-primary text-white border-green-primary'
                : 'bg-white text-navy-dark border-silver hover:border-green-primary hover:text-green-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-green-secondary">
          <ShoppingCart size={48} className="mx-auto mb-4 text-silver" />
          <p className="text-lg font-serif text-navy-dark mb-2">No products found</p>
          <p className="text-sm">Try a different category or check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

export { ProductSkeleton }
