import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { nome, cargo, email, telefone, mensagem } = await request.json();

    // Validar campos obrigatórios
    if (!nome || !cargo || !email || !telefone || !mensagem) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'E-mail inválido' },
        { status: 400 }
      );
    }

    // Criar cliente Supabase
    // Criar cliente Supabase
    // Usar Service Role Key para garantir que a inserção funcione (teste de diagnóstico)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Chave secreta

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Variáveis de ambiente Supabase não configuradas corretamente para a API Route');
      return NextResponse.json(
        { error: 'Erro de configuração do servidor (Chave Service Role ausente)' },
        { status: 500 }
      );
    }

    // Usar a chave Service Role para criar o cliente
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            // Desabilitar o auto-refresh de token, pois estamos usando a Service Role Key
            autoRefreshToken: false,
            persistSession: false,
        }
    });

    // Inserir lead no Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          nome: nome.trim(),
          cargo: cargo.trim(),
          email: email.trim().toLowerCase(),
          telefone: telefone.trim(),
          mensagem: mensagem.trim(),
          status: 'novo',
        },
      ])
      .select();

    if (error) {
      console.error('Erro detalhado ao inserir lead no Supabase:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: error.message || 'Erro ao salvar dados. Tente novamente.' },
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
