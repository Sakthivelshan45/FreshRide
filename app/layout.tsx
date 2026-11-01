import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1A4731',
}

export const metadata: Metadata = {
  title: {
    default: 'Butterfly Fresh Ride | Disposable Travel Bedding Kit',
    template: '%s | Butterfly Fresh Ride',
  },
  description:
    "Travel with greater convenience with Butterfly Fresh Ride's disposable travel bedding kit — bedsheet, pillow cover & blanket. Perfect for sleeper buses, hotels, trains and overnight travel.",
  keywords: [
    'disposable travel bedding kit',
    'disposable bedsheets',
    'use and throw bedsheets',
    'sleeper bus bedding',
    'disposable pillow cover',
    'travel bedding kit India',
    'single-use bedsheets',
    'disposable bedsheets for hotels',
    'disposable bedsheets wholesale',
    'Butterfly Fresh Ride',
  ],
  authors: [{ name: 'Butterfly Fresh Ride' }],
  creator: 'Butterfly Fresh Ride',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://butterflyfreshride.com',
    siteName: 'Butterfly Fresh Ride',
    title: 'Butterfly Fresh Ride | Disposable Travel Bedding Kit',
    description:
      'Premium 3-piece disposable travel bedding kit — bedsheet, pillow cover & blanket. Designed for sleeper buses, hotels, trains and overnight travel.',
    images: [
      {
        url: '/images/lifestyle/hero_sleeper_berth.png',
        width: 1200,
        height: 630,
        alt: 'Butterfly Fresh Ride Disposable Travel Bedding Kit on a luxury sleeper bus berth',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Butterfly Fresh Ride | Disposable Travel Bedding Kit',
    description: 'Premium disposable 3-piece travel bedding kit for sleeper buses, hotels and overnight travel.',
    images: ['/images/lifestyle/hero_sleeper_berth.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://butterflyfreshride.com',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-white text-navy-dark antialiased">
        {children}
      </body>
    </html>
  )
}
