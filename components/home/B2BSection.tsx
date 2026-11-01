'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessEnquirySchema, type BusinessEnquiryFormData } from '@/lib/validations/schemas'
import { Building2, MessageSquare, CheckCircle } from 'lucide-react'
import Image from 'next/image'

const businessTypes = [
  'Sleeper Bus Operator',
  'Hotel / Resort',
  'Hospital / Clinic',
  'Travel Company / Tour Operator',
  'Distributor / Wholesaler',
  'Salon / Spa / Wellness Centre',
  'Guest House / Hostel',
  'Other',
]

const targets = [
  { icon: '🚌', label: 'Bus Operators' },
  { icon: '🏨', label: 'Hotels' },
  { icon: '🏥', label: 'Hospitals' },
  { icon: '✈️', label: 'Travel Companies' },
  { icon: '💆', label: 'Spas & Wellness' },
  { icon: '📦', label: 'Distributors' },
]

export default function B2BSection() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BusinessEnquiryFormData>({
    resolver: zodResolver(businessEnquirySchema),
  })

  const onSubmit = async (data: BusinessEnquiryFormData) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSubmitted(true)
        reset()
      }
    } catch (err) {
      console.error('Enquiry submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="b2b" className="section-padding bg-light-bg" aria-label="Business and wholesale">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="eyebrow mb-4">For Businesses</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-navy-dark leading-tight mb-6">
              Your Hygiene
              <br />
              <span className="text-green-primary">Supply Partner.</span>
            </h2>
            <p className="text-green-secondary text-base leading-relaxed mb-8">
              We supply Butterfly Fresh Ride kits in bulk to businesses across India. Whether you operate a fleet of sleeper buses, manage a hotel chain or run a clinic — we can meet your bedding requirements with a reliable recurring supply.
            </p>

            {/* B2B target grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {targets.map((t) => (
                <div
                  key={t.label}
                  className="flex flex-col items-center gap-1.5 p-3 bg-white border border-silver text-center"
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-xs font-medium text-navy-dark">{t.label}</span>
                </div>
              ))}
            </div>

            {/* Hero image */}
            <div className="relative aspect-video overflow-hidden">
              <Image
                src="/images/lifestyle/b2b_fleet.png"
                alt="Professional bus fleet ready for Butterfly Fresh Ride bulk supply"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-green-primary/30" />
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            id="enquiry"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="bg-white border border-silver p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle size={48} className="text-green-primary mx-auto mb-4" />
                  <h3 className="font-serif text-2xl text-navy-dark mb-3">Enquiry Received!</h3>
                  <p className="text-green-secondary">
                    Thank you for your interest. Our team will contact you within 24 hours with a tailored quotation.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-outline mt-6"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <Building2 size={22} className="text-green-primary" />
                    <h3 className="font-serif text-xl text-navy-dark">Bulk Order Enquiry</h3>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">
                          Company Name *
                        </label>
                        <input
                          {...register('companyName')}
                          id="b2b-company"
                          className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary transition-colors"
                          placeholder="Your company name"
                        />
                        {errors.companyName && (
                          <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">
                          Contact Person *
                        </label>
                        <input
                          {...register('contactPerson')}
                          id="b2b-contact"
                          className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary transition-colors"
                          placeholder="Your name"
                        />
                        {errors.contactPerson && (
                          <p className="text-red-500 text-xs mt-1">{errors.contactPerson.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">
                          Business Email *
                        </label>
                        <input
                          {...register('email')}
                          type="email"
                          id="b2b-email"
                          className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary transition-colors"
                          placeholder="you@company.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">
                          Phone Number *
                        </label>
                        <input
                          {...register('phone')}
                          type="tel"
                          id="b2b-phone"
                          className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary transition-colors"
                          placeholder="10-digit mobile number"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">
                        Business Type *
                      </label>
                      <select
                        {...register('businessType')}
                        id="b2b-type"
                        className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary transition-colors bg-white"
                      >
                        <option value="">Select business type</option>
                        {businessTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {errors.businessType && (
                        <p className="text-red-500 text-xs mt-1">{errors.businessType.message}</p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">
                          Required Quantity *
                        </label>
                        <input
                          {...register('quantity')}
                          id="b2b-quantity"
                          className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary transition-colors"
                          placeholder="e.g. 500 kits/month"
                        />
                        {errors.quantity && (
                          <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">
                          Delivery Location *
                        </label>
                        <input
                          {...register('location')}
                          id="b2b-location"
                          className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary transition-colors"
                          placeholder="City, State"
                        />
                        {errors.location && (
                          <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">
                        Additional Requirements
                      </label>
                      <textarea
                        {...register('requirements')}
                        id="b2b-requirements"
                        rows={3}
                        className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary transition-colors resize-none"
                        placeholder="Any special requirements, packaging preferences, delivery schedule..."
                      />
                    </div>

                    <button
                      type="submit"
                      id="b2b-submit"
                      disabled={submitting}
                      className="btn-primary w-full justify-center disabled:opacity-60"
                    >
                      <MessageSquare size={16} />
                      {submitting ? 'Sending Enquiry...' : 'Submit Bulk Enquiry'}
                    </button>

                    <p className="text-xs text-green-secondary text-center">
                      We will respond within 24 hours with a personalised quotation.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
