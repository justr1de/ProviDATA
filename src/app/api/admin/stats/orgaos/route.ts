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
    
    // Buscar todos os órgãos
    const { data: orgaos, error: orgaosError } = await supabase
      .from('orgaos')
      .select('id, nome, sigla, tipo, ativo, gabinete_id')
    
    if (orgaosError) {
      console.error('Erro ao buscar órgãos:', orgaosError)
      return NextResponse.json({ error: 'Erro ao buscar órgãos' }, { status: 500 })
    }
    
    // Filtrar órgãos de gabinetes excluídos
    const orgaosFiltrados = (orgaos || []).filter(
      o => !gabineteIdsExcluidos.includes(o.gabinete_id)
    )
    
    // Buscar providências para contar demandas por órgão
    const { data: providencias } = await supabase
      .from('providencias')
      .select('id, orgao_destino_id, status, gabinete_id')
    
    // Filtrar providências de gabinetes excluídos
    const providenciasFiltradas = (providencias || []).filter(
      p => !gabineteIdsExcluidos.includes(p.gabinete_id)
    )
    
    // Contar demandas por órgão
    const demandasPorOrgao: { [key: string]: { total: number; pendentes: number; concluidas: number } } = {}
    
    providenciasFiltradas.forEach(p => {
      if (p.orgao_destino_id) {
        if (!demandasPorOrgao[p.orgao_destino_id]) {
          demandasPorOrgao[p.orgao_destino_id] = { total: 0, pendentes: 0, concluidas: 0 }
        }
        demandasPorOrgao[p.orgao_destino_id].total++
        
        const status = p.status?.toLowerCase() || ''
        if (status === 'concluido' || status === 'concluida') {
          demandasPorOrgao[p.orgao_destino_id].concluidas++
        } else {
          demandasPorOrgao[p.orgao_destino_id].pendentes++
        }
      }
    })
    
    // Criar lista de órgãos com estatísticas
    const orgaosComStats = orgaosFiltrados.map(orgao => {
      const stats = demandasPorOrgao[orgao.id] || { total: 0, pendentes: 0, concluidas: 0 }
      return {
        id: orgao.id,
        nome: orgao.nome,
        sigla: orgao.sigla,
        tipo: orgao.tipo,
        ativo: orgao.ativo,
        demandas: stats.total,
        pendentes: stats.pendentes,
        concluidas: stats.concluidas,
        taxaResolucao: stats.total > 0 ? Math.round((stats.concluidas / stats.total) * 100) : 0
      }
    })
    
    // Ordenar por quantidade de demandas (decrescente)
    orgaosComStats.sort((a, b) => b.demandas - a.demandas)
    
    // Top 10 órgãos com mais demandas
    const top10 = orgaosComStats.slice(0, 10)
    
    // Estatísticas gerais
    const totalOrgaos = orgaosFiltrados.length
    const orgaosAtivos = orgaosFiltrados.filter(o => o.ativo).length
    const orgaosComDemandas = orgaosComStats.filter(o => o.demandas > 0).length
    
    // Distribuição por tipo
    const porTipo: { [key: string]: number } = {}
    orgaosFiltrados.forEach(o => {
      const tipo = o.tipo || 'Outros'
      porTipo[tipo] = (porTipo[tipo] || 0) + 1
    })
    
    return NextResponse.json({
      totalOrgaos,
      orgaosAtivos,
      orgaosComDemandas,
      porTipo,
      top10,
      todosOrgaos: orgaosComStats
    })
    
  } catch (error) {
    console.error('Erro na API de estatísticas de órgãos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
