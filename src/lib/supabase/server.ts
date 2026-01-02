import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

/**
 * Cria um cliente Supabase para uso no servidor (server-side)
 * 
 * Este cliente gerencia cookies automaticamente e é usado em:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.supabaseUrl,
    env.supabaseAnonKey,
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
