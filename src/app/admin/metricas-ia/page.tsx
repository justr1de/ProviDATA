'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  Zap,
  RefreshCw,
  Calendar,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react'

interface UsageSummary {
  total_requests: number
  total_tokens_input: number
  total_tokens_output: number
  total_tokens: number
  cost_input_usd: number
  cost_output_usd: number
  total_cost_usd: number
  total_cost_brl: number
  avg_response_time_ms: number
  success_rate: number
}

interface DailyUsage {
  dia: string
  total_requests: number
  total_tokens: number
  cost_usd: number
  avg_response_time_ms: number
}

interface TopUser {
  user_id: string
  user_name?: string
  user_email?: string
  total_requests: number
  total_tokens: number
  cost_usd: number
  last_request: string
}

interface RecentLog {
  id: string
  user_id: string
  user_name?: string
  question: string
  tokens_input: number
  tokens_output: number
  response_time_ms: number
  status: string
  created_at: string
}

export default function MetricasIAPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuthStore()
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([])
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [periodDays, setPeriodDays] = useState(30)
  
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (user?.role !== 'super_admin') {
        router.push('/dashboard')
      } else {
        loadData()
      }
    }
  }, [user, authLoading, router])
  
  const loadData = async () => {
    setIsLoading(true)
    try {
      // Carregar resumo geral
      const { data: summaryData } = await supabase.rpc('calculate_ai_usage_cost')
      if (summaryData && summaryData.length > 0) {
        setSummary(summaryData[0])
      }
      
      // Carregar uso por dia
      const { data: dailyData } = await supabase.rpc('get_ai_usage_by_day', { days_back: periodDays })
      if (dailyData) {
        setDailyUsage(dailyData)
      }
      
      // Carregar top usuários
      const { data: topUsersData } = await supabase.rpc('get_top_ai_users', { limit_count: 10 })
      if (topUsersData) {
        // Buscar nomes dos usuários
        const userIds = topUsersData.map((u: TopUser) => u.user_id)
        const { data: usersInfo } = await supabase
          .from('users')
          .select('id, nome, email')
          .in('id', userIds)
        
        const usersMap = new Map(usersInfo?.map(u => [u.id, u]) || [])
        const enrichedUsers = topUsersData.map((u: TopUser) => ({
          ...u,
          user_name: usersMap.get(u.user_id)?.nome || 'Usuário desconhecido',
          user_email: usersMap.get(u.user_id)?.email || ''
        }))
        setTopUsers(enrichedUsers)
      }
      
      // Carregar logs recentes
      const { data: logsData } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (logsData) {
        // Buscar nomes dos usuários
        const userIds = [...new Set(logsData.map(l => l.user_id))]
        const { data: usersInfo } = await supabase
          .from('users')
          .select('id, nome')
          .in('id', userIds)
        
        const usersMap = new Map(usersInfo?.map(u => [u.id, u.nome]) || [])
        const enrichedLogs = logsData.map(l => ({
          ...l,
          user_name: usersMap.get(l.user_id) || 'Usuário desconhecido'
        }))
        setRecentLogs(enrichedLogs)
      }
      
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }
  
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR')
  }
  
  const formatCurrency = (value: number, currency: 'USD' | 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value)
  }
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }
  
  if (authLoading || isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw style={{ width: 40, height: 40, animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
          <p style={{ marginTop: 16, color: 'var(--foreground-muted)' }}>Carregando métricas...</p>
        </div>
      </div>
    )
  }
  
  // Calcular máximo para o gráfico de barras
  const maxRequests = Math.max(...dailyUsage.map(d => d.total_requests), 1)
  
  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: 'var(--foreground)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Activity style={{ width: 28, height: 28, color: 'var(--primary)' }} />
            Métricas de Uso da IA
          </h1>
          <p style={{ color: 'var(--foreground-muted)', marginTop: '4px' }}>
            Monitoramento em tempo real do consumo da API do Gemini
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={periodDays}
            onChange={(e) => {
              setPeriodDays(Number(e.target.value))
              setTimeout(loadData, 100)
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              fontSize: '14px'
            }}
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
            <option value={365}>Último ano</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.7 : 1
            }}
          >
            <RefreshCw style={{ 
              width: 16, 
              height: 16,
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }} />
            Atualizar
          </button>
        </div>
      </div>
      
      {/* Cards de Resumo */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Total de Requisições */}
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 style={{ width: 20, height: 20, color: '#3b82f6' }} />
            </div>
            <span style={{ color: 'var(--foreground-muted)', fontSize: '14px' }}>Total de Requisições</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--foreground)' }}>
            {formatNumber(summary?.total_requests || 0)}
          </p>
        </div>
        
        {/* Total de Tokens */}
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap style={{ width: 20, height: 20, color: '#a855f7' }} />
            </div>
            <span style={{ color: 'var(--foreground-muted)', fontSize: '14px' }}>Total de Tokens</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--foreground)' }}>
            {formatNumber(summary?.total_tokens || 0)}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '4px' }}>
            Entrada: {formatNumber(summary?.total_tokens_input || 0)} | Saída: {formatNumber(summary?.total_tokens_output || 0)}
          </p>
        </div>
        
        {/* Custo Total USD */}
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign style={{ width: 20, height: 20, color: '#22c55e' }} />
            </div>
            <span style={{ color: 'var(--foreground-muted)', fontSize: '14px' }}>Custo Estimado</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--foreground)' }}>
            {formatCurrency(summary?.total_cost_usd || 0, 'USD')}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '4px' }}>
            ≈ {formatCurrency(summary?.total_cost_brl || 0, 'BRL')}
          </p>
        </div>
        
        {/* Tempo Médio de Resposta */}
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock style={{ width: 20, height: 20, color: '#f97316' }} />
            </div>
            <span style={{ color: 'var(--foreground-muted)', fontSize: '14px' }}>Tempo Médio</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--foreground)' }}>
            {(summary?.avg_response_time_ms || 0).toFixed(0)}ms
          </p>
        </div>
        
        {/* Taxa de Sucesso */}
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle style={{ width: 20, height: 20, color: '#10b981' }} />
            </div>
            <span style={{ color: 'var(--foreground-muted)', fontSize: '14px' }}>Taxa de Sucesso</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--foreground)' }}>
            {(summary?.success_rate || 0).toFixed(1)}%
          </p>
        </div>
      </div>
      
      {/* Gráfico de Uso por Dia e Top Usuários */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Gráfico de Uso por Dia */}
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid var(--border)'
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: 'var(--foreground)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Calendar style={{ width: 18, height: 18, color: 'var(--primary)' }} />
            Requisições por Dia
          </h2>
          
          {dailyUsage.length === 0 ? (
            <p style={{ color: 'var(--foreground-muted)', textAlign: 'center', padding: '40px 0' }}>
              Nenhum dado disponível para o período selecionado
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dailyUsage.slice(0, 10).map((day, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    color: 'var(--foreground-muted)',
                    minWidth: '80px'
                  }}>
                    {formatDate(day.dia)}
                  </span>
                  <div style={{ 
                    flex: 1, 
                    height: '24px', 
                    backgroundColor: 'var(--background)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(day.total_requests / maxRequests) * 100}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary)',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    color: 'var(--foreground)',
                    minWidth: '40px',
                    textAlign: 'right'
                  }}>
                    {day.total_requests}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Top Usuários */}
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid var(--border)'
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: 'var(--foreground)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Users style={{ width: 18, height: 18, color: 'var(--primary)' }} />
            Top Usuários
          </h2>
          
          {topUsers.length === 0 ? (
            <p style={{ color: 'var(--foreground-muted)', textAlign: 'center', padding: '40px 0' }}>
              Nenhum usuário encontrado
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topUsers.map((user, index) => (
                <div 
                  key={user.user_id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--background)',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: 'var(--foreground)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {user.user_name}
                    </p>
                    <p style={{ 
                      fontSize: '12px', 
                      color: 'var(--foreground-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {user.user_email}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--foreground)' }}>
                      {user.total_requests} req
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--foreground-muted)' }}>
                      {formatCurrency(user.cost_usd, 'USD')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Logs Recentes */}
      <div style={{
        backgroundColor: 'var(--card)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid var(--border)'
      }}>
        <h2 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: 'var(--foreground)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <TrendingUp style={{ width: 18, height: 18, color: 'var(--primary)' }} />
          Requisições Recentes
        </h2>
        
        {recentLogs.length === 0 ? (
          <p style={{ color: 'var(--foreground-muted)', textAlign: 'center', padding: '40px 0' }}>
            Nenhuma requisição registrada ainda
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', color: 'var(--foreground-muted)', fontWeight: '500' }}>Usuário</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', color: 'var(--foreground-muted)', fontWeight: '500' }}>Pergunta</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', color: 'var(--foreground-muted)', fontWeight: '500' }}>Tokens</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', color: 'var(--foreground-muted)', fontWeight: '500' }}>Tempo</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', color: 'var(--foreground-muted)', fontWeight: '500' }}>Status</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '12px', color: 'var(--foreground-muted)', fontWeight: '500' }}>Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--foreground)' }}>{log.user_name}</span>
                    </td>
                    <td style={{ padding: '12px 8px', maxWidth: '300px' }}>
                      <span style={{ 
                        fontSize: '13px', 
                        color: 'var(--foreground)',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {log.question}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--foreground)' }}>
                        {formatNumber((log.tokens_input || 0) + (log.tokens_output || 0))}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--foreground)' }}>
                        {log.response_time_ms}ms
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      {log.status === 'success' ? (
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          color: '#22c55e',
                          fontSize: '12px'
                        }}>
                          <CheckCircle style={{ width: 12, height: 12 }} />
                          Sucesso
                        </span>
                      ) : (
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          fontSize: '12px'
                        }}>
                          <XCircle style={{ width: 12, height: 12 }} />
                          Erro
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>
                        {formatDateTime(log.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Informações sobre preços */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: 'var(--background)',
        borderRadius: '8px',
        border: '1px solid var(--border)'
      }}>
        <p style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>
          <strong>Nota sobre custos:</strong> Os valores são estimados com base nos preços do Gemini 2.0 Flash 
          (US$ 0.10 por 1M tokens de entrada, US$ 0.40 por 1M tokens de saída). 
          A conversão para BRL usa taxa aproximada de R$ 6,00/USD.
          Os tokens são estimados (~4 caracteres por token).
        </p>
      </div>
      
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
