/**
 * Validação de Variáveis de Ambiente
 * 
 * Este módulo centraliza a validação de todas as variáveis de ambiente
 * necessárias para o funcionamento da aplicação, garantindo que erros
 * de configuração sejam detectados precocemente.
 */

export function validateEnv() {
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não configuradas: ${missing.join(', ')}\n` +
      `Por favor, configure-as no arquivo .env.local`
    );
  }

  return required as Record<keyof typeof required, string>;
}

export function validateServerEnv() {
  const serverRequired = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const missing = Object.entries(serverRequired)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente do servidor não configuradas: ${missing.join(', ')}\n` +
      `Esta variável deve ser configurada apenas no servidor (não no frontend)`
    );
  }

  return serverRequired as Record<keyof typeof serverRequired, string>;
}

/**
 * Valida e retorna a lista de emails de super admins
 * Default: contato@dataro-it.com.br
 */
export function getSuperAdminEmails(): string[] {
  const emailsEnv = process.env.SUPER_ADMIN_EMAILS || 'contato@dataro-it.com.br';
  return emailsEnv.split(',').map(email => email.trim()).filter(email => email.length > 0);
}
