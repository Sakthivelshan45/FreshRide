import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Settings, MessageSquare, Star } from 'lucide-react'

export const metadata: Metadata = { title: 'Content Management | Admin' }

export default async function AdminContentPage() {
  let faqs: any[] = []
  let testimonials: any[] = []

  try {
    const supabase = await createClient()
    const [faqRes, testRes] = await Promise.all([
      supabase.from('faqs').select('*').order('sort_order'),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
    ])
    if (faqRes.data) faqs = faqRes.data
    if (testRes.data) testimonials = testRes.data
  } catch { /* DB not configured */ }

  return (
    <div className="min-h-screen bg-light-bg">
      <header className="bg-navy-dark text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-gold-accent" />
          <span className="font-medium">Content Management</span>
        </div>
        <Link href="/admin" className="text-xs text-green-light hover:text-white flex items-center gap-1">
          <ArrowLeft size={12} /> Dashboard
        </Link>
      </header>

      <div className="max-w-5xl mx-auto p-8 space-y-10">
        {/* FAQs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-navy-dark flex items-center gap-2">
              <MessageSquare size={18} className="text-green-primary" /> FAQs ({faqs.length})
            </h2>
          </div>
          {faqs.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 text-sm">
              Connect your Supabase database to manage FAQs. Run the migration SQL first.
            </div>
          ) : (
            <div className="bg-white border border-silver divide-y divide-[#E8EEF0]">
              {faqs.map((faq, i) => (
                <div key={faq.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-navy-dark mb-1">{faq.question}</p>
                    <p className="text-xs text-green-secondary line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 ${faq.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {faq.is_active ? 'Active' : 'Hidden'}
                    </span>
                    <span className="text-xs text-green-light">#{faq.sort_order}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Testimonials */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-navy-dark flex items-center gap-2">
              <Star size={18} className="text-gold-accent" /> Testimonials ({testimonials.length})
            </h2>
          </div>
          {testimonials.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 text-sm">
              Connect your Supabase database to manage testimonials.
            </div>
          ) : (
            <div className="bg-white border border-silver divide-y divide-[#E8EEF0]">
              {testimonials.map((t) => (
                <div key={t.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-navy-dark">{t.name}</span>
                      {t.role && <span className="text-xs text-green-secondary">· {t.role}</span>}
                      <div className="flex gap-0.5 ml-1">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <span key={i} className="text-gold-accent text-xs">★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-green-secondary line-clamp-2">{t.content}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {t.is_demo && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5">Demo</span>}
                    <span className={`text-[10px] px-2 py-0.5 ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {t.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
