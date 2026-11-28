import type { Metadata } from 'next'
import PolicyLayout, { type PolicySection } from '@/components/policies/PolicyLayout'
import { business } from '@/src/config/business'

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: `Review ${business.brandName}'s India shipping coverage, delivery estimates, charges, tracking and delivery issue process.`,
}

const sections: PolicySection[] = [
  {
    id: 'coverage',
    title: 'Delivery coverage',
    content: (
      <p>We currently ship within India to serviceable pincodes. Serviceability is confirmed at checkout and may depend on courier availability in your area. We do not currently ship internationally.</p>
    ),
  },
  {
    id: 'processing-and-delivery',
    title: 'Processing and estimated delivery',
    content: (
      <>
        <p>Orders are normally prepared within {business.shippingTimeline.processing} after payment confirmation, excluding Sundays and public holidays. Estimated transit times after dispatch are:</p>
        <ul>
          <li>Metro areas: {business.shippingTimeline.metro}</li>
          <li>Non-metro areas: {business.shippingTimeline.nonMetro}</li>
          <li>Remote or limited-service areas: {business.shippingTimeline.remote}</li>
        </ul>
        <p>These are estimates, not guaranteed delivery dates. The latest estimate, if available, will be shown at checkout or in your dispatch notification.</p>
      </>
    ),
  },
  {
    id: 'shipping-charges',
    title: 'Shipping charges',
    content: (
      <p>Shipping charges are shown at checkout before you place your order. Standard shipping is {business.shippingCharges.standard}; orders above {business.shippingCharges.freeShippingThreshold} qualify for {business.shippingCharges.freeShippingTerms}. Any location-specific or expedited charges will be disclosed before payment.</p>
    ),
  },
  {
    id: 'tracking',
    title: 'Order tracking',
    content: (
      <p>Once your order is dispatched, we will share available tracking details by SMS, email or WhatsApp using the contact details provided at checkout. Tracking updates are supplied by the courier and may take some time to appear.</p>
    ),
  },
  {
    id: 'bulk-orders',
    title: 'Bulk and B2B orders',
    content: (
      <p>Bus operators, hotels, travel businesses and other business customers can request a separate quote and delivery schedule through our <a href="/business#enquiry">business enquiry form</a>. Bulk order timelines are confirmed when we provide your quote and may differ from retail estimates. Current planning estimate: {business.shippingTimeline.bulk}.</p>
    ),
  },
  {
    id: 'delays',
    title: 'Delays beyond our control',
    content: (
      <p>Delivery may be delayed by courier capacity, weather, strikes, public emergencies, government restrictions, natural events or other circumstances outside our reasonable control (force majeure). We will share material updates when information is available from the courier.</p>
    ),
  },
  {
    id: 'address-and-failed-delivery',
    title: 'Incorrect address, failed delivery and returns to origin',
    content: (
      <p>Please check your delivery address and phone number before placing an order. If a shipment cannot be delivered because the address is incomplete or incorrect, the recipient is unavailable, or delivery is refused, the courier may return it to origin (RTO). Contact us promptly if tracking shows a delivery issue. Additional shipping charges or refund adjustments, if any, will be explained before we take action.</p>
    ),
  },
  {
    id: 'damaged-or-lost',
    title: 'Damaged, missing or lost package',
    content: (
      <p>If your package arrives visibly damaged or appears lost in transit, contact us as soon as possible at <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a> or by WhatsApp at +{business.whatsappNumber}. Share your order number, photos of the parcel and packaging, and any courier remarks. We will review the matter with the courier and explain the available resolution.</p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <p>For shipping assistance, contact {business.legalName}, {business.registeredAddress}, at <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a> or {business.supportPhone}.</p>
    ),
  },
]

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout
      title="Shipping Policy"
      intro={`This policy explains how ${business.legalName} processes and delivers orders placed through ${business.websiteUrl}. Delivery estimates start after dispatch and can vary by destination and courier serviceability.`}
      sections={sections}
    />
  )
}
