'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'

type Product = {
  id: string; name: string; slug: string
  short_description: string | null; description: string | null
  is_active: boolean; category: string | null; feature_tags: string[] | null
  product_variants: { price: number; compare_price: number | null; stock: number; is_active: boolean }[]
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const isEdit = !!product
  const variant = product?.product_variants?.[0]

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    short_description: product?.short_description ?? '',
    description: product?.description ?? '',
    category: product?.category ?? '',
    feature_tags: product?.feature_tags?.join(', ') ?? '',
    is_active: product?.is_active ?? true,
    price: variant?.price ?? 0,
    compare_price: variant?.compare_price ?? '',
    stock: variant?.stock ?? 0,
    image_url: '',
  })

  const set = (field: string, value: string | boolean | number) =>
    setForm(f => ({ ...f, [field]: value }))

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      feature_tags: form.feature_tags.split(',').map(t => t.trim()).filter(Boolean),
      price: Number(form.price),
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      stock: Number(form.stock),
    }

    const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()

    if (!res.ok || !data.success) {
      setError(data.error ?? 'Something went wrong')
      setSaving(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/admin/products'), 800)
  }

  const inputClass = "w-full border border-silver px-4 py-2.5 text-sm focus:outline-none focus:border-green-primary bg-white"
  const labelClass = "block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 p-4 text-sm">✅ Saved! Redirecting...</div>}

      {/* Basic Info */}
      <div className="bg-white border border-silver p-6 space-y-4">
        <h2 className="font-medium text-navy-dark border-b border-silver pb-3">Basic Information</h2>

        <div>
          <label className={labelClass}>Product Name *</label>
          <input value={form.name} onChange={e => { set('name', e.target.value); if (!isEdit) set('slug', autoSlug(e.target.value)) }}
            className={inputClass} required />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Slug (URL) *</label>
            <input value={form.slug} onChange={e => set('slug', autoSlug(e.target.value))}
              className={inputClass} required placeholder="product-name-here" />
            <p className="text-[11px] text-green-secondary mt-1">URL: /products/{form.slug || 'your-slug'}</p>
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className={inputClass}>
              <option value="">Select category</option>
              {['Sleep', 'Comfort', 'Bedding', 'Hygiene'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Short Description</label>
          <input value={form.short_description} onChange={e => set('short_description', e.target.value)}
            className={inputClass} placeholder="One line summary shown on product cards" />
        </div>

        <div>
          <label className={labelClass}>Full Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            className={`${inputClass} resize-none`} rows={4} placeholder="Detailed product description..." />
        </div>

        <div>
          <label className={labelClass}>Feature Tags <span className="text-green-secondary normal-case">(comma separated)</span></label>
          <input value={form.feature_tags} onChange={e => set('feature_tags', e.target.value)}
            className={inputClass} placeholder="e.g. Lightweight, Washable, Travel Case" />
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white border border-silver p-6 space-y-4">
        <h2 className="font-medium text-navy-dark border-b border-silver pb-3">Pricing & Stock</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Price (₹) *</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)}
              className={inputClass} placeholder="0 = Coming Soon" />
            <p className="text-[11px] text-green-secondary mt-1">Set 0 to show &quot;Price Coming Soon&quot;</p>
          </div>
          <div>
            <label className={labelClass}>MRP / Compare Price (₹)</label>
            <input type="number" min="0" step="0.01" value={form.compare_price} onChange={e => set('compare_price', e.target.value)}
              className={inputClass} placeholder="Optional strike-through price" />
          </div>
          <div>
            <label className={labelClass}>Stock (units)</label>
            <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)}
              className={inputClass} />
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="bg-white border border-silver p-6 space-y-4">
        <h2 className="font-medium text-navy-dark border-b border-silver pb-3">Product Image</h2>
        <div>
          <label className={labelClass}>Image Path</label>
          <input value={form.image_url} onChange={e => set('image_url', e.target.value)}
            className={inputClass} placeholder="/products/your-slug.jpg" />
          <p className="text-[11px] text-green-secondary mt-1">
            Save your image to <code className="bg-light-bg px-1">public/products/your-slug.jpg</code> then enter the path here.
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white border border-silver p-6">
        <h2 className="font-medium text-navy-dark border-b border-silver pb-3 mb-4">Visibility</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set('is_active', !form.is_active)}
            className={`w-11 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-green-primary' : 'bg-silver'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_active ? 'left-6' : 'left-1'}`} />
          </div>
          <span className="text-sm font-medium text-navy-dark">
            {form.is_active ? 'Active — visible on store' : 'Hidden — not shown on store'}
          </span>
        </label>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving || success} className="btn-primary disabled:opacity-60">
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {isEdit ? 'Save Changes' : 'Create Product'}</>}
        </button>
        <Link href="/admin/products" className="text-sm text-green-secondary hover:text-navy-dark flex items-center gap-1">
          <ArrowLeft size={14} /> Cancel
        </Link>
      </div>
    </form>
  )
}
