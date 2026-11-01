import type { Metadata } from 'next'
import Link from 'next/link'
import { User, ShoppingBag, MapPin, LogOut } from 'lucide-react'

export const metadata: Metadata = { title: 'My Account | Butterfly Fresh Ride' }

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-light-bg pt-20">
      <div className="container-wide section-padding max-w-4xl">
        <h1 className="font-serif text-3xl text-navy-dark mb-8">My Account</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: User, label: 'Profile', desc: 'Manage your personal details', href: '/account/profile' },
            { icon: ShoppingBag, label: 'My Orders', desc: 'View your order history', href: '/account/orders' },
            { icon: MapPin, label: 'Addresses', desc: 'Manage delivery addresses', href: '/account/addresses' },
          ].map(({ icon: Icon, label, desc, href }) => (
            <Link key={label} href={href} className="bg-white border border-silver p-6 hover:border-green-primary transition-colors group">
              <Icon size={24} className="text-green-primary mb-3" />
              <h2 className="font-medium text-navy-dark mb-1">{label}</h2>
              <p className="text-xs text-green-secondary">{desc}</p>
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/account/login" className="btn-outline text-sm">
            <LogOut size={15} />
            Login / Register
          </Link>
        </div>
      </div>
    </div>
  )
}
