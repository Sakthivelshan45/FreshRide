import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()

  const { data: all, error } = await supabase
    .from('products')
    .select('id, name, slug, is_active')

  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    productCount: all?.length ?? 0,
    slugs: all?.map((p: { slug: string; is_active: boolean }) => `${p.slug} (active:${p.is_active})`) ?? [],
    error: error?.message ?? null,
    timestamp: new Date().toISOString(),
  })
}
