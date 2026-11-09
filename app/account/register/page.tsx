'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/lib/validations/schemas'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { MailCheck } from 'lucide-react'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmation, setConfirmation] = useState<{ name: string; email: string } | null>(null)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName, phone: data.phone },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })
    if (signUpError) {
      const message = signUpError.message.toLowerCase().includes('email rate limit')
        ? 'Too many signup emails were sent recently. Wait a few minutes, then try again or sign in if your account is already created.'
        : signUpError.message
      setError(message)
      setLoading(false)
    } else {
      setConfirmation({ name: data.fullName.trim(), email: data.email.trim() })
      setLoading(false)
    }
  }

  async function resendConfirmation() {
    if (!confirmation) return

    setResending(true)
    setResendMessage('')
    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: confirmation.email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    })

    setResending(false)
    setResendMessage(error ? error.message : 'A new confirmation email has been sent.')
  }

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-silver shadow-sm">
        <div className="bg-green-primary p-8 text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <Image src="/images/logo.png" alt="Butterfly Fresh Ride" fill className="object-contain" />
          </div>
          <h1 className="font-serif text-2xl text-white">Create Account</h1>
          <p className="text-green-light text-sm mt-1">Join Butterfly Fresh Ride</p>
        </div>
        <div className="p-8">
          {confirmation ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-light">
                <MailCheck className="text-green-primary" size={28} />
              </div>
              <h2 className="font-serif text-2xl text-navy-dark">Check your inbox, {confirmation.name}</h2>
              <p className="mt-3 text-sm leading-6 text-green-secondary">
                We sent a confirmation email to
              </p>
              <p className="mt-1 break-all font-medium text-navy-dark">{confirmation.email}</p>
              <p className="mt-3 text-sm leading-6 text-green-secondary">
                Open the email and click <strong>Confirm your email</strong> to activate your account.
              </p>
              {resendMessage && (
                <p role="status" className="mt-4 rounded bg-light-bg px-3 py-2 text-sm text-green-secondary">
                  {resendMessage}
                </p>
              )}
              <button
                type="button"
                onClick={resendConfirmation}
                disabled={resending}
                className="btn-primary mt-6 w-full justify-center disabled:opacity-60"
              >
                {resending ? 'Sending...' : 'Resend confirmation email'}
              </button>
              <Link href="/account/login" className="mt-4 block text-sm font-medium text-green-primary hover:underline">
                Back to Sign In
              </Link>
            </div>
          ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Full Name *</label>
              <input {...register('fullName')} id="reg-name" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Email *</label>
              <input {...register('email')} type="email" id="reg-email" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Mobile Number *</label>
              <input {...register('phone')} type="tel" id="reg-phone" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" placeholder="10-digit mobile number" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Password *</label>
              <input {...register('password')} type="password" id="reg-password" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" placeholder="Minimum 8 characters" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Confirm Password *</label>
              <input {...register('confirmPassword')} type="password" id="reg-confirm" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 p-3">{error}</p>}
            <button type="submit" id="reg-submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          )}
          {!confirmation && (
          <div className="mt-6 text-center text-sm text-green-secondary">
            Already have an account? <Link href="/account/login" className="text-green-primary font-medium hover:underline">Sign In</Link>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
