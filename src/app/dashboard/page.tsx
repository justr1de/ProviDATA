'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { useTheme } from '@/providers/theme-provider'
import { isSuperAdmin } from '@/lib/auth-utils'
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
  Flame,
  AlertTriangle,
  Search,
  Send,
  Sparkles,
  Brain,
  Zap,
  HelpCircle,
  ChevronDown,
  Mail,
  MessageCircle
} from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'

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
  urgentes: number
}

interface MessageStats {
  emails24h: number
  whatsapp24h: number
}

interface CustomChart {
  id: string
  type: string
  title: string
  xAxis: string
  yAxis: string
  filters: string[]
}

interface TourStep {
  target: string
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right'
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

const tourSteps: TourStep[] = [
  {
    target: 'stats-cards',
    title: 'Cards de Estatísticas',
    content: 'Aqui você visualiza os principais indicadores do seu gabinete: total de providências, pendentes, em andamento, concluídas, urgentes, em análise e encaminhadas.',
    position: 'bottom'
  },
  {
    target: 'taxa-conclusao',
    title: 'Taxa de Conclusão',
    content: 'Acompanhe a porcentagem de providências concluídas em relação ao total. Quanto maior, melhor o desempenho do gabinete!',
    position: 'bottom'
  },
  {
    target: 'graficos-area',
    title: 'Área de Gráficos',
    content: 'Visualize seus dados em diferentes formatos. Você pode adicionar gráficos personalizados usando o painel lateral.',
    position: 'top'
  },
  {
    target: 'criar-grafico',
    title: 'Criar Gráfico',
    content: 'Selecione o tipo de gráfico, escolha os eixos X e Y, defina o período e clique em "Gerar Gráfico" para criar visualizações personalizadas.',
    position: 'left'
  },
  {
    target: 'ia-assistant',
    title: 'Assistente de IA',
    content: 'Nossa IA aprende com os dados do seu gabinete e pode cruzar informações para gerar insights valiosos. Faça perguntas em linguagem natural!',
    position: 'left'
  },
  {
    target: 'providencias-recentes',
    title: 'Providências Recentes',
    content: 'Acompanhe as últimas providências cadastradas ou atualizadas no sistema.',
    position: 'top'
  }
]

export default function DashboardPage() {
  const { resolvedTheme } = useTheme()
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Verificar tema no cliente
  useEffect(() => {
    setMounted(true)
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark')
      setIsDark(isDarkMode)
    }
    
    // Verificar imediatamente
    checkTheme()
    
    // Observar mudanças
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])
  
  // Também reagir a mudanças do resolvedTheme
  useEffect(() => {
    if (mounted) {
      setIsDark(resolvedTheme === 'dark')
    }
  }, [resolvedTheme, mounted])

  // Aplicar cores dinamicamente quando o tema mudar
  useEffect(() => {
    if (!mounted) return
    
    const applyThemeColors = () => {
      const isDarkMode = document.documentElement.classList.contains('dark')
      const dashboardPage = document.querySelector('.dashboard-page')
      if (!dashboardPage) return
      
      // Cores do tema
      const bgColor = isDarkMode ? '#0f172a' : '#f9fafb'
      const cardColor = isDarkMode ? '#1e293b' : '#ffffff'
      const borderColor = isDarkMode ? '#475569' : '#e5e7eb'
      const textColor = isDarkMode ? '#f1f5f9' : '#111827'
      const textMuted = isDarkMode ? '#94a3b8' : '#6b7280'
      
      // Aplicar ao container principal
      ;(dashboardPage as HTMLElement).style.backgroundColor = bgColor
      
      // Aplicar a todos os elementos com fundo branco ou var(--card)
      const elements = dashboardPage.querySelectorAll('div[style*="background"]')
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement
        const bg = htmlEl.style.backgroundColor
        if (bg === 'white' || bg === 'rgb(255, 255, 255)' || bg === 'var(--card)' || bg === '#ffffff') {
          htmlEl.style.backgroundColor = cardColor
          htmlEl.style.borderColor = borderColor
        }
      })
    }
    
