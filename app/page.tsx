import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import TrustStrip from '@/components/home/TrustStrip'
import ProductIntroSection from '@/components/home/ProductIntroSection'
import WhyChooseSection from '@/components/home/WhyChooseSection'
import UseCasesSection from '@/components/home/UseCasesSection'
import HowToUseSection from '@/components/home/HowToUseSection'
import ProductPackages from '@/components/home/ProductPackages'
import B2BSection from '@/components/home/B2BSection'
import TestimonialCarousel from '@/components/home/TestimonialCarousel'
import FAQSection from '@/components/home/FAQSection'
import FinalCTASection from '@/components/home/FinalCTASection'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Butterfly Fresh Ride | Premium Disposable Travel Bedding Kit',
  description:
    'Shop Butterfly Fresh Ride disposable travel bedding kits — bedsheet, pillow cover & blanket in one convenient pack. Ideal for sleeper buses, hotels, hospitals and overnight travel.',
}

const FALLBACK_VARIANTS = [
  { id: 'v1', name: 'Single Kit', price: 149, compare_price: null, pack_quantity: 1, stock: 100, is_active: true, sort_order: 1 },
  { id: 'v2', name: 'Pack of 5', price: 649, compare_price: 745, pack_quantity: 5, stock: 80, is_active: true, sort_order: 2 },
  { id: 'v3', name: 'Pack of 10', price: 1199, compare_price: 1490, pack_quantity: 10, stock: 60, is_active: true, sort_order: 3 },
  { id: 'v4', name: 'Bulk Pack (25)', price: 2749, compare_price: 3725, pack_quantity: 25, stock: 40, is_active: true, sort_order: 4 },
]

const FALLBACK_FAQS = [
  { id: 'f1', question: 'What is a Butterfly Fresh Ride disposable travel bedding kit?', answer: 'A Butterfly Fresh Ride kit is a complete 3-piece disposable bedding set consisting of a bedsheet, a pillow cover and a blanket. It is designed for single use during overnight travel on sleeper buses, trains, at hotels, or in other accommodation settings.', sort_order: 1, is_active: true },
  { id: 'f2', question: 'How many pieces are included in each kit?', answer: 'Every kit includes three pieces: one bedsheet, one pillow cover, and one blanket. Everything you need for a comfortable night is packed in a single compact package.', sort_order: 2, is_active: true },
  { id: 'f3', question: 'What is the material of the bedding?', answer: 'The Fresh Ride kit is made from a soft, breathable disposable fabric. Specific material details are available on the product page and can be confirmed with our team.', sort_order: 3, is_active: true },
  { id: 'f4', question: 'Is it suitable for hotels and hospitals?', answer: 'Yes. The Butterfly Fresh Ride disposable bedding kit is suitable for hotels, guest houses, hospitals, clinics, spas and other professional accommodation environments that require quick bed preparation.', sort_order: 4, is_active: true },
  { id: 'f5', question: 'How should I dispose of the kit after use?', answer: 'After use, fold the bedding and dispose of it in accordance with your local waste management requirements. The kit is intended for single use only and should not be re-used.', sort_order: 5, is_active: true },
  { id: 'f6', question: 'Do you offer bulk orders for businesses?', answer: 'Yes. We supply in bulk to sleeper bus operators, hotels, hospitals, travel companies and distributors. Please use the business enquiry form on this page or contact us directly for a customised quotation.', sort_order: 6, is_active: true },
  { id: 'f7', question: 'What sizes are available?', answer: 'Size information is available on the product detail page. Please contact us if you require specific dimensions for your application.', sort_order: 7, is_active: true },
  { id: 'f8', question: 'What are the delivery charges?', answer: 'Delivery is free on orders above ₹999. A standard delivery charge applies to orders below this threshold. Charges are calculated at checkout based on your delivery location.', sort_order: 8, is_active: true },
  { id: 'f9', question: 'What is the return policy?', answer: 'Due to the hygiene nature of the product, opened kits cannot be returned. Unopened, sealed packs may be returned within 7 days of delivery. Please refer to our Returns & Refund Policy for full details.', sort_order: 9, is_active: true },
]

const FALLBACK_TESTIMONIALS = [
  { id: 't1', name: 'Rajesh Kumar', role: 'Fleet Manager, Sunrise Travels', content: 'We have been supplying Fresh Ride kits to all our sleeper buses for the past three months. Passengers love the clean, fresh bedding on every journey. It has simplified our operations enormously.', rating: 5, is_active: true, is_demo: true },
  { id: 't2', name: 'Priya Nair', role: 'Hotel Operations Head', content: 'Fresh Ride has transformed our guest room turnaround. The disposable bedding is hygienic, easy to manage and our guests appreciate the fresh, sealed presentation every time.', rating: 5, is_active: true, is_demo: true },
  { id: 't3', name: 'Arjun Mehta', role: 'Frequent Traveller', content: 'I never travel on overnight buses without my Fresh Ride kit now. The quality is surprisingly good for a disposable product and the pack is so compact. Highly recommended!', rating: 4, is_active: true, is_demo: true },
]

export default async function HomePage() {
  // Try to fetch live data from Supabase; fall back to static seed data gracefully
  let variants = FALLBACK_VARIANTS
  let faqs = FALLBACK_FAQS
  let testimonials = FALLBACK_TESTIMONIALS
  let productId = 'fresh-ride-kit'
  let productName = 'Butterfly Fresh Ride Disposable Travel Bedding Kit'
  let productImage = '/images/products/three_piece_kit.png'

  try {
    const supabase = await createClient()

    const { data: productData }: { data: any } = await supabase
      .from('products')
      .select(`
        id, name,
        product_variants(id, name, price, compare_price, pack_quantity, stock, is_active, sort_order),
        product_images(url, is_primary)
      `)
      .eq('slug', 'fresh-ride-kit')
      .eq('is_active', true)
      .single()

    if (productData) {
      productId = productData.id
      productName = productData.name
      const primaryImg = (productData as any).product_images?.find((img: any) => img.is_primary)
      if (primaryImg) productImage = primaryImg.url
      const liveVariants = (productData as any).product_variants?.filter((v: any) => v.is_active)
      if (liveVariants?.length) variants = liveVariants.sort((a: any, b: any) => a.sort_order - b.sort_order)
    }

    const { data: faqData } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (faqData?.length) faqs = faqData

    const { data: testimonialData } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(6)
    if (testimonialData?.length) testimonials = testimonialData
  } catch {
    // Supabase not configured yet — use fallback data silently
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustStrip />
        <ProductIntroSection />
        <WhyChooseSection />
        <UseCasesSection />
        <HowToUseSection />
        <ProductPackages
          variants={variants}
          productId={productId}
          productName={productName}
          productImage={productImage}
        />
        <B2BSection />
        <TestimonialCarousel testimonials={testimonials} />
        <FAQSection faqs={faqs} />
        <FinalCTASection />
      </main>
      <Footer />
    </>
  )
}
