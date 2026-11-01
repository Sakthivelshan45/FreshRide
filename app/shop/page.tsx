import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ShopClient from './ShopClient'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Shop Disposable Travel Bedding Kits',
  description:
    'Browse all Butterfly Fresh Ride disposable travel bedding kit packs — single kits, packs of 5, 10 and bulk orders. Free shipping above ₹999.',
}

const FALLBACK_VARIANTS = [
  { id: 'v1', name: 'Single Kit', price: 149, compare_price: null, pack_quantity: 1, stock: 100, is_active: true, sort_order: 1, product_id: 'p1' },
  { id: 'v2', name: 'Pack of 5', price: 649, compare_price: 745, pack_quantity: 5, stock: 80, is_active: true, sort_order: 2, product_id: 'p1' },
  { id: 'v3', name: 'Pack of 10', price: 1199, compare_price: 1490, pack_quantity: 10, stock: 60, is_active: true, sort_order: 3, product_id: 'p1' },
  { id: 'v4', name: 'Bulk Pack (25)', price: 2749, compare_price: 3725, pack_quantity: 25, stock: 40, is_active: true, sort_order: 4, product_id: 'p1' },
]

export default async function ShopPage() {
  let variants = FALLBACK_VARIANTS
  let productId = 'fresh-ride-kit'
  let productName = 'Butterfly Fresh Ride Disposable Travel Bedding Kit'
  let productImage = '/images/products/three_piece_kit.png'

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select(`id, name, product_variants(*), product_images(url, is_primary)`)
      .eq('slug', 'fresh-ride-kit')
      .eq('is_active', true)
      .single()

    if (data) {
      productId = data.id
      productName = data.name
      const primaryImg = (data as any).product_images?.find((img: any) => img.is_primary)
      if (primaryImg) productImage = primaryImg.url
      const liveVariants = (data as any).product_variants?.filter((v: any) => v.is_active)
      if (liveVariants?.length) variants = liveVariants.sort((a: any, b: any) => a.sort_order - b.sort_order)
    }
  } catch {
    // Use fallback
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen">
        <ShopClient
          variants={variants}
          productId={productId}
          productName={productName}
          productImage={productImage}
        />
      </main>
      <Footer />
    </>
  )
}
