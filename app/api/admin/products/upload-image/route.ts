import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const PRODUCT_IMAGE_BUCKET = 'product-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024

const imageTypes = {
  'image/jpeg': {
    extension: 'jpg',
    matches: (bytes: Uint8Array) =>
      bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  'image/png': {
    extension: 'png',
    matches: (bytes: Uint8Array) =>
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a,
  },
  'image/webp': {
    extension: 'webp',
    matches: (bytes: Uint8Array) =>
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50,
  },
} as const

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'You must be signed in as an admin to upload images.' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Product image upload admin check failed:', profileError)
    return NextResponse.json({ error: 'Could not verify admin access.' }, { status: 500 })
  }
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Only admins can upload product images.' }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Choose an image file to upload.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Choose an image file to upload.' }, { status: 400 })
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Image must be larger than 0 bytes and no more than 5 MB.' }, { status: 400 })
  }

  const imageType = imageTypes[file.type as keyof typeof imageTypes]
  if (!imageType) {
    return NextResponse.json({ error: 'Use a JPEG, PNG, or WebP image.' }, { status: 400 })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!imageType.matches(bytes)) {
    return NextResponse.json({ error: 'The file contents do not match its image type.' }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient()
  const objectPath = `products/${crypto.randomUUID()}.${imageType.extension}`
  const { error: uploadError } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(objectPath, bytes, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    console.error('Product image upload failed:', uploadError)
    return NextResponse.json({ error: 'Could not upload the image. Please try again.' }, { status: 500 })
  }

  const { data } = supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(objectPath)
  return NextResponse.json({ url: data.publicUrl })
}
