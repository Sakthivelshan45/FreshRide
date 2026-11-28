import type { Metadata } from 'next'
import PolicyLayout, { type PolicySection } from '@/components/policies/PolicyLayout'
import { business } from '@/src/config/business'

export const metadata: Metadata = {
  title: 'Return, Refund & Cancellation Policy',
  description: `Understand the return window, eligible return reasons, refunds, replacements and cancellations for ${business.brandName} orders.`,
}

const sections: PolicySection[] = [
  {
    id: 'return-window',
    title: 'Return window',
    content: (
      <p>You may request a return within {business.returnWindowDays} days from the date your order is delivered. Contact us within this period and include your order number. Requests made after the window may not be accepted unless required by applicable law.</p>
    ),
  },
  {
    id: 'eligible-returns',
    title: 'When a return may be accepted',
    content: (
      <>
        <p>Returns may be considered if you receive the wrong item, the item is damaged in transit, or there is a manufacturing defect. Please report the issue as soon as possible and provide clear photos or an unboxing video showing the package, product and issue. We may ask for additional details to assess the request.</p>
        <p>We will review each request and confirm whether a return, replacement or refund is appropriate, subject to your rights under applicable law.</p>
      </>
    ),
  },
  {
    id: 'not-eligible',
    title: 'Items generally not eligible for return',
    content: (
      <>
        <p>Unless the item is defective, damaged, incorrect or applicable law requires otherwise, we generally cannot accept returns for items that:</p>
        <ul>
          <li>Have been used, washed, opened or altered.</li>
          <li>Are not returned with their original packaging and pouch.</li>
          <li>Were made or procured as custom or bulk orders, subject to the agreed B2B terms.</li>
        </ul>
        <p>Because bedding is a personal-use product, returns are accepted only for unused items that remain sealed in their original packaging, except where the product is defective, damaged in transit, incorrect or your legal rights provide otherwise.</p>
      </>
    ),
  },
  {
    id: 'request-process',
    title: 'How to request a return',
    content: (
      <>
        <p>Contact us within the return window by email at <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a>, WhatsApp at +{business.whatsappNumber}, or through our <a href="/contact">contact page</a>. Include your order number, reason for the request, photos or unboxing video, and a phone number where we can reach you.</p>
        <p>Do not send an item back before receiving return instructions. If approved, we will explain the pickup or return-shipping process and whether we will arrange collection or ask you to ship the item. We will confirm responsibility for return shipping when the request is approved.</p>
      </>
    ),
  },
  {
    id: 'resolution-and-refunds',
    title: 'Replacement and refunds',
    content: (
      <p>Depending on the issue and product availability, we may offer a replacement or refund after the return is approved and any required inspection is complete. Approved refunds are initiated to the original payment method through Razorpay or the relevant payment provider, normally within {business.refundTimelineDays}. Your bank or payment provider may take additional time to credit the amount.</p>
    ),
  },
  {
    id: 'cancellations',
    title: 'Order cancellations',
    content: (
      <p>You may contact us to cancel an order before it is shipped. We will confirm whether cancellation is possible; if payment has been collected and cancellation is accepted, we will initiate a refund to the original payment method. Once an order has shipped, it cannot usually be cancelled in transit. You may request a return after delivery under this policy, subject to eligibility and applicable law.</p>
    ),
  },
  {
    id: 'bulk-cancellations',
    title: 'Bulk and B2B order cancellations',
    content: (
      <p>Bulk and B2B orders may have separately agreed cancellation, return and refund terms, including any custom procurement or production commitments. Those terms will be provided with the quotation or order confirmation: {business.bulkCancellationTerms}. For defects, damage or incorrect items, contact us promptly so we can review the issue.</p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact us',
    content: (
      <p>For help with a return, replacement or cancellation, contact {business.legalName} at <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a>, WhatsApp +{business.whatsappNumber}, or {business.supportPhone}. Please include your order number in your message.</p>
    ),
  },
]

export default function ReturnPolicyPage() {
  return (
    <PolicyLayout
      title="Return, Refund & Cancellation Policy"
      intro={`This policy applies to orders placed with ${business.legalName} through ${business.websiteUrl}. It explains how to report a problem, request a return or replacement, and cancel an order.`}
      sections={sections}
    />
  )
}
