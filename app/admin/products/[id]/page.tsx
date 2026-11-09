import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export const metadata: Metadata = { title: 'Edit Product | Admin' }

type Props = { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, product_variants(*), product_images(*)')
    .eq('id', id)
    .single()

  if (!product) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-serif text-3xl text-navy-dark mb-2">Edit Product</h1>
      <p className="text-green-secondary text-sm mb-8">Update product details, pricing and status.</p>
      <ProductForm product={product as any} />
    </div>
  )
}
