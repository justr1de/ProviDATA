import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('Recebida nova requisição para /api/leads');
  try {
    const body = await request.json();
    console.log('Corpo da requisição:', JSON.stringify(body, null, 2));
    const { nome, cargo, email, telefone, mensagem } = body;

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('Supabase URL:', supabaseUrl ? 'Carregada' : 'NÃO CARREGADA');
    console.log('Supabase Anon Key:', supabaseAnonKey ? 'Carregada' : 'NÃO CARREGADA');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Variáveis de ambiente Supabase não configuradas');
      return NextResponse.json(
        { error: 'Erro de configuração do servidor' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        { error: 'Erro ao salvar dados. Tente novamente.' },
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
