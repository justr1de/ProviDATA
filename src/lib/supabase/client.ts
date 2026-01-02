import { createBrowserClient } from '@supabase/ssr'
import { validateEnv } from '@/lib/env-validation'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // Singleton pattern para reusar a mesma instância
  if (supabaseClient) {
    return supabaseClient;
  }

  const env = validateEnv();
  
  supabaseClient = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return supabaseClient;
}
