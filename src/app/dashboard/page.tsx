'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Plus,
  ArrowRight,
  BarChart3,
  PieChart,
  Calendar,
  TrendingUp,
  Loader2,
  ChevronRight,
  Activity,
  X,
  Settings2,
  LayoutDashboard,
  LineChart,
  ScatterChart,
  Flame
} from 'lucide-react'

interface Providencia {
  id: string
  numero_protocolo: string
  titulo: string
  status: string
  prioridade: string
  created_at: string
  cidadao?: { nome: string }
  orgao_destino?: { nome: string; sigla?: string }
}

interface Stats {
  total: number
  pendentes: number
  em_andamento: number
  concluidas: number
  em_analise: number
  encaminhadas: number
}

interface CustomChart {
  id: string
  type: string
  title: string
  xAxis: string
  yAxis: string
  filters: string[]
}

const statusColors: Record<string, string> = {
  pendente: '#f59e0b',
  em_analise: '#3b82f6',
  encaminhado: '#8b5cf6',
  em_andamento: '#6366f1',
  concluido: '#22c55e',
}

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  em_analise: 'Em Análise',
  encaminhado: 'Encaminhada',
  em_andamento: 'Em Andamento',
  concluido: 'Concluída',
}

const chartTypes = [
  { id: 'pizza', name: 'Pizza', icon: PieChart },
  { id: 'barras', name: 'Barras', icon: BarChart3 },
  { id: 'colunas', name: 'Colunas', icon: Activity },
  { id: 'linha', name: 'Linha', icon: LineChart },
  { id: 'dispersao', name: 'Dispersão', icon: ScatterChart },
  { id: 'calor', name: 'Calor', icon: Flame },
]

