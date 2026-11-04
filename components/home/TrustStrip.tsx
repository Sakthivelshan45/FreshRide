'use client'

import { motion } from 'framer-motion'
import { Truck, Package, RefreshCw, Headphones } from 'lucide-react'

const highlights = [
  {
    icon: Package,
    title: '3-Piece Kit',
    desc: 'Bedsheet + Pillow Cover + Blanket',
  },
  {
    icon: Truck,
    title: 'Bulk Supply Available',
    desc: 'For bus operators, hotels & more',
  },
  {
    icon: RefreshCw,
    title: 'Single-Use Convenience',
    desc: 'Fresh bedding for every journey',
  },
  {
    icon: Headphones,
    title: 'Dedicated B2B Support',
    desc: 'Custom quotes & recurring supply',
  },
]

export default function TrustStrip() {
  return (
    <section className="bg-green-primary mt-12 py-10" aria-label="Key highlights">
      <div className="container-wide">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              className="flex items-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <item.icon size={18} className="text-gold-accent" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{item.title}</p>
                <p className="text-green-light text-xs mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
