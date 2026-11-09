import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductsGrid from '@/components/products/ProductsGrid'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'All Products | Butterfly Fresh Ride',
  description: 'Browse our full range of Fresh Ride travel accessories.',
}

export default async function ProductsPage() {
  const supabase = await createClient()

  // Basic query without optional columns
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      short_description,
      is_active,
      product_images ( url, alt, is_primary ),
      product_variants ( price, is_active )
    `)
    .order('created_at', { ascending: true })

  // Try category separately (may not exist in DB yet)
  const catResult = await supabase
    .from('products')
    .select('slug, category, feature_tags')
  
  const catMap: Record<string, { category: string | null; tags: string[] | null }> = {}
  if (catResult.data) {
    for (const row of catResult.data as Array<{ slug: string; category?: string | null; feature_tags?: string[] | null }>) {
      catMap[row.slug] = { category: row.category ?? null, tags: row.feature_tags ?? null }
    }
  }

  type RawProduct = {
    id: string
    name: string
    slug: string
    short_description: string | null
    is_active: boolean
    product_images: { url: string; alt: string | null; is_primary: boolean }[]
    product_variants: { price: number; is_active: boolean }[]
  }

  const safeProducts = ((data ?? []) as RawProduct[]).map(p => ({
    ...p,
    category: catMap[p.slug]?.category ?? null,
    feature_tags: catMap[p.slug]?.tags ?? null,
  }))

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-light-bg">
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
              Error: {error.message}
            </div>
          </div>
        )}

        {!error && safeProducts.length === 0 && (
          <div className="container-wide py-8">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 text-sm rounded">
              No products found in database. Please run the SQL migration in Supabase.
            </div>
          </div>
        )}

        <ProductsGrid products={safeProducts} />
      </main>
      <Footer />
    </>
  )
}
