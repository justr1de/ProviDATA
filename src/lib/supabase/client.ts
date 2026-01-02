import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

/**
 * Cria um cliente Supabase para uso no navegador
 * 
 * IMPORTANTE:
 * - Este cliente usa apenas chaves públicas (ANON_KEY)
 * - Filtros por tenant devem ser aplicados nas queries, não no cliente
 * - Row Level Security (RLS) do Supabase garante isolamento de dados
 * 
 * @returns Cliente Supabase configurado para o navegador
 */
export function createClient() {
  return createBrowserClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY
  )
}

/**
 * NOTA SOBRE FILTROS DE TENANT:
 * 
 * A implementação anterior tentava fazer "monkey patching" do método from()
 * para aplicar filtros automaticamente. Isso causava problemas de:
 * 
 * 1. Race conditions: usar require() dinâmico com window !== 'undefined'
 * 2. Complexidade: dificultar manutenção e debugging
 * 3. Super admin emails hardcoded no código do cliente
 * 
 * NOVA ABORDAGEM:
 * - Aplicar filtros explicitamente nas queries quando necessário
 * - Usar RLS (Row Level Security) do Supabase para garantir isolamento
 * - Verificações de super admin devem ser feitas no servidor, não no cliente
 * 
 * Exemplo de uso correto:
 * 
 * ```typescript
 * const supabase = createClient()
 * const { data } = await supabase
 *   .from('providencias')
 *   .select('*')
 *   .eq('gabinete_id', gabineteId) // Filtro explícito
 * ```
 */
