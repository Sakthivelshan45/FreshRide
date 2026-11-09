'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingBag,
  Users, MessageSquare, Settings, ExternalLink, LogOut
} from 'lucide-react'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries' },
  { href: '/admin/content', icon: Settings, label: 'Content' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-navy-dark min-h-screen flex flex-col fixed top-0 left-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-[#2A3A47]">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <div>
            <p className="text-white text-xs font-bold tracking-widest">BUTTERFLY</p>
            <p className="text-green-light text-[9px] tracking-widest">ADMIN PANEL</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                active
                  ? 'bg-green-primary text-white'
                  : 'text-green-light hover:bg-[#2A3A47] hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[#2A3A47] space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 text-green-light hover:text-white text-sm transition-colors"
        >
          <ExternalLink size={16} />
          View Store
        </Link>
        <Link
          href="/account"
          className="flex items-center gap-3 px-3 py-2.5 text-green-light hover:text-white text-sm transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </Link>
      </div>
    </aside>
  )
}
