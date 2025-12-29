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
    // Usar Service Role Key no lado do servidor para garantir permissões de escrita
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Variáveis de ambiente Supabase não configuradas corretamente no servidor');
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
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
      console.error('Erro ao inserir lead no Supabase:', error);
      return NextResponse.json(
        { error: `Erro no Supabase: ${error.message}`, details: error },
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
