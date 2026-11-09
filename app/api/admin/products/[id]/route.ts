import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/admin/products/[id] — update product + variant
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!(profile as any)?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { name, slug, short_description, description, category, feature_tags, is_active, price, compare_price, stock } = body

  // Update product
  const { error: productError } = await supabase
    .from('products')
    .update({ name, slug, short_description, description, category, feature_tags, is_active, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (productError) return NextResponse.json({ error: productError.message }, { status: 400 })

  // Update or create variant
  const { data: variants } = await supabase.from('product_variants').select('id').eq('product_id', id).limit(1)
  if (variants && variants.length > 0) {
    await supabase.from('product_variants').update({ price: Number(price), compare_price: compare_price ? Number(compare_price) : null, stock: Number(stock), is_active }).eq('id', (variants[0] as any).id)
  } else {
    await supabase.from('product_variants').insert({ product_id: id, name: 'Single Unit', price: Number(price), compare_price: compare_price ? Number(compare_price) : null, stock: Number(stock), pack_quantity: 1, is_active, sort_order: 1 })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/admin/products/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!(profile as any)?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
