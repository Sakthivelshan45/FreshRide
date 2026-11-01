import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, MessageSquare, Mail, Phone, Building2 } from 'lucide-react'

export const metadata: Metadata = { title: 'B2B Enquiries | Admin' }

export default async function AdminEnquiriesPage() {
  let enquiries: any[] = []

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

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-amber-100 text-amber-700',
    quoted: 'bg-purple-100 text-purple-700',
    converted: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl text-navy-dark">Business Enquiries</h1>
            <p className="text-sm text-green-secondary mt-1">{enquiries.length} total enquiries</p>
          </div>
          <div className="flex gap-3">
            {['new', 'contacted', 'quoted', 'converted'].map(s => (
              <div key={s} className="text-center">
                <p className="text-lg font-bold text-navy-dark">{enquiries.filter(e => e.status === s).length}</p>
                <p className="text-[10px] text-green-secondary capitalize">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {enquiries.length === 0 ? (
          <div className="bg-white border border-silver p-10 text-center">
            <MessageSquare size={40} className="text-silver mx-auto mb-3" />
            <p className="text-green-secondary text-sm">No enquiries yet, or database not configured.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enq) => (
              <div key={enq.id} className="bg-white border border-silver p-5">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 size={14} className="text-green-primary" />
                      <h3 className="font-medium text-navy-dark">{enq.company_name}</h3>
                    </div>
                    <p className="text-xs text-green-secondary">{enq.business_type} · {enq.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 ${statusColors[enq.status] || 'bg-gray-100 text-gray-600'}`}>
                      {enq.status}
                    </span>
                    <span className="text-xs text-green-light">{new Date(enq.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-xs mb-3">
                  <div className="flex items-center gap-1.5 text-green-secondary">
                    <Mail size={12} /> {enq.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-green-secondary">
                    <Phone size={12} /> {enq.phone}
                  </div>
                  <div className="text-green-secondary">
                    Qty: <span className="font-medium text-navy-dark">{enq.quantity}</span>
                  </div>
                </div>
                {enq.requirements && (
                  <p className="text-xs text-green-secondary bg-light-bg p-3">{enq.requirements}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
