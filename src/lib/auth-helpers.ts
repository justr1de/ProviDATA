/**
 * Helpers de autenticação e autorização
 * Gerencia verificações de super admin e outras permissões
 */

import { getServerEnv } from './env';

/**
 * Lista de emails de super admin - fallback para uso no cliente
 * Em produção, esta verificação deve ser feita no servidor via RLS/API
 * Esta é apenas uma verificação auxiliar de UI
 */
const FALLBACK_SUPER_ADMIN_EMAILS = ['contato@dataro-it.com.br'];

/**
 * Obtém a lista de emails de super admin configurados (Server-side only)
 * @returns Array de emails de super admin
 */
export function getSuperAdminEmails(): string[] {
  // Verificar se está no servidor
  if (typeof window === 'undefined') {
    try {
      // Apenas no servidor podemos acessar getServerEnv
      const serverEnv = getServerEnv();
      const emails = serverEnv.superAdminEmails || '';
      return emails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
    } catch (error) {
      console.warn('Failed to get server env, using fallback super admin emails');
      return FALLBACK_SUPER_ADMIN_EMAILS;
    }
  }
  
  // No cliente, usar lista de fallback
  // NOTA: Esta é apenas uma verificação de UI. A autorização real deve ser feita no servidor
  return FALLBACK_SUPER_ADMIN_EMAILS;
}

/**
 * Verifica se um email é de super admin
 * @param email Email para verificar
 * @returns true se o email está na lista de super admins
 * 
 * IMPORTANTE: No cliente, esta é apenas uma verificação de UI.
 * A autorização real deve sempre ser verificada no servidor via RLS ou API.
 */
export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase().trim();
  const superAdminEmails = getSuperAdminEmails();
  
  return superAdminEmails.some(
    adminEmail => adminEmail.toLowerCase() === normalizedEmail
  );
}

/**
 * Formata a lista de super admins para exibição (útil para logs)
 * @returns String formatada com os emails (mascarados)
 */
export function formatSuperAdminList(): string {
  const emails = getSuperAdminEmails();
  
  // Mascarar emails para logs (mostrar apenas primeiros 3 caracteres e domínio)
  return emails
    .map(email => {
      const [local, domain] = email.split('@');
      if (local && domain) {
        return `${local.substring(0, 3)}***@${domain}`;
      }
      return '***';
    })
    .join(', ');
}
