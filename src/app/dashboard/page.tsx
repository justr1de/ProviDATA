'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  Users
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

const priorityLabels: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
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
          .limit(5)

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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total de Providências',
      value: stats?.total_providencias || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pendentes',
      value: stats?.pendentes || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Em Andamento',
      value: (stats?.em_analise || 0) + (stats?.encaminhadas || 0) + (stats?.em_andamento || 0),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Concluídas',
      value: stats?.concluidas || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Urgentes',
      value: stats?.urgentes || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Este Mês',
      value: stats?.este_mes || 0,
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-[var(--muted-foreground)]">
            Visão geral das providências do gabinete
          </p>
        </div>
        <Link href="/dashboard/providencias/nova">
          <Button>
            <Plus className="w-4 h-4" />
            Nova Providência
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas */}
      {(stats?.atrasadas || 0) > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-800 dark:text-red-200">
                {stats?.atrasadas} providência(s) com prazo vencido
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">
                Verifique as providências atrasadas e tome as medidas necessárias
              </p>
            </div>
            <Link href="/dashboard/providencias?status=atrasadas">
              <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                Ver Atrasadas
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent Providências */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Providências Recentes</CardTitle>
          <Link href="/dashboard/providencias">
            <Button variant="ghost" size="sm">
              Ver Todas
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentProvidencias.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="text-[var(--muted-foreground)]">
                Nenhuma providência cadastrada ainda
              </p>
              <Link href="/dashboard/providencias/nova">
                <Button className="mt-4">
                  <Plus className="w-4 h-4" />
                  Criar Primeira Providência
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProvidencias.map((providencia) => (
                <Link
                  key={providencia.id}
                  href={`/dashboard/providencias/${providencia.id}`}
                  className="block"
                >
                  <div className="flex items-start gap-4 p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-[var(--muted-foreground)]">
                          {providencia.numero_protocolo}
                        </span>
                        <Badge className={`status-${providencia.status}`}>
                          {statusLabels[providencia.status]}
                        </Badge>
                        <Badge className={`priority-${providencia.prioridade}`}>
                          {priorityLabels[providencia.prioridade]}
                        </Badge>
                      </div>
                      <h4 className="font-medium truncate">{providencia.titulo}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-[var(--muted-foreground)]">
                        {providencia.cidadao && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {providencia.cidadao.nome}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(providencia.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-[var(--muted-foreground)] pt-4 border-t border-[var(--border)]">
        <p>
          Desenvolvido por{' '}
          <a 
            href="https://dataro-it.com.br" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            DATA-RO INTELIGÊNCIA TERRITORIAL
          </a>
          . Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
