import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, Package, ShoppingBag, Users, MessageSquare, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Admin Dashboard | Butterfly Fresh Ride' }

const adminNav = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', desc: 'Overview & stats' },
  { href: '/admin/products', icon: Package, label: 'Products', desc: 'Manage variants & pricing' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders', desc: 'View & manage orders' },
  { href: '/admin/customers', icon: Users, label: 'Customers', desc: 'Customer database' },
  { href: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries', desc: 'B2B & bulk requests' },
  { href: '/admin/content', icon: Settings, label: 'Content', desc: 'FAQs, testimonials & settings' },
]

export default async function AdminDashboard() {
  const supabase = await createClient()
  const [
    { count: orderCount },
    { count: enquiryCount },
    { count: productCount },
  ] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('business_enquiries').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ])

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Admin header */}
      <header className="bg-navy-dark text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest">BUTTERFLY FRESH RIDE</p>
            <p className="text-[10px] text-green-secondary tracking-wider">Admin Dashboard</p>
          </div>
        </div>
        <Link href="/" className="text-xs text-green-light hover:text-white transition-colors">← Back to Site</Link>
      </header>

      <div className="max-w-5xl mx-auto p-8">
        <h1 className="font-serif text-3xl text-navy-dark mb-2">Admin Dashboard</h1>
        <p className="text-green-secondary mb-10 text-sm">Manage your store, products, orders and content.</p>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Orders', value: String(orderCount ?? 0), color: 'border-l-[#1A4731]' },
            { label: 'Total Revenue', value: '—', color: 'border-l-[#C8A96E]' },
            { label: 'Active Products', value: String(productCount ?? 0), color: 'border-l-[#4A7C59]' },
            { label: 'B2B Enquiries', value: String(enquiryCount ?? 0), color: 'border-l-[#17232D]' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-white border border-silver border-l-4 ${stat.color} p-5`}>
              <p className="text-2xl font-bold text-navy-dark">{stat.value}</p>
              <p className="text-xs text-green-secondary mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminNav.map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href} className="bg-white border border-silver p-6 hover:border-green-primary hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded bg-light-bg flex items-center justify-center mb-4 group-hover:bg-green-primary transition-colors">
                <Icon size={20} className="text-green-primary group-hover:text-white transition-colors" />
              </div>
              <h2 className="font-medium text-navy-dark mb-1">{label}</h2>
              <p className="text-xs text-green-secondary">{desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 bg-amber-50 border border-amber-200 text-amber-800 text-sm p-5">
          <strong>Setup Required:</strong> Configure your Supabase URL, anon key, and Razorpay keys in the <code>.env.local</code> file to activate full functionality. See the README for setup instructions.
        </div>
      </div>
    </div>
  )
}
