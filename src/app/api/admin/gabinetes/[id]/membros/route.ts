import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Criar cliente Supabase Admin sob demanda
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas')
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
    
    const { data: membros, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, cargo, avatar_url, created_at')
      .eq('gabinete_id', gabineteId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar membros:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar membros do gabinete' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ membros })
  } catch (error) {
    console.error('Erro na API de membros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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
        { error: 'Email, nome completo e papel são obrigatórios' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseAdmin()
    
    // Verificar se o email já existe
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, gabinete_id')
      .eq('email', email)
      .single()
    
    if (existingUser) {
      // Se o usuário já existe, atualizar o gabinete_id
      const { data: updatedUser, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          gabinete_id: gabineteId,
          role,
          cargo,
          full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Erro ao atualizar membro:', updateError)
        return NextResponse.json(
          { error: 'Erro ao atualizar membro' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ 
        membro: updatedUser,
        message: 'Membro atualizado e vinculado ao gabinete'
      })
    }
    
    // Criar novo usuário no Auth
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
      console.error('Erro ao criar usuário no Auth:', authError)
      return NextResponse.json(
        { error: `Erro ao criar usuário: ${authError.message}` },
        { status: 500 }
      )
    }
    
    // Criar perfil do usuário
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email,
        full_name,
        role,
        cargo,
        gabinete_id: gabineteId,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      // Tentar deletar o usuário do Auth se o perfil falhar
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json(
        { error: 'Erro ao criar perfil do membro' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      membro: newProfile,
      message: 'Membro criado com sucesso'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erro na API de membros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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
        { error: 'ID do membro é obrigatório' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseAdmin()
    
    const { data: updatedMembro, error } = await supabase
      .from('profiles')
      .update({ 
        full_name,
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
        { error: 'Erro ao atualizar membro' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      membro: updatedMembro,
      message: 'Membro atualizado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro na API de membros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover membro do gabinete (desvincular, não deletar)
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
        { error: 'ID do membro é obrigatório' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseAdmin()
    
    // Desvincular o membro do gabinete (não deletar o usuário)
    const { error } = await supabase
      .from('profiles')
      .update({ 
        gabinete_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .eq('gabinete_id', gabineteId)
    
    if (error) {
      console.error('Erro ao remover membro:', error)
      return NextResponse.json(
        { error: 'Erro ao remover membro do gabinete' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      message: 'Membro removido do gabinete com sucesso'
    })
    
  } catch (error) {
    console.error('Erro na API de membros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
