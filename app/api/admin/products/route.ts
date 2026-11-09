import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/admin/products — create new product
export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!(profile as any)?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { name, slug, short_description, description, category, feature_tags, is_active, price, compare_price, stock, image_url } = body

  // Create product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({ name, slug, short_description, description, category, feature_tags: feature_tags ?? [], is_active })
    .select()
    .single()

  if (productError) return NextResponse.json({ error: productError.message }, { status: 400 })
  const p = product as any

  // Create variant
  await supabase.from('product_variants').insert({
    product_id: p.id, name: 'Single Unit',
    price: Number(price ?? 0), compare_price: compare_price ? Number(compare_price) : null,
    stock: Number(stock ?? 0), pack_quantity: 1, is_active, sort_order: 1
  })

  // Create image if provided
  if (image_url) {
    await supabase.from('product_images').insert({
      product_id: p.id, url: image_url, alt: `${name} - Fresh Ride`, sort_order: 1, is_primary: true
    })
  }

  return NextResponse.json({ success: true, id: p.id })
}
