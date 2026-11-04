'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X, User, Phone } from 'lucide-react'
import { useCartStore } from '@/hooks/useCartStore'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/product/fresh-ride-kit', label: 'Product' },
  { href: '/business', label: 'Business' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const itemCount = useCartStore((s) => s.getItemCount())

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-silver'
            : 'bg-transparent'
        }`}
      >
        {/* Top bar */}
        <div className="bg-green-primary text-white text-xs py-2 px-4 text-center overflow-hidden">
          <span className="hidden sm:inline">🦋 Free shipping on orders above ₹999 &nbsp;|&nbsp; </span>
          <span className="sm:hidden">🦋 Free shipping above ₹999 | </span>
          <a
            href="https://wa.me/916235958246?text=Hi%2C%20I%20would%20like%20to%20know%20more%20about%20Butterfly%20Fresh%20Ride"
            className="underline hover:text-gold-accent transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp for bulk orders
          </a>
        </div>

        <nav className="container-wide flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <Image
                src="/images/logo.png"
                alt="Butterfly Fresh Ride Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className={`text-sm font-bold tracking-wide transition-colors duration-300 ${
                  scrolled ? 'text-green-primary' : 'text-white'
                }`}
              >
                BUTTERFLY'S
              </span>
              <span
                className={`text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 ${
                  scrolled ? 'text-green-secondary' : 'text-green-light'
                }`}
              >
                Fresh Ride
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors duration-300 hover:text-green-secondary ${
                    scrolled ? 'text-navy-dark' : 'text-white/90'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <a
              href="tel:+919999999999"
              className={`hidden lg:flex items-center gap-1.5 text-sm transition-colors duration-300 ${
                scrolled ? 'text-navy-dark' : 'text-white/90'
              } hover:text-green-secondary`}
              title="Call us"
            >
              <Phone size={15} />
              <span className="text-xs">+91 62359 58246</span>
            </a>

            <Link
              href="/account"
              className={`hidden lg:flex items-center transition-colors duration-300 ${
                scrolled ? 'text-navy-dark' : 'text-white/90'
              } hover:text-green-secondary`}
              title="Account"
            >
              <User size={20} />
            </Link>

            <Link
              href="/cart"
              className={`relative flex items-center transition-colors duration-300 ${
                scrolled ? 'text-navy-dark' : 'text-white/90'
              } hover:text-green-secondary`}
              title="Cart"
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className={`lg:hidden transition-colors duration-300 ${
                scrolled ? 'text-navy-dark' : 'text-white'
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-2xl">
            <div className="p-6 border-b border-silver flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
                </div>
                <span className="font-bold text-green-primary">BUTTERFLY</span>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X size={20} className="text-navy-dark" />
              </button>
            </div>

            <nav className="flex-1 p-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-4 text-navy-dark font-medium text-sm hover:bg-light-bg hover:text-green-primary rounded-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="p-6 border-t border-silver space-y-3">
              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full justify-center text-center"
              >
                <ShoppingCart size={16} />
                Cart {itemCount > 0 && `(${itemCount})`}
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="btn-outline w-full justify-center text-center"
              >
                My Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
