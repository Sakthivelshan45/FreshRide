import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/helpers'
import { ArrowLeft, Package, Edit, Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Product Management | Admin' }

export default async function AdminProductsPage() {
  let product: any = null
  let variants: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*, product_variants(*), product_images(*)')
      .eq('slug', 'fresh-ride-kit')
      .single()

    if (data) {
      product = data
      variants = (data as any).product_variants?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
    }
  } catch {
    // DB not configured
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <header className="bg-navy-dark text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={20} className="text-gold-accent" />
          <span className="font-medium">Product Management</span>
        </div>
        <Link href="/admin" className="text-xs text-green-light hover:text-white flex items-center gap-1">
          <ArrowLeft size={12} /> Dashboard
        </Link>
      </header>

      <div className="max-w-5xl mx-auto p-8">
        {!product ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 text-sm">
            <strong>Database not configured.</strong> Connect your Supabase instance to manage products live.
            Until then, the site uses the built-in seed data.
          </div>
        ) : (
          <>
            {/* Product info */}
            <div className="bg-white border border-silver p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl text-navy-dark">{product.name}</h2>
                <span className={`text-xs px-2 py-1 ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-green-secondary">{product.description}</p>
            </div>

            {/* Variants table */}
            <div className="bg-white border border-silver">
              <div className="flex items-center justify-between p-5 border-b border-silver">
                <h3 className="font-medium text-navy-dark">Product Variants & Pricing</h3>
                <Link href="/admin/products/new-variant" className="btn-primary text-xs py-2 px-4">
                  <Plus size={13} /> Add Variant
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-light-bg">
                    <tr>
                      {['Name', 'Pack Qty', 'Price', 'MRP', 'Stock', 'Status', 'Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-green-secondary uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EEF0]">
                    {variants.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-green-secondary">No variants configured yet.</td></tr>
                    ) : variants.map((v) => (
                      <tr key={v.id} className="hover:bg-light-bg">
                        <td className="px-4 py-3 font-medium text-navy-dark">{v.name}</td>
                        <td className="px-4 py-3 text-green-secondary">{v.pack_quantity}</td>
                        <td className="px-4 py-3 font-bold text-navy-dark">{formatPrice(v.price)}</td>
                        <td className="px-4 py-3 text-green-secondary line-through">{v.compare_price ? formatPrice(v.compare_price) : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={v.stock > 10 ? 'text-green-600' : v.stock > 0 ? 'text-amber-600' : 'text-red-500'}>{v.stock}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {v.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/products/${v.id}`} className="text-green-primary hover:underline flex items-center gap-1 text-xs">
                            <Edit size={12} /> Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
