'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { 
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Building,
  Building2,
  BarChart3,
  PieChart,
  Calendar,
  Loader2,
  LogOut,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Target,
  Timer,
  Activity,
  ArrowLeft,
  Users
} from 'lucide-react'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { AIChat } from '@/components/ai-chat'

// Tipos para as estatísticas
interface ProvidenciasStats {
  total: number
  atrasadas: number
  tempoMedio: number
  taxaResolucao: number
  porStatus: {
    pendente: number
    em_analise: number
    em_andamento: number
    encaminhada: number
    concluida: number
  }
  porPrioridade: {
    baixa: number
    media: number
    alta: number
    urgente: number
  }
  porMes: { [key: string]: number }
}

interface OrgaoStats {
  id: string
  nome: string
  sigla: string | null
  tipo: string | null
  demandas: number
  pendentes: number
  concluidas: number
  taxaResolucao: number
}

interface OrgaosStats {
  totalOrgaos: number
  orgaosAtivos: number
  orgaosComDemandas: number
  porTipo: { [key: string]: number }
  top10: OrgaoStats[]
  todosOrgaos: OrgaoStats[]
}

// Função para formatar status
function formatarStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    pendente: 'Pendente',
    em_analise: 'Em Análise',
    em_andamento: 'Em Andamento',
    encaminhada: 'Encaminhada',
    concluida: 'Concluída',
    concluido: 'Concluído'
  }
  return statusMap[status] || status
}

// Cores para os status
const STATUS_COLORS: { [key: string]: string } = {
  pendente: '#f59e0b',
  em_analise: '#3b82f6',
  em_andamento: '#8b5cf6',
  encaminhada: '#06b6d4',
  concluida: '#22c55e'
}

// Cores para prioridades
const PRIORIDADE_COLORS: { [key: string]: string } = {
  baixa: '#22c55e',
  media: '#3b82f6',
  alta: '#f59e0b',
  urgente: '#ef4444'
}

