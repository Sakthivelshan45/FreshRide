'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/update-password`,
    })
    if (err) { setError(err.message); setLoading(false) }
    else setSent(true)
  }

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-silver shadow-sm">
        <div className="bg-green-primary p-8 text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <Image src="/images/logo.png" alt="Butterfly Fresh Ride" fill className="object-contain" />
          </div>
          <h1 className="font-serif text-2xl text-white">Reset Password</h1>
        </div>
        <div className="p-8">
          {sent ? (
            <div className="text-center">
              <p className="text-green-primary text-2xl mb-3">✓</p>
              <p className="text-navy-dark font-medium mb-2">Email Sent!</p>
              <p className="text-green-secondary text-sm">Check your inbox for a password reset link.</p>
              <Link href="/account/login" className="btn-outline mt-6 text-sm">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-green-secondary mb-4">Enter your email address and we will send you a password reset link.</p>
              <div>
                <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} id="reset-email"
                  className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" required />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link href="/account/login" className="block text-center text-xs text-green-secondary hover:text-green-primary mt-2">
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
