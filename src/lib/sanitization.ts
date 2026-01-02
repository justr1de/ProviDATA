/**
 * Sanitização e Validação de Inputs
 * 
 * Funções para limpar e validar dados de entrada do usuário,
 * prevenindo XSS, injection e outros ataques.
 */

/**
 * Sanitiza uma string removendo caracteres potencialmente perigosos
 * 
 * @param input - String a ser sanitizada
 * @param maxLength - Comprimento máximo permitido
 * @returns String sanitizada
 */
export function sanitizeString(input: string, maxLength = 255): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .substring(0, maxLength)
    // Remove caracteres HTML perigosos
    .replace(/[<>]/g, '')
    // Remove caracteres de controle
    .replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Valida formato de email
 * 
 * @param email - Email a ser validado
 * @returns true se válido, false caso contrário
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // RFC 5322 simplificado
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Valida e sanitiza número de telefone
 * Remove caracteres não numéricos, mantendo apenas dígitos, espaços, parênteses e hífens
 * 
 * @param phone - Telefone a ser validado
 * @returns Telefone sanitizado ou string vazia se inválido
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // Remove tudo exceto dígitos, espaços, parênteses, hífens e +
  return phone
    .trim()
    .substring(0, 20)
    .replace(/[^0-9\s()\-+]/g, '');
}

/**
 * Valida URL
 * 
 * @param url - URL a ser validada
 * @returns true se válida, false caso contrário
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitiza objeto com múltiplos campos de string
 * 
 * @param obj - Objeto a ser sanitizado
 * @param fields - Campos a serem sanitizados com seus comprimentos máximos
 * @returns Objeto sanitizado
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fields: Record<string, number>
): T {
  const sanitized = { ...obj };
  
  for (const [field, maxLength] of Object.entries(fields)) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeString(sanitized[field] as string, maxLength) as T[Extract<keyof T, string>];
    }
  }
  
  return sanitized;
}
