'use client'

import { useState } from 'react'
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { exportEnquiriesPdf, type ExportEnquiryRow } from '@/lib/admin/export-enquiries-pdf'

type ExportResponse = {
  error?: string
  truncated?: boolean
  rows?: ExportEnquiryRow[]
}

export default function EnquiriesExportControls() {
  const [loading, setLoading] = useState<'excel' | 'pdf' | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const downloadExcel = async () => {
    setLoading('excel')
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/admin/export/enquiries')
      if (!response.ok) {
        const result = (await response.json()) as ExportResponse
        throw new Error(result.error ?? 'Could not export enquiries.')
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      const filename = response.headers
        .get('Content-Disposition')
        ?.match(/filename="([^"]+)"/)?.[1]
      link.download = filename ?? 'enquiries.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)

      if (response.headers.get('X-Export-Truncated') === 'true') {
        setNotice('Export limited to the first 5,000 enquiries.')
      }
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Could not export enquiries.')
    } finally {
      setLoading(null)
    }
  }

  const downloadPdf = async () => {
    setLoading('pdf')
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/admin/export/enquiries?format=json')
      const result = (await response.json()) as ExportResponse
      if (!response.ok || !result.rows) {
        throw new Error(result.error ?? 'Could not load enquiries for the PDF export.')
      }

      await exportEnquiriesPdf(result.rows, Boolean(result.truncated))
      if (result.truncated) {
        setNotice('PDF limited to the first 5,000 enquiries.')
      }
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Could not export enquiries.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="bg-white border border-silver p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={downloadExcel}
          disabled={loading !== null}
          className="btn-outline disabled:opacity-60"
        >
          {loading === 'excel' ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
          {loading === 'excel' ? 'Preparing Excel...' : 'Export Excel'}
        </button>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={loading !== null}
          className="btn-outline disabled:opacity-60"
        >
          {loading === 'pdf' ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
          {loading === 'pdf' ? 'Preparing PDF...' : 'Export PDF'}
        </button>
      </div>

      {notice && <p role="status" className="mt-3 text-sm text-amber-700">{notice}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  )
}
