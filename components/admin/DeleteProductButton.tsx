'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import DeleteProductDialog from '@/components/admin/DeleteProductDialog'

export default function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  const confirmDelete = async () => {
    const response = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })

    if (!response.ok) {
      let message = `Could not delete product (HTTP ${response.status}).`
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
        console.error('Could not read product deletion error response:', parseError)
      }
      throw new Error(message)
    }

    router.refresh()
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        aria-label={`Delete ${productName}`}
        className="inline-flex min-h-10 items-center gap-1 rounded px-3 py-2 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <Trash2 size={12} />
        Delete
      </button>
      <DeleteProductDialog
        open={dialogOpen}
        productName={productName}
        onConfirm={confirmDelete}
        onCancel={() => setDialogOpen(false)}
      />
    </div>
  )
}
