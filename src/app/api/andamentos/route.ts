import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Listar andamentos de uma providência
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const providenciaId = searchParams.get('providencia_id')
    
    if (!providenciaId) {
      return NextResponse.json(
        { error: 'providencia_id é obrigatório' },
        { status: 400 }
      )
    }
    
    // Buscar andamentos com anexos
    const { data: andamentos, error } = await supabase
      .from('andamentos')
      .select(`
        *,
        anexos:andamentos_anexos(*)
      `)
      .eq('providencia_id', providenciaId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar andamentos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar andamentos' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ andamentos })
  } catch (error) {
    console.error('Erro na API de andamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo andamento
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const {
      providencia_id,
      tipo_acao,
      descricao,
      status_anterior,
      status_novo,
      visivel_cidadao = true,
      notificar_cidadao = false,
      metadados = {}
    } = body
    
    // Validações
    if (!providencia_id || !tipo_acao || !descricao) {
      return NextResponse.json(
        { error: 'providencia_id, tipo_acao e descricao são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    // Obter perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome, gabinete_id')
      .eq('id', user.id)
      .single()
    
    // Obter gabinete_id da providência
    const { data: providencia } = await supabase
      .from('providencias')
      .select('gabinete_id, cidadao_id, protocolo, titulo')
      .eq('id', providencia_id)
      .single()
    
    if (!providencia) {
      return NextResponse.json(
        { error: 'Providência não encontrada' },
        { status: 404 }
      )
    }
    
    // Inserir andamento
    const { data: andamento, error } = await supabase
      .from('andamentos')
      .insert({
        providencia_id,
        gabinete_id: providencia.gabinete_id,
        tipo_acao,
        descricao,
        status_anterior,
        status_novo,
        usuario_id: user.id,
        usuario_nome: profile?.nome || user.email,
        visivel_cidadao,
        metadados
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar andamento:', error)
      return NextResponse.json(
        { error: 'Erro ao criar andamento' },
        { status: 500 }
      )
    }
    
    // Se houver mudança de status, atualizar a providência
    if (status_novo && status_novo !== status_anterior) {
      await supabase
        .from('providencias')
        .update({ 
          status: status_novo,
          updated_at: new Date().toISOString()
        })
        .eq('id', providencia_id)
    }
    
    // Se solicitado, notificar o cidadão
    if (notificar_cidadao && providencia.cidadao_id) {
      // Buscar dados do cidadão
      const { data: cidadao } = await supabase
        .from('cidadaos')
        .select('nome, email, telefone')
        .eq('id', providencia.cidadao_id)
        .single()
      
      if (cidadao?.email) {
        // Registrar notificação para envio
        await supabase
          .from('notificacoes_cidadao')
          .insert({
            providencia_id,
            andamento_id: andamento.id,
            cidadao_id: providencia.cidadao_id,
            gabinete_id: providencia.gabinete_id,
            tipo_notificacao: 'email',
            assunto: `Atualização da Providência ${providencia.protocolo}`,
            mensagem: `Olá ${cidadao.nome},\n\nSua providência "${providencia.titulo}" (Protocolo: ${providencia.protocolo}) teve uma atualização:\n\n${descricao}\n\nStatus atual: ${status_novo || 'Sem alteração'}\n\nAtenciosamente,\nGabinete Parlamentar`,
            destinatario: cidadao.email,
            status: 'pendente',
            enviado_por: user.id
          })
      }
    }
    
    return NextResponse.json({ andamento }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de andamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
