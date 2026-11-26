'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

type Product = {
  id: string; name: string; slug: string
  short_description: string | null; description: string | null
  is_active: boolean; category: string | null; feature_tags: string[] | null
  product_variants: { price: number; compare_price: number | null; stock: number; is_active: boolean }[]
  product_images?: { url: string; alt: string | null; is_primary: boolean }[]
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const isEdit = !!product
  const variant = product?.product_variants?.[0]

  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP image.')
      event.target.value = ''
      return
    }
    if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
      setError('Image must be larger than 0 bytes and no more than 5 MB.')
      event.target.value = ''
      return
    }

    setError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products'
    const method = isEdit ? 'PATCH' : 'POST'

    try {
      let imageUrl = form.image_url.trim()
      if (imageFile) {
        setUploadingImage(true)
        const uploadForm = new FormData()
        uploadForm.set('file', imageFile)
        const uploadResponse = await fetch('/api/admin/products/upload-image', {
          method: 'POST',
          body: uploadForm,
        })
        const uploadResult: unknown = await uploadResponse.json()
        const uploadData =
          typeof uploadResult === 'object' && uploadResult !== null
            ? (uploadResult as Record<string, unknown>)
            : {}

        if (!uploadResponse.ok || typeof uploadData.url !== 'string') {
          setError(
            typeof uploadData.error === 'string'
              ? uploadData.error
              : `Could not upload image (HTTP ${uploadResponse.status}). Please try again.`
          )
          return
        }
        imageUrl = uploadData.url
      }

      const payload = {
        ...form,
        image_url: imageUrl,
        feature_tags: form.feature_tags.split(',').map(t => t.trim()).filter(Boolean),
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        stock: Number(form.stock),
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseText = await res.text()
      let data: { success?: boolean; error?: string } | null = null

      if (responseText) {
        try {
          const parsed: unknown = JSON.parse(responseText)
          if (typeof parsed === 'object' && parsed !== null) {
            const response = parsed as Record<string, unknown>
            data = {
              success: response.success === true,
              error: typeof response.error === 'string' ? response.error : undefined,
            }
          }
        } catch {
          // Use the HTTP status below when the server response is not JSON.
        }
      }

      if (!res.ok || !data?.success) {
        setError(data?.error ?? `Could not save product (HTTP ${res.status}). Please try again.`)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/admin/products'), 800)
    } catch (err) {
      console.error('Product submission failed:', err)
      setError('Could not reach the server. Please try again.')
    } finally {
      setUploadingImage(false)
      setSaving(false)
    }
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
        {imagePreview && (
          <div className="relative h-40 w-40 overflow-hidden rounded border border-silver bg-light-bg">
            <Image src={imagePreview} alt="Selected product image preview" fill unoptimized className="object-contain" />
          </div>
        )}
        <div>
          <label htmlFor="product-image-file" className={labelClass}>Upload image file</label>
          <input
            id="product-image-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className={inputClass}
            disabled={saving}
          />
          <p className="text-[11px] text-green-secondary mt-1">
            JPEG, PNG, or WebP; maximum 5 MB. {isEdit && 'Leave empty to keep the current image.'}
          </p>
        </div>
        <div>
          <label htmlFor="product-image-url" className={labelClass}>Or enter an existing image URL</label>
          <input
            id="product-image-url"
            value={form.image_url}
            onChange={e => set('image_url', e.target.value)}
            className={inputClass}
            placeholder="/products/your-slug.jpg or https://..."
            disabled={saving || Boolean(imageFile)}
          />
          <p className="text-[11px] text-green-secondary mt-1">
            Selecting a file uploads it to the store and uses its URL instead.
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
          {saving ? <><Loader2 size={16} className="animate-spin" /> {uploadingImage ? 'Uploading image...' : 'Saving...'}</> : <><Save size={16} /> {isEdit ? 'Save Changes' : 'Create Product'}</>}
        </button>
        <Link href="/admin/products" className="text-sm text-green-secondary hover:text-navy-dark flex items-center gap-1">
          <ArrowLeft size={14} /> Cancel
        </Link>
      </div>
    </form>
  )
}
