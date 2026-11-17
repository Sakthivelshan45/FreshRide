'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import {
  ORDER_STATUS_OPTIONS,
  type OrderExportFilters,
} from '@/lib/admin/orders-export'
import { exportOrdersPdf } from '@/lib/admin/export-orders-pdf'

type Props = {
  filters: OrderExportFilters
}

type ExportResponse = {
  error?: string
  truncated?: boolean
  rows?: Parameters<typeof exportOrdersPdf>[0]
}

function getQueryString(filters: OrderExportFilters, format?: 'json') {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.search) params.set('search', filters.search)
  if (format) params.set('format', format)
  return params.toString()
}

export default function OrdersExportControls({ filters }: Props) {
  const [loading, setLoading] = useState<'excel' | 'pdf' | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const downloadExcel = async () => {
    setLoading('excel')
    setError('')
    setNotice('')
    try {
      const query = getQueryString(filters)
      const response = await fetch(`/api/admin/export/orders?${query}`)
      if (!response.ok) {
        const result = (await response.json()) as ExportResponse
        throw new Error(result.error ?? 'Could not export orders.')
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      const filename = response.headers
        .get('Content-Disposition')
        ?.match(/filename="([^"]+)"/)?.[1]
      link.download = filename ?? 'orders.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)

      if (response.headers.get('X-Export-Truncated') === 'true') {
        setNotice('Export limited to the first 5,000 matching orders.')
      }
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Could not export orders.')
    } finally {
      setLoading(null)
    }
  }

  const downloadPdf = async () => {
    setLoading('pdf')
    setError('')
    setNotice('')
    try {
      const query = getQueryString(filters, 'json')
      const response = await fetch(`/api/admin/export/orders?${query}`)
      const result = (await response.json()) as ExportResponse
      if (!response.ok || !result.rows) {
        throw new Error(result.error ?? 'Could not load orders for the PDF export.')
      }

      await exportOrdersPdf(result.rows, filters, Boolean(result.truncated))
      if (result.truncated) {
        setNotice('PDF limited to the first 5,000 matching orders.')
      }
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Could not export orders.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="mb-6 border border-silver bg-white p-4 sm:rounded-lg sm:p-5">
      <form method="get" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-green-secondary">
          Order status
          <select
            name="status"
            defaultValue={filters.status}
            className="block h-11 min-w-0 w-full border border-silver bg-white px-3 text-sm font-normal text-navy-dark focus:border-green-primary focus:outline-none focus:ring-2 focus:ring-green-primary/20"
          >
            <option value="">All statuses</option>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-green-secondary">
          From
          <input
            type="date"
            name="from"
            defaultValue={filters.from}
            className="block h-11 min-w-0 w-full border border-silver bg-white px-3 text-sm font-normal text-navy-dark focus:border-green-primary focus:outline-none focus:ring-2 focus:ring-green-primary/20"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-green-secondary">
          To
          <input
            type="date"
            name="to"
            defaultValue={filters.to}
            className="block h-11 min-w-0 w-full border border-silver bg-white px-3 text-sm font-normal text-navy-dark focus:border-green-primary focus:outline-none focus:ring-2 focus:ring-green-primary/20"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-green-secondary">
          Search
          <input
            type="search"
            name="search"
            maxLength={100}
            defaultValue={filters.search}
            placeholder="Order, customer, phone or email"
            className="block h-11 min-w-0 w-full border border-silver bg-white px-3 text-sm font-normal text-navy-dark placeholder:text-gray-400 focus:border-green-primary focus:outline-none focus:ring-2 focus:ring-green-primary/20"
          />
        </label>
        <div className="flex flex-col gap-2 border-t border-silver pt-4 sm:col-span-2 sm:flex-row sm:justify-end lg:col-span-4">
          <button type="submit" className="btn-primary w-full justify-center whitespace-nowrap px-4 py-3 text-xs sm:w-auto sm:min-w-36">
            Apply filters
          </button>
          <Link href="/admin/orders" className="btn-outline w-full justify-center whitespace-nowrap px-4 py-3 text-xs sm:w-auto sm:min-w-28">
            Clear
          </Link>
        </div>
      </form>

      <div className="mt-4 flex flex-col gap-2 border-t border-silver pt-4 sm:flex-row">
        <button
          type="button"
          onClick={downloadExcel}
          disabled={loading !== null}
          className="btn-outline w-full justify-center whitespace-nowrap px-4 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-44"
        >
          {loading === 'excel' ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
          {loading === 'excel' ? 'Preparing Excel...' : 'Export Excel'}
        </button>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={loading !== null}
          className="btn-outline w-full justify-center whitespace-nowrap px-4 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-40"
        >
          {loading === 'pdf' ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
          {loading === 'pdf' ? 'Preparing PDF...' : 'Export PDF'}
        </button>
      </div>

      {notice && <p role="status" className="mt-3 break-words text-sm text-amber-700">{notice}</p>}
      {error && <p role="alert" className="mt-3 break-words text-sm text-red-600">{error}</p>}
    </section>
  )
}
