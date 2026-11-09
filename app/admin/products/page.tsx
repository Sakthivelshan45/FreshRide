import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/helpers'
import { Plus, Edit, Package, CheckCircle, XCircle } from 'lucide-react'
import DeleteProductButton from '@/components/admin/DeleteProductButton'
import ToggleActiveButton from '@/components/admin/ToggleActiveButton'

export const metadata: Metadata = { title: 'Products | Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('products')
    .select('*, product_variants(*), product_images(*)')
    .order('created_at', { ascending: true })

  const products = (data ?? []) as Array<{
    id: string; name: string; slug: string; short_description: string | null
    is_active: boolean; created_at: string
    product_variants: { id: string; name: string; price: number; stock: number; is_active: boolean }[]
    product_images: { url: string; alt: string | null; is_primary: boolean }[]
  }>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-navy-dark mb-1">Products</h1>
          <p className="text-green-secondary text-sm">{products.length} products total</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-silver p-16 text-center">
          <Package size={48} className="text-silver mx-auto mb-4" />
          <p className="text-navy-dark font-medium mb-2">No products yet</p>
          <Link href="/admin/products/new" className="btn-primary inline-flex">
            <Plus size={16} /> Add First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-silver">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-light-bg border-b border-silver">
                <tr>
                  {['Image', 'Product', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-green-secondary uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EEF0]">
                {products.map((product) => {
                  const primaryImage = product.product_images?.find(i => i.is_primary) ?? product.product_images?.[0]
                  const variant = product.product_variants?.[0]
                  const price = variant?.price ?? 0
                  const stock = variant?.stock ?? 0

                  return (
                    <tr key={product.id} className="hover:bg-light-bg">
                      {/* Image */}
                      <td className="px-4 py-3">
                        <div className="relative w-12 h-12 bg-light-bg flex-shrink-0">
                          {primaryImage ? (
                            <Image src={primaryImage.url} alt={primaryImage.alt ?? product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-12 h-12 bg-light-bg flex items-center justify-center">
                              <Package size={16} className="text-silver" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-dark">{product.name}</p>
                        <p className="text-[11px] text-green-secondary font-mono">{product.slug}</p>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        {price === 0
                          ? <span className="text-xs text-gold-accent font-medium">Coming Soon</span>
                          : <span className="font-bold text-navy-dark">{formatPrice(price)}</span>}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${stock > 10 ? 'text-green-600' : stock > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                          {stock === 0 ? 'Out of stock' : `${stock} units`}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {product.is_active
                            ? <><CheckCircle size={14} className="text-green-500" /><span className="text-xs text-green-600">Active</span></>
                            : <><XCircle size={14} className="text-gray-400" /><span className="text-xs text-gray-500">Hidden</span></>}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="inline-flex items-center gap-1 text-xs text-green-primary hover:underline"
                          >
                            <Edit size={12} /> Edit
                          </Link>
                          <ToggleActiveButton productId={product.id} isActive={product.is_active} />
                          <DeleteProductButton productId={product.id} productName={product.name} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
