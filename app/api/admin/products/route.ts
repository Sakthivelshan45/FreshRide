import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { adminProductSchema } from '@/lib/validations/schemas'

// POST /api/admin/products — create new product
export async function POST(req: Request) {
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

  const parsed = adminProductSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid product data.', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name, slug, short_description, description, category, feature_tags, is_active, price, compare_price, stock, image_url } = parsed.data

  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .insert({ name, slug, short_description, description, category, feature_tags: feature_tags ?? [], is_active })
    .select()
    .single()

  if (productError || !product) {
    console.error('Product insert failed:', productError)
    return NextResponse.json({ error: 'Could not create product.' }, { status: 500 })
  }

  const { error: variantError } = await supabaseAdmin.from('product_variants').insert({
    product_id: product.id,
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
    return NextResponse.json({ error: 'Product was created, but its variant could not be saved.' }, { status: 500 })
  }

  if (image_url) {
    const { error: imageError } = await supabaseAdmin.from('product_images').insert({
      product_id: product.id,
      url: image_url,
      alt: `${name} - Fresh Ride`,
      sort_order: 1,
      is_primary: true,
    })
    if (imageError) {
      console.error('Product image insert failed:', imageError)
      return NextResponse.json({ error: 'Product was created, but its image could not be saved.' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, id: product.id })
}
