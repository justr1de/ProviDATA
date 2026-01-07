import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Upload de anexo para andamento
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
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const andamentoId = formData.get('andamento_id') as string
    const descricao = formData.get('descricao') as string
    
    if (!file || !andamentoId) {
      return NextResponse.json(
        { error: 'file e andamento_id são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Obter gabinete_id do andamento
    const { data: andamento } = await supabase
      .from('andamentos')
      .select('gabinete_id, providencia_id')
      .eq('id', andamentoId)
      .single()
    
    if (!andamento) {
      return NextResponse.json(
        { error: 'Andamento não encontrado' },
        { status: 404 }
      )
    }
    
    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const nomeArquivo = `${andamento.gabinete_id}/${andamento.providencia_id}/${andamentoId}/${timestamp}.${extension}`
    
    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    
    // Upload para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('andamentos-anexos')
      .upload(nomeArquivo, buffer, {
        contentType: file.type,
        upsert: false
      })
    
    if (uploadError) {
      console.error('Erro no upload:', uploadError)
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo' },
        { status: 500 }
      )
    }
    
    // Obter URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from('andamentos-anexos')
      .getPublicUrl(nomeArquivo)
    
    // Registrar anexo no banco
    const { data: anexo, error: anexoError } = await supabase
      .from('andamentos_anexos')
      .insert({
        andamento_id: andamentoId,
        gabinete_id: andamento.gabinete_id,
        nome_arquivo: nomeArquivo,
        nome_original: file.name,
        tipo_arquivo: file.type,
        tamanho: file.size,
        url_arquivo: urlData.publicUrl,
        descricao: descricao || null,
        uploaded_by: user.id
      })
      .select()
      .single()
    
    if (anexoError) {
      console.error('Erro ao registrar anexo:', anexoError)
      // Tentar remover arquivo do storage em caso de erro
      await supabase.storage.from('andamentos-anexos').remove([nomeArquivo])
      return NextResponse.json(
        { error: 'Erro ao registrar anexo' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ anexo }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de anexos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover anexo
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const anexoId = searchParams.get('id')
    
    if (!anexoId) {
      return NextResponse.json(
        { error: 'id do anexo é obrigatório' },
        { status: 400 }
      )
    }
    
    // Buscar anexo
    const { data: anexo } = await supabase
      .from('andamentos_anexos')
      .select('nome_arquivo')
      .eq('id', anexoId)
      .single()
    
    if (!anexo) {
      return NextResponse.json(
        { error: 'Anexo não encontrado' },
        { status: 404 }
      )
    }
    
    // Remover do storage
    await supabase.storage
      .from('andamentos-anexos')
      .remove([anexo.nome_arquivo])
    
    // Remover do banco
    const { error } = await supabase
      .from('andamentos_anexos')
      .delete()
      .eq('id', anexoId)
    
    if (error) {
      console.error('Erro ao deletar anexo:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar anexo' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na API de anexos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
