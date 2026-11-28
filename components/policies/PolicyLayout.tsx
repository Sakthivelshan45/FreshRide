import Image from 'next/image'
import { Mail, MessageCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { business } from '@/src/config/business'

export type PolicySection = {
  id: string
  title: string
  content: React.ReactNode
}

type PolicyLayoutProps = {
  title: string
  intro: string
  sections: PolicySection[]
}

export default function PolicyLayout({ title, intro, sections }: PolicyLayoutProps) {
  const whatsappUrl = `https://wa.me/${business.whatsappNumber}`
  const emailUrl = `mailto:${business.supportEmail}`

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-light-bg pt-20">
        <header className="relative isolate flex min-h-48 items-center overflow-hidden bg-green-primary text-white sm:min-h-60">
          <Image
            src="/images/products/fresh_ride_new (4).png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-20 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102f21]/90 via-[#173b29]/75 to-[#173b29]/45" />
          <div className="container-wide py-10 sm:py-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold-accent">
              {business.brandName} · Policies
            </p>
            <h1 className="max-w-3xl font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-white/80">Last updated: {business.lastUpdated}</p>
          </div>
        </header>

        <div className="container-wide py-10 sm:py-14 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <p className="mb-8 max-w-3xl text-base leading-7 text-green-secondary sm:mb-10 sm:text-lg sm:leading-8">
              {intro}
            </p>

            <details className="mb-8 rounded-2xl border border-silver bg-white p-5 lg:hidden">
              <summary className="cursor-pointer font-semibold text-green-primary">
                On this page
              </summary>
              <nav aria-label="Table of contents" className="mt-4">
                <ol className="space-y-2 text-sm">
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a className="text-green-secondary hover:text-green-primary" href={`#${section.id}`}>
                        {index + 1}. {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </details>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14">
              <article className="min-w-0 space-y-9 sm:space-y-11">
                {sections.map((section, index) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28 border-b border-silver pb-8 last:border-b-0 sm:pb-10"
                  >
                    <h2 className="mb-4 font-serif text-2xl leading-snug text-green-primary sm:text-3xl">
                      <a href={`#${section.id}`} className="group">
                        <span className="mr-2 text-base font-sans font-semibold text-green-secondary">
                          {index + 1}.
                        </span>
                        {section.title}
                      </a>
                    </h2>
                    <div className="space-y-4 break-words text-sm leading-7 text-navy-dark sm:text-base sm:leading-8 [&_a]:font-medium [&_a]:text-green-primary [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_ol]:space-y-2 [&_p]:max-w-3xl [&_ul]:space-y-2">
                      {section.content}
                    </div>
                  </section>
                ))}
              </article>

              <aside className="hidden lg:block">
                <nav
                  aria-label="Table of contents"
                  className="sticky top-28 rounded-2xl border border-silver bg-white p-5 shadow-sm"
                >
                  <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-green-primary">
                    On this page
                  </h2>
                  <ol className="space-y-3 text-sm leading-5">
                    {sections.map((section, index) => (
                      <li key={section.id}>
                        <a className="text-green-secondary transition-colors hover:text-green-primary" href={`#${section.id}`}>
                          <span className="mr-1">{index + 1}.</span>
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </aside>
            </div>

            <section className="mt-10 rounded-3xl bg-[#1A4731] p-6 text-white sm:mt-14 sm:p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-accent">We&apos;re here to help</p>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl">Need help? Contact us</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                For questions about this policy or an order, reach our customer support team.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-green-primary transition-colors hover:bg-green-50"
                >
                  <MessageCircle size={17} aria-hidden="true" />
                  WhatsApp us
                </a>
                <a
                  href={emailUrl}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/40 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <Mail size={17} aria-hidden="true" />
                  Email {business.supportEmail}
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
