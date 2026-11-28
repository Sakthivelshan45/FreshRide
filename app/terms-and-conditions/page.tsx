import type { Metadata } from 'next'
import PolicyLayout, { type PolicySection } from '@/components/policies/PolicyLayout'
import { business } from '@/src/config/business'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: `Read the terms that apply when you visit ${business.websiteUrl} or purchase from ${business.brandName}.`,
}

const sections: PolicySection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of these terms',
    content: (
      <p>These terms apply to your access to and use of {business.websiteUrl}, and to purchases from {business.legalName} (“we”, “us” or “our”). By using the website or placing an order, you agree to these terms and our Privacy, Shipping and Return policies. If you do not agree, please do not use the website. Nothing here limits rights that cannot be excluded under applicable consumer law.</p>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility and account responsibilities',
    content: (
      <>
        <p>You must be at least 18 years old and legally capable of entering into a contract to place an order. If you use an account, you are responsible for keeping your login details confidential, providing accurate information and notifying us if you suspect unauthorised use.</p>
        <p>You are responsible for activity carried out through your account, except where applicable law provides otherwise. We may suspend access where reasonably necessary to protect customers, our services or legal compliance.</p>
      </>
    ),
  },
  {
    id: 'products',
    title: 'Product information',
    content: (
      <p>We make reasonable efforts to describe products accurately. Product images, colours and packaging may vary slightly due to display settings, photography or product updates. These variations do not affect your statutory rights. Please review the product description and specifications before ordering.</p>
    ),
  },
  {
    id: 'pricing-and-tax',
    title: 'Prices, taxes and invoices',
    content: (
      <p>Prices are shown in Indian Rupees (INR) and include applicable GST unless stated otherwise. Delivery charges and any other applicable charges are displayed before you confirm payment. We may update prices prospectively, but a price change does not alter an order already accepted. GST invoices are issued where required; B2B customers should provide accurate business and GSTIN details before checkout or request an invoice correction promptly.</p>
    ),
  },
  {
    id: 'orders-and-cancellations',
    title: 'Orders, acceptance and cancellation',
    content: (
      <p>Placing an order is an offer to buy. An order is accepted when we confirm it or dispatch the product. We may contact you to verify an order or cancel and refund it if a product is unavailable, payment is not authorised, a material listing error occurred, delivery is not serviceable, or we reasonably suspect fraud or misuse. If we cancel after payment, we will arrange a refund to the original payment method. Customer cancellation requests are governed by our <a href="/return-policy">Return, Refund & Cancellation Policy</a>.</p>
    ),
  },
  {
    id: 'payments-and-promotions',
    title: 'Payments, coupons and promotions',
    content: (
      <p>Payments are processed through Razorpay or other payment methods presented at checkout. Orders are subject to successful payment confirmation. Coupons and discounts are subject to their stated eligibility, validity, usage limits and exclusions; they cannot be exchanged for cash and may not be combined unless stated. We may withdraw or correct a promotion where permitted by law, including in the event of an obvious error.</p>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    content: (
      <p>The website and its content, including the Butterfly Fresh Ride name and brand, logos, product images, text, graphics and design, are owned by or licensed to us and are protected by applicable intellectual property laws. You may use the website for personal, non-commercial shopping. You must not copy, reproduce, distribute or commercially exploit website content without prior written permission, except as permitted by law.</p>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    content: (
      <p>You must not use the website unlawfully, interfere with its security or operation, attempt unauthorised access, submit false information, infringe another person’s rights, or use automated means to extract or misuse website content. We may restrict access and take lawful steps in response to misuse.</p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability and indemnity',
    content: (
      <>
        <p>To the extent permitted by law, we are not liable for indirect or consequential loss arising from use of the website or delays beyond our reasonable control. Nothing in these terms excludes or limits liability that cannot lawfully be excluded, including applicable consumer rights.</p>
        <p>You agree to be responsible for losses we reasonably incur as a direct result of your unlawful use of the website or material breach of these terms, to the extent permitted by law.</p>
      </>
    ),
  },
  {
    id: 'law-and-disputes',
    title: 'Governing law and disputes',
    content: (
      <p>These terms are governed by the laws of India. Subject to mandatory consumer protections and jurisdiction conferred by applicable law, courts at {business.jurisdictionCity}, Tamil Nadu will have jurisdiction. We encourage you to contact us first so we can try to resolve a concern promptly. Nothing in these terms prevents you from using a consumer forum or other remedy available under law.</p>
    ),
  },
  {
    id: 'grievance-officer',
    title: 'Grievance Officer',
    content: (
      <>
        <p>For complaints relating to these terms or an online order, contact our Grievance Officer:</p>
        <ul>
          <li>{business.grievanceOfficer.name}, {business.grievanceOfficer.designation}</li>
          <li>Email: <a href={`mailto:${business.grievanceOfficer.email}`}>{business.grievanceOfficer.email}</a></li>
          <li>Phone: {business.grievanceOfficer.phone}</li>
          <li>Address: {business.registeredAddress}</li>
        </ul>
        <p>We will acknowledge and address grievances within the timeframes required by applicable law, including the Consumer Protection Act, 2019 and Consumer Protection (E-Commerce) Rules, 2020, as applicable.</p>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact details',
    content: (
      <p>{business.legalName}, {business.registeredAddress}. Email: <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a>. Phone: {business.supportPhone}. GSTIN: {business.gstin}.</p>
    ),
  },
]

export default function TermsAndConditionsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      intro={`Please read these terms carefully before using ${business.websiteUrl} or purchasing ${business.brandName} products. They are intended to be read consistently with the Indian Contract Act, 1872, Consumer Protection Act, 2019 and Consumer Protection (E-Commerce) Rules, 2020.`}
      sections={sections}
    />
  )
}
