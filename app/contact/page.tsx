import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Building2, Mail, MapPin, Phone } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Contact Us | Butterfly Fresh Ride',
  description: 'Get in touch with Butterfly Fresh Ride for product enquiries, bulk orders or customer support.',
}

const address = 'P2/11, Dakshas Vhridha Apartment, Marudhamalai Rd, IOB Colony, Coimbatore, Tamil Nadu – 641046'

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-light-bg pt-20">
        <section className="relative overflow-hidden bg-gradient-green text-white">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full border border-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 h-80 w-80 rounded-full border border-white/10" />

          <div className="container-wide relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold-accent">Contact Us</p>
              <h1 className="max-w-2xl font-serif text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
                Let&apos;s talk about your next journey.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                Questions about Fresh Ride or need help choosing the right kit? Our team is happy to help.
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-6 text-navy-dark shadow-[0_24px_70px_rgba(23,35,45,0.2)] sm:p-8">
              <p className="eyebrow mb-2">We&apos;re here to help</p>
              <h2 className="mb-6 font-serif text-2xl text-navy-dark sm:text-3xl">Reach us directly</h2>

              <div className="space-y-3">
                <a
                  href="tel:+916235958246"
                  className="group flex items-center gap-4 rounded-2xl border border-silver p-4 transition-colors hover:border-green-primary hover:bg-light-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-light-bg text-green-primary transition-colors group-hover:bg-green-primary group-hover:text-white">
                    <Phone size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-green-secondary">Call our team</span>
                    <span className="mt-1 block break-words text-sm font-semibold text-navy-dark sm:text-base">+91 62359 58246</span>
                  </span>
                  <ArrowUpRight size={18} aria-hidden="true" className="ml-auto shrink-0 text-green-secondary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>

                <a
                  href="mailto:info@butterflygroups.com"
                  className="group flex items-center gap-4 rounded-2xl border border-silver p-4 transition-colors hover:border-green-primary hover:bg-light-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-light-bg text-green-primary transition-colors group-hover:bg-green-primary group-hover:text-white">
                    <Mail size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-green-secondary">Email us</span>
                    <span className="mt-1 block break-all text-sm font-semibold text-navy-dark sm:text-base">info@butterflygroups.com</span>
                  </span>
                  <ArrowUpRight size={18} aria-hidden="true" className="ml-auto shrink-0 text-green-secondary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="container-wide grid gap-5 py-12 sm:py-16 md:grid-cols-2 md:gap-6">
          <div className="rounded-[28px] border border-silver bg-white p-6 sm:p-8">
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-light-bg text-green-primary">
              <MapPin size={21} aria-hidden="true" />
            </span>
            <p className="eyebrow mb-2">Find us</p>
            <h2 className="font-serif text-2xl text-navy-dark">Visit our office</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-green-secondary">{address}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-green-primary px-5 text-sm font-semibold text-green-primary transition-colors hover:bg-green-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2"
            >
              Get directions
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>

          <div className="flex flex-col items-start justify-between gap-8 rounded-[28px] bg-navy-dark p-6 text-white sm:p-8">
            <div>
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-gold-accent">
                <Building2 size={21} aria-hidden="true" />
              </span>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-accent">For businesses</p>
              <h2 className="font-serif text-2xl text-white sm:text-3xl">Looking for bulk orders?</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-green-light">
                Tell us about your business and requirements. We&apos;ll help you find the right supply option.
              </p>
            </div>
            <Link
              href="/business#enquiry"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold-accent px-6 text-sm font-bold text-navy-dark transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-dark"
            >
              Submit a business enquiry
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
