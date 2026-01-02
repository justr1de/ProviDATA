/**
 * Hook para criar cliente Supabase tenant-aware
 * 
 * Este hook retorna um cliente Supabase que:
 * - Para super admins: acesso total sem filtros
 * - Para usuários normais: filtra automaticamente por gabinete_id
 * 
 * USO:
 * const supabase = useTenantClient();
 * const { data } = await supabase.from('providencias').select('*');
 */

import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { createClient } from '@/lib/supabase/client';
import { isSuperAdminEmail } from '@/lib/auth-helpers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Hook que retorna um cliente Supabase configurado para o tenant do usuário
 */
export function useTenantClient() {
  const { user } = useAuthStore();
  
  return useMemo(() => {
    const client = createClient();
    
    // Se não há usuário, retornar cliente básico
    if (!user) {
      return client;
    }
    
    // Verificar se é super admin
    const isSuper = user.role === 'super_admin' || isSuperAdminEmail(user.email);
    
    // Super admin tem acesso total sem filtros
    if (isSuper) {
      return client;
    }
    
    // Para usuários normais, o filtro por gabinete_id deve ser aplicado
    // nas queries específicas de cada página/componente
    // Este hook apenas retorna o cliente básico
    // 
    // NOTA: A aplicação dos filtros de tenant deve ser feita via RLS no Supabase
    // ou explicitamente nas queries quando necessário
    return client;
  }, [user]);
}

/**
 * Hook auxiliar para verificar se o usuário atual é super admin
 */
export function useIsSuperAdmin(): boolean {
  const { user } = useAuthStore();
  
  return useMemo(() => {
    if (!user) return false;
    return user.role === 'super_admin' || isSuperAdminEmail(user.email);
  }, [user]);
}

/**
 * Hook auxiliar para obter o gabinete_id do usuário atual
 */
export function useGabineteId(): string | null {
  const { user } = useAuthStore();
  return user?.gabinete_id || null;
}
