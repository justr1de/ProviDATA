import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Configuração do serviço de email (usando Gmail MCP ou outro serviço)
async function enviarEmail(destinatario: string, assunto: string, mensagem: string) {
  // Aqui você pode integrar com:
  // 1. Gmail MCP
  // 2. SendGrid
  // 3. Amazon SES
  // 4. Resend
  // 5. Nodemailer
  
  // Por enquanto, vamos simular o envio e registrar
  console.log('Enviando email para:', destinatario)
  console.log('Assunto:', assunto)
  console.log('Mensagem:', mensagem)
  
  // Simulação de sucesso
  return { success: true, messageId: `msg_${Date.now()}`, error: '' }
}

// POST - Enviar notificação para cidadão
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
      tipo_notificacao = 'email',
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
        gabinete:gabinetes(id, nome)
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
    let destinatario = ''
    let mensagemFinal = mensagem
    
    // Determinar destinatário baseado no tipo de notificação
    switch (tipo_notificacao) {
      case 'email':
        if (!cidadao.email) {
          return NextResponse.json(
            { error: 'Cidadão não possui email cadastrado' },
            { status: 400 }
          )
        }
        destinatario = cidadao.email
        break
      case 'sms':
      case 'whatsapp':
        if (!cidadao.telefone) {
          return NextResponse.json(
            { error: 'Cidadão não possui telefone cadastrado' },
            { status: 400 }
          )
        }
        destinatario = cidadao.telefone
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de notificação inválido' },
          { status: 400 }
        )
    }
    
    // Se solicitado, gerar link de acompanhamento
    let tokenAcesso = null
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
        const linkAcompanhamento = `${process.env.NEXT_PUBLIC_APP_URL || 'https://providata.com.br'}/acompanhar/${tokenAcesso}`
        mensagemFinal += `\n\n📱 Acompanhe sua providência em tempo real:\n${linkAcompanhamento}`
      }
    }
    
    // Registrar notificação
    const { data: notificacao, error: notificacaoError } = await supabase
      .from('notificacoes_cidadao')
      .insert({
        providencia_id,
        andamento_id,
        cidadao_id: cidadao.id,
        gabinete_id: providencia.gabinete_id,
        tipo_notificacao,
        assunto: assunto || `Atualização da Providência ${providencia.protocolo}`,
        mensagem: mensagemFinal,
        destinatario,
        status: 'pendente',
        enviado_por: user.id,
        metadados: { token_acesso: tokenAcesso }
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
    
    // Tentar enviar a notificação
    let envioResult = { success: false, error: '' }
    
    if (tipo_notificacao === 'email') {
      try {
        envioResult = await enviarEmail(
          destinatario,
          notificacao.assunto,
          mensagemFinal
        )
      } catch (emailError: any) {
        envioResult = { success: false, error: emailError.message }
      }
    }
    // TODO: Implementar SMS e WhatsApp
    
    // Atualizar status da notificação
    const novoStatus = envioResult.success ? 'enviado' : 'erro'
    await supabase
      .from('notificacoes_cidadao')
      .update({
        status: novoStatus,
        enviado_em: envioResult.success ? new Date().toISOString() : null,
        erro_mensagem: envioResult.success ? null : envioResult.error,
        metadados: {
          ...notificacao.metadados,
          resultado_envio: envioResult
        }
      })
      .eq('id', notificacao.id)
    
    // Se enviou com sucesso, registrar andamento
    if (envioResult.success && andamento_id === null) {
      await supabase
        .from('andamentos')
        .insert({
          providencia_id,
          gabinete_id: providencia.gabinete_id,
          tipo_acao: 'notificacao',
          descricao: `Notificação enviada para ${cidadao.nome} via ${tipo_notificacao}`,
          usuario_id: user.id,
          usuario_nome: user.email,
          visivel_cidadao: false,
          metadados: { notificacao_id: notificacao.id }
        })
    }
    
    return NextResponse.json({
      notificacao: {
        ...notificacao,
        status: novoStatus
      },
      envio: envioResult,
      link_acompanhamento: tokenAcesso 
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://providata.com.br'}/acompanhar/${tokenAcesso}`
        : null
    }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Listar notificações de uma providência
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
    
    const { data: notificacoes, error } = await supabase
      .from('notificacoes_cidadao')
      .select('*')
      .eq('providencia_id', providenciaId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar notificações:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar notificações' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ notificacoes })
  } catch (error) {
    console.error('Erro na API de notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
