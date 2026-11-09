'use client'

import { FormEvent, useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type ProfileEditorProps = {
  userId: string
  fullName: string
  phone: string
  email: string
}

export default function ProfileEditor({ userId, fullName, phone, email }: ProfileEditorProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(fullName)
  const [mobile, setMobile] = useState(phone)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    const trimmedName = name.trim()
    const trimmedMobile = mobile.trim()

    if (trimmedName.length < 2) {
      setMessage('Name must be at least 2 characters.')
      return
    }
    if (!/^[6-9]\d{9}$/.test(trimmedMobile)) {
      setMessage('Enter a valid 10-digit mobile number.')
      return
    }

    setSaving(true)
    const supabase = createClient()

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: trimmedName, phone: trimmedMobile })
      .eq('id', userId)

    if (profileError) {
      setMessage(profileError.message)
      setSaving(false)
      return
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: trimmedName, phone: trimmedMobile },
    })

    if (authError) {
      setMessage(authError.message)
      setSaving(false)
      return
    }

    setName(trimmedName)
    setMobile(trimmedMobile)
    setEditing(false)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="bg-white border border-silver p-6">
      {!editing ? (
        <>
          <div className="flex items-start justify-between gap-4 mb-4">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-green-secondary">Name</dt>
                <dd className="mt-1 text-navy-dark font-medium">{fullName || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-green-secondary">Email</dt>
                <dd className="mt-1 text-navy-dark">{email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-green-secondary">Mobile</dt>
                <dd className="mt-1 text-navy-dark">{phone || 'Not provided'}</dd>
              </div>
            </dl>
            <button type="button" onClick={() => setEditing(true)} className="btn-outline text-xs whitespace-nowrap">
              <Pencil size={14} />
              Edit
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="profile-name" className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">
              Full Name
            </label>
            <input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="profile-phone" className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">
              Mobile Number
            </label>
            <input
              id="profile-phone"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className="w-full border border-silver px-4 py-3 text-sm focus:outline-none focus:border-green-primary"
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy-dark mb-1.5 uppercase tracking-wide">Email</label>
            <p className="w-full border border-silver bg-light-bg px-4 py-3 text-sm text-green-secondary">{email}</p>
          </div>
          {message && <p role="alert" className="text-sm text-red-500 bg-red-50 p-3">{message}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-60">
              <Check size={15} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setName(fullName)
                setMobile(phone)
                setMessage('')
                setEditing(false)
              }}
              className="btn-outline text-sm"
            >
              <X size={15} />
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
