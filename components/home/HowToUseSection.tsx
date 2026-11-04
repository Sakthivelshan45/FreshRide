'use client'

import { motion } from 'framer-motion'
import { Package, Expand, Layers, Trash2, CheckCircle } from 'lucide-react'
import Image from 'next/image'

const steps = [
  {
    step: '01',
    icon: Package,
    title: 'Open the Pack',
    desc: 'Tear open the compact sealed package. Each kit contains all three bedding pieces neatly folded inside.',
    image: '/images/lifestyle/howto_unpack.png',
  },
  {
    step: '02',
    icon: Expand,
    title: 'Unfold the Bedsheet',
    desc: 'Shake open the bedsheet and spread it evenly over your sleeping berth or mattress.',
    image: '/images/lifestyle/hero_sleeper_berth.png',
  },
  {
    step: '03',
    icon: Layers,
    title: 'Prepare the Pillow',
    desc: 'Slide the pillow into the pillow cover and place it comfortably at the head of the berth.',
    image: '/images/lifestyle/howto_unpack.png',
  },
  {
    step: '04',
    icon: CheckCircle,
    title: 'Rest Comfortably',
    desc: 'Wrap yourself in the blanket and enjoy a comfortable, hygienic night of rest.',
    image: '/images/lifestyle/hero_sleeper_berth.png',
  },
  {
    step: '05',
    icon: Trash2,
    title: 'Dispose Responsibly',
    desc: 'After use, fold the bedding and dispose of it in accordance with local waste handling requirements.',
    image: '/images/lifestyle/howto_unpack.png',
  },
]

export default function HowToUseSection() {
  return (
    <section className="section-padding bg-navy-dark" aria-label="How to use the Fresh Ride kit">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.p
            className="eyebrow text-green-light mb-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Simple to Use
          </motion.p>
          <motion.h2
            className="font-serif text-4xl lg:text-5xl text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            How to Use Your
            <br />
            <span className="text-gold-accent">Fresh Ride Kit</span>
          </motion.h2>
        </div>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[calc(50%-1px)] top-0 bottom-0 w-px bg-[#2A3A47] hidden lg:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                className={`grid lg:grid-cols-2 gap-10 items-center ${
                  i % 2 === 1 ? 'lg:direction-rtl' : ''
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {/* Content side */}
                <div className={`${i % 2 === 1 ? 'lg:order-last' : ''}`}>
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-green-primary border-2 border-gold-accent flex items-center justify-center relative z-10">
                        <step.icon size={22} className="text-gold-accent" />
                      </div>
                    </div>
                    <div>
                      <p className="eyebrow text-gold-accent mb-1">Step {step.step}</p>
                      <h3 className="font-serif text-2xl text-white mb-3">{step.title}</h3>
                      <p className="text-green-light leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Image side */}
                <div className={`${i % 2 === 1 ? 'lg:order-first' : ''}`}>
                  <div className="relative aspect-video overflow-hidden bg-green-primary/30">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover opacity-80"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    {/* Step number overlay */}
                    {/* <div className="absolute top-4 right-4 font-serif text-6xl font-bold text-white/10">
                      {step.step}
                    </div> */}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
