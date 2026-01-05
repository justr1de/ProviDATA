/**
 * Utility functions for authentication and authorization
 */

/**
 * Super admin email addresses that have full access across all tenants
 */
const SUPER_ADMIN_EMAILS = ['contato@dataro-it.com.br', 'ranieri.braga@hotmail.com']

/**
 * Checks if a user is a super admin with access to all tenants
 * @param user - User object with role and email properties
 * @returns true if user is a super admin
 */
export function isSuperAdmin(user: { role?: string; email?: string } | null | undefined): boolean {
  if (!user) return false
  return user.role === 'super_admin' || SUPER_ADMIN_EMAILS.includes(user.email || '')
}