export default function IndicadoresPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  
  const [loading, setLoading] = useState(true)
  const [providenciasStats, setProvidenciasStats] = useState<ProvidenciasStats | null>(null)
  const [orgaosStats, setOrgaosStats] = useState<OrgaosStats | null>(null)
  const [activeTab, setActiveTab] = useState<'providencias' | 'orgaos'>('providencias')
  
  // Carregar estatísticas
  const carregarStats = useCallback(async () => {
    setLoading(true)
    try {
      // Carregar estatísticas de providências
      const provResponse = await fetch('/api/admin/stats/providencias')
      if (provResponse.ok) {
        const provData = await provResponse.json()
        setProvidenciasStats(provData)
      }
      
      // Carregar estatísticas de órgãos
      const orgResponse = await fetch('/api/admin/stats/orgaos')
      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        setOrgaosStats(orgData)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      toast.error('Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }, [])
  
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logout realizado com sucesso!')
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast.error('Erro ao fazer logout')
    }
  }, [supabase, router])
  
  useEffect(() => {
    carregarStats()
  }, [carregarStats])
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link href="/admin/gabinetes" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Image
                  src="/providata-logo-rounded.png"
                  alt="ProviDATA"
                  width={180}
                  height={50}
                  style={{ height: '40px', width: 'auto', borderRadius: '8px' }}
                  priority
                />
              </Link>
              <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border)' }} />
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{ 
                  fontSize: '20px', 
                  fontWeight: 700, 
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  Indicadores
                </span>
                {/* Efeito de reflexo/espelho */}
                <span style={{ 
                  position: 'absolute',
                  left: 0,
                  top: '100%',
                  fontSize: '20px', 
                  fontWeight: 700, 
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  transform: 'scaleY(-1)',
                  opacity: 0.15,
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)',
                  pointerEvents: 'none'
                }}>
                  Indicadores
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                href="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(6, 182, 212, 0.25)'
                }}
              >
                <Building2 size={18} />
                Meu Gabinete
              </Link>
              <Link
                href="/admin/gabinetes"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
                }}
              >
                <Users size={18} />
                Gabinetes
              </Link>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: 'var(--destructive)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={18} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Conteúdo Principal */}
      <main style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '24px 32px'
      }}>
        {/* Título */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
            Indicadores de Providências
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', marginTop: '4px' }}>
            Acompanhe as métricas e indicadores de todas as providências do sistema (excluindo gabinetes de demonstração)
          </p>
        </div>
        
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            color: 'var(--foreground-muted)'
          }}>
            <Loader2 style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
            <span style={{ marginLeft: '12px', fontSize: '16px' }}>Carregando estatísticas...</span>
          </div>
        ) : (
          <>
            {/* Cards de Resumo */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }} className="stats-grid">
              {/* Total de Providências */}
              <div className="stat-card" style={{
                backgroundColor: 'var(--card)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid var(--border)',
                transition: 'all 0.2s',
                cursor: 'default'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '10px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '10px'
                  }}>
                    <FileText style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>
                      Total de Providências
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
                      {providenciasStats?.total || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Taxa de Resolução */}
              <div className="stat-card" style={{
                backgroundColor: 'var(--card)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '10px',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '10px'
                  }}>
                    <Target style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>
                      Taxa de Resolução
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e', margin: 0 }}>
                      {providenciasStats?.taxaResolucao || 0}%
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Tempo Médio */}
              <div className="stat-card" style={{
                backgroundColor: 'var(--card)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '10px',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '10px'
                  }}>
                    <Timer style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>
                      Tempo Médio (dias)
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6', margin: 0 }}>
                      {providenciasStats?.tempoMedio || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Atrasadas */}
              <div className="stat-card" style={{
                backgroundColor: 'var(--card)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '10px'
                  }}>
                    <AlertTriangle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>
                      Atrasadas
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444', margin: 0 }}>
                      {providenciasStats?.atrasadas || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '24px',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '16px'
            }}>
              <button
                onClick={() => setActiveTab('providencias')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: activeTab === 'providencias' ? '#16a34a' : 'var(--background)',
                  color: activeTab === 'providencias' ? 'white' : 'var(--foreground)',
                  border: activeTab === 'providencias' ? 'none' : '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <BarChart3 size={18} />
                Providências por Status
              </button>
              <button
                onClick={() => setActiveTab('orgaos')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: activeTab === 'orgaos' ? '#16a34a' : 'var(--background)',
                  color: activeTab === 'orgaos' ? 'white' : 'var(--foreground)',
                  border: activeTab === 'orgaos' ? 'none' : '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Building size={18} />
                Demandas por Órgão
              </button>
            </div>
            
            {activeTab === 'providencias' && providenciasStats && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="charts-grid">
                {/* Gráfico de Status */}
                <div style={{
                  backgroundColor: 'var(--card)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid var(--border)'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', color: 'var(--foreground)' }}>
                    Distribuição por Status
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(providenciasStats.porStatus).map(([status, count]) => {
                      const total = Object.values(providenciasStats.porStatus).reduce((a, b) => a + b, 0)
                      const percent = total > 0 ? Math.round((count / total) * 100) : 0
                      return (
                        <div key={status}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>
                              {formatarStatus(status)}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                              {count} ({percent}%)
                            </span>
                          </div>
                          <div style={{
                            height: '8px',
                            backgroundColor: 'var(--background)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${percent}%`,
                              backgroundColor: STATUS_COLORS[status] || '#6b7280',
                              borderRadius: '4px',
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* Gráfico de Prioridade */}
                <div style={{
                  backgroundColor: 'var(--card)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid var(--border)'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', color: 'var(--foreground)' }}>
                    Distribuição por Prioridade
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(providenciasStats.porPrioridade).map(([prioridade, count]) => {
                      const total = Object.values(providenciasStats.porPrioridade).reduce((a, b) => a + b, 0)
                      const percent = total > 0 ? Math.round((count / total) * 100) : 0
                      return (
                        <div key={prioridade}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--foreground)', textTransform: 'capitalize' }}>
                              {prioridade === 'media' ? 'Média' : prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                              {count} ({percent}%)
                            </span>
                          </div>
                          <div style={{
                            height: '8px',
                            backgroundColor: 'var(--background)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${percent}%`,
                              backgroundColor: PRIORIDADE_COLORS[prioridade] || '#6b7280',
                              borderRadius: '4px',
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* Gráfico de Evolução Mensal */}
                <div style={{
                  backgroundColor: 'var(--card)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid var(--border)',
                  gridColumn: 'span 2'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', color: 'var(--foreground)' }}>
                    Evolução Mensal
                  </h3>
                  {Object.keys(providenciasStats.porMes).length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px' }}>
                      {Object.entries(providenciasStats.porMes).map(([mes, count]) => {
                        const maxCount = Math.max(...Object.values(providenciasStats.porMes))
                        const height = maxCount > 0 ? (count / maxCount) * 100 : 0
                        return (
                          <div key={mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                              {count}
                            </span>
                            <div style={{
                              width: '100%',
                              height: `${height}%`,
                              minHeight: '4px',
                              backgroundColor: '#16a34a',
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.5s ease'
                            }} />
                            <span style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '8px' }}>
                              {mes}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '200px',
                      color: 'var(--foreground-muted)'
                    }}>
                      <p>Nenhum dado disponível para o período</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'orgaos' && orgaosStats && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }} className="orgaos-grid">
                {/* Cards de Resumo de Órgãos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    backgroundColor: 'var(--card)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        padding: '10px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '10px'
                      }}>
                        <Building style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>
                          Total de Órgãos
                        </p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
                          {orgaosStats.totalOrgaos}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    backgroundColor: 'var(--card)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        padding: '10px',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '10px'
                      }}>
                        <CheckCircle2 style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>
                          Órgãos Ativos
                        </p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e', margin: 0 }}>
                          {orgaosStats.orgaosAtivos}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    backgroundColor: 'var(--card)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        padding: '10px',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: '10px'
                      }}>
                        <Activity style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>
                          Com Demandas
                        </p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6', margin: 0 }}>
                          {orgaosStats.orgaosComDemandas}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tabela de Top 10 Órgãos */}
                <div style={{
                  backgroundColor: 'var(--card)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid var(--border)'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', color: 'var(--foreground)' }}>
                    Top 10 Órgãos com Mais Demandas
                  </h3>
                  {orgaosStats.top10.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>
                              Órgão
                            </th>
                            <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>
                              Total
                            </th>
                            <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>
                              Pendentes
                            </th>
                            <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>
                              Concluídas
                            </th>
                            <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>
                              Taxa
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {orgaosStats.top10.map((orgao, index) => (
                            <tr key={orgao.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                                    color: '#16a34a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 600
                                  }}>
                                    {index + 1}
                                  </span>
                                  <div>
                                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--foreground)', margin: 0 }}>
                                      {orgao.nome}
                                    </p>
                                    {orgao.sigla && (
                                      <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', margin: 0 }}>
                                        {orgao.sigla}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                                {orgao.demandas}
                              </td>
                              <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '14px', color: '#f59e0b' }}>
                                {orgao.pendentes}
                              </td>
                              <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '14px', color: '#22c55e' }}>
                                {orgao.concluidas}
                              </td>
                              <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  backgroundColor: orgao.taxaResolucao >= 70 ? 'rgba(34, 197, 94, 0.1)' : 
                                                   orgao.taxaResolucao >= 40 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  color: orgao.taxaResolucao >= 70 ? '#22c55e' : 
                                         orgao.taxaResolucao >= 40 ? '#f59e0b' : '#ef4444'
                                }}>
                                  {orgao.taxaResolucao}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '40px',
                      color: 'var(--foreground-muted)'
                    }}>
                      <p>Nenhum órgão com demandas cadastradas</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Assistente de IA */}
      <AIChat />

      {/* CSS para animação */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .stat-card:hover {
          box-shadow: 0 0 20px rgba(22, 163, 74, 0.15);
          transform: translateY(-2px);
        }
        
        @media (max-width: 1280px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .charts-grid {
            grid-template-columns: 1fr !important;
          }
          .charts-grid > div:last-child {
            grid-column: span 1 !important;
          }
          .orgaos-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
