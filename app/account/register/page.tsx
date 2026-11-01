'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/lib/validations/schemas'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
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
      },
    })
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      router.push('/account?registered=true')
    }
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
          <div className="mt-6 text-center text-sm text-green-secondary">
            Already have an account? <Link href="/account/login" className="text-green-primary font-medium hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
