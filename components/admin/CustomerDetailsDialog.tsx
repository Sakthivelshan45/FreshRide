'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { CalendarDays, LoaderCircle, Mail, MapPin, Phone, ShoppingBag, X } from 'lucide-react'
import type { Json } from '@/types/database'

type CustomerDetails = {
  customer: {
    id: string
    full_name: string | null
    email: string | null
    phone: string | null
    avatar_url: string | null
    is_admin: boolean
    created_at: string
  }
  addresses: {
    id: string
    name: string
    phone: string | null
    line1: string
    line2: string | null
    city: string
    state: string
    pincode: string
    is_default: boolean
  }[]
  order_count: number
  orders: {
    id: string
    order_number: string
    status: string
    fulfillment_status: string
    payment_method: string
    total: number
    created_at: string
    shipping_address: Json
    items: {
      variant_name: string
      quantity: number
      unit_price: number
      total_price: number
    }[]
  }[]
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date)
}

function formatPhone(value: string | null) {
  if (!value) return '—'
  const digits = value.replace(/\D/g, '')
  const localNumber = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits
  return localNumber.length === 10
    ? `+91 ${localNumber.slice(0, 5)} ${localNumber.slice(5)}`
    : value
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatStatus(value: string) {
  return value
    .split(/[_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getAddressLines(address: Json) {
  if (typeof address !== 'object' || address === null || Array.isArray(address)) return []

  const values = address as Record<string, Json | undefined>
  const line1 = values.line1
  const line2 = values.line2
  const city = values.city
  const state = values.state
  const pincode = values.pincode

  return [
    line1,
    line2,
    [city, state].filter((value): value is string => typeof value === 'string' && value.length > 0).join(', '),
    pincode,
  ].filter((value): value is string => typeof value === 'string' && value.length > 0)
}

export default function CustomerDetailsDialog({
  customerId,
  refreshKey,
  onClose,
}: {
  customerId: string
  refreshKey: number
  onClose: () => void
}) {
  const requestKey = `${customerId}:${refreshKey}`
  const [requestState, setRequestState] = useState<{
    key: string
    details: CustomerDetails | null
    error: string | null
  }>({ key: '', details: null, error: null })
  const currentRequest = requestState.key === requestKey ? requestState : null
  const details = currentRequest?.details ?? null
  const loading = currentRequest === null
  const error = currentRequest?.error ?? null
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadDetails() {
      try {
        const response = await fetch(`/api/admin/customers/${customerId}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        const result = await response.json() as CustomerDetails & { error?: string }
        if (!response.ok) throw new Error(result.error || 'Could not load customer details.')
        setRequestState({ key: requestKey, details: result, error: null })
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === 'AbortError') return
        console.error('Customer details request failed:', loadError)
        setRequestState({
          key: requestKey,
          details: null,
          error: loadError instanceof Error ? loadError.message : 'Could not load customer details.',
        })
      }
    }

    loadDetails()
    return () => controller.abort()
  }, [customerId, refreshKey, requestKey])

  const customer = details?.customer
  const displayName = customer?.full_name || customer?.email || 'Customer'
  const initials = (customer?.full_name?.trim()[0] || customer?.email?.trim()[0] || '?').toUpperCase()

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-dark/50 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-details-title"
        tabIndex={-1}
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-silver bg-light-bg shadow-2xl focus:outline-none sm:max-h-[90vh]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-silver bg-white px-5 py-4 sm:px-7">
          <div>
            <h2 id="customer-details-title" className="font-serif text-xl text-navy-dark">
              Customer details
            </h2>
            <p className="mt-1 max-w-[60vw] truncate text-sm text-green-secondary">{displayName}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close customer details"
            className="rounded-md p-2 text-green-secondary hover:bg-light-bg hover:text-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="overflow-y-auto p-4 sm:p-7">
          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-green-secondary" role="status">
              <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
              Loading customer details...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert">
              {error}
            </div>
          ) : details && customer ? (
            <div className="space-y-6">
              <section className="rounded-lg border border-silver bg-white p-4 sm:p-5" aria-labelledby="customer-profile-heading">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-50 text-lg font-semibold text-green-800">
                      {customer.avatar_url ? (
                        <Image src={customer.avatar_url} alt="" fill sizes="64px" unoptimized className="object-cover" />
                      ) : initials}
                    </div>
                    <div className="min-w-0">
                      <h3 id="customer-profile-heading" className="truncate text-lg font-semibold text-navy-dark">
                        {customer.full_name || 'Unnamed customer'}
                      </h3>
                      <p className="mt-1 flex items-center gap-2 break-all text-sm text-gray-600">
                        <Mail size={14} className="shrink-0" aria-hidden="true" />
                        {customer.email || 'No email available'}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="shrink-0" aria-hidden="true" />
                        {formatPhone(customer.phone)}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    customer.is_admin ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${customer.is_admin ? 'bg-red-600' : 'bg-green-primary'}`} />
                    {customer.is_admin ? 'Admin' : 'Customer'}
                  </span>
                </div>
                <dl className="mt-5 grid gap-4 border-t border-[#E8EEF0] pt-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-600">Joined</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-navy-dark">
                      <CalendarDays size={15} className="text-green-secondary" aria-hidden="true" />
                      {formatDate(customer.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-600">Customer ID</dt>
                    <dd className="mt-1 break-all font-mono text-xs text-navy-dark">{customer.id}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-600">Total orders</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm tabular-nums text-navy-dark">
                      <ShoppingBag size={15} className="text-green-secondary" aria-hidden="true" />
                      {details.order_count}
                    </dd>
                  </div>
                </dl>
              </section>

              <section aria-labelledby="customer-addresses-heading">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin size={17} className="text-green-primary" aria-hidden="true" />
                  <h3 id="customer-addresses-heading" className="font-semibold text-navy-dark">Saved addresses</h3>
                </div>
                {details.addresses.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-silver bg-white p-4 text-sm text-gray-600">
                    No saved addresses.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {details.addresses.map((address) => (
                      <article key={address.id} className="rounded-lg border border-silver bg-white p-4 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-navy-dark">{address.name}</p>
                          {address.is_default && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-800">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-2 break-words text-green-secondary">
                          {[address.line1, address.line2, address.city, address.state, address.pincode]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        {address.phone && <p className="mt-2 text-xs text-gray-600">{formatPhone(address.phone)}</p>}
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section aria-labelledby="customer-orders-heading">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={17} className="text-green-primary" aria-hidden="true" />
                    <h3 id="customer-orders-heading" className="font-semibold text-navy-dark">Order history</h3>
                  </div>
                  {details.order_count > details.orders.length && (
                    <span className="text-xs text-gray-600">Showing latest {details.orders.length}</span>
                  )}
                </div>
                {details.orders.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-silver bg-white p-4 text-sm text-gray-600">
                    No orders are linked to this account.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {details.orders.map((order) => (
                      <article key={order.id} className="rounded-lg border border-silver bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-navy-dark">{order.order_number}</p>
                            <p className="mt-1 text-xs text-gray-600">
                              {formatDate(order.created_at)} · {formatStatus(order.payment_method)}
                            </p>
                          </div>
                          <p className="font-semibold tabular-nums text-navy-dark">{formatPrice(order.total)}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-light-bg px-2.5 py-1 text-green-secondary">
                            Payment: {formatStatus(order.status)}
                          </span>
                          <span className="rounded-full bg-light-bg px-2.5 py-1 text-green-secondary">
                            Fulfillment: {formatStatus(order.fulfillment_status)}
                          </span>
                        </div>
                        {order.items.length > 0 && (
                          <ul className="mt-3 space-y-1 border-t border-[#E8EEF0] pt-3 text-sm text-green-secondary">
                            {order.items.map((item, index) => (
                              <li key={`${order.id}-${index}`} className="flex items-start justify-between gap-3">
                                <span className="min-w-0 break-words">{item.variant_name} × {item.quantity}</span>
                                <span className="shrink-0 tabular-nums">{formatPrice(item.total_price)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {getAddressLines(order.shipping_address).length > 0 && (
                          <p className="mt-3 flex items-start gap-2 border-t border-[#E8EEF0] pt-3 text-xs text-gray-600">
                            <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                            <span className="min-w-0 break-words">{getAddressLines(order.shipping_address).join(', ')}</span>
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
