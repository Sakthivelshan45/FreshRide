import type { Metadata } from 'next'
import ProductForm from '@/components/admin/ProductForm'

export const metadata: Metadata = { title: 'Add Product | Admin' }

export default function NewProductPage() {
  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-serif text-3xl text-navy-dark mb-2">Add New Product</h1>
      <p className="text-green-secondary text-sm mb-8">Fill in the details to add a new product to your store.</p>
      <ProductForm />
    </div>
  )
}
