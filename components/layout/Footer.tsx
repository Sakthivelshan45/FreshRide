import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail } from 'lucide-react'

// Inline SVGs for social icons removed from newer lucide-react
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-navy-dark text-white">
      {/* Main footer */}
      <div className="container-wide py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
        {/* Brand column */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative w-10 h-10">
              <Image src="/images/logo.png" alt="Butterfly Fresh Ride" fill className="object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-widest">BUTTERFLY</p>
              <p className="text-[10px] tracking-[0.2em] text-green-light">FRESH RIDE</p>
            </div>
          </div>
          <p className="text-green-light text-sm leading-relaxed mb-6">
            Premium disposable travel bedding kits designed for comfort, convenience and hygiene during overnight journeys.
          </p>
          <div className="flex gap-4">
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-light hover:text-[#25D366] transition-colors"
              title="WhatsApp"
            >
              <WhatsAppIcon />
            </a>
            <a
              href="https://instagram.com/butterflyfreshride"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-light hover:text-[#E1306C] transition-colors"
              title="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://facebook.com/butterflyfreshride"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-light hover:text-[#1877F2] transition-colors"
              title="Facebook"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>

        {/* Products */}
        <div>
          <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-accent mb-5">Products</h4>
          <ul className="space-y-3 text-sm">
            {[
              { href: '/product/fresh-ride-kit', label: 'Fresh Ride Kit (3-Piece)' },
              { href: '/shop', label: 'Shop All Packs' },
              { href: '/product/fresh-ride-kit#specifications', label: 'Product Specifications' },
              { href: '/business', label: 'Bulk & Wholesale Orders' },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-green-light hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Business solutions */}
        <div>
          <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-accent mb-5">Business Solutions</h4>
          <ul className="space-y-3 text-sm">
            {[
              { href: '/business#sleeper-bus', label: 'Sleeper Bus Operators' },
              { href: '/business#hotels', label: 'Hotels & Resorts' },
              { href: '/business#hospitals', label: 'Hospitals & Clinics' },
              { href: '/business#travel', label: 'Travel Companies' },
              { href: '/business#enquiry', label: 'Request a Quote' },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-green-light hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-accent mb-5">Contact Us</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3 text-green-light">
              <MapPin size={16} className="flex-shrink-0 mt-0.5" />
              <span>Butterfly Groups, India</span>
            </li>
            <li>
              <a href="tel:+919999999999" className="flex gap-3 text-green-light hover:text-white transition-colors">
                <Phone size={16} className="flex-shrink-0" />
                <span>+91 99999 99999</span>
              </a>
            </li>
            <li>
              <a href="mailto:info@butterflyfreshride.com" className="flex gap-3 text-green-light hover:text-white transition-colors">
                <Mail size={16} className="flex-shrink-0" />
                <span>info@butterflyfreshride.com</span>
              </a>
            </li>
          </ul>

          <div className="mt-6">
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-accent mb-3">Policies</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/shipping-policy', label: 'Shipping Policy' },
                { href: '/return-policy', label: 'Returns & Refunds' },
                { href: '/privacy-policy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms & Conditions' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-green-light hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#2A3A47]">
        <div className="container-wide py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-green-secondary text-xs">
            © {currentYear} Butterfly Fresh Ride. All rights reserved. A Butterfly Groups brand.
          </p>
          <p className="text-green-secondary text-xs">
            Designed for comfort. Made for travel.
          </p>
        </div>
      </div>
    </footer>
  )
}
