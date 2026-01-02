/**
 * Validação centralizada de variáveis de ambiente
 * 
 * Este arquivo garante que todas as variáveis de ambiente necessárias
 * estejam definidas antes do uso, evitando erros em runtime.
 */

/**
 * Valida se uma variável de ambiente está definida
 * @param name - Nome da variável de ambiente
 * @param value - Valor da variável (pode ser undefined)
 * @returns O valor validado da variável
 * @throws Error se a variável não estiver definida
 */
export function validateEnvVar(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `❌ Variável de ambiente ${name} não está definida.\n` +
      `Configure-a no arquivo .env.local seguindo o exemplo em .env.example`
    )
  }
  return value
}

/**
 * Valida uma variável de ambiente opcional
 * @param name - Nome da variável de ambiente
 * @param value - Valor da variável (pode ser undefined)
 * @param defaultValue - Valor padrão caso não esteja definida
 * @returns O valor da variável ou o valor padrão
 */
export function validateOptionalEnvVar(
  name: string,
  value: string | undefined,
  defaultValue: string
): string {
  if (!value || value.trim() === '') {
    console.warn(`⚠️  Variável de ambiente ${name} não definida. Usando valor padrão.`)
    return defaultValue
  }
  return value
}

/**
 * Objeto centralizado com todas as variáveis de ambiente validadas
 * 
 * IMPORTANTE: 
 * - Variáveis NEXT_PUBLIC_* são expostas ao navegador
 * - Variáveis sem NEXT_PUBLIC_ são apenas server-side
 * - NUNCA exponha Service Role Keys ao navegador
 */
export const env = {
  // URLs e chaves públicas (podem ser expostas ao navegador)
  SUPABASE_URL: validateEnvVar(
    'NEXT_PUBLIC_SUPABASE_URL',
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ),
  SUPABASE_ANON_KEY: validateEnvVar(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
  
  // Chave de serviço (APENAS SERVER-SIDE - NUNCA EXPOR AO NAVEGADOR)
  // Nota: Esta validação só acontece em server-side code
  get SUPABASE_SERVICE_ROLE_KEY(): string {
    // Verifica se estamos no lado do servidor
    if (typeof window !== 'undefined') {
      throw new Error(
        '🚨 ERRO DE SEGURANÇA: Service Role Key não pode ser acessada no navegador!'
      )
    }
    return validateEnvVar(
      'SUPABASE_SERVICE_ROLE_KEY',
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  },
  
  // Super Admins (apenas server-side)
  // Formato: email1@example.com,email2@example.com
  get SUPER_ADMIN_EMAILS(): string[] {
    if (typeof window !== 'undefined') {
      throw new Error(
        '🚨 ERRO DE SEGURANÇA: Super Admin emails não podem ser acessados no navegador!'
      )
    }
    const emailsStr = validateOptionalEnvVar(
      'SUPER_ADMIN_EMAILS',
      process.env.SUPER_ADMIN_EMAILS,
      'contato@dataro-it.com.br' // Fallback padrão
    )
    return emailsStr.split(',').map(e => e.trim()).filter(e => e.length > 0)
  },
  
  // URL da aplicação (opcional)
  APP_URL: validateOptionalEnvVar(
    'NEXT_PUBLIC_APP_URL',
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000'
  ),
} as const

/**
 * Valida se todas as variáveis de ambiente necessárias estão definidas
 * Deve ser chamado no início da aplicação
 */
export function validateAllEnvVars(): void {
  try {
    // Valida variáveis públicas (browser-safe)
    env.SUPABASE_URL
    env.SUPABASE_ANON_KEY
    env.APP_URL
    
    // Valida variáveis server-side apenas no servidor
    if (typeof window === 'undefined') {
      env.SUPABASE_SERVICE_ROLE_KEY
      env.SUPER_ADMIN_EMAILS
    }
    
    console.log('✅ Todas as variáveis de ambiente foram validadas com sucesso')
  } catch (error) {
    console.error('❌ Erro na validação de variáveis de ambiente:', error)
    throw error
  }
}

/**
 * Helper para verificar se é super admin
 * @param email - Email do usuário
 * @returns true se o email está na lista de super admins
 */
export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  if (typeof window !== 'undefined') {
    console.warn('⚠️  Verificação de super admin não deve ser feita no cliente')
    return false
  }
  return env.SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim())
}
