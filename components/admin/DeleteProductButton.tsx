'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return
    setLoading(true)
    await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      aria-label={`Delete ${productName}`}
      className="inline-flex min-h-10 items-center gap-1 rounded px-3 py-2 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50">
      <Trash2 size={12} />
      {loading ? '...' : 'Delete'}
    </button>
  )
}
