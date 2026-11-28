import type { Metadata } from 'next'
import PolicyLayout, { type PolicySection } from '@/components/policies/PolicyLayout'
import { business } from '@/src/config/business'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Learn how ${business.brandName} collects, uses, stores and protects your personal information when you use our website or services.`,
}

const sections: PolicySection[] = [
  {
    id: 'information-we-collect',
    title: 'Information we collect',
    content: (
      <>
        <p>Depending on how you use our website and services, we may collect:</p>
        <ul>
          <li>Identity and contact information, including your name, phone number, email address and delivery or billing address.</li>
          <li>Order details, order history, customer support messages and preferences.</li>
          <li>For business-to-business (B2B) purchases, business name, GSTIN and invoice details you provide.</li>
          <li>Technical information such as device type, browser, IP address, approximate location, cookies and website usage data.</li>
        </ul>
        <p>Please do not send us sensitive personal information unless it is necessary for your request.</p>
      </>
    ),
  },
  {
    id: 'how-we-use-information',
    title: 'Why and how we use your information',
    content: (
      <>
        <p>We use information to accept and fulfil orders, arrange delivery, issue invoices, provide customer support, manage accounts, process returns, improve the website, prevent fraud and comply with legal obligations.</p>
        <p>Where required, we process personal data on the basis of your consent or another lawful ground under applicable Indian law. You may withdraw consent as described below; doing so may affect services that need that information.</p>
      </>
    ),
  },
  {
    id: 'payments',
    title: 'Payments',
    content: (
      <p>Online payments are processed by Razorpay and its payment partners. We do not store your full card number, card security code, UPI PIN or other payment authentication credentials. Payment providers handle payment information under their own privacy and security terms.</p>
    ),
  },
  {
    id: 'storage-and-service-providers',
    title: 'Storage and service providers',
    content: (
      <p>We use Supabase for secure data storage and authentication. We share only the information reasonably needed with delivery and logistics partners to fulfil orders, payment providers to process transactions, and government, regulatory or law-enforcement authorities when required by law or valid legal process. Service providers are expected to protect information they handle for us.</p>
    ),
  },
  {
    id: 'cookies-and-analytics',
    title: 'Cookies and analytics',
    content: (
      <p>Our website may use cookies and similar technologies to keep the site working, remember preferences, understand traffic and improve our services. You can manage cookies through your browser settings; disabling some cookies may affect website features. Where required, we will seek consent before using non-essential cookies or analytics.</p>
    ),
  },
  {
    id: 'retention-and-security',
    title: 'Data retention and security',
    content: (
      <p>We retain information only for as long as needed for the purposes described here, including order fulfilment, accounting, dispute handling and legal compliance. We use reasonable technical and organisational safeguards, including access controls and secure service providers. No online transmission or storage method can be guaranteed completely secure.</p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your choices and rights',
    content: (
      <p>Subject to applicable law, you may request access to or correction of your personal information, request deletion where we are not required to retain it, and withdraw consent for processing based on consent. To make a request, email <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a>. We may need to verify your identity before responding.</p>
    ),
  },
  {
    id: 'children',
    title: 'Children’s information',
    content: (
      <p>Our website and products are intended for adults. We do not knowingly seek personal information directly from children. If you believe a child has provided us personal information, contact us so we can review and take appropriate steps in accordance with applicable law.</p>
    ),
  },
  {
    id: 'grievance',
    title: 'Grievance Officer',
    content: (
      <>
        <p>For privacy complaints or questions, contact our Grievance Officer:</p>
        <ul>
          <li>Name: {business.grievanceOfficer.name}</li>
          <li>Designation: {business.grievanceOfficer.designation}</li>
          <li>Email: <a href={`mailto:${business.grievanceOfficer.email}`}>{business.grievanceOfficer.email}</a></li>
          <li>Phone: {business.grievanceOfficer.phone}</li>
          <li>Address: {business.registeredAddress}</li>
        </ul>
        <p>We will acknowledge and address grievances within the timeframes prescribed by applicable law. This policy is intended to be read consistently with the Information Technology Act, 2000, the SPDI Rules, 2011, and the Digital Personal Data Protection Act, 2023, to the extent applicable.</p>
      </>
    ),
  },
  {
    id: 'policy-updates',
    title: 'Updates to this policy',
    content: (
      <p>We may update this policy to reflect changes to our practices or applicable law. The current version will be posted on this page with its revised “Last updated” date. Please review it periodically.</p>
    ),
  },
]

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      intro={`${business.legalName} (“we”, “us” or “our”), operating the ${business.brandName} website at ${business.websiteUrl}, respects your privacy. This policy explains how we handle personal information when you browse, contact us or place an order.`}
      sections={sections}
    />
  )
}
