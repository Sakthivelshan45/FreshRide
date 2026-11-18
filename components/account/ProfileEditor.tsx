'use client'

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Check, ImagePlus, Pencil, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type ProfileEditorProps = {
  userId: string
  fullName: string
  phone: string
  email: string
  avatarUrl: string | null
}

const MAX_AVATAR_SIZE = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function ProfileEditor({ userId, fullName, phone, email, avatarUrl }: ProfileEditorProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(fullName)
  const [mobile, setMobile] = useState(phone)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const avatarPreviewRef = useRef<string | null>(null)
  const router = useRouter()

  useEffect(() => () => {
    if (avatarPreviewRef.current) URL.revokeObjectURL(avatarPreviewRef.current)
  }, [])

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setAvatarError('')
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Choose a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('The image must be 5 MB or smaller.')
      return
    }

    if (avatarPreviewRef.current) URL.revokeObjectURL(avatarPreviewRef.current)
    const previewUrl = URL.createObjectURL(file)
    avatarPreviewRef.current = previewUrl
    setAvatarPreview(previewUrl)
    setAvatarUploading(true)

    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user || user.id !== userId) throw new Error('Please sign in again to upload a profile photo.')

      const avatarPath = `${user.id}/avatar`
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(avatarPath, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: true,
        })
      if (uploadError) throw uploadError

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_path: avatarPath, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (profileError) throw profileError

      router.refresh()
    } catch (error) {
      console.error('Profile photo upload failed:', error)
      if (avatarPreviewRef.current) URL.revokeObjectURL(avatarPreviewRef.current)
      avatarPreviewRef.current = null
      setAvatarPreview(null)
      setAvatarError(error instanceof Error ? error.message : 'Could not upload profile photo.')
    } finally {
      setAvatarUploading(false)
    }
  }

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
      <div className="mb-6 flex items-center gap-4 border-b border-silver pb-6">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-50 text-2xl font-semibold text-green-800">
          {avatarPreview || avatarUrl ? (
            <Image
              src={avatarPreview || avatarUrl || ''}
              alt=""
              fill
              sizes="80px"
              unoptimized
              className="object-cover"
            />
          ) : (
            (fullName.trim()[0] || email.trim()[0] || '?').toUpperCase()
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-navy-dark">Profile photo</p>
          <p className="mt-1 text-xs text-green-secondary">JPG, PNG, or WebP. Maximum 5 MB.</p>
          <label
            htmlFor="profile-avatar"
            className={`mt-3 inline-flex cursor-pointer items-center gap-2 rounded border border-silver px-3 py-2 text-xs font-medium text-navy-dark hover:bg-light-bg focus-within:ring-2 focus-within:ring-green-primary focus-within:ring-offset-2 ${
              avatarUploading ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            <ImagePlus size={14} aria-hidden="true" />
            {avatarUploading ? 'Uploading...' : avatarUrl || avatarPreview ? 'Change photo' : 'Upload photo'}
          </label>
          <input
            id="profile-avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Upload a profile photo"
            disabled={avatarUploading}
            onChange={handleAvatarChange}
            className="sr-only"
          />
          {avatarError && <p role="alert" className="mt-2 text-xs text-red-600">{avatarError}</p>}
        </div>
      </div>

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
