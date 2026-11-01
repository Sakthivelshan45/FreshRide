import type { Metadata, Viewport } from 'next'
import './globals.css'

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
        url: '/images/lifestyle/hero_bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Butterfly Fresh Ride Disposable Travel Bedding Kit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Butterfly Fresh Ride | Disposable Travel Bedding Kit',
    description: 'Premium disposable 3-piece travel bedding kit for sleeper buses, hotels and overnight travel.',
    images: ['/images/lifestyle/hero_bg.jpg'],
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-white text-navy-dark antialiased">
        {children}
      </body>
    </html>
  )
}
