import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import B2BSection from '@/components/home/B2BSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wholesale & Bulk Orders | Butterfly Fresh Ride',
  description: 'Bulk supply of disposable travel bedding kits for sleeper buses, hotels, hospitals and travel operators. Request a wholesale quotation from Butterfly Fresh Ride.',
}

export default function BusinessPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="bg-green-primary py-20 text-center">
          <p className="eyebrow text-green-light mb-3">B2B & Wholesale</p>
          <h1 className="font-serif text-4xl lg:text-5xl text-white">Your Hygiene Supply Partner.</h1>
          <p className="text-white/70 mt-4 max-w-xl mx-auto text-sm">
            Reliable bulk supply of Butterfly Fresh Ride disposable bedding kits for businesses across India.
          </p>
        </div>
        <B2BSection />
      </main>
      <Footer />
    </>
  )
}
