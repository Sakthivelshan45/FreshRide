import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-light-bg pt-20">
      <div className="container-wide section-padding max-w-2xl">
        <Link href="/account" className="flex items-center gap-2 text-sm text-green-secondary hover:text-green-primary mb-6">
          <ArrowLeft size={14} /> My Account
        </Link>
        <h1 className="font-serif text-3xl text-navy-dark mb-8">My Profile</h1>
        <div className="bg-white border border-silver p-6">
          <p className="text-sm text-green-secondary">Sign in to manage your profile details.</p>
          <Link href="/account/login" className="btn-primary mt-4 text-sm">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
