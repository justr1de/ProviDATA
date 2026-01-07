import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Cliente Supabase com service role para acesso público
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Buscar providência por token (acesso público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      )
    }
    
    // Buscar e validar token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('providencias_tokens')
      .select('*')
      .eq('token', token)
      .eq('ativo', true)
      .gt('expira_em', new Date().toISOString())
      .single()
    
    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 404 }
      )
    }
    
    // Atualizar estatísticas de acesso
    await supabaseAdmin
      .from('providencias_tokens')
      .update({
        ultimo_acesso: new Date().toISOString(),
        total_acessos: tokenData.total_acessos + 1
      })
      .eq('id', tokenData.id)
    
    // Buscar dados da providência
    const { data: providencia, error: providenciaError } = await supabaseAdmin
      .from('providencias')
      .select(`
        id,
        protocolo,
        titulo,
        descricao,
        status,
        prioridade,
        created_at,
        updated_at,
        cidadao:cidadaos(nome),
        orgao:orgaos(nome),
        categoria:categorias(nome),
        gabinete:gabinetes(nome, parlamentar)
      `)
      .eq('id', tokenData.providencia_id)
      .single()
    
    if (providenciaError || !providencia) {
      return NextResponse.json(
        { error: 'Providência não encontrada' },
        { status: 404 }
      )
    }
    
    // Buscar andamentos visíveis para o cidadão
    const { data: andamentos } = await supabaseAdmin
      .from('andamentos')
      .select(`
        id,
        tipo_acao,
        descricao,
        status_anterior,
        status_novo,
        created_at,
        anexos:andamentos_anexos(
          id,
          nome_original,
          tipo_arquivo,
          tamanho,
          url_arquivo
        )
      `)
      .eq('providencia_id', tokenData.providencia_id)
      .eq('visivel_cidadao', true)
      .order('created_at', { ascending: false })
    
    return NextResponse.json({
      providencia: {
        ...providencia,
        cidadao_nome: (providencia.cidadao as any)?.[0]?.nome || (providencia.cidadao as any)?.nome,
        orgao_nome: (providencia.orgao as any)?.[0]?.nome || (providencia.orgao as any)?.nome,
        categoria_nome: (providencia.categoria as any)?.[0]?.nome || (providencia.categoria as any)?.nome,
        gabinete_nome: (providencia.gabinete as any)?.[0]?.nome || (providencia.gabinete as any)?.nome,
        parlamentar: (providencia.gabinete as any)?.[0]?.parlamentar || (providencia.gabinete as any)?.parlamentar
      },
      andamentos: andamentos || [],
      token_info: {
        criado_em: tokenData.created_at,
        expira_em: tokenData.expira_em,
        total_acessos: tokenData.total_acessos + 1
      }
    })
  } catch (error) {
    console.error('Erro na API pública:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
