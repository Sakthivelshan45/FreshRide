import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductsGrid from '@/components/products/ProductsGrid'

export const metadata = {
  title: 'All Products | Butterfly Fresh Ride',
  description: 'Browse our full range of Fresh Ride travel accessories — sleep masks, ear plugs, neck pillows, blankets, hygiene kits and more.',
}

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      short_description,
      category,
      feature_tags,
      is_active,
      product_images ( url, alt, is_primary ),
      product_variants ( price, is_active )
    `)
    .order('created_at', { ascending: true })

  const safeProducts = (products ?? []) as Array<{
    id: string
    name: string
    slug: string
    short_description: string | null
    category: string | null
    feature_tags: string[] | null
    is_active: boolean
    product_images: { url: string; alt: string | null; is_primary: boolean }[]
    product_variants: { price: number; is_active: boolean }[]
  }>

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-light-bg">
        {/* Page header */}
        <div className="bg-navy-dark text-white py-14">
          <div className="container-wide text-center">
            <p className="text-green-light text-xs tracking-[0.3em] uppercase mb-3">Fresh Ride Collection</p>
            <h1 className="font-serif text-4xl sm:text-5xl mb-4">All Products</h1>
            <p className="text-green-light max-w-xl mx-auto text-sm leading-relaxed">
              Premium travel accessories for comfort, hygiene and better rest on every journey.
            </p>
          </div>
        </div>

        {error && (
          <div className="container-wide py-8">
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 text-sm rounded">
              Could not load products. Please try again later.
            </div>
          </div>
        )}

        <ProductsGrid products={safeProducts} />
      </main>
      <Footer />
    </>
  )
}
