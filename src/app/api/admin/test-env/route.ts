import { NextResponse } from 'next/server'

// GET - Verificar variaveis de ambiente (apenas para debug)
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  return NextResponse.json({
    hasSupabaseUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    serviceKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0,
    serviceKeyPrefix: supabaseServiceKey ? supabaseServiceKey.substring(0, 10) + '...' : null
  })
}
