import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * API Route: POST /api/leads
 * 
 * Registra leads de potenciais clientes no sistema
 * 
 * SEGURANÇA:
 * - Validação robusta de inputs
 * - Sanitização de dados
 * - Limitação de tamanho de campos
 * - Email com regex completo
 * 
 * NOTA SOBRE RATE LIMITING:
 * Para produção, considere implementar rate limiting usando:
 * - Middleware do Next.js com cache (Redis/Vercel KV)
 * - Serviços externos como Upstash Rate Limit
 * - Cloudflare Rate Limiting
 */

// Regex robusto para validação de email (RFC 5322 simplificado)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Sanitiza uma string removendo caracteres potencialmente perigosos
 */
function sanitizeString(input: string, maxLength: number): string {
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, '') // Remove < e > para prevenir XSS básico
}

/**
 * Sanitiza um telefone mantendo apenas números e caracteres permitidos
 */
function sanitizePhone(input: string): string {
  return input
    .trim()
    .replace(/[^0-9+() -]/g, '') // Mantém apenas números e caracteres de formatação
    .substring(0, 20)
}

/**
 * Valida os dados do lead
 */
function validateLeadData(data: {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  mensagem: string;
}): { valid: boolean; error?: string } {
  // Validar campos obrigatórios
  if (!data.nome || data.nome.trim().length === 0) {
    return { valid: false, error: 'Nome é obrigatório' };
  }
  
  if (!data.cargo || data.cargo.trim().length === 0) {
    return { valid: false, error: 'Cargo é obrigatório' };
  }
  
  if (!data.email || data.email.trim().length === 0) {
    return { valid: false, error: 'E-mail é obrigatório' };
  }
  
  if (!data.telefone || data.telefone.trim().length === 0) {
    return { valid: false, error: 'Telefone é obrigatório' };
  }
  
  if (!data.mensagem || data.mensagem.trim().length === 0) {
    return { valid: false, error: 'Mensagem é obrigatória' };
  }
  
  // Validar formato do email
  if (!EMAIL_REGEX.test(data.email.trim())) {
    return { valid: false, error: 'E-mail inválido' };
  }
  
  // Validar tamanhos mínimos
  if (data.nome.trim().length < 3) {
    return { valid: false, error: 'Nome deve ter no mínimo 3 caracteres' };
  }
  
  if (data.mensagem.trim().length < 10) {
    return { valid: false, error: 'Mensagem deve ter no mínimo 10 caracteres' };
  }
  
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, cargo, email, telefone, mensagem } = body;

    // Validar dados
    const validation = validateLeadData({ nome, cargo, email, telefone, mensagem });
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Sanitizar dados de entrada
    const sanitizedData = {
      nome: sanitizeString(nome, 255),
      cargo: sanitizeString(cargo, 100),
      email: email.trim().toLowerCase().substring(0, 255),
      telefone: sanitizePhone(telefone),
      mensagem: sanitizeString(mensagem, 2000),
      status: 'novo',
    };

    /**
     * Criar cliente Supabase com Service Role Key
     * 
     * ⚠️ SEGURANÇA:
     * - Service Role Key usada APENAS no servidor para operações administrativas
     * - Esta chave bypassa RLS e tem permissões totais
     * - NUNCA exponha ao cliente/navegador
     */
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Inserir lead no Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([sanitizedData])
      .select();

    if (error) {
      console.error('Erro ao inserir lead no Supabase:', error);
      return NextResponse.json(
        { error: 'Erro ao processar solicitação. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Dados enviados com sucesso! Nossa equipe entrará em contato em breve.',
        data 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro na API de leads:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
