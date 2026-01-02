/**
 * Rate Limiting
 * 
 * Implementação simples de rate limiting baseado em IP para proteger
 * APIs públicas contra abuso e ataques de força bruta.
 */

import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Map em memória para armazenar contadores por IP
// Em produção, considere usar Redis ou similar para ambientes multi-instância
const rateLimit = new Map<string, RateLimitRecord>();

/**
 * Verifica se a requisição está dentro do limite de taxa
 * 
 * @param request - NextRequest da requisição
 * @param limit - Número máximo de requisições permitidas na janela de tempo
 * @param windowMs - Janela de tempo em milissegundos
 * @returns true se permitido, false se excedeu o limite
 */
export function checkRateLimit(
  request: NextRequest,
  limit = 5,
  windowMs = 60000
): boolean {
  // Obter IP do cliente
  const ip = 
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  
  const now = Date.now();
  const record = rateLimit.get(ip);
  
  // Se não existe registro ou o tempo expirou, criar novo
  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  // Se excedeu o limite, negar
  if (record.count >= limit) {
    return false;
  }
  
  // Incrementar contador
  record.count++;
  return true;
}

/**
 * Limpa registros antigos de rate limiting
 * Deve ser chamado periodicamente para evitar vazamento de memória
 */
export function cleanupOldRecords(): void {
  const now = Date.now();
  for (const [ip, record] of rateLimit.entries()) {
    if (now > record.resetTime) {
      rateLimit.delete(ip);
    }
  }
}

// Limpar registros antigos a cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldRecords, 5 * 60 * 1000);
}
