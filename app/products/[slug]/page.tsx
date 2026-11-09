import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AddToCartSection from '@/components/products/AddToCartSection'
import { Tag, ArrowLeft } from 'lucide-react'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description')
    .eq('slug', slug)
    .single()

  if (!product) return { title: 'Product Not Found | Fresh Ride' }
  const p = product as { name: string; short_description: string | null }
  return {
    title: `${p.name} | Butterfly Fresh Ride`,
    description: p.short_description ?? '',
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      short_description,
      description,
      category,
      feature_tags,
      is_active,
      product_images ( url, alt, is_primary, sort_order ),
      product_variants ( id, name, price, compare_price, pack_quantity, stock, is_active, sort_order )
    `)
    .eq('slug', slug)
    .single()

  if (!product) notFound()

  const safeProduct = product as {
    id: string
    name: string
    slug: string
    short_description: string | null
    description: string | null
    category: string | null
    feature_tags: string[] | null
    is_active: boolean
    product_images: { url: string; alt: string | null; is_primary: boolean; sort_order: number }[]
    product_variants: { id: string; name: string; price: number; compare_price: number | null; pack_quantity: number; stock: number; is_active: boolean; sort_order: number }[]
  }

  const images = safeProduct.product_images.sort((a, b) => a.sort_order - b.sort_order)
  const primaryImage = images.find((i) => i.is_primary) ?? images[0]
  const activeVariants = safeProduct.product_variants.filter((v) => v.is_active).sort((a, b) => a.sort_order - b.sort_order)
  const lowestPrice = safeProduct.product_variants.reduce((min, v) => (v.price < min ? v.price : min), Infinity)
  const isPriceComing = lowestPrice === 0 || lowestPrice === Infinity

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-light-bg">
        <div className="container-wide section-padding">
          {/* Back link */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-green-secondary hover:text-green-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to All Products
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Image */}
            <div className="relative aspect-square bg-white border border-silver overflow-hidden">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt ?? safeProduct.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-light-bg">
                  <p className="text-green-secondary text-sm">No image available</p>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {safeProduct.category && (
                <span className="text-[11px] text-green-secondary tracking-widest uppercase">{safeProduct.category}</span>
              )}
              <h1 className="font-serif text-3xl sm:text-4xl text-navy-dark leading-tight">
                {safeProduct.name}
              </h1>

              {/* Price */}
              {isPriceComing ? (
                <div className="inline-block bg-gold-accent text-white text-xs font-bold tracking-wide px-4 py-2 uppercase">
                  Price Coming Soon
                </div>
              ) : (
                <p className="text-2xl font-bold text-navy-dark">
                  ₹{lowestPrice.toLocaleString('en-IN')}
                </p>
              )}

              {/* Short description */}
              {safeProduct.short_description && (
                <p className="text-green-secondary text-sm leading-relaxed border-l-2 border-green-primary pl-4">
                  {safeProduct.short_description}
                </p>
              )}

              {/* Long description */}
              {safeProduct.description && (
                <div className="prose prose-sm max-w-none text-navy-dark">
                  <p className="text-sm leading-relaxed">{safeProduct.description}</p>
                </div>
              )}

              {/* Feature tags */}
              {safeProduct.feature_tags && safeProduct.feature_tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-navy-dark uppercase tracking-widest mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {safeProduct.feature_tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs bg-white text-green-primary px-3 py-1 border border-green-primary"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to cart section */}
              <AddToCartSection
                product={{
                  id: safeProduct.id,
                  name: safeProduct.name,
                  slug: safeProduct.slug,
                  image: primaryImage?.url ?? '/images/placeholder.jpg',
                }}
                variants={activeVariants}
                isPriceComing={isPriceComing}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