const dataFields = [
  { id: 'status', name: 'Status', category: 'Providências' },
  { id: 'prioridade', name: 'Prioridade', category: 'Providências' },
  { id: 'categoria', name: 'Categoria/Tipo', category: 'Providências' },
  { id: 'orgao_destino', name: 'Órgão de Destino', category: 'Providências' },
  { id: 'data_criacao', name: 'Data de Criação', category: 'Providências' },
  { id: 'cidadao_bairro', name: 'Bairro do Cidadão', category: 'Cidadãos' },
  { id: 'cidadao_cidade', name: 'Cidade do Cidadão', category: 'Cidadãos' },
  { id: 'mes', name: 'Mês', category: 'Tempo' },
  { id: 'ano', name: 'Ano', category: 'Tempo' },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pendentes: 0,
    em_andamento: 0,
    concluidas: 0,
    em_analise: 0,
    encaminhadas: 0,
  })
  const [recentProvidencias, setRecentProvidencias] = useState<Providencia[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showChartBuilder, setShowChartBuilder] = useState(true)
  const [selectedChartType, setSelectedChartType] = useState('pizza')
  const [selectedXAxis, setSelectedXAxis] = useState('status')
  const [selectedYAxis, setSelectedYAxis] = useState('quantidade')
  const [customCharts, setCustomCharts] = useState<CustomChart[]>([])
  const [generatingChart, setGeneratingChart] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const supabase = createClient()
  const { tenant } = useAuthStore()

  useEffect(() => {
    if (tenant?.id) {
      loadDashboardData()
    }
  }, [tenant?.id, selectedYear])

  const loadDashboardData = async () => {
    if (!tenant?.id) return
    
    setLoading(true)
    try {
      const startOfYear = new Date(selectedYear, 0, 1).toISOString()
      const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString()

      const { data: providencias } = await supabase
        .from('providencias')
        .select('status')
        .eq('tenant_id', tenant.id)
        .gte('created_at', startOfYear)
        .lte('created_at', endOfYear)

      if (providencias) {
        const newStats: Stats = {
          total: providencias.length,
          pendentes: providencias.filter(p => p.status === 'pendente').length,
          em_andamento: providencias.filter(p => p.status === 'em_andamento').length,
          concluidas: providencias.filter(p => p.status === 'concluido').length,
          em_analise: providencias.filter(p => p.status === 'em_analise').length,
          encaminhadas: providencias.filter(p => p.status === 'encaminhado').length,
        }
        setStats(newStats)
      }

      const { data: recent } = await supabase
        .from('providencias')
        .select(`
          id,
          numero_protocolo,
          titulo,
          status,
          prioridade,
          created_at,
          cidadao:cidadaos(nome),
          orgao_destino:orgaos(nome, sigla)
        `)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recent) {
        setRecentProvidencias(recent as unknown as Providencia[])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateChart = () => {
    setGeneratingChart(true)
    const xField = dataFields.find(f => f.id === selectedXAxis)
    const newChart: CustomChart = {
      id: Date.now().toString(),
      type: selectedChartType,
      title: `${xField?.name || selectedXAxis} por Quantidade`,
      xAxis: selectedXAxis,
      yAxis: selectedYAxis,
      filters: []
    }
    setTimeout(() => {
      setCustomCharts(prev => [...prev, newChart])
      setGeneratingChart(false)
    }, 500)
  }

  const handleRemoveChart = (chartId: string) => {
    setCustomCharts(prev => prev.filter(c => c.id !== chartId))
  }

  const taxaConclusao = stats.total > 0 
    ? Math.round((stats.concluidas / stats.total) * 100) 
    : 0

  const chartData = [
    { label: 'Pendentes', value: stats.pendentes, color: '#f59e0b' },
    { label: 'Em Análise', value: stats.em_analise, color: '#3b82f6' },
    { label: 'Encaminhadas', value: stats.encaminhadas, color: '#8b5cf6' },
    { label: 'Em Andamento', value: stats.em_andamento, color: '#6366f1' },
    { label: 'Concluídas', value: stats.concluidas, color: '#22c55e' },
  ]

  const maxChartValue = Math.max(...chartData.map(d => d.value), 1)

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        backgroundColor: '#f9fafb'
      }}>
        <Loader2 style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite', color: '#16a34a' }} />
      </div>
    )
  }

  return (
    <div style={{ 
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      padding: '24px'
    }}>
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Área Principal */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                }}>
                  <LayoutDashboard style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <h1 style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#111827',
                    margin: 0
                  }}>
                    Dashboard de Providências
                  </h1>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280',
                    margin: '4px 0 0 0'
                  }}>
                    Visão geral das demandas · {tenant?.parlamentar_name || 'Gabinete'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{
                    padding: '10px 16px',
                    fontSize: '14px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontWeight: '500',
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
                <Link href="/dashboard/providencias/nova">
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                  }}>
                    <Plus style={{ width: '18px', height: '18px' }} />
                    Nova Providência
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Total */}
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  backgroundColor: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FileText style={{ width: '24px', height: '24px', color: '#2563eb' }} />
                </div>
                <div>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>{stats.total}</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '4px 0 0 0' }}>Total</p>
                </div>
              </div>
            </div>

            {/* Pendentes */}
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  backgroundColor: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clock style={{ width: '24px', height: '24px', color: '#d97706' }} />
                </div>
                <div>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>{stats.pendentes}</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '4px 0 0 0' }}>Pendentes</p>
                </div>
              </div>
            </div>

            {/* Em Andamento */}
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  backgroundColor: '#e0e7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <TrendingUp style={{ width: '24px', height: '24px', color: '#4f46e5' }} />
                </div>
                <div>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>{stats.em_andamento}</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '4px 0 0 0' }}>Em Andamento</p>
                </div>
              </div>
            </div>

            {/* Concluídas */}
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <CheckCircle2 style={{ width: '24px', height: '24px', color: '#16a34a' }} />
                </div>
                <div>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>{stats.concluidas}</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '4px 0 0 0' }}>Concluídas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Taxa de Conclusão */}
          <div style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>Taxa de Conclusão</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Providências concluídas vs total</p>
              </div>
              <span style={{ fontSize: '32px', fontWeight: '700', color: '#16a34a' }}>{taxaConclusao}%</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '12px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                height: '100%', 
                background: 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)',
                borderRadius: '6px',
                width: `${taxaConclusao}%`,
                transition: 'width 0.5s ease'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
              <span>Concluídas: {stats.concluidas}</span>
              <span>Total: {stats.total}</span>
            </div>
          </div>

          {/* Gráficos */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Providências por Status */}
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px',
                  backgroundColor: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BarChart3 style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>Providências por Status</h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>Distribuição atual</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {chartData.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '100px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>{item.label}</span>
                    <div style={{ flex: 1, height: '24px', backgroundColor: '#f3f4f6', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        borderRadius: '6px',
                        width: `${(item.value / maxChartValue) * 100}%`,
                        backgroundColor: item.color,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <span style={{ width: '32px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color: '#111827' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribuição de Status */}
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px',
                  backgroundColor: '#f3e8ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PieChart style={{ width: '20px', height: '20px', color: '#9333ea' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>Distribuição de Status</h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>Visão proporcional</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
                <div style={{ position: 'relative' }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="60" fill="none" stroke="#22c55e" strokeWidth="20"
                      strokeDasharray={`${(stats.concluidas / Math.max(stats.total, 1)) * 377} 377`}
                      transform="rotate(-90 80 80)" />
                    <circle cx="80" cy="80" r="60" fill="none" stroke="#6366f1" strokeWidth="20"
                      strokeDasharray={`${(stats.em_andamento / Math.max(stats.total, 1)) * 377} 377`}
                      strokeDashoffset={`-${(stats.concluidas / Math.max(stats.total, 1)) * 377}`}
                      transform="rotate(-90 80 80)" />
                    <circle cx="80" cy="80" r="60" fill="none" stroke="#f59e0b" strokeWidth="20"
                      strokeDasharray={`${(stats.pendentes / Math.max(stats.total, 1)) * 377} 377`}
                      strokeDashoffset={`-${((stats.concluidas + stats.em_andamento) / Math.max(stats.total, 1)) * 377}`}
                      transform="rotate(-90 80 80)" />
                  </svg>
                  <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <span style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{stats.total}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Total</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px' }}>
                {chartData.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#4b5563', flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gráficos Personalizados */}
          {customCharts.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
              marginBottom: '24px'
            }}>
              {customCharts.map((chart) => {
                const ChartIcon = chartTypes.find(t => t.id === chart.type)?.icon || PieChart
                return (
                  <div key={chart.id} style={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '10px',
                          backgroundColor: '#dcfce7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ChartIcon style={{ width: '20px', height: '20px', color: '#16a34a' }} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>{chart.title}</h3>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                            Gráfico de {chartTypes.find(t => t.id === chart.type)?.name}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveChart(chart.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: '#9ca3af'
                        }}
                      >
                        <X style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                    <div style={{ 
                      height: '160px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px',
                      border: '2px dashed #e5e7eb'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <ChartIcon style={{ width: '40px', height: '40px', color: '#d1d5db', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Gráfico será renderizado aqui</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Providências Recentes */}
          <div style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            marginBottom: '24px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px',
                  backgroundColor: '#ffedd5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock style={{ width: '20px', height: '20px', color: '#ea580c' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>Providências Recentes</h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>Últimas atualizações</p>
                </div>
              </div>
              <Link href="/dashboard/providencias">
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  color: '#16a34a',
                  fontWeight: '600',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Ver Todas
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </Link>
            </div>
            
            {recentProvidencias.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '16px',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <FileText style={{ width: '32px', height: '32px', color: '#9ca3af' }} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>Nenhuma providência cadastrada</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Comece cadastrando a primeira providência do gabinete
                </p>
                <Link href="/dashboard/providencias/nova">
                  <button style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                    <Plus style={{ width: '18px', height: '18px' }} />
                    Nova Providência
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                {recentProvidencias.map((providencia, index) => (
                  <Link
                    key={providencia.id}
                    href={`/dashboard/providencias/${providencia.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '16px',
                      padding: '20px 24px',
                      borderBottom: index < recentProvidencias.length - 1 ? '1px solid #e5e7eb' : 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}>
                      <div style={{ 
                        width: '6px', 
                        height: '48px', 
                        borderRadius: '3px',
                        backgroundColor: statusColors[providencia.status] || '#6b7280',
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ 
                            fontSize: '12px', 
                            fontFamily: 'monospace',
                            color: '#6b7280',
                            backgroundColor: '#f3f4f6',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            {providencia.numero_protocolo}
                          </span>
                          <span style={{ 
                            padding: '2px 10px',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderRadius: '9999px',
                            backgroundColor: providencia.status === 'concluido' ? '#dcfce7' :
                              providencia.status === 'pendente' ? '#fef3c7' :
                              providencia.status === 'em_andamento' ? '#e0e7ff' : '#f3f4f6',
                            color: providencia.status === 'concluido' ? '#16a34a' :
                              providencia.status === 'pendente' ? '#d97706' :
                              providencia.status === 'em_andamento' ? '#4f46e5' : '#6b7280'
                          }}>
                            {statusLabels[providencia.status]}
                          </span>
                        </div>
                        <h4 style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#111827',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {providencia.titulo}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                            <Calendar style={{ width: '14px', height: '14px' }} />
                            {format(new Date(providencia.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      <ChevronRight style={{ width: '20px', height: '20px', color: '#9ca3af', flexShrink: 0 }} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div style={{ 
            backgroundColor: '#f3f4f6',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', margin: '0 0 4px 0' }}>Sistema</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>ProviDATA</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', margin: '0 0 4px 0' }}>Gabinete</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant?.parlamentar_name || 'Não definido'}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', margin: '0 0 4px 0' }}>Período</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>2024 - 2025</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', margin: '0 0 4px 0' }}>Atualização</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>{format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Lateral - Criador de Gráficos */}
        {showChartBuilder && (
          <div style={{ width: '320px', flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: '24px' }}>
              <div style={{ 
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                overflow: 'hidden'
              }}>
                {/* Header do Painel */}
                <div style={{ 
                  padding: '20px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '10px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Settings2 style={{ width: '20px', height: '20px', color: 'white' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', margin: 0 }}>Criar Gráfico</h3>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '2px 0 0 0' }}>Personalize sua visualização</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowChartBuilder(false)}
                      style={{
                        padding: '6px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'white'
                      }}
                    >
                      <X style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  {/* Tipo de Gráfico */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '12px'
                    }}>
                      Tipo de Gráfico
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {chartTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedChartType(type.id)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '12px 8px',
                            borderRadius: '10px',
                            border: selectedChartType === type.id ? '2px solid #16a34a' : '2px solid #e5e7eb',
                            backgroundColor: selectedChartType === type.id ? '#f0fdf4' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <type.icon style={{ 
                            width: '20px', 
                            height: '20px', 
                            color: selectedChartType === type.id ? '#16a34a' : '#9ca3af'
                          }} />
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '600',
                            color: selectedChartType === type.id ? '#16a34a' : '#6b7280'
                          }}>{type.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Eixo X */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '8px'
                    }}>
                      Eixo X (Categorias)
                    </label>
                    <select
                      value={selectedXAxis}
                      onChange={(e) => setSelectedXAxis(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: '#374151'
                      }}
                    >
                      <optgroup label="Providências">
                        {dataFields.filter(f => f.category === 'Providências').map(field => (
                          <option key={field.id} value={field.id}>{field.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Cidadãos">
                        {dataFields.filter(f => f.category === 'Cidadãos').map(field => (
                          <option key={field.id} value={field.id}>{field.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Tempo">
                        {dataFields.filter(f => f.category === 'Tempo').map(field => (
                          <option key={field.id} value={field.id}>{field.name}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Eixo Y */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '8px'
                    }}>
                      Eixo Y (Valores)
                    </label>
                    <select
                      value={selectedYAxis}
                      onChange={(e) => setSelectedYAxis(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: '#374151'
                      }}
                    >
                      <option value="quantidade">Quantidade</option>
                      <option value="tempo_resolucao">Tempo de Resolução</option>
                    </select>
                  </div>

                  {/* Período */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '8px'
                    }}>
                      Período
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: '14px',
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          color: '#374151'
                        }}
                      />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: '14px',
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          color: '#374151'
                        }}
                      />
                    </div>
                  </div>

                  {/* Botão Gerar */}
                  <button
                    onClick={handleGenerateChart}
                    disabled={generatingChart}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      backgroundColor: generatingChart ? '#86efac' : '#16a34a',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '700',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: generatingChart ? 'not-allowed' : 'pointer',
                      marginBottom: '16px'
                    }}
                  >
                    {generatingChart ? (
                      <>
                        <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Plus style={{ width: '18px', height: '18px' }} />
                        Gerar Gráfico
                      </>
                    )}
                  </button>

                  {/* Dica */}
                  <div style={{ 
                    backgroundColor: '#eff6ff',
                    borderRadius: '10px',
                    padding: '14px'
                  }}>
                    <p style={{ fontSize: '12px', color: '#1d4ed8', lineHeight: '1.5', margin: 0 }}>
                      <strong>Dica:</strong> Combine diferentes campos para criar análises personalizadas. Os gráficos gerados aparecerão na área principal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
