'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowUp, Search, Users } from 'lucide-react'
import CustomerDetailsDialog from '@/components/admin/CustomerDetailsDialog'

export type CustomerRow = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  phone: string | null
  orders: number
  is_admin: boolean
  created_at: string
}

type RoleFilter = 'all' | 'admin' | 'customer'
type SortKey = 'orders' | 'joined'
type SortDirection = 'asc' | 'desc'

function getInitials(name: string | null, email: string | null) {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? []
  const initials = words.slice(0, 2).map((word) => word[0]).join('')
  return (initials || email?.trim()[0] || '?').toUpperCase()
}

function formatPhone(phone: string | null) {
  if (!phone) return '—'

  const digits = phone.replace(/\D/g, '')
  const localNumber = digits.length === 12 && digits.startsWith('91')
    ? digits.slice(2)
    : digits

  if (localNumber.length === 10) {
    return `+91 ${localNumber.slice(0, 5)} ${localNumber.slice(5)}`
  }

  return phone
}

function formatJoinedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { label: '—', title: 'Unknown date' }

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }

  return {
    label: new Intl.DateTimeFormat('en-IN', dateOptions).format(date),
    title: new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'full',
      timeZone: 'Asia/Kolkata',
    }).format(date),
  }
}

function RoleBadge({ isAdmin }: { isAdmin: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isAdmin ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${isAdmin ? 'bg-red-600' : 'bg-green-primary'}`}
      />
      {isAdmin ? 'Admin' : 'Customer'}
    </span>
  )
}

function SortHeader({
  label,
  sortKey,
  activeSort,
  onSort,
  align = 'left',
}: {
  label: string
  sortKey: SortKey
  activeSort: { key: SortKey; direction: SortDirection }
  onSort: (key: SortKey) => void
  align?: 'left' | 'right'
}) {
  const active = activeSort.key === sortKey
  const Icon = active
    ? activeSort.direction === 'asc' ? ArrowUp : ArrowDown
    : null

  return (
    <th
      scope="col"
      aria-sort={active ? (activeSort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide text-green-secondary ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2 ${
          align === 'right' ? 'justify-end' : ''
        }`}
        aria-label={`Sort by ${label}${active ? `, ${activeSort.direction === 'asc' ? 'ascending' : 'descending'}` : ''}`}
      >
        {label}
        {Icon && <Icon aria-hidden="true" size={14} />}
      </button>
    </th>
  )
}

