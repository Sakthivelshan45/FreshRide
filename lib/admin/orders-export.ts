export const ORDER_STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const

export type OrderExportFilters = {
  status: (typeof ORDER_STATUS_OPTIONS)[number] | ''
  from: string
  to: string
  search: string
}

export const EMPTY_ORDER_EXPORT_FILTERS: OrderExportFilters = {
  status: '',
  from: '',
  to: '',
  search: '',
}

function isValidDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  )
}

export function parseOrderExportFilters(params: URLSearchParams) {
  const status = params.get('status') ?? ''
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  const search = (params.get('search') ?? '').trim()

  if (status && !ORDER_STATUS_OPTIONS.some((option) => option === status)) {
    return { filters: EMPTY_ORDER_EXPORT_FILTERS, error: 'Invalid order status filter.' }
  }
  if ((from && !isValidDate(from)) || (to && !isValidDate(to))) {
    return { filters: EMPTY_ORDER_EXPORT_FILTERS, error: 'Dates must use YYYY-MM-DD format.' }
  }
  if (from && to && from > to) {
    return { filters: EMPTY_ORDER_EXPORT_FILTERS, error: 'The start date must not be after the end date.' }
  }
  if (search.length > 100) {
    return { filters: EMPTY_ORDER_EXPORT_FILTERS, error: 'Search must be 100 characters or fewer.' }
  }

  return {
    filters: {
      status: status as OrderExportFilters['status'],
      from,
      to,
      search,
    },
    error: null,
  }
}

function istMidnightUtc(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day) - 330 * 60 * 1000).toISOString()
}

export function getOrderExportDateBounds(filters: OrderExportFilters) {
  const nextDay = filters.to
    ? new Date(
        Date.UTC(
          Number(filters.to.slice(0, 4)),
          Number(filters.to.slice(5, 7)) - 1,
          Number(filters.to.slice(8, 10)) + 1
        )
      )
    : null
  const toExclusive = nextDay
    ? new Date(nextDay.getTime() - 330 * 60 * 1000).toISOString()
    : undefined

  return {
    fromInclusive: filters.from ? istMidnightUtc(filters.from) : undefined,
    toExclusive,
  }
}

export function buildOrderExportSearchCondition(search: string) {
  if (!search) return ''

  const escaped = search.replace(/[\\%_"]/g, '\\$&')
  const pattern = `"%${escaped}%"`
  return [
    `order_number.ilike.${pattern}`,
    `customer_name.ilike.${pattern}`,
    `customer_phone.ilike.${pattern}`,
    `customer_email.ilike.${pattern}`,
  ].join(',')
}
