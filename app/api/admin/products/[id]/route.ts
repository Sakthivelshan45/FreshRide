import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { adminProductSchema } from '@/lib/validations/schemas'
import { z } from 'zod'

const productIdSchema = z.string().uuid()
const productVisibilitySchema = z.object({ is_active: z.boolean() }).strict()

// PATCH /api/admin/products/[id] — update product + variant
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsedId = productIdSchema.safeParse(id)
  if (!parsedId.success) {
    return NextResponse.json(
      { error: 'Invalid product ID.', details: parsedId.error.flatten().formErrors },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!(profile as any)?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabaseAdmin = createAdminClient()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid product data.', details: ['Request body must be valid JSON.'] }, { status: 400 })
  }

  if (
    typeof body === 'object' &&
    body !== null &&
    !Array.isArray(body) &&
    Object.keys(body).length === 1 &&
    'is_active' in body
  ) {
    const parsedVisibility = productVisibilitySchema.safeParse(body)
    if (!parsedVisibility.success) {
      return NextResponse.json(
        { error: 'Invalid product visibility.', details: parsedVisibility.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { error: visibilityError } = await supabaseAdmin
      .from('products')
      .update({ is_active: parsedVisibility.data.is_active, updated_at: new Date().toISOString() })
      .eq('id', parsedId.data)

    if (visibilityError) {
      console.error('Product visibility update failed:', visibilityError)
      return NextResponse.json({ error: 'Could not update product visibility.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  const parsed = adminProductSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid product data.', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name, slug, short_description, description, category, feature_tags, is_active, price, compare_price, stock, image_url } = parsed.data

  const { error: productError } = await supabaseAdmin
    .from('products')
    .update({ name, slug, short_description, description, category, feature_tags, is_active, updated_at: new Date().toISOString() })
    .eq('id', parsedId.data)

  if (productError) {
    console.error('Product update failed:', productError)
    return NextResponse.json({ error: 'Could not update product.' }, { status: 500 })
  }

  const { data: variant, error: variantLookupError } = await supabaseAdmin
    .from('product_variants')
    .select('id')
    .eq('product_id', parsedId.data)
    .limit(1)
    .maybeSingle()
  if (variantLookupError) {
    console.error('Product variant lookup failed:', variantLookupError)
    return NextResponse.json({ error: 'Could not load product variant.' }, { status: 500 })
  }

  if (variant) {
    const { error: variantError } = await supabaseAdmin
      .from('product_variants')
      .update({ price, compare_price, stock, is_active })
      .eq('id', variant.id)
    if (variantError) {
      console.error('Product variant update failed:', variantError)
      return NextResponse.json({ error: 'Could not update product variant.' }, { status: 500 })
    }
  } else {
    const { error: variantError } = await supabaseAdmin.from('product_variants').insert({
      product_id: parsedId.data,
      name: 'Single Unit',
      price,
      compare_price,
      stock,
      pack_quantity: 1,
      is_active,
      sort_order: 1,
    })
    if (variantError) {
      console.error('Product variant insert failed:', variantError)
      return NextResponse.json({ error: 'Could not create product variant.' }, { status: 500 })
    }
  }

  if (image_url) {
    const { data: image, error: imageLookupError } = await supabaseAdmin
      .from('product_images')
      .select('id')
      .eq('product_id', parsedId.data)
      .eq('is_primary', true)
      .limit(1)
      .maybeSingle()
    if (imageLookupError) {
      console.error('Product image lookup failed:', imageLookupError)
      return NextResponse.json({ error: 'Could not load product image.' }, { status: 500 })
    }

    if (image) {
      const { error: imageError } = await supabaseAdmin
        .from('product_images')
        .update({ url: image_url, alt: `${name} - Fresh Ride` })
        .eq('id', image.id)
      if (imageError) {
        console.error('Product image update failed:', imageError)
        return NextResponse.json({ error: 'Could not update product image.' }, { status: 500 })
      }
    } else {
      const { error: imageError } = await supabaseAdmin.from('product_images').insert({
        product_id: parsedId.data,
        url: image_url,
        alt: `${name} - Fresh Ride`,
        sort_order: 1,
        is_primary: true,
      })
      if (imageError) {
        console.error('Product image insert failed:', imageError)
        return NextResponse.json({ error: 'Could not create product image.' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/admin/products/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsedId = productIdSchema.safeParse(id)
  if (!parsedId.success) {
    return NextResponse.json(
      { error: 'Invalid product ID.', details: parsedId.error.flatten().formErrors },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!(profile as any)?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.from('products').delete().eq('id', parsedId.data)
  if (error) {
    console.error('Product delete failed:', error)
    return NextResponse.json({ error: 'Could not delete product.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
