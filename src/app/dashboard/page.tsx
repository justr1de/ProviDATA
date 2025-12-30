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
  PieChart
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
        const { data: statsData } = await supabase
          .from('dashboard_stats')
          .select('*')
          .eq('tenant_id', tenant.id)
          .single()

        if (statsData) {
          setStats(statsData)
        } else {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #22c55e', 
            borderTopColor: 'transparent', 
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const totalProvidencias = stats?.total_providencias || 0
  const concluidas = stats?.concluidas || 0
  const taxaConclusao = totalProvidencias > 0 ? Math.round((concluidas / totalProvidencias) * 100) : 0

  const statusData = [
    { label: 'Pendentes', value: stats?.pendentes || 0, color: '#f59e0b' },
    { label: 'Em Análise', value: stats?.em_analise || 0, color: '#3b82f6' },
    { label: 'Encaminhadas', value: stats?.encaminhadas || 0, color: '#a855f7' },
    { label: 'Em Andamento', value: stats?.em_andamento || 0, color: '#6366f1' },
    { label: 'Concluídas', value: stats?.concluidas || 0, color: '#22c55e' },
  ]

  const maxValue = Math.max(...statusData.map(d => d.value), 1)

  return (
    <div className="w-full max-w-full overflow-x-hidden flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--foreground)]">
            Dashboard de Providências
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Visão geral das demandas do gabinete · {tenant?.parlamentar_name || 'Gabinete'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)]">
            <option>2025</option>
            <option>2024</option>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total de Providências */}
        <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
              Total de Providências
            </span>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--foreground)]">
            {stats?.total_providencias?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Cadastradas no sistema</p>
        </div>

        {/* Pendentes */}
        <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
              Pendentes
            </span>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--foreground)]">
            {stats?.pendentes || 0}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Aguardando análise</p>
        </div>

        {/* Em Andamento */}
        <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
              Em Andamento
            </span>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--foreground)]">
            {(stats?.em_analise || 0) + (stats?.encaminhadas || 0) + (stats?.em_andamento || 0)}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Em processamento</p>
        </div>

        {/* Concluídas */}
        <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
              Concluídas
            </span>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--foreground)]">
            {stats?.concluidas || 0}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Finalizadas com sucesso</p>
        </div>
      </div>

      {/* Taxa de Conclusão */}
      <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Taxa de Conclusão</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Providências concluídas vs total</p>
          </div>
          <span className="text-2xl font-bold text-green-500">{taxaConclusao}%</span>
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
            <div className="bg-red-500/5 rounded-xl border border-red-500/20 p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 dark:text-red-400">
                    {stats?.urgentes} Providência(s) Urgente(s)
                  </h4>
                  <p className="text-sm text-red-600 mt-1">
                    Requerem atenção imediata
                  </p>
                </div>
                <Link href="/dashboard/providencias?prioridade=urgente">
                  <button className="px-3 py-1.5 text-sm font-medium text-red-700 border border-red-700/30 rounded-lg hover:bg-red-500/10 transition-colors">
                    Ver
                  </button>
                </Link>
              </div>
            </div>
          )}
          {(stats?.atrasadas || 0) > 0 && (
            <div className="bg-orange-500/5 rounded-xl border border-orange-500/20 p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-400">
                    {stats?.atrasadas} Providência(s) Atrasada(s)
                  </h4>
                  <p className="text-sm text-orange-600 mt-1">
                    Prazo vencido, verificar situação
                  </p>
                </div>
                <Link href="/dashboard/providencias?status=atrasadas">
                  <button className="px-3 py-1.5 text-sm font-medium text-orange-700 border border-orange-700/30 rounded-lg hover:bg-orange-500/10 transition-colors">
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
        {/* Gráfico de Barras */}
        <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-[var(--muted-foreground)]" />
            <h3 className="font-semibold text-[var(--foreground)]">Providências por Status</h3>
          </div>
          <div className="flex flex-col gap-4">
            {statusData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--foreground)]">{item.label}</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">{item.value}</span>
                </div>
                <div className="w-full h-2.5 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(item.value / maxValue) * 100}%`, 
                      backgroundColor: item.color 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Pizza */}
        <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-[var(--muted-foreground)]" />
            <h3 className="font-semibold text-[var(--foreground)]">Distribuição de Status</h3>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  const total = statusData.reduce((acc, item) => acc + item.value, 0) || 1
                  let currentAngle = 0
                  
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
                        fill={item.color}
                        className="cursor-pointer transition-opacity hover:opacity-80"
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
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-[var(--muted-foreground)]">{item.label}</span>
                <span className="text-xs font-medium text-[var(--foreground)] ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Providências Recentes */}
      <div className="bg-[var(--background)] rounded-xl border border-[var(--border)]">
        <div className="flex items-center justify-between p-5 sm:px-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--muted-foreground)]" />
            <h3 className="font-semibold text-[var(--foreground)]">Providências Recentes</h3>
          </div>
          <Link href="/dashboard/providencias">
            <button className="flex items-center gap-1 text-sm text-green-600 font-medium hover:text-green-700 transition-colors">
              Ver Todas
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
        
        {recentProvidencias.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <h4 className="font-medium text-[var(--foreground)] mb-2">Nenhuma providência cadastrada</h4>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Comece cadastrando a primeira providência do gabinete
            </p>
            <Link href="/dashboard/providencias/nova">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
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
                className="block hover:bg-[var(--muted)]/50 transition-colors"
              >
                <div className="flex items-center gap-4 p-4 sm:px-6">
                  <div 
                    className="w-1 h-12 rounded-sm shrink-0"
                    style={{ backgroundColor: statusColors[providencia.status]?.replace('bg-', '') || '#6b7280' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-[var(--muted-foreground)]">
                        {providencia.numero_protocolo}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        priorityColors[providencia.prioridade]?.includes('gray') ? 'bg-gray-500/10 text-gray-600' :
                        priorityColors[providencia.prioridade]?.includes('blue') ? 'bg-blue-500/10 text-blue-600' :
                        priorityColors[providencia.prioridade]?.includes('orange') ? 'bg-orange-500/10 text-orange-600' :
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {priorityLabels[providencia.prioridade]}
                      </span>
                    </div>
                    <h4 className="font-medium text-[var(--foreground)] truncate">
                      {providencia.titulo}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      {providencia.cidadao && (
                        <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                          <Users className="w-3 h-3" />
                          {providencia.cidadao.nome}
                        </span>
                      )}
                      {providencia.orgao_destino && (
                        <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                          <Building2 className="w-3 h-3" />
                          {providencia.orgao_destino.sigla || providencia.orgao_destino.nome}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(providencia.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-lg ${
                      providencia.status === 'concluido' ? 'bg-green-500/10 text-green-600' :
                      providencia.status === 'pendente' ? 'bg-amber-500/10 text-amber-600' :
                      providencia.status === 'em_andamento' ? 'bg-indigo-500/10 text-indigo-600' :
                      'bg-gray-500/10 text-gray-600'
                    }`}>
                      {statusLabels[providencia.status]}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Fonte dos Dados */}
      <div className="bg-[var(--muted)] rounded-xl p-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1">Sistema</p>
            <p className="text-sm font-medium text-[var(--foreground)]">ProviDATA</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1">Gabinete</p>
            <p className="text-sm font-medium text-[var(--foreground)]">{tenant?.parlamentar_name || 'Não definido'}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1">Período</p>
            <p className="text-sm font-medium text-[var(--foreground)]">2024 - 2025</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1">Última Atualização</p>
            <p className="text-sm font-medium text-[var(--foreground)]">{format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
