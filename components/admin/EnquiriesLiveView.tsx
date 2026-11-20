'use client'

import { useCallback, useMemo } from 'react'
import { Building2, Mail, MessageSquare, Phone } from 'lucide-react'
import type { Database } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { useAdminRealtimeToast } from '@/components/admin/useAdminRealtimeToast'
import { useRealtimeTable, type AdminRealtimeChange, type AdminRealtimeListener } from '@/lib/hooks/useRealtimeTable'
import { useInitialRows } from '@/lib/hooks/useInitialRows'

type BusinessEnquiry = Database['public']['Tables']['business_enquiries']['Row']

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  quoted: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
}

async function fetchEnquiryById(id: string): Promise<BusinessEnquiry | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('business_enquiries')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export default function EnquiriesLiveView({
  initialEnquiries,
}: {
  initialEnquiries: BusinessEnquiry[]
}) {
  const [enquiries, setEnquiries] = useInitialRows(initialEnquiries)
  const { showToast, toast } = useAdminRealtimeToast()

  const refetchEnquiries = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('business_enquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    setEnquiries(data ?? [])
  }, [setEnquiries])

  const handleRealtimeChange = useCallback(async (change: AdminRealtimeChange) => {
    if (change.event === 'DELETE') {
      const id = change.oldRecord?.id
      if (typeof id === 'string') {
        setEnquiries((current) => current.filter((enquiry) => enquiry.id !== id))
      } else {
        console.error('Realtime enquiry DELETE did not include the old row ID:', change)
      }
      return
    }

    const id = change.record?.id
    if (typeof id !== 'string') {
      console.error('Realtime enquiry event did not include an enquiry ID:', change)
      return
    }

    const enquiry = await fetchEnquiryById(id)
    if (!enquiry) {
      setEnquiries((current) => current.filter((existing) => existing.id !== id))
      return
    }

    if (change.event === 'INSERT') showToast('New enquiry received')
    setEnquiries((current) => {
      const existingIndex = current.findIndex((existing) => existing.id === enquiry.id)
      if (change.event === 'UPDATE' && existingIndex >= 0) {
        const next = [...current]
        next[existingIndex] = enquiry
        return next
      }
      return [enquiry, ...current.filter((existing) => existing.id !== enquiry.id)]
    })
  }, [setEnquiries, showToast])

  const listeners = useMemo<AdminRealtimeListener[]>(() => [
    {
      id: 'enquiry-row-changes',
      source: 'postgres_changes',
      table: 'business_enquiries',
      events: ['INSERT', 'UPDATE'],
      onChange: handleRealtimeChange,
    },
    {
      id: 'enquiry-deletes',
      source: 'broadcast',
      table: 'business_enquiries',
      events: ['DELETE'],
      onChange: handleRealtimeChange,
    },
  ], [handleRealtimeChange])

  useRealtimeTable({
    channelName: 'admin:enquiries',
    listeners,
    onConnectionError: refetchEnquiries,
  })

  return (
    <>
      {toast}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-navy-dark">Business Enquiries</h1>
          <p className="text-sm text-green-secondary mt-1">{enquiries.length} total enquiries</p>
        </div>
        <div className="flex gap-3">
          {['new', 'contacted', 'quoted', 'converted'].map((status) => (
            <div key={status} className="text-center">
              <p className="text-lg font-bold text-navy-dark">
                {enquiries.filter((enquiry) => enquiry.status === status).length}
              </p>
              <p className="text-[10px] text-green-secondary capitalize">{status}</p>
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
          {enquiries.map((enquiry) => (
            <div key={enquiry.id} className="bg-white border border-silver p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={14} className="text-green-primary" />
                    <h3 className="font-medium text-navy-dark">{enquiry.company_name}</h3>
                  </div>
                  <p className="text-xs text-green-secondary">
                    {enquiry.business_type} · {enquiry.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 ${statusColors[enquiry.status] || 'bg-gray-100 text-gray-600'}`}>
                    {enquiry.status}
                  </span>
                  <span className="text-xs text-green-light">
                    {new Date(enquiry.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-xs mb-3">
                <div className="flex items-center gap-1.5 text-green-secondary">
                  <Mail size={12} /> {enquiry.email}
                </div>
                <div className="flex items-center gap-1.5 text-green-secondary">
                  <Phone size={12} /> {enquiry.phone}
                </div>
                <div className="text-green-secondary">
                  Qty: <span className="font-medium text-navy-dark">{enquiry.quantity}</span>
                </div>
              </div>
              {enquiry.requirements && (
                <p className="text-xs text-green-secondary bg-light-bg p-3">{enquiry.requirements}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
