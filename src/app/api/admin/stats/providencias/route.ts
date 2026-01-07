import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Nomes de gabinetes a serem excluídos dos indicadores
const GABINETES_EXCLUIDOS = ['demonstração', 'demonstracao', 'dataro', 'data-ro', 'data ro', 'administração geral']

function isGabineteExcluido(nome: string | null): boolean {
  if (!nome) return false
  const nomeNormalizado = nome.toLowerCase()
  return GABINETES_EXCLUIDOS.some(excluido => nomeNormalizado.includes(excluido))
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    // Verificar se é super_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    
    // Buscar gabinetes para filtrar os excluídos
    const { data: gabinetes } = await supabase
      .from('gabinetes')
      .select('id, nome')
    
    const gabineteIdsExcluidos = (gabinetes || [])
      .filter(g => isGabineteExcluido(g.nome))
      .map(g => g.id)
    
    // Buscar todas as providências
    const { data: providencias, error: provError } = await supabase
      .from('providencias')
      .select('id, status, prioridade, prazo_estimado, created_at, data_conclusao, gabinete_id, orgao_destino_id')
    
    if (provError) {
      console.error('Erro ao buscar providências:', provError)
      return NextResponse.json({ error: 'Erro ao buscar providências' }, { status: 500 })
    }
    
    // Filtrar providências de gabinetes excluídos
    const providenciasFiltradas = (providencias || []).filter(
      p => !gabineteIdsExcluidos.includes(p.gabinete_id)
    )
    
    // Calcular estatísticas
    const total = providenciasFiltradas.length
    const hoje = new Date()
    
    // Por status
    const porStatus = {
      pendente: 0,
      em_analise: 0,
      em_andamento: 0,
      encaminhada: 0,
      concluida: 0
    }
    
    // Por prioridade
    const porPrioridade = {
      baixa: 0,
      media: 0,
      alta: 0,
      urgente: 0
    }
    
    // Atrasadas (prazo_estimado < hoje e não concluída)
    let atrasadas = 0
    
    // Tempo médio de resolução (em dias)
    let temposResolucao: number[] = []
    
    // Por período (últimos 6 meses)
    const porMes: { [key: string]: number } = {}
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    providenciasFiltradas.forEach(p => {
      // Status
      const status = p.status?.toLowerCase() || 'pendente'
      if (status === 'concluido' || status === 'concluida') {
        porStatus.concluida++
      } else if (status in porStatus) {
        porStatus[status as keyof typeof porStatus]++
      }
      
      // Prioridade
      const prioridade = p.prioridade?.toLowerCase() || 'media'
      if (prioridade in porPrioridade) {
        porPrioridade[prioridade as keyof typeof porPrioridade]++
      }
      
      // Atrasadas
      if (p.prazo_estimado && status !== 'concluido' && status !== 'concluida') {
        const prazo = new Date(p.prazo_estimado)
        if (prazo < hoje) {
          atrasadas++
        }
      }
      
      // Tempo de resolução
      if ((status === 'concluido' || status === 'concluida') && p.data_conclusao && p.created_at) {
        const inicio = new Date(p.created_at)
        const fim = new Date(p.data_conclusao)
        const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
        if (dias >= 0) {
          temposResolucao.push(dias)
        }
      }
      
      // Por mês
      if (p.created_at) {
        const data = new Date(p.created_at)
        const mesAno = `${meses[data.getMonth()]}/${data.getFullYear().toString().slice(-2)}`
        porMes[mesAno] = (porMes[mesAno] || 0) + 1
      }
    })
    
    // Calcular tempo médio
    const tempoMedio = temposResolucao.length > 0
      ? Math.round(temposResolucao.reduce((a, b) => a + b, 0) / temposResolucao.length)
      : 0
    
    // Taxa de resolução
    const taxaResolucao = total > 0 
      ? Math.round((porStatus.concluida / total) * 100) 
      : 0
    
    // Ordenar por mês (últimos 6 meses)
    const ultimosMeses = Object.entries(porMes)
      .sort((a, b) => {
        const [mesA, anoA] = a[0].split('/')
        const [mesB, anoB] = b[0].split('/')
        const idxA = meses.indexOf(mesA) + parseInt(anoA) * 12
        const idxB = meses.indexOf(mesB) + parseInt(anoB) * 12
        return idxB - idxA
      })
      .slice(0, 6)
      .reverse()
    
    return NextResponse.json({
      total,
      atrasadas,
      tempoMedio,
      taxaResolucao,
      porStatus,
      porPrioridade,
      porMes: Object.fromEntries(ultimosMeses)
    })
    
  } catch (error) {
    console.error('Erro na API de estatísticas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
