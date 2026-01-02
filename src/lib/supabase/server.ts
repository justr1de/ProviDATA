import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

/**
 * Cria um cliente Supabase para uso no servidor (Server Components, API Routes)
 * 
 * IMPORTANTE:
 * - Este cliente usa apenas chaves públicas (ANON_KEY)
 * - Para operações administrativas, use Service Role Key em serviços dedicados
 * - Row Level Security (RLS) protege os dados automaticamente
 * 
 * @returns Cliente Supabase configurado para o servidor
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
