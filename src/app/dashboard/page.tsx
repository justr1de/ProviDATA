'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  Users,
  Building2,
  BarChart3,
  PieChart,
  Filter
} from 'lucide-react'
import type { Providencia, DashboardStats } from '@/types/database'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  em_analise: 'Em Análise',
  encaminhado: 'Encaminhado',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
}

const statusColors: Record<string, string> = {
  pendente: 'bg-amber-500',
  em_analise: 'bg-blue-500',
  encaminhado: 'bg-purple-500',
  em_andamento: 'bg-indigo-500',
  concluido: 'bg-green-500',
  arquivado: 'bg-gray-500',
}

const priorityLabels: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}

const priorityColors: Record<string, string> = {
  baixa: 'bg-gray-100 text-gray-700',
  media: 'bg-blue-100 text-blue-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentProvidencias, setRecentProvidencias] = useState<Providencia[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { tenant } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!tenant) return

      try {
        // Carregar estatísticas
        const { data: statsData } = await supabase
          .from('dashboard_stats')
          .select('*')
          .eq('tenant_id', tenant.id)
          .single()

        if (statsData) {
          setStats(statsData)
        } else {
          // Se não houver dados, criar estatísticas zeradas
          setStats({
            tenant_id: tenant.id,
            total_providencias: 0,
            pendentes: 0,
            em_analise: 0,
            encaminhadas: 0,
            em_andamento: 0,
            concluidas: 0,
            arquivadas: 0,
            urgentes: 0,
            atrasadas: 0,
            este_mes: 0,
          })
        }

        // Carregar providências recentes
        const { data: providenciasData } = await supabase
          .from('providencias')
          .select(`
            *,
            cidadao:cidadaos(nome),
            categoria:categorias(nome, cor),
            orgao_destino:orgaos(nome, sigla)
          `)
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })
          .limit(8)

        if (providenciasData) {
          setRecentProvidencias(providenciasData)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [tenant, supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--muted-foreground)]">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const totalProvidencias = stats?.total_providencias || 0
  const concluidas = stats?.concluidas || 0
  const taxaConclusao = totalProvidencias > 0 ? Math.round((concluidas / totalProvidencias) * 100) : 0

  // Dados para o gráfico de barras (simulado)
  const statusData = [
    { label: 'Pendentes', value: stats?.pendentes || 0, color: 'bg-amber-500' },
    { label: 'Em Análise', value: stats?.em_analise || 0, color: 'bg-blue-500' },
    { label: 'Encaminhadas', value: stats?.encaminhadas || 0, color: 'bg-purple-500' },
    { label: 'Em Andamento', value: stats?.em_andamento || 0, color: 'bg-indigo-500' },
    { label: 'Concluídas', value: stats?.concluidas || 0, color: 'bg-green-500' },
  ]

  const maxValue = Math.max(...statusData.map(d => d.value), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard de Providências</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Visão geral das demandas do gabinete · {tenant?.parlamentar_name || 'Gabinete'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
            <option>2025</option>
            <option>2024</option>
          </select>
          <Link href="/dashboard/providencias/nova">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Nova Providência
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total de Providências */}
        <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Total de Providências</span>
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--foreground)]">{stats?.total_providencias?.toLocaleString() || 0}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Cadastradas no sistema</p>
        </div>

        {/* Pendentes */}
        <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Pendentes</span>
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--foreground)]">{stats?.pendentes || 0}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Aguardando análise</p>
        </div>

        {/* Em Andamento */}
        <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Em Andamento</span>
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--foreground)]">
            {(stats?.em_analise || 0) + (stats?.encaminhadas || 0) + (stats?.em_andamento || 0)}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Em processamento</p>
        </div>

        {/* Concluídas */}
        <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Concluídas</span>
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--foreground)]">{stats?.concluidas || 0}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Finalizadas com sucesso</p>
        </div>
      </div>

      {/* Taxa de Conclusão */}
      <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Taxa de Conclusão</h3>
            <p className="text-xs text-[var(--muted-foreground)]">Providências concluídas vs total</p>
          </div>
          <span className="text-2xl font-bold text-green-600">{taxaConclusao}%</span>
        </div>
        <div className="w-full h-3 bg-[var(--muted)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
            style={{ width: `${taxaConclusao}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[var(--muted-foreground)]">
          <span>Concluídas: {concluidas}</span>
          <span>Total: {totalProvidencias}</span>
        </div>
      </div>

      {/* Alertas */}
      {((stats?.atrasadas || 0) > 0 || (stats?.urgentes || 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(stats?.urgentes || 0) > 0 && (
            <div className="bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800 p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800 dark:text-red-200">
                    {stats?.urgentes} Providência(s) Urgente(s)
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    Requerem atenção imediata
                  </p>
                </div>
                <Link href="/dashboard/providencias?prioridade=urgente">
                  <button className="px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                    Ver
                  </button>
                </Link>
              </div>
            </div>
          )}
          {(stats?.atrasadas || 0) > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800 p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                    {stats?.atrasadas} Providência(s) Atrasada(s)
                  </h4>
                  <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                    Prazo vencido, verificar situação
                  </p>
                </div>
                <Link href="/dashboard/providencias?status=atrasadas">
                  <button className="px-3 py-1.5 text-sm font-medium text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors">
                    Ver
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Status */}
        <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-[var(--muted-foreground)]" />
            <h3 className="font-semibold text-[var(--foreground)]">Providências por Status</h3>
          </div>
          <div className="space-y-4">
            {statusData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--foreground)]">{item.label}</span>
                  <span className="font-medium text-[var(--foreground)]">{item.value}</span>
                </div>
                <div className="w-full h-2.5 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Pizza - Distribuição */}
        <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-[var(--muted-foreground)]" />
            <h3 className="font-semibold text-[var(--foreground)]">Distribuição de Status</h3>
          </div>
          <div className="flex items-center justify-center">
            {/* Gráfico de Pizza SVG */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {(() => {
                  const total = statusData.reduce((acc, item) => acc + item.value, 0) || 1
                  let currentAngle = 0
                  const colors = ['#f59e0b', '#3b82f6', '#a855f7', '#6366f1', '#22c55e']
                  
                  return statusData.map((item, index) => {
                    const percentage = (item.value / total) * 100
                    const angle = (percentage / 100) * 360
                    const startAngle = currentAngle
                    currentAngle += angle
                    
                    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                    const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180)
                    const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180)
                    const largeArc = angle > 180 ? 1 : 0
                    
                    if (item.value === 0) return null
                    
                    return (
                      <path
                        key={index}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={colors[index]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    )
                  })
                })()}
                <circle cx="50" cy="50" r="25" fill="var(--background)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--foreground)]">{totalProvidencias}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Total</p>
                </div>
              </div>
            </div>
          </div>
          {/* Legenda */}
          <div className="grid grid-cols-2 gap-2 mt-6">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-[var(--muted-foreground)]">{item.label}</span>
                <span className="font-medium text-[var(--foreground)] ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Providências Recentes */}
      <div className="bg-[var(--background)] rounded-xl border border-[var(--border)]">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--muted-foreground)]" />
            <h3 className="font-semibold text-[var(--foreground)]">Providências Recentes</h3>
          </div>
          <Link href="/dashboard/providencias">
            <button className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
              Ver Todas
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
        
        {recentProvidencias.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <h4 className="font-medium text-[var(--foreground)] mb-2">Nenhuma providência cadastrada</h4>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
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
          <div className="divide-y divide-[var(--border)]">
            {recentProvidencias.map((providencia) => (
              <Link
                key={providencia.id}
                href={`/dashboard/providencias/${providencia.id}`}
                className="flex items-center gap-4 p-4 hover:bg-[var(--muted)] transition-colors"
              >
                <div className={`w-2 h-12 rounded-full ${statusColors[providencia.status]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[var(--muted-foreground)]">
                      {providencia.numero_protocolo}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[providencia.prioridade]}`}>
                      {priorityLabels[providencia.prioridade]}
                    </span>
                  </div>
                  <h4 className="font-medium text-[var(--foreground)] truncate">{providencia.titulo}</h4>
                  <div className="flex items-center gap-4 mt-1 text-xs text-[var(--muted-foreground)]">
                    {providencia.cidadao && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {providencia.cidadao.nome}
                      </span>
                    )}
                    {providencia.orgao_destino && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {providencia.orgao_destino.sigla || providencia.orgao_destino.nome}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(providencia.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-lg ${
                    providencia.status === 'concluido' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    providencia.status === 'pendente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    providencia.status === 'em_andamento' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {statusLabels[providencia.status]}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Fonte dos Dados */}
      <div className="bg-[var(--muted)] rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1">Sistema</p>
            <p className="font-medium text-[var(--foreground)]">ProviDATA</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1">Gabinete</p>
            <p className="font-medium text-[var(--foreground)]">{tenant?.parlamentar_name || 'Não definido'}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1">Período</p>
            <p className="font-medium text-[var(--foreground)]">2024 - 2025</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1">Última Atualização</p>
            <p className="font-medium text-[var(--foreground)]">{format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
