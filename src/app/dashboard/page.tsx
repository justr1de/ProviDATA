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
  AlertCircle,
  Plus,
  ArrowRight,
  BarChart3,
  PieChart,
  Users,
  Building2,
  Calendar,
  TrendingUp,
  Loader2,
  ChevronDown,
  ChevronRight,
  Activity,
  Target,
  Layers,
  Filter,
  RefreshCw,
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

const priorityLabels: Record<string, string> = {
  baixa: 'Baixa',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente',
}

const chartTypes = [
  { id: 'pizza', name: 'Pizza', icon: PieChart },
  { id: 'barras', name: 'Barras', icon: BarChart3 },
  { id: 'colunas', name: 'Colunas', icon: Activity },
  { id: 'linha', name: 'Linha', icon: LineChart },
  { id: 'dispersao', name: 'Dispersão', icon: ScatterChart },
  { id: 'calor', name: 'Mapa de Calor', icon: Flame },
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
      const startDate = new Date(selectedYear, 0, 1).toISOString()
      const endDate = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString()

      const { data: providencias } = await supabase
        .from('providencias')
        .select('status')
        .eq('tenant_id', tenant.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="flex gap-8">
      {/* Área Principal */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <LayoutDashboard className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard de Providências
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                  Visão geral das demandas · {tenant?.parlamentar_name || 'Gabinete'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-5 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium"
              >
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
              <Link href="/dashboard/providencias/nova">
                <button className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-green-600/20">
                  <Plus className="w-5 h-5" />
                  <span>Nova Providência</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Total */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Total</p>
              </div>
            </div>
          </div>

          {/* Pendentes */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{stats.pendentes}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Pendentes</p>
              </div>
            </div>
          </div>

          {/* Em Andamento */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{stats.em_andamento}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Em Andamento</p>
              </div>
            </div>
          </div>

          {/* Concluídas */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{stats.concluidas}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Concluídas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Taxa de Conclusão */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Taxa de Conclusão</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Providências concluídas vs total</p>
            </div>
            <span className="text-4xl font-bold text-green-600 dark:text-green-400">{taxaConclusao}%</span>
          </div>
          <div className="w-full h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
              style={{ width: `${taxaConclusao}%` }}
            />
          </div>
          <div className="flex justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Concluídas: {stats.concluidas}</span>
            <span>Total: {stats.total}</span>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Providências por Status */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Providências por Status</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Distribuição atual</p>
              </div>
            </div>
            <div className="space-y-5">
              {chartData.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="w-28 text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
                  <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <div 
                      className="h-full rounded-lg transition-all duration-500"
                      style={{ 
                        width: `${(item.value / maxChartValue) * 100}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-bold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição de Status */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Distribuição de Status</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Visão proporcional</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="24"
                    strokeDasharray={`${(stats.concluidas / Math.max(stats.total, 1)) * 502} 502`}
                    transform="rotate(-90 100 100)"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="24"
                    strokeDasharray={`${(stats.em_andamento / Math.max(stats.total, 1)) * 502} 502`}
                    strokeDashoffset={`-${(stats.concluidas / Math.max(stats.total, 1)) * 502}`}
                    transform="rotate(-90 100 100)"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="24"
                    strokeDasharray={`${(stats.pendentes / Math.max(stats.total, 1)) * 502} 502`}
                    strokeDashoffset={`-${((stats.concluidas + stats.em_andamento) / Math.max(stats.total, 1)) * 502}`}
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {chartData.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráficos Personalizados */}
        {customCharts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {customCharts.map((chart) => {
              const ChartIcon = chartTypes.find(t => t.id === chart.type)?.icon || PieChart
              return (
                <div key={chart.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <ChartIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{chart.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Gráfico de {chartTypes.find(t => t.id === chart.type)?.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveChart(chart.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <ChartIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Gráfico será renderizado aqui</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{chart.xAxis} × {chart.yAxis}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Providências Recentes */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-8">
          <div className="flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Providências Recentes</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Últimas atualizações</p>
              </div>
            </div>
            <Link href="/dashboard/providencias">
              <button className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold">
                Ver Todas
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          
          {recentProvidencias.length === 0 ? (
            <div className="py-16 px-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nenhuma providência cadastrada</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                Comece cadastrando a primeira providência do gabinete
              </p>
              <Link href="/dashboard/providencias/nova">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-green-600/20">
                  <Plus className="w-5 h-5" />
                  Nova Providência
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentProvidencias.map((providencia) => (
                <Link
                  key={providencia.id}
                  href={`/dashboard/providencias/${providencia.id}`}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start gap-5 p-6">
                    <div 
                      className="w-2 h-16 rounded-full flex-shrink-0"
                      style={{ backgroundColor: statusColors[providencia.status] || '#6b7280' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                          {providencia.numero_protocolo}
                        </span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          providencia.status === 'concluido' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          providencia.status === 'pendente' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                          providencia.status === 'em_andamento' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {statusLabels[providencia.status]}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-base line-clamp-1">
                        {providencia.titulo}
                      </h4>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(providencia.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">Sistema</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">ProviDATA</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">Gabinete</p>
              <p className="text-base font-bold text-gray-900 dark:text-white truncate">{tenant?.parlamentar_name || 'Não definido'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">Período</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">2024 - 2025</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">Atualização</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Painel Lateral - Criador de Gráficos */}
      {showChartBuilder && (
        <div className="hidden xl:block w-96 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl">
              {/* Header do Painel */}
              <div className="p-6 bg-gradient-to-r from-green-500 to-green-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Settings2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Criar Gráfico</h3>
                      <p className="text-sm text-white/80">Personalize sua visualização</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowChartBuilder(false)}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Tipo de Gráfico */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Tipo de Gráfico
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {chartTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedChartType(type.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          selectedChartType === type.id
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <type.icon className={`w-6 h-6 ${
                          selectedChartType === type.id
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-400'
                        }`} />
                        <span className={`text-xs font-semibold ${
                          selectedChartType === type.id
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eixo X */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Eixo X (Categorias)
                  </label>
                  <select
                    value={selectedXAxis}
                    onChange={(e) => setSelectedXAxis(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Eixo Y (Valores)
                  </label>
                  <select
                    value={selectedYAxis}
                    onChange={(e) => setSelectedYAxis(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="quantidade">Quantidade</option>
                    <option value="tempo_resolucao">Tempo de Resolução</option>
                  </select>
                </div>

                {/* Período */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Período
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Botão Gerar */}
                <button
                  onClick={handleGenerateChart}
                  disabled={generatingChart}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-green-600/20"
                >
                  {generatingChart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Gerar Gráfico
                    </>
                  )}
                </button>

                {/* Dica */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    <strong>Dica:</strong> Combine diferentes campos para criar análises personalizadas. Os gráficos gerados aparecerão na área principal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
