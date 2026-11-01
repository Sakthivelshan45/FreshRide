import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'
import { Phone, Mail, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us | Butterfly Fresh Ride',
  description: 'Get in touch with Butterfly Fresh Ride for product enquiries, bulk orders or customer support.',
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-light-bg">
        <div className="container-wide section-padding">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="eyebrow mb-3">Get in Touch</p>
              <h1 className="font-serif text-4xl lg:text-5xl text-navy-dark">Contact Us</h1>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Phone, label: 'Phone', value: '+91 62359 58246', href: 'tel:+916235958246' },
                { icon: Mail, label: 'Email', value: 'info@butterflygroups.com', href: 'mailto:info@butterflygroups.com' },
                { icon: MapPin, label: 'Location', value: 'P2/11, Dakshas Vhridha Apartment, Marudhamalai Rd, IOB Colony, Coimbatore, Tamil Nadu – 641046', href: '#' },
              ].map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href} className="bg-white border border-silver p-6 text-center hover:border-green-primary transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-light-bg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-primary transition-colors">
                    <Icon size={20} className="text-green-primary group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-xs text-green-secondary mb-1 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-medium text-navy-dark">{value}</p>
                </a>
              ))}
            </div>
            <div className="bg-white border border-silver p-8 text-center">
              <p className="text-green-secondary mb-6">For bulk orders and business enquiries, please use our dedicated B2B enquiry form.</p>
              <a href="/business#enquiry" className="btn-primary">Submit a Business Enquiry</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
