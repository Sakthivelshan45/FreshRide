'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingBag,
  Users, MessageSquare, Settings, ExternalLink, LogOut, Menu, X
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
  const [open, setOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-navy-dark flex items-center justify-between px-4 py-3 border-b border-[#2A3A47]">
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7 flex-shrink-0">
            <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <div>
            <p className="text-white text-xs font-bold tracking-widest">BUTTERFLY</p>
            <p className="text-green-light text-[9px] tracking-widest">ADMIN PANEL</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-white p-1.5 hover:bg-[#2A3A47] rounded transition-colors"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 lg:w-56 bg-navy-dark min-h-screen flex flex-col fixed top-0 left-0 z-50
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:z-30
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-[#2A3A47] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <div>
              <p className="text-white text-xs font-bold tracking-widest">BUTTERFLY</p>
              <p className="text-green-light text-[9px] tracking-widest">ADMIN PANEL</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-green-light hover:text-white p-1 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
    </>
  )
}
