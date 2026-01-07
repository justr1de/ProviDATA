import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Criar cliente Supabase Admin sob demanda
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Variaveis de ambiente nao configuradas:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey
    })
    throw new Error('Variaveis de ambiente do Supabase nao configuradas')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// GET - Listar membros do gabinete
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gabineteId } = await params
    const supabase = getSupabaseAdmin()
    
    // Buscar na tabela users (tabela principal do sistema)
    const { data: membros, error } = await supabase
      .from('users')
      .select('id, email, nome, role, cargo, avatar_url, ativo, created_at')
      .eq('gabinete_id', gabineteId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar membros:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar membros do gabinete', details: error.message },
        { status: 500 }
      )
    }
    
    // Mapear para o formato esperado pelo frontend
    const membrosFormatados = (membros || []).map(m => ({
      id: m.id,
      email: m.email,
      full_name: m.nome,
      role: m.role,
      cargo: m.cargo,
      avatar_url: m.avatar_url,
      ativo: m.ativo,
      created_at: m.created_at
    }))
    
    return NextResponse.json({ membros: membrosFormatados })
  } catch (error) {
    console.error('Erro na API de membros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    )
  }
}

// POST - Adicionar novo membro ao gabinete
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gabineteId } = await params
    const body = await request.json()
    const { email, full_name, role, cargo, password } = body
    
    if (!email || !full_name || !role) {
      return NextResponse.json(
        { error: 'Email, nome completo e papel sao obrigatorios' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseAdmin()
    
    // Verificar se o email ja existe na tabela users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, gabinete_id')
      .eq('email', email)
      .single()
    
    if (existingUser) {
      // Se o usuario ja existe, atualizar o gabinete_id
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          gabinete_id: gabineteId,
          role,
          cargo,
          nome: full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Erro ao atualizar membro:', updateError)
        return NextResponse.json(
          { error: 'Erro ao atualizar membro', details: updateError.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ 
        membro: {
          id: updatedUser.id,
          email: updatedUser.email,
          full_name: updatedUser.nome,
          role: updatedUser.role,
          cargo: updatedUser.cargo
        },
        message: 'Membro atualizado e vinculado ao gabinete'
      })
    }
    
    // Criar novo usuario no Auth
    const userPassword = password || `Temp@${Date.now()}`
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        cargo
      }
    })
    
    if (authError) {
      console.error('Erro ao criar usuario no Auth:', authError)
      return NextResponse.json(
        { error: `Erro ao criar usuario: ${authError.message}` },
        { status: 500 }
      )
    }
    
    // Criar registro na tabela users
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email,
        nome: full_name,
        role,
        cargo,
        gabinete_id: gabineteId,
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (userError) {
      console.error('Erro ao criar usuario na tabela users:', userError)
      // Tentar deletar o usuario do Auth se falhar
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json(
        { error: 'Erro ao criar registro do membro', details: userError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      membro: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.nome,
        role: newUser.role,
        cargo: newUser.cargo
      },
      message: 'Membro criado com sucesso'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erro na API de membros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    )
  }
}

// PUT - Atualizar membro do gabinete
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gabineteId } = await params
    const body = await request.json()
    const { memberId, full_name, role, cargo } = body
    
    if (!memberId) {
      return NextResponse.json(
        { error: 'ID do membro e obrigatorio' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseAdmin()
    
    const { data: updatedMembro, error } = await supabase
      .from('users')
      .update({ 
        nome: full_name,
        role,
        cargo,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .eq('gabinete_id', gabineteId)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao atualizar membro:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar membro', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      membro: {
        id: updatedMembro.id,
        email: updatedMembro.email,
        full_name: updatedMembro.nome,
        role: updatedMembro.role,
        cargo: updatedMembro.cargo
      },
      message: 'Membro atualizado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro na API de membros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    )
  }
}

// DELETE - Remover membro do gabinete (desvincular, nao deletar)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gabineteId } = await params
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    
    if (!memberId) {
      return NextResponse.json(
        { error: 'ID do membro e obrigatorio' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseAdmin()
    
    // Desvincular o membro do gabinete (nao deletar o usuario)
    const { error } = await supabase
      .from('users')
      .update({ 
        gabinete_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .eq('gabinete_id', gabineteId)
    
    if (error) {
      console.error('Erro ao remover membro:', error)
      return NextResponse.json(
        { error: 'Erro ao remover membro do gabinete', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      message: 'Membro removido do gabinete com sucesso'
    })
    
  } catch (error) {
    console.error('Erro na API de membros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    )
  }
}
