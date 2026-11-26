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

function getProductImageSrc(value: string | null | undefined): string | null {
  const src = value?.trim()
  if (!src || src.startsWith('//')) return null
  if (src.startsWith('/')) return src

  try {
    const url = new URL(src)
    if (
      url.protocol === 'https:' &&
      (url.hostname.endsWith('.supabase.co') || url.hostname === 'res.cloudinary.com')
    ) {
      return src
    }
    return null
  } catch {
    if (/^[a-z][a-z\d+.-]*:/i.test(src)) return null
    return `/${encodeURI(src.replace(/^\.?\//, ''))}`
  }
}

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
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 font-serif text-2xl text-navy-dark sm:text-3xl">Products</h1>
          <p className="text-green-secondary text-sm">{products.length} products total</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary w-full justify-center sm:w-auto">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white px-5 py-10 text-center sm:p-16">
          <Package size={40} className="mx-auto mb-4 text-silver sm:h-12 sm:w-12" />
          <p className="text-navy-dark font-medium mb-2">No products yet</p>
          <Link href="/admin/products/new" className="btn-primary inline-flex">
            <Plus size={16} /> Add First Product
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-silver bg-white shadow-sm">
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="bg-light-bg border-b border-silver">
                <tr>
                  {['Image', 'Product', 'Price', 'Stock', 'Status', 'Actions'].map((heading) => (
                    <th key={heading} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-green-secondary">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EEF0]">
                {products.map((product) => {
                  const primaryImage = product.product_images?.find(i => i.is_primary) ?? product.product_images?.[0]
                  const imageSrc = getProductImageSrc(primaryImage?.url)
                  const variant = product.product_variants?.[0]
                  const price = variant?.price ?? 0
                  const stock = variant?.stock ?? 0

                  return (
                    <tr key={product.id} className="hover:bg-light-bg">
                      {/* Image */}
                      <td className="px-4 py-3">
                        <div className="relative w-12 h-12 bg-light-bg flex-shrink-0">
                          {imageSrc ? (
                            <Image src={imageSrc} alt={primaryImage?.alt ?? product.name} fill sizes="48px" className="object-cover" />
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
                        <p className="font-mono text-[11px] text-green-secondary">{product.slug}</p>
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
                            className="inline-flex min-h-10 items-center gap-1 rounded px-2 text-xs text-green-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary"
                          >
                            <Edit size={12} /> Edit
                          </Link>
                          <ToggleActiveButton productId={product.id} productName={product.name} isActive={product.is_active} />
                          <DeleteProductButton productId={product.id} productName={product.name} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[#E8EEF0] xl:hidden">
            {products.map((product) => {
              const primaryImage = product.product_images?.find((image) => image.is_primary) ?? product.product_images?.[0]
              const imageSrc = getProductImageSrc(primaryImage?.url)
              const variant = product.product_variants?.[0]
              const price = variant?.price ?? 0
              const stock = variant?.stock ?? 0

              return (
                <article key={product.id} className="min-w-0 p-4 sm:p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="relative h-16 w-16 shrink-0 bg-light-bg">
                      {imageSrc ? (
                        <Image src={imageSrc} alt={primaryImage?.alt ?? product.name} fill sizes="64px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package size={20} className="text-silver" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words font-medium text-navy-dark">{product.name}</h2>
                      <p className="mt-0.5 break-all font-mono text-[11px] text-green-secondary">{product.slug}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        {product.is_active
                          ? <><CheckCircle size={14} className="shrink-0 text-green-500" /><span className="text-xs text-green-600">Active</span></>
                          : <><XCircle size={14} className="shrink-0 text-gray-400" /><span className="text-xs text-gray-500">Hidden</span></>}
                      </div>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#E8EEF0] pt-3 text-sm">
                    <div className="min-w-0">
                      <dt className="text-xs text-gray-600">Price</dt>
                      <dd className="mt-0.5 font-medium text-navy-dark">
                        {price === 0
                          ? <span className="text-xs text-gold-accent">Coming Soon</span>
                          : formatPrice(price)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-gray-600">Stock</dt>
                      <dd className={`mt-0.5 text-xs font-medium ${stock > 10 ? 'text-green-600' : stock > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                        {stock === 0 ? 'Out of stock' : `${stock} units`}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E8EEF0] pt-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded border border-silver px-3 text-xs font-medium text-green-primary hover:bg-light-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary"
                    >
                      <Edit size={14} /> Edit
                    </Link>
                    <ToggleActiveButton productId={product.id} productName={product.name} isActive={product.is_active} />
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
