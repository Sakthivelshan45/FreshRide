const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export const business = {
  brandName: 'Fresh Ride',
  legalName: 'BUTTERFLY GROUPS PRIVATE LIMITED',
  registeredAddress:
    'P2/11, Dakshas Vhridha Apartment, Marudhamalai Rd, IOB Colony, Coimbatore, Tamil Nadu – 641046',
  supportEmail: 'info@butterflygroups.com',
  supportPhone: '+91 62359 58246',
  whatsappNumber: '916235958246',
  gstin: '[GSTIN]',
  grievanceOfficer: {
    name: '[GRIEVANCE OFFICER NAME]',
    designation: '[DESIGNATION]',
    email: '[GRIEVANCE OFFICER EMAIL]',
    phone: '[GRIEVANCE OFFICER PHONE]',
  },
  websiteUrl: 'https://flyfreshride.store',
  lastUpdated: dateFormatter.format(new Date()),
  shippingTimeline: {
    processing: '[1-2 business days]',
    metro: '[2-5 business days]',
    nonMetro: '[4-7 business days]',
    remote: '[7-10 business days]',
    bulk: '[CONFIRM BULK ORDER TIMELINE]',
  },
  shippingCharges: {
    standard: '[SHIPPING CHARGE]',
    freeShippingThreshold: '[FREE-SHIPPING THRESHOLD]',
    freeShippingTerms: '[FREE SHIPPING / APPLICABLE TERMS]',
  },
  jurisdictionCity: '[CITY]',
  bulkCancellationTerms: '[ADD BULK/B2B CANCELLATION TERMS]',
  returnWindowDays: 7,
  refundTimelineDays: '5-7 business days',
} as const
