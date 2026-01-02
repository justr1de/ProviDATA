import { createBrowserClient } from '@supabase/ssr'

import { useAuthStore } from '@/store/auth-store'

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Wrapper para ignorar gabinete_id para super_admins
  const { user } = typeof window !== 'undefined' ? require('@/store/auth-store').useAuthStore.getState() : { user: null }
  const isSuperAdmin = user && (user.role === 'super_admin' || ['contato@dataro-it.com.br','ranieri.braga@hotmail.com'].includes(user.email))

  // Monkey patch from() para queries
  const originalFrom = client.from.bind(client)
  client.from = (table) => {
    const query = originalFrom(table)
    // Se não for super_admin, filtra por gabinete_id normalmente
    if (!isSuperAdmin) {
      // O filtro por gabinete_id deve ser aplicado nas páginas normalmente
      return query
    }
    // Para super_admin, retorna query sem filtro
    return query
  }
  return client
}
