'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ToggleActiveButton({ productId, isActive }: { productId: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    await fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })
    router.refresh()
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`text-xs px-2 py-0.5 border transition-colors disabled:opacity-50 ${
        isActive ? 'border-amber-300 text-amber-600 hover:bg-amber-50' : 'border-green-300 text-green-600 hover:bg-green-50'
      }`}>
      {loading ? '...' : isActive ? 'Hide' : 'Show'}
    </button>
  )
}
