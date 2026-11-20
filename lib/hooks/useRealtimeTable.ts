'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export type AdminRealtimeOperation = 'INSERT' | 'UPDATE' | 'DELETE'
export type AdminRealtimeSource = 'postgres_changes' | 'broadcast'

export type AdminRealtimeChange = {
  source: AdminRealtimeSource
  table: string
  event: AdminRealtimeOperation
  record: Record<string, unknown> | null
  oldRecord: Record<string, unknown> | null
}

export type AdminRealtimeListener = {
  id: string
  source: AdminRealtimeSource
  table: string
  events: readonly AdminRealtimeOperation[]
  onChange: (change: AdminRealtimeChange) => void | Promise<void>
}

type UseRealtimeTableOptions = {
  channelName: string
  listeners: readonly AdminRealtimeListener[]
  onConnectionError: () => void | Promise<void>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function useRealtimeTable({
  channelName,
  listeners,
  onConnectionError,
}: UseRealtimeTableOptions) {
  const supabase = useMemo(() => createClient(), [])
  const listenersRef = useRef(listeners)
  const onConnectionErrorRef = useRef(onConnectionError)
  const fallbackRequestedRef = useRef(false)

  useEffect(() => {
    listenersRef.current = listeners
  }, [listeners])

  useEffect(() => {
    onConnectionErrorRef.current = onConnectionError
  }, [onConnectionError])

  useEffect(() => {
    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    const refetchOnce = () => {
      if (fallbackRequestedRef.current) return
      fallbackRequestedRef.current = true
      void Promise.resolve(onConnectionErrorRef.current()).catch((error: unknown) => {
        console.error(`[${channelName}] Realtime fallback refetch failed:`, error)
      })
    }

    const dispatch = (listenerId: string, change: AdminRealtimeChange) => {
      const listener = listenersRef.current.find((entry) => entry.id === listenerId)
      if (!listener) return

      void Promise.resolve(listener.onChange(change)).catch((error: unknown) => {
        console.error(`[${channelName}] Realtime ${change.event} handler failed:`, error)
      })
    }

    async function subscribe() {
      try {
        await supabase.realtime.setAuth()
        if (!active) return

        channel = supabase.channel(channelName, { config: { private: true } })

        for (const listener of listenersRef.current) {
          for (const event of listener.events) {
            if (listener.source === 'postgres_changes') {
              channel.on(
                'postgres_changes',
                { event, schema: 'public', table: listener.table },
                (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
                  dispatch(listener.id, {
                    source: 'postgres_changes',
                    table: listener.table,
                    event: payload.eventType,
                    record: payload.eventType === 'DELETE' ? null : payload.new,
                    oldRecord: payload.old,
                  })
                }
              )
              continue
            }

            channel.on('broadcast', { event }, (payload: Record<string, unknown>) => {
              if (payload.table !== listener.table) return
              const operation = payload.operation
              if (operation !== 'INSERT' && operation !== 'UPDATE' && operation !== 'DELETE') return

              dispatch(listener.id, {
                source: 'broadcast',
                table: listener.table,
                event: operation,
                record: isRecord(payload.record) ? payload.record : null,
                oldRecord: isRecord(payload.old_record) ? payload.old_record : null,
              })
            })
          }
        }

        channel.subscribe((status, error) => {
          if (!active || (status !== 'CHANNEL_ERROR' && status !== 'TIMED_OUT')) return
          console.error(`[${channelName}] Supabase Realtime ${status}:`, error)
          refetchOnce()
        })
      } catch (error) {
        if (!active) return
        console.error(`[${channelName}] Supabase Realtime setup failed:`, error)
        refetchOnce()
      }
    }

    void subscribe()
    return () => {
      active = false
      if (channel) void supabase.removeChannel(channel)
    }
  }, [channelName, supabase])
}
