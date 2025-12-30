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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--foreground)', margin: 0 }}>
            Dashboard de Providências
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
            Visão geral das demandas do gabinete · {tenant?.parlamentar_name || 'Gabinete'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select style={{ 
            padding: '8px 16px', 
            fontSize: '14px', 
            backgroundColor: 'var(--background)', 
            border: '1px solid var(--border)', 
            borderRadius: '8px',
            color: 'var(--foreground)'
          }}>
            <option>2025</option>
            <option>2024</option>
          </select>
          <Link href="/dashboard/providencias/nova">
            <button style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 16px', 
              backgroundColor: '#16a34a', 
              color: 'white', 
              fontSize: '14px', 
              fontWeight: '500', 
              borderRadius: '8px', 
              border: 'none',
              cursor: 'pointer'
            }}>
              <Plus style={{ width: '16px', height: '16px' }} />
              Nova Providência
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total de Providências */}
        <div style={{ 
          backgroundColor: 'var(--background)', 
          borderRadius: '12px', 
          border: '1px solid var(--border)', 
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total de Providências
            </span>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <FileText style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            </div>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--foreground)', margin: 0 }}>
            {stats?.total_providencias?.toLocaleString() || 0}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Cadastradas no sistema</p>
        </div>

        {/* Pendentes */}
        <div style={{ 
          backgroundColor: 'var(--background)', 
          borderRadius: '12px', 
          border: '1px solid var(--border)', 
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pendentes
            </span>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(245, 158, 11, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Clock style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            </div>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--foreground)', margin: 0 }}>
            {stats?.pendentes || 0}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Aguardando análise</p>
        </div>

        {/* Em Andamento */}
        <div style={{ 
          backgroundColor: 'var(--background)', 
          borderRadius: '12px', 
          border: '1px solid var(--border)', 
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Em Andamento
            </span>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(168, 85, 247, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <TrendingUp style={{ width: '20px', height: '20px', color: '#a855f7' }} />
            </div>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--foreground)', margin: 0 }}>
            {(stats?.em_analise || 0) + (stats?.encaminhadas || 0) + (stats?.em_andamento || 0)}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Em processamento</p>
        </div>

        {/* Concluídas */}
        <div style={{ 
          backgroundColor: 'var(--background)', 
          borderRadius: '12px', 
          border: '1px solid var(--border)', 
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Concluídas
            </span>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(34, 197, 94, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <CheckCircle2 style={{ width: '20px', height: '20px', color: '#22c55e' }} />
            </div>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--foreground)', margin: 0 }}>
            {stats?.concluidas || 0}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Finalizadas com sucesso</p>
        </div>
      </div>

      {/* Taxa de Conclusão */}
      <div style={{ 
        backgroundColor: 'var(--background)', 
        borderRadius: '12px', 
        border: '1px solid var(--border)', 
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>Taxa de Conclusão</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>Providências concluídas vs total</p>
          </div>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>{taxaConclusao}%</span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '12px', 
          backgroundColor: 'var(--muted)', 
          borderRadius: '6px', 
          overflow: 'hidden' 
        }}>
          <div style={{ 
            height: '100%', 
            width: `${taxaConclusao}%`, 
            background: 'linear-gradient(to right, #22c55e, #16a34a)', 
            borderRadius: '6px',
            transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
          <span>Concluídas: {concluidas}</span>
          <span>Total: {totalProvidencias}</span>
        </div>
      </div>

      {/* Alertas */}
      {((stats?.atrasadas || 0) > 0 || (stats?.urgentes || 0) > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {(stats?.urgentes || 0) > 0 && (
            <div style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.05)', 
              borderRadius: '12px', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              padding: '20px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertTriangle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: '600', color: '#991b1b', margin: 0 }}>
                    {stats?.urgentes} Providência(s) Urgente(s)
                  </h4>
                  <p style={{ fontSize: '14px', color: '#dc2626', marginTop: '4px' }}>
                    Requerem atenção imediata
                  </p>
                </div>
                <Link href="/dashboard/providencias?prioridade=urgente">
                  <button style={{ 
                    padding: '6px 12px', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#b91c1c', 
                    border: '1px solid rgba(185, 28, 28, 0.3)', 
                    borderRadius: '8px', 
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  }}>
                    Ver
                  </button>
                </Link>
              </div>
            </div>
          )}
          {(stats?.atrasadas || 0) > 0 && (
            <div style={{ 
              backgroundColor: 'rgba(249, 115, 22, 0.05)', 
              borderRadius: '12px', 
              border: '1px solid rgba(249, 115, 22, 0.2)', 
              padding: '20px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(249, 115, 22, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clock style={{ width: '20px', height: '20px', color: '#ea580c' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: '600', color: '#9a3412', margin: 0 }}>
                    {stats?.atrasadas} Providência(s) Atrasada(s)
                  </h4>
                  <p style={{ fontSize: '14px', color: '#ea580c', marginTop: '4px' }}>
                    Prazo vencido, verificar situação
                  </p>
                </div>
                <Link href="/dashboard/providencias?status=atrasadas">
                  <button style={{ 
                    padding: '6px 12px', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#c2410c', 
                    border: '1px solid rgba(194, 65, 12, 0.3)', 
                    borderRadius: '8px', 
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  }}>
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
        <div style={{ 
          backgroundColor: 'var(--background)', 
          borderRadius: '12px', 
          border: '1px solid var(--border)', 
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <BarChart3 style={{ width: '20px', height: '20px', color: 'var(--muted-foreground)' }} />
            <h3 style={{ fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>Providências por Status</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {statusData.map((item, index) => (
              <div key={index}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>{item.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>{item.value}</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '10px', 
                  backgroundColor: 'var(--muted)', 
                  borderRadius: '5px', 
                  overflow: 'hidden' 
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${(item.value / maxValue) * 100}%`, 
                    backgroundColor: item.color, 
                    borderRadius: '5px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Pizza */}
        <div style={{ 
          backgroundColor: 'var(--background)', 
          borderRadius: '12px', 
          border: '1px solid var(--border)', 
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <PieChart style={{ width: '20px', height: '20px', color: 'var(--muted-foreground)' }} />
            <h3 style={{ fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>Distribuição de Status</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px' }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
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
                        style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                      />
                    )
                  })
                })()}
                <circle cx="50" cy="50" r="25" fill="var(--background)" />
              </svg>
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--foreground)', margin: 0 }}>{totalProvidencias}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>Total</p>
                </div>
              </div>
            </div>
          </div>
          {/* Legenda */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '24px' }}>
            {statusData.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }} />
                <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--foreground)', marginLeft: 'auto' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Providências Recentes */}
      <div style={{ 
        backgroundColor: 'var(--background)', 
        borderRadius: '12px', 
        border: '1px solid var(--border)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '20px 24px', 
          borderBottom: '1px solid var(--border)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText style={{ width: '20px', height: '20px', color: 'var(--muted-foreground)' }} />
            <h3 style={{ fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>Providências Recentes</h3>
          </div>
          <Link href="/dashboard/providencias">
            <button style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              fontSize: '14px', 
              color: '#16a34a', 
              fontWeight: '500', 
              background: 'none', 
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
              borderRadius: '50%', 
              backgroundColor: 'var(--muted)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px' 
            }}>
              <FileText style={{ width: '32px', height: '32px', color: 'var(--muted-foreground)' }} />
            </div>
            <h4 style={{ fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>Nenhuma providência cadastrada</h4>
            <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '16px' }}>
              Comece cadastrando a primeira providência do gabinete
            </p>
            <Link href="/dashboard/providencias/nova">
              <button style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px 16px', 
                backgroundColor: '#16a34a', 
                color: 'white', 
                fontSize: '14px', 
                fontWeight: '500', 
                borderRadius: '8px', 
                border: 'none',
                cursor: 'pointer'
              }}>
                <Plus style={{ width: '16px', height: '16px' }} />
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
                  alignItems: 'center', 
                  gap: '16px', 
                  padding: '16px 24px',
                  borderBottom: index < recentProvidencias.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}>
                  <div style={{ 
                    width: '4px', 
                    height: '48px', 
                    borderRadius: '2px', 
                    backgroundColor: statusColors[providencia.status]?.replace('bg-', '') || '#6b7280'
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--muted-foreground)' }}>
                        {providencia.numero_protocolo}
                      </span>
                      <span style={{ 
                        padding: '2px 8px', 
                        fontSize: '11px', 
                        fontWeight: '500', 
                        borderRadius: '9999px',
                        backgroundColor: priorityColors[providencia.prioridade]?.includes('gray') ? 'rgba(107, 114, 128, 0.1)' :
                                        priorityColors[providencia.prioridade]?.includes('blue') ? 'rgba(59, 130, 246, 0.1)' :
                                        priorityColors[providencia.prioridade]?.includes('orange') ? 'rgba(249, 115, 22, 0.1)' :
                                        'rgba(239, 68, 68, 0.1)',
                        color: priorityColors[providencia.prioridade]?.includes('gray') ? '#4b5563' :
                               priorityColors[providencia.prioridade]?.includes('blue') ? '#2563eb' :
                               priorityColors[providencia.prioridade]?.includes('orange') ? '#ea580c' :
                               '#dc2626'
                      }}>
                        {priorityLabels[providencia.prioridade]}
                      </span>
                    </div>
                    <h4 style={{ 
                      fontWeight: '500', 
                      color: 'var(--foreground)', 
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {providencia.titulo}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                      {providencia.cidadao && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          <Users style={{ width: '12px', height: '12px' }} />
                          {providencia.cidadao.nome}
                        </span>
                      )}
                      {providencia.orgao_destino && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          <Building2 style={{ width: '12px', height: '12px' }} />
                          {providencia.orgao_destino.sigla || providencia.orgao_destino.nome}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                        <Calendar style={{ width: '12px', height: '12px' }} />
                        {format(new Date(providencia.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      fontSize: '12px', 
                      fontWeight: '500', 
                      borderRadius: '8px',
                      backgroundColor: providencia.status === 'concluido' ? 'rgba(34, 197, 94, 0.1)' :
                                      providencia.status === 'pendente' ? 'rgba(245, 158, 11, 0.1)' :
                                      providencia.status === 'em_andamento' ? 'rgba(99, 102, 241, 0.1)' :
                                      'rgba(107, 114, 128, 0.1)',
                      color: providencia.status === 'concluido' ? '#16a34a' :
                             providencia.status === 'pendente' ? '#d97706' :
                             providencia.status === 'em_andamento' ? '#4f46e5' :
                             '#4b5563'
                    }}>
                      {statusLabels[providencia.status]}
                    </span>
                    <ArrowRight style={{ width: '16px', height: '16px', color: 'var(--muted-foreground)' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Fonte dos Dados */}
      <div style={{ 
        backgroundColor: 'var(--muted)', 
        borderRadius: '12px', 
        padding: '16px 24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Sistema</p>
            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', margin: 0 }}>ProviDATA</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Gabinete</p>
            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', margin: 0 }}>{tenant?.parlamentar_name || 'Não definido'}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Período</p>
            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', margin: 0 }}>2024 - 2025</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Última Atualização</p>
            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', margin: 0 }}>{format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
