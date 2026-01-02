import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { validateEnv, validateServerEnv } from '@/lib/env-validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { sanitizeString, sanitizePhone, validateEmail } from '@/lib/sanitization';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requisições por minuto por IP
    if (!checkRateLimit(request, 5, 60000)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validar campos obrigatórios
    if (!body.nome || !body.cargo || !body.email || !body.telefone || !body.mensagem) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar e-mail
    if (!validateEmail(body.email)) {
      return NextResponse.json(
        { error: 'E-mail inválido' },
        { status: 400 }
      );
    }

    // Sanitizar dados
    const sanitizedData = {
      nome: sanitizeString(body.nome, 255),
      cargo: sanitizeString(body.cargo, 100),
      email: body.email.trim().toLowerCase(),
      telefone: sanitizePhone(body.telefone),
      mensagem: sanitizeString(body.mensagem, 1000),
    };

    // Validar dados sanitizados
    if (!sanitizedData.nome || !sanitizedData.cargo || !sanitizedData.telefone || !sanitizedData.mensagem) {
      return NextResponse.json(
        { error: 'Dados inválidos após sanitização' },
        { status: 400 }
      );
    }

    // Validar variáveis de ambiente
    const env = validateEnv();
    const serverEnv = validateServerEnv();

    // Criar cliente Supabase com Service Role Key
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Inserir lead no Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          nome: sanitizedData.nome,
          cargo: sanitizedData.cargo,
          email: sanitizedData.email,
          telefone: sanitizedData.telefone,
          mensagem: sanitizedData.mensagem,
          status: 'novo',
        },
      ])
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
