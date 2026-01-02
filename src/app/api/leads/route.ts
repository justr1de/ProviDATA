import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';
import { validateLeadData } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, cargo, email, telefone, mensagem } = body;

    // Validar e sanitizar dados de entrada
    const validation = validateLeadData({ nome, cargo, email, telefone, mensagem });
    
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Usar dados sanitizados
    const sanitizedData = validation.sanitized!;

    // Obter credenciais do servidor de forma segura
    const serverEnv = getServerEnv();
    
    // Criar cliente Supabase com Service Role Key (server-only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serverEnv.supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Inserir lead no Supabase com dados sanitizados
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
        { error: 'Erro ao processar solicitação' },
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
