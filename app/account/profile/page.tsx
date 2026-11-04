import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account/login')

  return (
    <div className="min-h-screen bg-light-bg pt-20">
      <div className="container-wide section-padding max-w-2xl">
        <Link href="/account" className="flex items-center gap-2 text-sm text-green-secondary hover:text-green-primary mb-6">
          <ArrowLeft size={14} /> My Account
        </Link>
        <h1 className="font-serif text-3xl text-navy-dark mb-8">My Profile</h1>
        <div className="bg-white border border-silver p-6">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-green-secondary">Name</dt>
              <dd className="mt-1 text-navy-dark font-medium">{user.user_metadata.full_name || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-green-secondary">Email</dt>
              <dd className="mt-1 text-navy-dark">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-green-secondary">Mobile</dt>
              <dd className="mt-1 text-navy-dark">{user.user_metadata.phone || 'Not provided'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
