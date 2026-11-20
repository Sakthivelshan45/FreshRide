import type { Metadata } from 'next'
import Link from 'next/link'
import type { Database } from '@/types/database'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import EnquiriesExportControls from '@/components/admin/EnquiriesExportControls'
import EnquiriesLiveView from '@/components/admin/EnquiriesLiveView'

export const metadata: Metadata = { title: 'B2B Enquiries | Admin' }

type BusinessEnquiry = Database['public']['Tables']['business_enquiries']['Row']

export default async function AdminEnquiriesPage() {
  let enquiries: BusinessEnquiry[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('business_enquiries')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) enquiries = data
  } catch {
    // DB not configured
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <header className="bg-navy-dark text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare size={20} className="text-gold-accent" />
          <span className="font-medium">B2B Enquiries</span>
        </div>
        <Link href="/admin" className="text-xs text-green-light hover:text-white flex items-center gap-1">
          <ArrowLeft size={12} /> Dashboard
        </Link>
      </header>

      <div className="max-w-6xl mx-auto p-8">
        <EnquiriesExportControls />
        <EnquiriesLiveView initialEnquiries={enquiries} />
      </div>
    </div>
  )
}
