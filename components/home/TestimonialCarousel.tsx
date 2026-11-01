'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  role: string | null
  content: string
  rating: number
  is_demo: boolean
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
}

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = () => setCurrent((c) => (c + 1) % testimonials.length)
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)

  useEffect(() => {
    if (isAutoPlaying && testimonials.length > 1) {
      timerRef.current = setInterval(next, 5000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isAutoPlaying, testimonials.length])

  if (testimonials.length === 0) return null

  const testimonial = testimonials[current]

  return (
    <section className="section-padding bg-white overflow-hidden" aria-label="Customer testimonials">
      <div className="container-wide">
        <div className="text-center mb-14">
          <motion.p
            className="eyebrow mb-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            What People Say
          </motion.p>
          <motion.h2
            className="font-serif text-4xl lg:text-5xl text-navy-dark leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Customer
            <br />
            <span className="text-green-primary">Testimonials</span>
          </motion.h2>
          {testimonial.is_demo && (
            <p className="text-xs text-green-light mt-3 italic">* Sample reviews for demonstration purposes</p>
          )}
        </div>

        <div
          className="max-w-3xl mx-auto relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Decorative quote mark */}
          <div className="absolute -top-4 left-0 text-[120px] leading-none text-silver font-serif select-none pointer-events-none">
            &ldquo;
          </div>

          <div className="relative bg-light-bg border border-silver p-10 sm:p-14">
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < testimonial.rating ? 'text-gold-accent fill-gold-accent' : 'text-silver'}
                  />
                ))}
              </div>

              <p className="text-navy-dark text-lg sm:text-xl leading-relaxed mb-8 font-light">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-primary flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-navy-dark text-sm">{testimonial.name}</p>
                  {testimonial.role && <p className="text-green-secondary text-xs">{testimonial.role}</p>}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={prev}
                className="w-10 h-10 border border-silver flex items-center justify-center text-green-secondary hover:bg-green-primary hover:text-white hover:border-green-primary transition-all"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`transition-all duration-300 ${
                      i === current
                        ? 'w-6 h-2 bg-green-primary'
                        : 'w-2 h-2 bg-silver hover:bg-green-secondary'
                    }`}
                    aria-label={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-10 h-10 border border-silver flex items-center justify-center text-green-secondary hover:bg-green-primary hover:text-white hover:border-green-primary transition-all"
                aria-label="Next testimonial"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
