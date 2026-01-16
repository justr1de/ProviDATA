import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Interface para o payload de e-mail
interface EmailPayload {
  to: string[]
  subject: string
  content: string
  cc?: string[]
  bcc?: string[]
  attachments?: string[]
}

// Interface para a fila de e-mails
interface EmailQueue {
  id: string
  providencia_id: string
  cidadao_id: string
  gabinete_id: string
  destinatario: string
  assunto: string
  mensagem: string
  status: 'pendente' | 'aprovado' | 'enviado' | 'erro'
  created_at: string
}

// POST - Adicionar e-mail à fila para envio via Gmail MCP
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const {
      providencia_id,
      andamento_id,
      assunto,
      mensagem,
      incluir_link_acompanhamento = true
    } = body
    
    if (!providencia_id || !mensagem) {
      return NextResponse.json(
        { error: 'providencia_id e mensagem são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Buscar dados da providência e cidadão
    const { data: providencia } = await supabase
      .from('providencias')
      .select(`
        *,
        cidadao:cidadaos(id, nome, email, telefone),
        gabinete:gabinetes(id, nome, parlamentar_nome)
      `)
      .eq('id', providencia_id)
      .single()
    
    if (!providencia) {
      return NextResponse.json(
        { error: 'Providência não encontrada' },
        { status: 404 }
      )
    }
    
    if (!providencia.cidadao) {
      return NextResponse.json(
        { error: 'Cidadão não encontrado para esta providência' },
        { status: 404 }
      )
    }
    
    const cidadao = providencia.cidadao
    
    if (!cidadao.email) {
      return NextResponse.json(
        { error: 'Cidadão não possui email cadastrado' },
        { status: 400 }
      )
    }
    
    let mensagemFinal = mensagem
    let tokenAcesso = null
    
    // Se solicitado, gerar link de acompanhamento
    if (incluir_link_acompanhamento) {
      // Verificar se já existe token
      const { data: tokenExistente } = await supabase
        .from('providencias_tokens')
        .select('token')
        .eq('providencia_id', providencia_id)
        .eq('cidadao_id', cidadao.id)
        .eq('ativo', true)
        .single()
      
      if (tokenExistente) {
        tokenAcesso = tokenExistente.token
      } else {
        // Criar novo token
        const { data: novoToken } = await supabase
          .from('providencias_tokens')
          .insert({
            providencia_id,
            cidadao_id: cidadao.id
          })
          .select('token')
          .single()
        
        if (novoToken) {
          tokenAcesso = novoToken.token
        }
      }
      
      if (tokenAcesso) {
        const linkAcompanhamento = `${process.env.NEXT_PUBLIC_APP_URL || 'https://providata.vercel.app'}/acompanhar/${tokenAcesso}`
        mensagemFinal += `\n\n📱 Acompanhe sua providência em tempo real:\n${linkAcompanhamento}`
      }
    }
    
    // Formatar assunto do e-mail
    const assuntoFinal = assunto || `[ProviDATA] Atualização da Providência ${providencia.protocolo}`
    
    // Formatar mensagem completa
    const mensagemCompleta = `
Prezado(a) ${cidadao.nome},

${mensagemFinal}

---
Gabinete: ${providencia.gabinete?.nome || 'N/A'}
Parlamentar: ${providencia.gabinete?.parlamentar_nome || 'N/A'}
Protocolo: ${providencia.protocolo}

Este é um e-mail automático do sistema ProviDATA.
Por favor, não responda diretamente a este e-mail.
    `.trim()
    
    // Registrar na tabela de notificações
    const { data: notificacao, error: notificacaoError } = await supabase
      .from('notificacoes_cidadao')
      .insert({
        providencia_id,
        andamento_id,
        cidadao_id: cidadao.id,
        gabinete_id: providencia.gabinete_id,
        tipo_notificacao: 'email',
        assunto: assuntoFinal,
        mensagem: mensagemCompleta,
        destinatario: cidadao.email,
        status: 'pendente',
        enviado_por: user.id,
        metadados: { 
          token_acesso: tokenAcesso,
          gmail_mcp: true,
          aguardando_aprovacao: true
        }
      })
      .select()
      .single()
    
    if (notificacaoError) {
      console.error('Erro ao registrar notificação:', notificacaoError)
      return NextResponse.json(
        { error: 'Erro ao registrar notificação' },
        { status: 500 }
      )
    }
    
    // Retornar payload formatado para o Gmail MCP
    const gmailPayload: EmailPayload = {
      to: [cidadao.email],
      subject: assuntoFinal,
      content: mensagemCompleta
    }
    
    return NextResponse.json({
      success: true,
      notificacao_id: notificacao.id,
      gmail_payload: gmailPayload,
      instrucoes: 'Use o Gmail MCP para enviar este e-mail. Após o envio, atualize o status da notificação.',
      link_acompanhamento: tokenAcesso 
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://providata.vercel.app'}/acompanhar/${tokenAcesso}`
        : null
    }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar status do e-mail após envio via Gmail MCP
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const body = await request.json()
    const { notificacao_id, status, erro_mensagem } = body
    
    if (!notificacao_id || !status) {
      return NextResponse.json(
        { error: 'notificacao_id e status são obrigatórios' },
        { status: 400 }
      )
    }
    
    const updateData: any = {
      status,
      metadados: {
        gmail_mcp: true,
        atualizado_em: new Date().toISOString()
      }
    }
    
    if (status === 'enviado') {
      updateData.enviado_em = new Date().toISOString()
    }
    
    if (erro_mensagem) {
      updateData.erro_mensagem = erro_mensagem
    }
    
    const { data, error } = await supabase
      .from('notificacoes_cidadao')
      .update(updateData)
      .eq('id', notificacao_id)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao atualizar notificação:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar notificação' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, notificacao: data })
  } catch (error) {
    console.error('Erro na API de email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Listar e-mails pendentes de envio
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pendente'
    const gabinete_id = searchParams.get('gabinete_id')
    
    let query = supabase
      .from('notificacoes_cidadao')
      .select(`
        *,
        cidadao:cidadaos(nome, email),
        providencia:providencias(protocolo, titulo)
      `)
      .eq('tipo_notificacao', 'email')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (gabinete_id) {
      query = query.eq('gabinete_id', gabinete_id)
    }
    
    const { data: emails, error } = await query
    
    if (error) {
      console.error('Erro ao buscar emails:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar emails' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ emails })
  } catch (error) {
    console.error('Erro na API de email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
