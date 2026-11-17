export const ORDER_EXPORT_BRAND = {
  name: 'Butterfly Fresh Ride',
  tagline: 'A Butterfly Groups brand',
  address:
    'P2/11, Dakshas Vhridha Apartment, Marudhamalai Rd, IOB Colony, Coimbatore, Tamil Nadu 641046',
  phones: ['+91 62359 58246', '+91 99527 53900'],
  email: 'info@butterflygroups.com',
  logoPath: '/images/logo.svg',
} as const

export function extractEmbeddedLogoPngBase64(svg: string) {
  const match = /data:image\/png;base64,([A-Za-z0-9+/=]+)/.exec(svg)
  if (!match) throw new Error('The order export logo does not contain a PNG image.')
  return match[1]
}
