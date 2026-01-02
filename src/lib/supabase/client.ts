import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

/**
 * Cria um cliente Supabase para uso no navegador (client-side)
 * 
 * IMPORTANTE: Este cliente usa apenas a anon key pública.
 * Para queries que precisam respeitar tenant, use o hook useTenantClient.
 */
export function createClient() {
  return createBrowserClient(
    env.supabaseUrl,
    env.supabaseAnonKey
  )
}
