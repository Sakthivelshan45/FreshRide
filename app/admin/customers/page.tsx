import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Users } from 'lucide-react'

export const metadata: Metadata = { title: 'Customers | Admin' }

export default async function AdminCustomersPage() {
  let customers: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, phone, is_admin, created_at')
      .order('created_at', { ascending: false })
    if (data) customers = data
  } catch { /* DB not configured */ }

  return (
    <div className="min-h-screen bg-light-bg">
      <header className="bg-navy-dark text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-gold-accent" />
          <span className="font-medium">Customer Database</span>
        </div>
        <Link href="/admin" className="text-xs text-green-light hover:text-white flex items-center gap-1">
          <ArrowLeft size={12} /> Dashboard
        </Link>
      </header>

      <div className="max-w-5xl mx-auto p-8">
        <h1 className="font-serif text-2xl text-navy-dark mb-6">Customers ({customers.length})</h1>

        {customers.length === 0 ? (
          <div className="bg-white border border-silver p-10 text-center text-sm text-green-secondary">
            No customers yet, or database not configured.
          </div>
        ) : (
          <div className="bg-white border border-silver overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-light-bg">
                <tr>
                  {['Name', 'Phone', 'Role', 'Joined'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-green-secondary uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EEF0]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-light-bg">
                    <td className="px-4 py-3 font-medium text-navy-dark">{c.full_name || '—'}</td>
                    <td className="px-4 py-3 text-green-secondary">{c.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 ${c.is_admin ? 'bg-amber-100 text-amber-700' : 'bg-light-bg text-green-secondary'}`}>
                        {c.is_admin ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-green-secondary text-xs">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
