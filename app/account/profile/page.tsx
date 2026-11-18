import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileEditor from '@/components/account/ProfileEditor'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, avatar_path')
    .eq('id', user.id)
    .single()

  const fullName = profile?.full_name || user.user_metadata.full_name || ''
  const phone = profile?.phone || user.user_metadata.phone || ''
  let avatarUrl: string | null = null

  if (profile?.avatar_path) {
    const { data: avatar, error } = await supabase
      .storage
      .from('profile-avatars')
      .createSignedUrl(profile.avatar_path, 60 * 60)

    if (error) {
      console.error('Profile avatar URL creation failed:', error)
      throw new Error('Could not load profile photo.')
    }

    avatarUrl = avatar.signedUrl
  }

  return (
    <div className="min-h-screen bg-light-bg pt-20">
      <div className="container-wide section-padding max-w-2xl">
        <Link href="/account" className="flex items-center gap-2 text-sm text-green-secondary hover:text-green-primary mb-6">
          <ArrowLeft size={14} /> My Account
        </Link>
        <h1 className="font-serif text-3xl text-navy-dark mb-8">My Profile</h1>
        <ProfileEditor
          userId={user.id}
          fullName={fullName}
          phone={phone}
          email={user.email || ''}
          avatarUrl={avatarUrl}
        />
      </div>
    </div>
  )
}
