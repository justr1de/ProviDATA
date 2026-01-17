import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Criar cliente Supabase Admin com service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, nome, role, gabinete_id, created_by } = body

    // Validar campos obrigatórios
    if (!email || !password || !nome) {
      return NextResponse.json(
        { error: 'E-mail, senha e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o usuário que está criando tem permissão (super_admin ou admin)
    if (created_by) {
      const { data: creatorData, error: creatorError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', created_by)
        .single()

      if (creatorError || !creatorData) {
        return NextResponse.json(
          { error: 'Usuário criador não encontrado' },
          { status: 403 }
        )
      }

      // Apenas super_admin e admin podem criar usuários
      if (!['super_admin', 'admin'].includes(creatorData.role)) {
        return NextResponse.json(
          { error: 'Sem permissão para criar usuários' },
          { status: 403 }
        )
      }

      // Apenas super_admin pode criar outros super_admin
      if (role === 'super_admin' && creatorData.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Apenas Super Admin pode criar outros Super Admin' },
          { status: 403 }
        )
      }
    }

    // Verificar se o e-mail já existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado' },
        { status: 400 }
      )
    }

    // Criar usuário no Supabase Auth usando Admin API (sem rate limit)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar e-mail automaticamente
      user_metadata: {
        nome
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'Este e-mail já está cadastrado no sistema de autenticação' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: `Erro ao criar usuário: ${authError.message}` },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário: dados de autenticação não retornados' },
        { status: 500 }
      )
    }

    // Criar registro na tabela public.users
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        gabinete_id: gabinete_id,
        nome: nome,
        email: email,
        role: role || 'user',
        ativo: true,
        created_at: new Date().toISOString()
      })

    if (userError) {
      console.error('User table error:', userError)
      
      // Se falhou ao criar na tabela users, deletar do auth para manter consistência
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: `Erro ao criar registro do usuário: ${userError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        nome: nome,
        role: role || 'user'
      }
    })

  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
