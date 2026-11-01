'use client'

import { motion } from 'framer-motion'

const features = [
  {
    emoji: '🌿',
    title: 'Single-Use Convenience',
    description:
      'Each kit is designed for one use only — open, use, and dispose. No washing, no carrying soiled linen.',
  },
  {
    emoji: '🛏️',
    title: 'Complete Bedding in One Pack',
    description:
      'Bedsheet, pillow cover and blanket neatly packed together. Everything you need, nothing you do not.',
  },
  {
    emoji: '🚌',
    title: 'Ideal for High-Turnover Settings',
    description:
      'Designed for sleeper buses, hotels and overnight travel where quick bed turnaround is essential.',
  },
  {
    emoji: '🧳',
    title: 'Compact and Portable',
    description:
      'The entire kit packs into a small, lightweight package that fits easily in your bag or berth storage.',
  },
  {
    emoji: '🏨',
    title: 'Versatile Applications',
    description:
      'Perfect for sleeper buses, overnight trains, hotels, guest houses, hospitals and home use.',
  },
  {
    emoji: '📦',
    title: 'Bulk Supply Available',
    description:
      'Order in bulk for your fleet, hotel or facility. Custom quantities and recurring supply agreements available.',
  },
]

export default function WhyChooseSection() {
  return (
    <section className="section-padding bg-white" aria-label="Why choose Butterfly Fresh Ride">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.p
            className="eyebrow mb-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Why Fresh Ride
          </motion.p>
          <motion.h2
            className="font-serif text-3xl sm:text-4xl lg:text-5xl text-navy-dark leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Why Choose Our
            <br />
            <span className="text-green-primary">Disposable Bedding Kits?</span>
          </motion.h2>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group p-8 border border-silver hover:border-green-primary hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300 inline-block">
                {feature.emoji}
              </div>
              <h3 className="font-serif text-xl text-navy-dark mb-3">{feature.title}</h3>
              <p className="text-green-secondary text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
