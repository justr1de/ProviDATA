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
  Loader2
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

      // Buscar estatísticas
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

      // Buscar providências recentes
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard de Providências
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visão geral das demandas do gabinete · {tenant?.parlamentar_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
          <Link href="/dashboard/providencias/nova">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Providência</span>
              <span className="sm:hidden">Nova</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            </div>
          </div>
        </div>

        {/* Pendentes */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendentes}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pendentes</p>
            </div>
          </div>
        </div>

        {/* Em Andamento */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.em_andamento}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Em Andamento</p>
            </div>
          </div>
        </div>

        {/* Concluídas */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.concluidas}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Concluídas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Taxa de Conclusão */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Taxa de Conclusão</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Providências concluídas vs total</p>
          </div>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">{taxaConclusao}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-600 rounded-full transition-all duration-500"
            style={{ width: `${taxaConclusao}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Concluídas: {stats.concluidas}</span>
          <span>Total: {stats.total}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Providências por Status</h3>
          </div>
          <div className="space-y-3">
            {chartData.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(item.value / maxChartValue) * 100}%`,
                      backgroundColor: item.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart (simplified) */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Distribuição de Status</h3>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                </div>
              </div>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-gray-200 dark:text-gray-700"
                />
                {stats.total > 0 && (
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="12"
                    strokeDasharray={`${(stats.concluidas / stats.total) * 352} 352`}
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {chartData.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-300">{item.label}</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Providencias */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Providências Recentes</h3>
          </div>
          <Link href="/dashboard/providencias">
            <button className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
              Ver Todas
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
        
        {recentProvidencias.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Nenhuma providência cadastrada</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Comece cadastrando a primeira providência do gabinete
            </p>
            <Link href="/dashboard/providencias/nova">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
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
                <div className="flex items-center gap-4 p-4">
                  <div 
                    className="w-1 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusColors[providencia.status] || '#6b7280' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {providencia.numero_protocolo}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        providencia.prioridade === 'urgente' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        providencia.prioridade === 'alta' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                        providencia.prioridade === 'normal' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {priorityLabels[providencia.prioridade]}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {providencia.titulo}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      {providencia.cidadao && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Users className="w-3 h-3" />
                          {providencia.cidadao.nome}
                        </span>
                      )}
                      {providencia.orgao_destino && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Building2 className="w-3 h-3" />
                          {providencia.orgao_destino.sigla || providencia.orgao_destino.nome}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(providencia.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-lg ${
                      providencia.status === 'concluido' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      providencia.status === 'pendente' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                      providencia.status === 'em_andamento' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {statusLabels[providencia.status]}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Sistema</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">ProviDATA</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Gabinete</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{tenant?.parlamentar_name || 'Não definido'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Período</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">2024 - 2025</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Última Atualização</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
