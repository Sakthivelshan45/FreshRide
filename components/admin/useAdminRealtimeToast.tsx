'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useAdminRealtimeToast() {
  const [message, setMessage] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((nextMessage: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setMessage(nextMessage)
    timeoutRef.current = setTimeout(() => setMessage(null), 4000)
  }, [])

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const toast = message ? (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-[100] rounded-lg bg-navy-dark px-4 py-3 text-sm font-medium text-white shadow-lg"
    >
      {message}
    </div>
  ) : null

  return { showToast, toast }
}
