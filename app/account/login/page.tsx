'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/schemas'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password })
    if (authError) {
      const message = authError.message === 'Invalid login credentials'
        ? 'Email or password is incorrect. Check your password or use Forgot password.'
        : authError.message
      setError(message)
      setLoading(false)
    } else {
      router.replace('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-silver shadow-sm">
        <div className="bg-green-primary p-8 text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <Image src="/images/logo.png" alt="Butterfly Fresh Ride" fill className="object-contain" />
          </div>
          <h1 className="font-serif text-2xl text-white">Welcome Back</h1>
          <p className="text-green-light text-sm mt-1">Sign in to your account</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Email</label>
              <input {...register('email')} type="email" id="login-email" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Password</label>
              <input {...register('password')} type="password" id="login-password" className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 p-3">{error}</p>}
            <button type="submit" id="login-submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-green-secondary space-y-2">
            <p>Don&apos;t have an account? <Link href="/account/register" className="text-green-primary font-medium hover:underline">Register</Link></p>
            <p><Link href="/account/reset-password" className="text-green-primary hover:underline">Forgot password?</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
