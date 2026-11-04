'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const useCases = [
  {
    id: 'sleeper-bus',
    title: 'Sleeper Buses',
    description: 'Fresh bedding for every passenger on every route — no laundry required.',
    image: '/images/lifestyle/sleeper_bus.png',
    gradient: 'from-[#0D2018]/80 to-[#1A4731]/20',
  },
  {
    id: 'hotels',
    title: 'Hotels & Resorts',
    description: 'Quick room turnaround with hygienic disposable bedding for guests.',
    image: '/images/lifestyle/hotel_room.png',
    gradient: 'from-[#142A3A]/80 to-[#1A4731]/20',
  },
  {
    id: 'hospitals',
    title: 'Hospitals & Clinics',
    description: 'Clean, single-use bedding for patient examination and overnight stays.',
    image: '/images/lifestyle/b2b_fleet.png',
    gradient: 'from-[#0D2018]/80 to-[#17232D]/20',
  },
  {
    id: 'travel',
    title: 'Travel Operators',
    description: 'Standardise comfort across your fleet with reliable bulk bedding supply.',
    image: '/images/lifestyle/b2b_fleet.png',
    gradient: 'from-[#1A4731]/80 to-[#4A7C59]/20',
  },
  {
    id: 'wellness',
    title: 'Spas & Wellness',
    description: 'Hygienic treatment table covers for massage and wellness centres.',
    image: '/images/lifestyle/hotel_room.png',
    gradient: 'from-[#17232D]/80 to-[#1A4731]/20',
  },
  {
    id: 'home',
    title: 'Home Use',
    description: 'Perfect for guest rooms, camping trips and travel away from home.',
    image: '/images/lifestyle/sleeper_bus.png',
    gradient: 'from-[#0D2018]/80 to-[#4A7C59]/20',
  },
]

export default function UseCasesSection() {
  return (
    <section className="section-padding bg-light-bg" aria-label="Use cases">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.p
            className="eyebrow mb-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Where Can You Use It?
          </motion.p>
          <motion.h2
            className="font-serif text-4xl lg:text-5xl text-navy-dark leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Fresh Bedding for
            <br />
            <span className="text-green-primary">Every Setting</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {useCases.map((item, i) => (
            <motion.div
              key={item.id}
              id={item.id}
              className="group relative aspect-[4/3] overflow-hidden cursor-default"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              {/* Background image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient} transition-opacity duration-300`} />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="font-serif text-xl text-white mb-1">{item.title}</h3>
                <p className="text-white/70 text-sm leading-snug translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                  {item.description}
                </p>
              </div>

              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
