import type { Metadata } from 'next'
import Link from 'next/link'
import { User, ShoppingBag, MapPin, ShieldCheck, ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/account/SignOutButton'

export const metadata: Metadata = { title: 'My Account | Butterfly Fresh Ride' }

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/account/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, is_admin')
    .eq('id', user.id)
    .single()
  const typedProfile = profile as { full_name: string | null; is_admin: boolean } | null

  return (
    <div className="min-h-screen bg-light-bg pt-20">
      <div className="container-wide section-padding max-w-4xl">
        <div className="flex items-start justify-between gap-4 mb-8">
          <h1 className="font-serif text-3xl text-navy-dark">My Account</h1>
          <Link href="/" className="btn-outline text-xs whitespace-nowrap">
            <ArrowLeft size={14} />
            Back to site
          </Link>
        </div>
        <p className="text-sm text-green-secondary mb-6">
          Signed in as {typedProfile?.full_name || user.user_metadata.full_name || user.email}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: User, label: 'Profile', desc: 'Manage your personal details', href: '/account/profile' },
            { icon: ShoppingBag, label: 'My Orders', desc: 'View your order history', href: '/account/orders' },
            { icon: MapPin, label: 'Addresses', desc: 'Manage delivery addresses', href: '/account/addresses' },
          ].map(({ icon: Icon, label, desc, href }) => (
            <Link key={label} href={href} className="bg-white border border-silver p-6 hover:border-green-primary transition-colors group">
              <Icon size={24} className="text-green-primary mb-3" />
              <h2 className="font-medium text-navy-dark mb-1">{label}</h2>
              <p className="text-xs text-green-secondary">{desc}</p>
            </Link>
          ))}
        </div>
        {typedProfile?.is_admin && (
          <Link href="/admin" className="btn-primary mt-8 text-sm">
            <ShieldCheck size={15} />
            Open Admin Panel
          </Link>
        )}
        <div className="mt-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