export default function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<RoleFilter>('all')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'joined',
    direction: 'desc',
  })

  const searchTerm = search.trim().toLocaleLowerCase('en-IN')
  const filteredCustomers = customers.filter((customer) => {
    const matchesRole =
      role === 'all' || (role === 'admin' ? customer.is_admin : !customer.is_admin)
    const matchesSearch =
      !searchTerm ||
      [customer.full_name, customer.email, customer.phone]
        .some((value) => value?.toLocaleLowerCase('en-IN').includes(searchTerm))

    return matchesRole && matchesSearch
  })

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const difference =
      sort.key === 'orders'
        ? a.orders - b.orders
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return sort.direction === 'asc' ? difference : -difference
  })

  const hasFilters = search.trim().length > 0 || role !== 'all'
  const clearFilters = () => {
    setSearch('')
    setRole('all')
  }
  const changeSort = (key: SortKey) => {
    setSort((current) => ({
      key,
      direction: current.key === key
        ? current.direction === 'asc' ? 'desc' : 'asc'
        : 'asc',
    }))
  }

  return (
    <section aria-label="Customer list">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-secondary"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email or phone"
            aria-label="Search customers by name, email or phone"
            className="h-11 w-full rounded-lg border border-silver bg-white pl-10 pr-3 text-sm text-navy-dark placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-1"
          />
        </div>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as RoleFilter)}
          aria-label="Filter customers by role"
          className="h-11 rounded-lg border border-silver bg-white px-3 text-sm text-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-1 sm:w-44"
        >
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-silver bg-white shadow-sm">
        {sortedCustomers.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            {customers.length === 0 ? (
              <>
                <Users aria-hidden="true" size={28} className="mb-3 text-green-secondary" />
                <h2 className="font-medium text-navy-dark">No customers yet</h2>
                <p className="mt-1 text-sm text-green-secondary">
                  Registered users will appear here.
                </p>
              </>
            ) : (
              <>
                <Search aria-hidden="true" size={28} className="mb-3 text-green-secondary" />
                <h2 className="font-medium text-navy-dark">No customers match your search</h2>
                <p className="mt-1 text-sm text-green-secondary">
                  Try another name, email, phone number, or role.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-md px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[36%]" />
                  <col className="w-[21%]" />
                  <col className="w-[12%]" />
                  <col className="w-[13%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-[#F3F7F5]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-green-secondary">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-green-secondary">
                      Phone
                    </th>
                    <SortHeader
                      label="Orders"
                      sortKey="orders"
                      activeSort={sort}
                      onSort={changeSort}
                      align="right"
                    />
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-green-secondary">
                      Role
                    </th>
                    <SortHeader
                      label="Joined"
                      sortKey="joined"
                      activeSort={sort}
                      onSort={changeSort}
                    />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EEF0]">
                  {sortedCustomers.map((customer) => {
                    const joined = formatJoinedDate(customer.created_at)
                    return (
                      <tr key={customer.id} className="h-[60px] hover:bg-[#F7FAF8]">
                        <td className="px-6 py-2 align-middle">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomerId(customer.id)}
                            aria-label={`View details for ${customer.full_name || customer.email || 'customer'}`}
                            className="flex w-full min-w-0 items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2"
                          >
                            <span aria-hidden="true" className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-50 text-sm font-semibold text-green-800">
                              {customer.avatar_url ? (
                                <Image src={customer.avatar_url} alt="" fill sizes="40px" unoptimized className="object-cover" />
                              ) : (
                                getInitials(customer.full_name, customer.email)
                              )}
                            </span>
                            <span className="block min-w-0">
                              <span className="block truncate font-medium text-navy-dark">{customer.full_name || 'Unnamed customer'}</span>
                              <span className="block truncate text-xs text-gray-600">{customer.email || '—'}</span>
                            </span>
                          </button>
                        </td>
                        <td className="px-6 py-2 align-middle text-green-secondary">{formatPhone(customer.phone)}</td>
                        <td className={`px-6 py-2 text-right align-middle tabular-nums ${customer.orders === 0 ? 'text-gray-500' : 'font-medium text-navy-dark'}`}>
                          {customer.orders}
                        </td>
                        <td className="px-6 py-2 align-middle"><RoleBadge isAdmin={customer.is_admin} /></td>
                        <td className="px-6 py-2 align-middle text-green-secondary">
                          <time dateTime={customer.created_at} title={joined.title}>{joined.label}</time>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-[#E8EEF0] md:hidden">
              {sortedCustomers.map((customer) => {
                const joined = formatJoinedDate(customer.created_at)
                return (
                  <article key={customer.id} className="p-4">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomerId(customer.id)}
                      aria-label={`View details for ${customer.full_name || customer.email || 'customer'}`}
                      className="flex w-full min-w-0 items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2"
                    >
                      <span aria-hidden="true" className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-50 text-sm font-semibold text-green-800">
                        {customer.avatar_url ? (
                          <Image src={customer.avatar_url} alt="" fill sizes="40px" unoptimized className="object-cover" />
                        ) : (
                          getInitials(customer.full_name, customer.email)
                        )}
                      </span>
                      <span className="block min-w-0 flex-1">
                        <span className="block truncate font-medium text-navy-dark">{customer.full_name || 'Unnamed customer'}</span>
                        <span className="block truncate text-xs text-gray-600">{customer.email || '—'}</span>
                      </span>
                      <RoleBadge isAdmin={customer.is_admin} />
                    </button>
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div>
                        <dt className="text-xs text-gray-600">Phone</dt>
                        <dd className="mt-0.5 text-navy-dark">{formatPhone(customer.phone)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-600">Orders</dt>
                        <dd className={`mt-0.5 tabular-nums ${customer.orders === 0 ? 'text-gray-500' : 'font-medium text-navy-dark'}`}>
                          {customer.orders}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-gray-600">Joined</dt>
                        <dd className="mt-0.5 text-navy-dark">
                          <time dateTime={customer.created_at} title={joined.title}>{joined.label}</time>
                        </dd>
                      </div>
                    </dl>
                  </article>
                )
              })}
            </div>
          </>
        )}

        <footer className="border-t border-[#E8EEF0] px-4 py-3 text-xs text-green-secondary sm:px-6">
          Showing <span className="font-medium tabular-nums text-navy-dark">{sortedCustomers.length}</span> of{' '}
          <span className="font-medium tabular-nums text-navy-dark">{customers.length}</span> customers
        </footer>
      </div>
      {selectedCustomerId && (
        <CustomerDetailsDialog
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </section>
  )
}
