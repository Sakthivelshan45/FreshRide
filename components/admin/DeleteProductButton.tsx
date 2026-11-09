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
      className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors">
      <Trash2 size={12} />
      {loading ? '...' : 'Delete'}
    </button>
  )
}
