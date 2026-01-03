import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Cliente mock para prerendering quando env vars não estão disponíveis
function createMockClient(): SupabaseClient {
  const mockQuery = {
    select: () => mockQuery,
    insert: () => mockQuery,
    update: () => mockQuery,
    delete: () => mockQuery,
    eq: () => mockQuery,
    neq: () => mockQuery,
    gt: () => mockQuery,
    gte: () => mockQuery,
    lt: () => mockQuery,
    lte: () => mockQuery,
    like: () => mockQuery,
    ilike: () => mockQuery,
    is: () => mockQuery,
    in: () => mockQuery,
    contains: () => mockQuery,
    containedBy: () => mockQuery,
    range: () => mockQuery,
    order: () => mockQuery,
    limit: () => mockQuery,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: (value: { data: null; error: null }) => void) => resolve({ data: null, error: null })
  }

  return {
    from: () => mockQuery,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { session: null, user: null }, error: null }),
      signUp: () => Promise.resolve({ data: { session: null, user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
        list: () => Promise.resolve({ data: [], error: null }),
        remove: () => Promise.resolve({ data: null, error: null })
      })
    }
  } as SupabaseClient
}

export function createClient() {
  // Verificar se as variáveis de ambiente estão disponíveis
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      // Durante SSR/prerendering, retorna mock client
      return createMockClient()
    }
    console.warn('Variáveis de ambiente do Supabase não configuradas')
    return createMockClient()
  }

  const client = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )

  // Wrapper para ignorar gabinete_id para super_admins
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { user } = typeof globalThis.window === 'undefined' ? { user: null } : require('@/store/auth-store').useAuthStore.getState()
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
