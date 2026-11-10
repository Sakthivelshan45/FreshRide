import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductDetailClient from './ProductDetailClient'
import { createClient } from '@/lib/supabase/server'

type ProductVariant = {
  id: string
  name: string
  price: number
  compare_price: number | null
  pack_quantity: number
  stock: number
  is_active: boolean
  sort_order: number
}

type ProductImage = {
  url: string
  alt: string | null
  is_primary: boolean
}

type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  variants: ProductVariant[]
  images: ProductImage[]
}

const FALLBACK_PRODUCT: Product = {
  id: 'fresh-ride-kit',
  name: 'Butterfly Fresh Ride Disposable Travel Bedding Kit',
  slug: 'fresh-ride-kit',
  description: 'The Butterfly Fresh Ride disposable travel bedding kit is your complete all-in-one bedding solution for overnight journeys. Designed for convenience and hygiene, each kit includes a soft bedsheet, pillow cover and blanket — everything you need for a fresh, comfortable night of rest wherever you travel.',
  short_description: 'Complete 3-piece disposable travel bedding kit — bedsheet, pillow cover & blanket.',
  variants: [
    { id: 'v1', name: 'Single Kit', price: 149, compare_price: null, pack_quantity: 1, stock: 100, is_active: true, sort_order: 1 },
    { id: 'v2', name: 'Pack of 5', price: 649, compare_price: 745, pack_quantity: 5, stock: 80, is_active: true, sort_order: 2 },
    { id: 'v3', name: 'Pack of 10', price: 1199, compare_price: 1490, pack_quantity: 10, stock: 60, is_active: true, sort_order: 3 },
    { id: 'v4', name: 'Bulk Pack (25)', price: 2749, compare_price: 3725, pack_quantity: 25, stock: 40, is_active: true, sort_order: 4 },
  ],
  images: [
    { url: '/images/products/three_piece_kit.png', alt: 'Butterfly Fresh Ride 3-piece kit', is_primary: true },
    { url: '/images/lifestyle/hero_sleeper_berth.png', alt: 'Fresh Ride kit on a sleeper bus berth', is_primary: false },
    { url: '/images/lifestyle/hotel_room.png', alt: 'Disposable bedding in a hotel room', is_primary: false },
  ],
}

export async function generateMetadata() {
  return {
    title: 'Butterfly Fresh Ride Disposable Travel Bedding Kit | 3-Piece Set',
    description: 'Buy Butterfly Fresh Ride disposable travel bedding kit online. Includes bedsheet, pillow cover and blanket. Ideal for sleeper buses, hotels and overnight travel.',
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let product = FALLBACK_PRODUCT

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select(`*, product_variants(*), product_images(*)`)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (data) {
      const productData = data as unknown as {
        id: string
        name: string
        slug: string
        description: string | null
        short_description: string | null
        product_variants: ProductVariant[] | null
        product_images: ProductImage[] | null
      }

      product = {
        id: productData.id,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        short_description: productData.short_description,
        variants: (productData.product_variants ?? [])
          .filter((variant) => variant.is_active)
          .sort((a, b) => a.sort_order - b.sort_order),
        images: productData.product_images ?? [],
      }
    }
  } catch {
    // Use fallback
  }

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <ProductDetailClient product={product} />
      </main>
      <Footer />
    </>
  )
}
