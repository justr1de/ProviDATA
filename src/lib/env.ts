/**
 * Validação centralizada de variáveis de ambiente
 * Garante que todas as variáveis obrigatórias estejam definidas
 * e fornece mensagens de erro claras em caso de problemas
 */

/**
 * Obtém uma variável de ambiente obrigatória
 * @param key Nome da variável de ambiente
 * @param isServer Se true, permite acesso a variáveis server-only (não NEXT_PUBLIC_)
 * @throws Error se a variável não estiver definida
 */
export function getRequiredEnv(key: string, isServer: boolean = false): string {
  // Em ambiente de cliente, apenas variáveis NEXT_PUBLIC_ são acessíveis
  if (typeof window !== 'undefined' && !key.startsWith('NEXT_PUBLIC_')) {
    throw new Error(
      `Tentativa de acessar variável server-only "${key}" no cliente. ` +
      `Variáveis de servidor não podem ser acessadas no navegador por segurança.`
    );
  }

  const value = process.env[key];
  
  if (!value || value.trim() === '') {
    throw new Error(
      `Variável de ambiente obrigatória não definida ou vazia: ${key}\n` +
      `Configure esta variável em seu arquivo .env.local ou nas variáveis de ambiente do deployment.`
    );
  }
  
  return value.trim();
}

/**
 * Obtém uma variável de ambiente opcional
 * @param key Nome da variável de ambiente
 * @param defaultValue Valor padrão se a variável não estiver definida
 */
export function getOptionalEnv(key: string, defaultValue: string = ''): string {
  const value = process.env[key];
  return value && value.trim() !== '' ? value.trim() : defaultValue;
}

/**
 * Validação e exportação de todas as variáveis de ambiente do sistema
 */

// Variáveis públicas (acessíveis no cliente e servidor)
export const env = {
  // Supabase - Variáveis públicas
  supabaseUrl: getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  
  // App
  appUrl: getOptionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
} as const;

/**
 * Variáveis de ambiente server-only (NUNCA devem ser expostas ao cliente)
 * Esta função DEVE ser chamada apenas em contextos de servidor
 */
export function getServerEnv() {
  // Verificação adicional de segurança
  if (typeof window !== 'undefined') {
    throw new Error(
      'VIOLAÇÃO DE SEGURANÇA: getServerEnv() foi chamado no cliente. ' +
      'Esta função contém credenciais sensíveis e só pode ser chamada no servidor.'
    );
  }

  return {
    // Supabase Service Role Key - CRÍTICO: Nunca expor ao cliente
    supabaseServiceKey: getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY', true),
    
    // Super Admin Emails - Lista separada por vírgula
    superAdminEmails: getOptionalEnv('SUPER_ADMIN_EMAILS', 'contato@dataro-it.com.br'),
    
    // Rate Limiting (opcional - para Upstash Redis)
    upstashRedisUrl: getOptionalEnv('UPSTASH_REDIS_REST_URL', ''),
    upstashRedisToken: getOptionalEnv('UPSTASH_REDIS_REST_TOKEN', ''),
  } as const;
}

/**
 * Tipo para as variáveis de ambiente públicas
 */
export type PublicEnv = typeof env;

/**
 * Tipo para as variáveis de ambiente do servidor
 */
export type ServerEnv = ReturnType<typeof getServerEnv>;