    // Aplicar imediatamente
    applyThemeColors()
    
    // Reaplicar quando o tema mudar
    const observer = new MutationObserver(applyThemeColors)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [mounted, isDark])
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pendentes: 0,
    em_andamento: 0,
    concluidas: 0,
    em_analise: 0,
    encaminhadas: 0,
    urgentes: 0,
  })
  const [messageStats, setMessageStats] = useState<MessageStats>({
    emails24h: 0,
    whatsapp24h: 0,
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
  const [showTour, setShowTour] = useState(false)
  const [currentTourStep, setCurrentTourStep] = useState(0)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiPanel, setShowAiPanel] = useState(false)
  
  const supabase = createClient()
  const { user, gabinete: tenant } = useAuthStore()

  useEffect(() => {
    // Verificar se é o primeiro acesso
    const hasSeenTour = localStorage.getItem('providata-tour-completed')
    if (!hasSeenTour && tenant?.id) {
      setShowTour(true)
    }
  }, [tenant?.id])

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

      let query = supabase
        .from('providencias')
        .select('status, prioridade')
      
      // Filtrar por gabinete apenas se não for super admin
      if (!isSuperAdmin(user)) {
        query = query.eq('gabinete_id', tenant?.id)
      }
      
      const { data: providencias } = await query
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
          urgentes: providencias.filter(p => p.prioridade === 'urgente').length,
        }
        setStats(newStats)
      }

      let recentQuery = supabase
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
      
      // Filtrar por gabinete apenas se não for super admin
      if (!isSuperAdmin(user)) {
        recentQuery = recentQuery.eq('gabinete_id', tenant?.id)
      }
      
      const { data: recent } = await recentQuery
        .order('created_at', { ascending: false })
        .limit(5)

      if (recent) {
        setRecentProvidencias(recent as unknown as Providencia[])
      }

      // Carregar estatísticas de mensagens das últimas 24 horas
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      // Contar e-mails enviados nas últimas 24h
      let emailQuery = supabase
        .from('email_tracking')
        .select('id', { count: 'exact', head: true })
        .gte('enviado_em', last24h)
      
      if (!isSuperAdmin(user)) {
        emailQuery = emailQuery.eq('gabinete_id', tenant?.id)
      }
      
      const { count: emailCount } = await emailQuery
      
      // Contar WhatsApp enviados nas últimas 24h
      let whatsappQuery = supabase
        .from('notificacoes_cidadao')
        .select('id', { count: 'exact', head: true })
        .eq('tipo_notificacao', 'whatsapp')
        .gte('created_at', last24h)
      
      if (!isSuperAdmin(user)) {
        whatsappQuery = whatsappQuery.eq('gabinete_id', tenant?.id)
      }
      
      const { count: whatsappCount } = await whatsappQuery
      
      setMessageStats({
        emails24h: emailCount || 0,
        whatsapp24h: whatsappCount || 0,
      })
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

  const handleTourNext = () => {
    if (currentTourStep < tourSteps.length - 1) {
      setCurrentTourStep(prev => prev + 1)
    } else {
      handleTourComplete()
    }
  }

  const handleTourPrev = () => {
    if (currentTourStep > 0) {
      setCurrentTourStep(prev => prev - 1)
    }
  }

  const handleTourComplete = () => {
    setShowTour(false)
    localStorage.setItem('providata-tour-completed', 'true')
  }

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return
    
    setAiLoading(true)
    setAiResponse('')
    
    try {
      const response = await fetch('/api/admin/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: aiQuery })
      })
      
      const data = await response.json()
      
      if (data.answer) {
        setAiResponse(data.answer)
      } else if (data.error) {
        setAiResponse(`Desculpe, ocorreu um erro: ${data.error}`)
      } else {
        setAiResponse('Desculpe, não consegui processar sua pergunta. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao consultar IA:', error)
      setAiResponse('Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.')
    } finally {
      setAiLoading(false)
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

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      {/* Tour Overlay */}
      {showTour && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light, var(--primary)) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HelpCircle style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Passo {currentTourStep + 1} de {tourSteps.length}
                </p>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>
                  {tourSteps[currentTourStep].title}
                </h3>
              </div>
            </div>
            
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
              {tourSteps[currentTourStep].content}
            </p>

            {/* Progress dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: index === currentTourStep ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: index === currentTourStep ? 'var(--primary)' : '#e5e7eb',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                    onClick={handleTourComplete}
                    style={{
                      flex: 1,
                      fontSize: '14px',
                      fontWeight: '600',
                      borderRadius: '10px',
                      padding: '12px 20px',
                      border: 'none',
                      backgroundColor: 'var(--card)',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    Pular Tour
                  </button>
              {currentTourStep > 0 && (
                <button
                  onClick={handleTourPrev}
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '10px',
                    padding: '12px 20px',
                    border: 'none',
                    backgroundColor: 'var(--card)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Anterior
                </button>
              )}
              <button
                onClick={handleTourNext}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {currentTourStep === tourSteps.length - 1 ? 'Concluir' : 'Próximo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Área Principal */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
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
                <Tooltip content="Painel de controle" position="right">
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light, var(--primary)) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px var(--primary-muted, rgba(22, 163, 74, 0.25))'
                  }}>
                    <LayoutDashboard style={{ width: '24px', height: '24px', color: 'white' }} />
                  </div>
                </Tooltip>
                <div>
                  <h1 style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: 'var(--text-color)',
                    margin: 0
                  }}>
                    Dashboard de Providências
                  </h1>
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'var(--text-muted)',
                    margin: '4px 0 0 0'
                  }}>
                    Visão geral das demandas · {tenant?.parlamentar_nome || 'Gabinete'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Tooltip content="Iniciar tour guiado" position="bottom">
                  <button
                    onClick={() => setShowTour(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      backgroundColor: 'var(--muted-bg)',
                      
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    <HelpCircle style={{ width: '16px', height: '16px' }} />
                    Tour
                  </button>
                </Tooltip>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{
                    padding: '10px 16px',
                    fontSize: '14px',
                    backgroundColor: 'var(--muted-bg)',
                    
                    borderRadius: '8px',
                    fontWeight: '500',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
                <Tooltip content="Cadastrar nova providência" position="bottom">
                  <Link href="/dashboard/providencias/nova">
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px var(--primary-muted, rgba(22, 163, 74, 0.25))'
                    }}>
                      <Plus style={{ width: '18px', height: '18px' }} />
                      Nova Providência
                    </button>
                  </Link>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Stats Cards - 7 cards em 2 linhas */}
          <div id="stats-cards" style={{ marginBottom: '24px' }}>
            {/* Primeira linha - 4 cards principais */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '16px'
            }}>
              {/* Total */}
              <Link href="/dashboard/providencias" style={{ textDecoration: 'none' }}>
                <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Tooltip content="Ver todas as providências" position="top">
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
                    </Tooltip>
                    <div>
                      <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>{stats.total}</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Total</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Pendentes */}
              <Link href="/dashboard/providencias?status=pendente" style={{ textDecoration: 'none' }}>
                <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Tooltip content="Ver providências pendentes" position="top">
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
                    </Tooltip>
                    <div>
                      <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>{stats.pendentes}</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Pendentes</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Em Andamento */}
              <Link href="/dashboard/providencias?status=em_andamento" style={{ textDecoration: 'none' }}>
                <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Tooltip content="Ver providências em andamento" position="top">
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
                    </Tooltip>
                    <div>
                      <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>{stats.em_andamento}</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Em Andamento</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Concluídas */}
              <Link href="/dashboard/providencias?status=concluido" style={{ textDecoration: 'none' }}>
                <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Tooltip content="Ver providências concluídas" position="top">
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
                        <CheckCircle2 style={{ width: '24px', height: '24px', color: 'var(--primary)' }} />
                      </div>
                    </Tooltip>
                    <div>
                      <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>{stats.concluidas}</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Concluídas</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Segunda linha - 3 cards adicionais */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px'
            }}>
              {/* Urgentes */}
              <Link href="/dashboard/providencias?prioridade=urgente" style={{ textDecoration: 'none' }}>
                <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Tooltip content="Ver providências urgentes" position="top">
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px',
                        backgroundColor: '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <AlertTriangle style={{ width: '24px', height: '24px', color: '#dc2626' }} />
                      </div>
                    </Tooltip>
                    <div>
                      <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>{stats.urgentes}</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Urgentes</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Em Análise */}
              <Link href="/dashboard/providencias?status=em_analise" style={{ textDecoration: 'none' }}>
                <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Tooltip content="Ver providências em análise" position="top">
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px',
                        backgroundColor: '#f3e8ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Search style={{ width: '24px', height: '24px', color: '#9333ea' }} />
                      </div>
                    </Tooltip>
                    <div>
                      <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>{stats.em_analise}</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Em Análise</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Encaminhadas */}
              <Link href="/dashboard/providencias?status=encaminhado" style={{ textDecoration: 'none' }}>
                <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Tooltip content="Ver providências encaminhadas" position="top">
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px',
                        backgroundColor: '#cffafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Send style={{ width: '24px', height: '24px', color: '#0891b2' }} />
                      </div>
                    </Tooltip>
                    <div>
                      <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>{stats.encaminhadas}</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Encaminhadas</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Card de Mensagens Enviadas - Últimas 24h */}
          <Link href="/dashboard/mensagens" style={{ textDecoration: 'none', display: 'block', marginBottom: '24px' }}>
            <div style={{
              backgroundColor: 'var(--card)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            className="stat-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Send style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>Mensagens Enviadas</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Últimas 24 horas</p>
                  </div>
                </div>
                <ChevronRight style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  backgroundColor: 'var(--muted-bg)',
                  borderRadius: '12px'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Mail style={{ width: '22px', height: '22px', color: '#2563eb' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>{messageStats.emails24h}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>E-mails</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  backgroundColor: 'var(--muted-bg)',
                  borderRadius: '12px'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MessageCircle style={{ width: '22px', height: '22px', color: '#25D366' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>{messageStats.whatsapp24h}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Taxa de Conclusão */}
          <div id="taxa-conclusao" className="taxa-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>Taxa de Conclusão</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Providências concluídas vs total</p>
              </div>
              <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)' }}>{taxaConclusao}%</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '12px', 
              backgroundColor: 'var(--border-color)', 
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light, var(--primary)) 100%)',
                borderRadius: '6px',
                width: `${taxaConclusao}%`,
                transition: 'width 0.5s ease'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <span>Concluídas: {stats.concluidas}</span>
              <span>Total: {stats.total}</span>
            </div>
          </div>

          {/* Área de Gráficos - Delimitada */}
          <div id="graficos-area" style={{ 
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            border: '1px dashed var(--border)',
            padding: '24px',
            marginBottom: '24px',
            minHeight: '400px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Tooltip content="Visualização de dados" position="right">
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px',
                    backgroundColor: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BarChart3 style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
                  </div>
                </Tooltip>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>Área de Gráficos Personalizados</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Adicione gráficos usando o painel lateral</p>
                </div>
              </div>
              <span style={{ 
                fontSize: '12px', 
                color: 'var(--text-muted)',
                backgroundColor: 'var(--muted-bg)',
                padding: '4px 12px',
                borderRadius: '9999px'
              }}>
                {customCharts.length} gráfico(s) adicionado(s)
              </span>
            </div>

            {/* Gráficos padrão */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
              marginBottom: customCharts.length > 0 ? '24px' : '0'
            }}>
              {/* Providências por Status */}
              <div style={{ 
                backgroundColor: 'var(--muted-bg)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '8px',
                    backgroundColor: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BarChart3 style={{ width: '18px', height: '18px', color: '#2563eb' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>Providências por Status</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Distribuição atual</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {chartData.map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '90px', fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>{item.label}</span>
                      <div style={{ flex: 1, height: '20px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          borderRadius: '4px',
                          width: `${(item.value / maxChartValue) * 100}%`,
                          backgroundColor: item.color,
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                      <span style={{ width: '28px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: 'var(--text-color)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distribuição de Status */}
              <div style={{ 
                backgroundColor: 'var(--muted-bg)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '8px',
                    backgroundColor: '#f3e8ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PieChart style={{ width: '18px', height: '18px', color: '#9333ea' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>Distribuição de Status</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Visão proporcional</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
                  <div style={{ position: 'relative' }}>
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r="50" fill="none" stroke="#22c55e" strokeWidth="18"
                        strokeDasharray={`${(stats.concluidas / Math.max(stats.total, 1)) * 314} 314`}
                        transform="rotate(-90 70 70)" />
                      <circle cx="70" cy="70" r="50" fill="none" stroke="#6366f1" strokeWidth="18"
                        strokeDasharray={`${(stats.em_andamento / Math.max(stats.total, 1)) * 314} 314`}
                        strokeDashoffset={`-${(stats.concluidas / Math.max(stats.total, 1)) * 314}`}
                        transform="rotate(-90 70 70)" />
                      <circle cx="70" cy="70" r="50" fill="none" stroke="#f59e0b" strokeWidth="18"
                        strokeDasharray={`${(stats.pendentes / Math.max(stats.total, 1)) * 314} 314`}
                        strokeDashoffset={`-${((stats.concluidas + stats.em_andamento) / Math.max(stats.total, 1)) * 314}`}
                        transform="rotate(-90 70 70)" />
                    </svg>
                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-color)' }}>{stats.total}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '12px' }}>
                  {chartData.map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-color)' }}>{item.value}</span>
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
                paddingTop: '24px',
                borderTop: '1px dashed var(--border)'
              }}>
                {customCharts.map((chart) => {
                  const ChartIcon = chartTypes.find(t => t.id === chart.type)?.icon || PieChart
                  return (
                    <div key={chart.id} style={{ 
                      backgroundColor: 'var(--muted-bg)',
                      borderRadius: '12px',
                      padding: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '8px',
                            backgroundColor: '#dcfce7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <ChartIcon style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>{chart.title}</h4>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                              Gráfico de {chartTypes.find(t => t.id === chart.type)?.name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveChart(chart.id)}
                          style={{
                            padding: '6px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: 'var(--text-muted)'
                          }}
                        >
                          <X style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                      <div style={{ 
                        height: '140px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: 'var(--card)',
                        borderRadius: '8px',
                        border: '2px solid var(--border)'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <ChartIcon style={{ width: '32px', height: '32px', color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gráfico será renderizado aqui</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Placeholder para adicionar gráficos */}
            {customCharts.length === 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '40px',
                marginTop: '24px',
                border: '1px dashed var(--border)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <Plus style={{ width: '40px', height: '40px', color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                    Use o painel "Criar Gráfico" para adicionar visualizações personalizadas
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Providências Recentes */}
          <div id="providencias-recentes" style={{
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            overflow: 'hidden'
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
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>Providências Recentes</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Últimas atualizações</p>
                </div>
              </div>
              <Link href="/dashboard/providencias">
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  color: 'var(--primary)',
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
                  backgroundColor: 'var(--muted-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <FileText style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-color)', margin: '0 0 8px 0' }}>Nenhuma providência cadastrada</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 24px 0', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Comece cadastrando a primeira providência do gabinete
                </p>
                <Link href="/dashboard/providencias/nova">
                  <button style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    backgroundColor: 'var(--primary)',
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
                            color: 'var(--text-muted)',
                            backgroundColor: 'var(--muted-bg)',
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
                          color: 'var(--text-color)',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {providencia.titulo}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <Calendar style={{ width: '14px', height: '14px' }} />
                            {format(new Date(providencia.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      <ChevronRight style={{ width: '20px', height: '20px', color: 'var(--text-muted)', flexShrink: 0 }} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Painel Lateral */}
        <div style={{ width: '340px', flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Criar Gráfico */}
            <div id="criar-grafico" style={{
              backgroundColor: 'var(--card)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}>
              {/* Header do Painel */}
              <div style={{ 
                padding: '20px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light, var(--primary)) 100%)'
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
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Tipo de Gráfico */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: 'var(--text-muted)',
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
                          border: selectedChartType === type.id ? '2px solid var(--primary)' : '2px solid #e5e7eb',
                          backgroundColor: selectedChartType === type.id ? 'var(--primary-muted, #f0fdf4)' : 'var(--card)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <type.icon style={{ 
                          width: '20px', 
                          height: '20px', 
                          color: selectedChartType === type.id ? 'var(--primary)' : '#9ca3af'
                        }} />
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: '600',
                          color: selectedChartType === type.id ? 'var(--primary)' : '#6b7280'
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
                    color: 'var(--text-muted)',
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
                      backgroundColor: 'var(--muted-bg)',
                      
                      borderRadius: '8px',
                      color: 'var(--text-muted)'
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
                    color: 'var(--text-muted)',
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
                      backgroundColor: 'var(--muted-bg)',
                      
                      borderRadius: '8px',
                      color: 'var(--text-muted)'
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
                    color: 'var(--text-muted)',
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
                        backgroundColor: 'var(--muted-bg)',
                        
                        borderRadius: '8px',
                        color: 'var(--text-muted)'
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
                        backgroundColor: 'var(--muted-bg)',
                        
                        borderRadius: '8px',
                        color: 'var(--text-muted)'
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
                    backgroundColor: generatingChart ? 'var(--primary-light, #86efac)' : 'var(--primary)',
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

            {/* Assistente de IA */}
            <div id="ia-assistant" style={{
              backgroundColor: 'var(--card)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{ 
                padding: '20px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
              }}>
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
                    <Brain style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', margin: 0 }}>Assistente de IA</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '2px 0 0 0' }}>Análise inteligente dos dados</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Sugestões rápidas */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Sugestões:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['Análise geral', 'Prioridades', 'Tendências'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setAiQuery(suggestion)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          backgroundColor: 'var(--muted-bg)',
                          
                          borderRadius: '9999px',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input de pergunta */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px',
                    backgroundColor: 'var(--muted-bg)',
                    borderRadius: '10px',
                    padding: '4px',
                    border: '1px solid var(--border)'
                  }}>
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Faça uma pergunta..."
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        fontSize: '14px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--text-muted)'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
                    />
                    <button
                      onClick={handleAiQuery}
                      disabled={aiLoading || !aiQuery.trim()}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: aiLoading || !aiQuery.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {aiLoading ? (
                        <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Sparkles style={{ width: '16px', height: '16px' }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Resposta da IA */}
                {aiResponse && (
                  <div style={{ 
                    backgroundColor: '#faf5ff',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <Zap style={{ width: '16px', height: '16px', color: '#7c3aed', flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '13px', color: '#581c87', lineHeight: '1.5', margin: 0 }}>
                        {aiResponse}
                      </p>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div style={{ 
                  marginTop: '16px',
                  backgroundColor: 'var(--muted-bg)',
                  borderRadius: '10px',
                  padding: '12px'
                }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                    <strong>IA treinada</strong> com os dados do seu gabinete. Faça perguntas sobre providências, tendências, prioridades e muito mais.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
