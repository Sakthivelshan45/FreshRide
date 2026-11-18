'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ToggleActiveButton({
  productId,
  productName,
  isActive,
}: {
  productId: string
  productName: string
  isActive: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (!response.ok) {
        let message = `Could not ${isActive ? 'hide' : 'show'} product (HTTP ${response.status}).`
        try {
          const result: unknown = await response.json()
          if (
            typeof result === 'object' &&
            result !== null &&
            'error' in result &&
            typeof result.error === 'string'
          ) {
            message = result.error
          }
        } catch (parseError) {
          console.error('Could not read product visibility error response:', parseError)
        }
        setError(message)
        return
      }

      router.refresh()
    } catch (err) {
      console.error('Product visibility update failed:', err)
      setError('Could not update product visibility. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button onClick={toggle} disabled={loading}
        aria-label={`${isActive ? 'Hide' : 'Show'} ${productName}`}
        className={`min-h-10 rounded border px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary disabled:opacity-50 ${
          isActive ? 'border-amber-300 text-amber-600 hover:bg-amber-50' : 'border-green-300 text-green-600 hover:bg-green-50'
        }`}>
        {loading ? '...' : isActive ? 'Hide' : 'Show'}
      </button>
      {error && <span role="alert" className="max-w-40 text-xs text-red-600">{error}</span>}
    </div>
  )
}
