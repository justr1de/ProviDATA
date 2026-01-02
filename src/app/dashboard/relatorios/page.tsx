'use client'

import { useState, useEffect } from 'react'
import { 
  FileBarChart, 
  Download, 
  Calendar, 
  Filter,
  FileText,
  Users,
  Building2,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Providencia {
  id: string
  protocolo: string
  titulo: string
  descricao: string
  status: string
  prioridade: string
  created_at: string
  updated_at: string
  cidadao?: any
  orgao?: any
  categoria?: any
}

const reportTypes = [
  {
    id: 'providencias-periodo',
    name: 'Providências por Período',
    description: 'Relatório detalhado de todas as providências em um período específico',
    icon: FileText,
    color: '#16a34a'
  },
  {
    id: 'providencias-status',
    name: 'Providências por Status',
    description: 'Análise das providências agrupadas por status atual',
    icon: CheckCircle,
    color: '#6366f1'
  },
  {
    id: 'providencias-orgao',
    name: 'Providências por Órgão',
    description: 'Distribuição das providências por órgão destinatário',
    icon: Building2,
    color: '#f59e0b'
  },
  {
    id: 'atendimentos-cidadao',
    name: 'Atendimentos por Cidadão',
    description: 'Histórico de atendimentos e providências por cidadão',
    icon: Users,
    color: '#ec4899'
  },
  {
    id: 'tempo-resolucao',
    name: 'Tempo de Resolução',
    description: 'Análise do tempo médio de resolução das providências',
    icon: Clock,
    color: '#8b5cf6'
  },
  {
    id: 'desempenho-geral',
    name: 'Desempenho Geral',
    description: 'Visão geral do desempenho do gabinete no período',
    icon: TrendingUp,
    color: '#14b8a6'
  }
]

export default function RelatoriosPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null)
  const { user, tenant } = useAuthStore()
  const supabase = createClient()

  // Função para formatar data no formato YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // Função para formatar data para exibição
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR')
  }

  // Função para aplicar atalhos de data
  const applyDateShortcut = (shortcut: string) => {
    const today = new Date()
    let start: Date
    let end: Date = today

    switch (shortcut) {
      case 'Hoje':
        start = today
        break
      case 'Esta semana':
        start = new Date(today)
        start.setDate(today.getDate() - today.getDay())
        break
      case 'Este mês':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case 'Este ano':
        start = new Date(today.getFullYear(), 0, 1)
        break
      default:
        return
    }

    setDateRange({
      start: formatDate(start),
      end: formatDate(end)
    })
    setActiveShortcut(shortcut)
  }

  // Função para buscar providências do banco
  const fetchProvidencias = async (): Promise<Providencia[]> => {
    if (!user?.gabinete_id) return []

    let query = supabase
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
        orgao:orgaos(nome, sigla),
        categoria:categorias(nome)
      `)
      .eq('gabinete_id', user.gabinete_id)

    if (dateRange.start) {
      query = query.gte('created_at', dateRange.start)
    }
    if (dateRange.end) {
      query = query.lte('created_at', dateRange.end + 'T23:59:59')
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar providências:', error)
      return []
    }

    // Mapear os dados para normalizar arrays em objetos
    const mappedData = (data || []).map((item: any) => ({
      ...item,
      cidadao: Array.isArray(item.cidadao) ? item.cidadao[0] : item.cidadao,
      orgao: Array.isArray(item.orgao) ? item.orgao[0] : item.orgao,
      categoria: Array.isArray(item.categoria) ? item.categoria[0] : item.categoria
    }))
    return mappedData
  }

  // Função para gerar PDF
  const generatePDF = async () => {
    if (!selectedReport) return

    setIsGenerating(true)

    try {
      const providencias = await fetchProvidencias()
      const reportType = reportTypes.find(r => r.id === selectedReport)
      
      // Criar documento PDF
      const doc = new jsPDF()
      
      // Configurar fonte
      doc.setFont('helvetica')
      
      // Cabeçalho
      doc.setFontSize(20)
      doc.setTextColor(22, 163, 74) // Verde
      doc.text('ProviDATA', 14, 20)
      
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text('Sistema de Gestão de Providências Parlamentares', 14, 27)
      
      // Linha separadora
      doc.setDrawColor(22, 163, 74)
      doc.setLineWidth(0.5)
      doc.line(14, 32, 196, 32)
      
      // Título do relatório
      doc.setFontSize(16)
      doc.setTextColor(0)
      doc.text(reportType?.name || 'Relatório', 14, 45)
      
      // Informação do Gabinete do Parlamentar
      doc.setFontSize(11)
      doc.setTextColor(60)
      console.log('Tenant para relatório:', tenant)
      const cargoMap: Record<string, string> = {
        'vereador': 'Vereador',
        'deputado_estadual': 'Deputado Estadual',
        'deputado_federal': 'Deputado Federal',
        'senador': 'Senador'
      }
      // Usa 'deputado_estadual' como valor padrão se cargo estiver vazio
      const cargoValue = tenant?.cargo || 'deputado_estadual'
      const cargoFormatado = cargoMap[cargoValue] || 'Deputado Estadual'
      const nomeParlamentar = tenant?.parlamentar_name || ''
      const apelidoParlamentar = tenant?.parlamentar_nickname ? `"${tenant.parlamentar_nickname}"` : ''
      const gabineteText = nomeParlamentar 
        ? `Gabinete do ${cargoFormatado} ${nomeParlamentar} ${apelidoParlamentar}`.trim()
        : `Gabinete do ${cargoFormatado}`
      doc.text(gabineteText, 14, 52)
      
      // Período
      doc.setFontSize(10)
      doc.setTextColor(100)
      const periodoText = dateRange.start && dateRange.end 
        ? `Período: ${formatDateDisplay(dateRange.start)} a ${formatDateDisplay(dateRange.end)}`
        : 'Período: Todos os registros'
      doc.text(periodoText, 14, 59)
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 65)
      
      // Gerar conteúdo baseado no tipo de relatório
      switch (selectedReport) {
        case 'providencias-periodo':
          generateProvidenciasPeriodo(doc, providencias)
          break
        case 'providencias-status':
          generateProvidenciasStatus(doc, providencias)
          break
        case 'providencias-orgao':
          generateProvidenciasOrgao(doc, providencias)
          break
        case 'atendimentos-cidadao':
          generateAtendimentosCidadao(doc, providencias)
          break
        case 'tempo-resolucao':
          generateTempoResolucao(doc, providencias)
          break
        case 'desempenho-geral':
          generateDesempenhoGeral(doc, providencias)
          break
      }
      
      // Rodapé
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
          `Página ${i} de ${pageCount} | ProviDATA - DATA-RO Inteligência Territorial`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        )
      }
      
      // Baixar PDF
      const fileName = `${reportType?.id || 'relatorio'}_${formatDate(new Date())}.pdf`
      doc.save(fileName)
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar o relatório. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Relatório: Providências por Período
  const generateProvidenciasPeriodo = (doc: jsPDF, providencias: Providencia[]) => {
    const tableData = providencias.map(p => [
      p.protocolo || '-',
      (p.titulo || '').substring(0, 30) + ((p.titulo?.length || 0) > 30 ? '...' : ''),
      p.cidadao?.nome || '-',
      p.status || '-',
      formatDateDisplay(p.created_at)
    ])

    autoTable(doc, {
      startY: 72,
      head: [['Protocolo', 'Título', 'Cidadão', 'Status', 'Data']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 }
      }
    })

    // Resumo
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text(`Total de providências: ${providencias.length}`, 14, finalY)
  }

  // Relatório: Providências por Status
  const generateProvidenciasStatus = (doc: jsPDF, providencias: Providencia[]) => {
    const statusCount: Record<string, number> = {}
    providencias.forEach(p => {
      const status = p.status || 'Não definido'
      statusCount[status] = (statusCount[status] || 0) + 1
    })

    const tableData = Object.entries(statusCount).map(([status, count]) => [
      status,
      count.toString(),
      `${((count / providencias.length) * 100).toFixed(1)}%`
    ])

    autoTable(doc, {
      startY: 72,
      head: [['Status', 'Quantidade', 'Percentual']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 10 }
    })

    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.text(`Total geral: ${providencias.length} providências`, 14, finalY)
  }

  // Relatório: Providências por Órgão
  const generateProvidenciasOrgao = (doc: jsPDF, providencias: Providencia[]) => {
    const orgaoCount: Record<string, number> = {}
    providencias.forEach(p => {
      const orgao = p.orgao?.sigla || p.orgao?.nome || 'Não definido'
      orgaoCount[orgao] = (orgaoCount[orgao] || 0) + 1
    })

    const tableData = Object.entries(orgaoCount)
      .sort((a, b) => b[1] - a[1])
      .map(([orgao, count]) => [
        orgao,
        count.toString(),
        `${((count / providencias.length) * 100).toFixed(1)}%`
      ])

    autoTable(doc, {
      startY: 72,
      head: [['Órgão', 'Quantidade', 'Percentual']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11] },
      styles: { fontSize: 10 }
    })
  }

  // Relatório: Atendimentos por Cidadão
  const generateAtendimentosCidadao = (doc: jsPDF, providencias: Providencia[]) => {
    const cidadaoCount: Record<string, number> = {}
    providencias.forEach(p => {
      const cidadao = p.cidadao?.nome || 'Não identificado'
      cidadaoCount[cidadao] = (cidadaoCount[cidadao] || 0) + 1
    })

    const tableData = Object.entries(cidadaoCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([cidadao, count]) => [cidadao, count.toString()])

    autoTable(doc, {
      startY: 72,
      head: [['Cidadão', 'Atendimentos']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [236, 72, 153] },
      styles: { fontSize: 10 }
    })

    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.text(`Exibindo os 20 cidadãos com mais atendimentos`, 14, finalY)
  }

  // Relatório: Tempo de Resolução
  const generateTempoResolucao = (doc: jsPDF, providencias: Providencia[]) => {
    const concluidas = providencias.filter(p => p.status === 'concluida')
    
    let tempoTotal = 0
    concluidas.forEach(p => {
      const inicio = new Date(p.created_at)
      const fim = new Date(p.updated_at)
      tempoTotal += (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
    })

    const tempoMedio = concluidas.length > 0 ? tempoTotal / concluidas.length : 0

    doc.setFontSize(12)
    doc.text('Análise de Tempo de Resolução', 14, 77)
    
    const tableData = [
      ['Total de providências', providencias.length.toString()],
      ['Providências concluídas', concluidas.length.toString()],
      ['Tempo médio de resolução', `${tempoMedio.toFixed(1)} dias`],
      ['Taxa de conclusão', `${((concluidas.length / providencias.length) * 100).toFixed(1)}%`]
    ]

    autoTable(doc, {
      startY: 82,
      head: [['Métrica', 'Valor']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] },
      styles: { fontSize: 10 }
    })
  }

  // Relatório: Desempenho Geral
  const generateDesempenhoGeral = (doc: jsPDF, providencias: Providencia[]) => {
    const statusCount: Record<string, number> = {}
    const prioridadeCount: Record<string, number> = {}
    
    providencias.forEach(p => {
      statusCount[p.status || 'Não definido'] = (statusCount[p.status || 'Não definido'] || 0) + 1
      prioridadeCount[p.prioridade || 'normal'] = (prioridadeCount[p.prioridade || 'normal'] || 0) + 1
    })

    doc.setFontSize(12)
    doc.text('Resumo por Status', 14, 77)

    autoTable(doc, {
      startY: 82,
      head: [['Status', 'Quantidade']],
      body: Object.entries(statusCount).map(([k, v]) => [k, v.toString()]),
      theme: 'striped',
      headStyles: { fillColor: [20, 184, 166] },
      styles: { fontSize: 10 }
    })

    const finalY1 = (doc as any).lastAutoTable.finalY + 15
    doc.text('Resumo por Prioridade', 14, finalY1)

    autoTable(doc, {
      startY: finalY1 + 5,
      head: [['Prioridade', 'Quantidade']],
      body: Object.entries(prioridadeCount).map(([k, v]) => [k, v.toString()]),
      theme: 'striped',
      headStyles: { fillColor: [20, 184, 166] },
      styles: { fontSize: 10 }
    })

    const finalY2 = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(14)
    doc.setTextColor(22, 163, 74)
    doc.text(`Total de Providências: ${providencias.length}`, 14, finalY2)
  }

  // Estilos padronizados
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    overflow: 'hidden'
  }

  const cardHeaderStyle: React.CSSProperties = {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }

  const cardContentStyle: React.CSSProperties = {
    padding: '24px'
  }

  return (
    <div className="px-1 md:px-2">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <FileBarChart style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
          <h1 className="text-xl md:text-2xl lg:text-[28px] font-bold" style={{ color: 'var(--foreground)' }}>
            Relatórios
          </h1>
        </div>
        <p className="text-sm md:text-base" style={{ color: 'var(--foreground-muted)' }}>
          Gere relatórios detalhados sobre as providências e atendimentos do gabinete
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 lg:gap-6 items-stretch">
        {/* Report Types Card */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>
                Selecione o tipo de relatório
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>
                Escolha um dos relatórios disponíveis abaixo
              </p>
            </div>
          </div>
          <div style={cardContentStyle}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {reportTypes.map((report) => {
                const Icon = report.icon
                const isSelected = selectedReport === report.id
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'var(--primary-muted)' : 'var(--muted)',
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'transparent'}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: `${report.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon style={{ width: '22px', height: '22px', color: report.color }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>
                        {report.name}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', lineHeight: '1.4' }}>
                        {report.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Filter style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>
                Filtros
              </h2>
            </div>
          </div>
          <div style={{ ...cardContentStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* Date Range */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: 'var(--foreground)', 
                  marginBottom: '10px' 
                }}>
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  Período
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => {
                      setDateRange({ ...dateRange, start: e.target.value })
                      setActiveShortcut(null)
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => {
                      setDateRange({ ...dateRange, end: e.target.value })
                      setActiveShortcut(null)
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Quick Date Filters */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: 'var(--foreground)', 
                  marginBottom: '10px' 
                }}>
                  Atalhos
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Hoje', 'Esta semana', 'Este mês', 'Este ano'].map((label) => (
                    <button
                      key={label}
                      onClick={() => applyDateShortcut(label)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: activeShortcut === label ? 'var(--primary)' : 'var(--muted)',
                        border: `1px solid ${activeShortcut === label ? 'var(--primary)' : 'var(--border)'}`,
                        fontSize: '13px',
                        color: activeShortcut === label ? 'white' : 'var(--foreground)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacer to push button to bottom */}
              <div style={{ flex: 1 }} />

              {/* Generate Button */}
              <button
                onClick={generatePDF}
                disabled={!selectedReport || isGenerating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '14px 24px',
                  borderRadius: '10px',
                  backgroundColor: selectedReport ? 'var(--primary)' : 'var(--muted)',
                  color: selectedReport ? 'white' : 'var(--foreground-muted)',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: selectedReport ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
              >
                {isGenerating ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <Download style={{ width: '20px', height: '20px' }} />
                    Gerar Relatório PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
