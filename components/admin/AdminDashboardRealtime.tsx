'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminRealtimeToast } from '@/components/admin/useAdminRealtimeToast'
import { useRealtimeTable, type AdminRealtimeChange, type AdminRealtimeListener } from '@/lib/hooks/useRealtimeTable'

export default function AdminDashboardRealtime() {
  const router = useRouter()
  const { showToast, toast } = useAdminRealtimeToast()

  const handleRealtimeChange = useCallback((change: AdminRealtimeChange) => {
    if (change.event === 'INSERT') {
      showToast(change.table === 'orders' ? 'New order received' : 'New enquiry received')
    }
    router.refresh()
  }, [router, showToast])

  const refetchDashboard = useCallback(() => {
    router.refresh()
  }, [router])

  const listeners = useMemo<AdminRealtimeListener[]>(() => [
    {
      id: 'dashboard-order-row-changes',
      source: 'postgres_changes',
      table: 'orders',
      events: ['INSERT', 'UPDATE'],
      onChange: handleRealtimeChange,
    },
    {
      id: 'dashboard-order-deletes',
      source: 'broadcast',
      table: 'orders',
      events: ['DELETE'],
      onChange: handleRealtimeChange,
    },
    {
      id: 'dashboard-enquiry-row-changes',
      source: 'postgres_changes',
      table: 'business_enquiries',
      events: ['INSERT', 'UPDATE'],
      onChange: handleRealtimeChange,
    },
    {
      id: 'dashboard-enquiry-deletes',
      source: 'broadcast',
      table: 'business_enquiries',
      events: ['DELETE'],
      onChange: handleRealtimeChange,
    },
  ], [handleRealtimeChange])

  useRealtimeTable({
    channelName: 'admin:dashboard',
    listeners,
    onConnectionError: refetchDashboard,
  })

  return toast
}
