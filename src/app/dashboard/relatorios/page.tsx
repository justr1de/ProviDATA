'use client'

import { useState } from 'react'
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

  const handleGenerateReport = async () => {
    if (!selectedReport) return
    
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    
    alert('Funcionalidade de geração de relatórios será implementada em breve!')
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 lg:gap-6 items-start">
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

        {/* Filters Card - Alinhado com o card de relatórios */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Filter style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>
                Filtros
              </h2>
            </div>
          </div>
          <div style={cardContentStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Date Range */}
              <div>
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
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
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
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
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
              <div>
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
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--muted)',
                        border: '1px solid var(--border)',
                        fontSize: '13px',
                        color: 'var(--foreground)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateReport}
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
                  marginTop: '4px',
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
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download style={{ width: '20px', height: '20px' }} />
                    Gerar Relatório
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
