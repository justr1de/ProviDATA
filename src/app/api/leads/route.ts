import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { nome, cargo, email, telefone } = await request.json();

    // Validar campos obrigatórios
    if (!nome || !cargo || !email || !telefone) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar cliente Supabase no servidor
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Handle cookie setting errors
            }
          },
        },
      }
    );

    // Inserir lead no Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          nome,
          cargo,
          email,
          telefone,
          status: 'novo',
        },
      ])
      .select();

    if (error) {
      console.error('Erro ao inserir lead:', error);
      return NextResponse.json(
        { error: 'Erro ao enviar formulário' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data },
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
