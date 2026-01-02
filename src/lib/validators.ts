/**
 * Utilitários de validação e sanitização de dados
 * Garante que os dados de entrada sejam seguros e válidos
 */

/**
 * Regex RFC-compliant para validação de email
 * Baseado na especificação RFC 5322
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Valida se uma string é um email válido
 * @param email Email para validar
 * @returns true se o email é válido
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Verificar comprimento máximo (RFC 5321)
  if (email.length > 254) {
    return false;
  }
  
  // Verificar formato
  return EMAIL_REGEX.test(email);
}

/**
 * Sanitiza uma string removendo caracteres perigosos e limitando o tamanho
 * @param input String para sanitizar
 * @param maxLength Tamanho máximo permitido (padrão: 255)
 * @returns String sanitizada
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .substring(0, maxLength)
    // Remove caracteres de controle potencialmente perigosos
    .replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Sanitiza um email
 * @param email Email para sanitizar
 * @returns Email sanitizado e normalizado
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  return email
    .trim()
    .toLowerCase()
    .substring(0, 254);
}

/**
 * Sanitiza um telefone removendo caracteres não numéricos (exceto +, -, (, ), espaços)
 * @param phone Telefone para sanitizar
 * @returns Telefone sanitizado
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  return phone
    .trim()
    .replace(/[^\d+\-() ]/g, '')
    .substring(0, 20);
}

/**
 * Valida se uma string contém apenas caracteres alfanuméricos e espaços
 * Suporta caracteres Unicode incluindo acentuação
 * @param input String para validar
 * @returns true se contém apenas caracteres seguros
 */
export function isAlphanumericWithSpaces(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  // Permite letras Unicode (incluindo acentuadas), números e espaços
  // \p{L} = todas as letras Unicode
  // \p{N} = todos os números Unicode
  return /^[\p{L}\p{N}\s]+$/u.test(input);
}

/**
 * Valida se uma UF brasileira é válida
 * @param uf UF para validar
 * @returns true se a UF é válida
 */
export function validateUF(uf: string): boolean {
  const validUFs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  return validUFs.includes(uf.toUpperCase());
}

/**
 * Sanitiza dados de formulário genérico
 * @param data Objeto com dados do formulário
 * @returns Objeto com dados sanitizados
 */
export function sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (value === null || value === undefined) {
      sanitized[key] = '';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Valida dados de lead da landing page
 * @param data Dados do lead
 * @returns Objeto com resultado da validação
 */
export interface LeadValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    nome: string;
    cargo: string;
    email: string;
    telefone: string;
    mensagem: string;
  };
}

export function validateLeadData(data: {
  nome?: string;
  cargo?: string;
  email?: string;
  telefone?: string;
  mensagem?: string;
}): LeadValidationResult {
  const errors: Record<string, string> = {};
  
  // Validar nome
  if (!data.nome || data.nome.trim().length < 3) {
    errors.nome = 'Nome deve ter pelo menos 3 caracteres';
  } else if (data.nome.length > 100) {
    errors.nome = 'Nome muito longo (máximo 100 caracteres)';
  }
  
  // Validar cargo
  if (!data.cargo || data.cargo.trim().length < 2) {
    errors.cargo = 'Cargo deve ter pelo menos 2 caracteres';
  } else if (data.cargo.length > 100) {
    errors.cargo = 'Cargo muito longo (máximo 100 caracteres)';
  }
  
  // Validar email
  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Email inválido';
  }
  
  // Validar telefone (opcional, mas se fornecido deve ter formato mínimo)
  if (data.telefone && data.telefone.trim().length > 0) {
    const digitsOnly = data.telefone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      errors.telefone = 'Telefone inválido (mínimo 10 dígitos)';
    }
  }
  
  // Validar mensagem (opcional)
  if (data.mensagem && data.mensagem.length > 1000) {
    errors.mensagem = 'Mensagem muito longa (máximo 1000 caracteres)';
  }
  
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }
  
  return {
    valid: true,
    errors: {},
    sanitized: {
      nome: sanitizeString(data.nome || '', 100),
      cargo: sanitizeString(data.cargo || '', 100),
      email: sanitizeEmail(data.email || ''),
      telefone: sanitizePhone(data.telefone || ''),
      mensagem: sanitizeString(data.mensagem || '', 1000),
    },
  };
}
