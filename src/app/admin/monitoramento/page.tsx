'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { 
  Activity, 
  Users, 
  Monitor, 
  Smartphone, 
  Tablet,
  MapPin,
  Eye,
  LogIn,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart3,
  LogOut,
  X,
  Building2
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface LoginLog {
  id: string
  user_id: string
  email: string
  user_name: string
  ip_address: string
  user_agent: string
  browser: string
  browser_version: string
  os: string
  os_version: string
  device_type: string
  country: string
  region: string
  city: string
  latitude: number
  longitude: number
  timezone: string
  isp: string
  session_id: string
  success: boolean
  failure_reason: string
  created_at: string
}

interface PageView {
  id: string
  user_id: string
  email: string
  user_name: string
  page_path: string
  page_title: string
  referrer: string
  session_id: string
  ip_address: string
  user_agent: string
  browser: string
  os: string
  device_type: string
  created_at: string
}

interface UserStats {
  id: string
  user_id: string
  email: string
  user_name: string
  total_logins: number
  last_login_at: string
  last_ip_address: string
  last_browser: string
  last_os: string
  last_city: string
  last_country: string
  total_page_views: number
  last_page_viewed: string
  last_page_viewed_at: string
  created_at: string
  updated_at: string
}

export default function MonitoramentoPage() {
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([])
  const [pageViews, setPageViews] = useState<PageView[]>([])
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'logins' | 'pages' | 'users'>('logins')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin' && user.email !== 'contato@dataro-it.com.br') {
      toast.error('Acesso negado. Apenas super administradores podem acessar esta página.')
      router.push('/dashboard')
      return
    }

    setIsSuperAdmin(true)
    loadData()
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const { data: logs } = await supabase
        .from('login_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      setLoginLogs(logs || [])

      const { data: views } = await supabase
        .from('page_views')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      setPageViews(views || [])

      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .order('total_logins', { ascending: false })
      setUserStats(stats || [])
    } catch (error) {
      console.error('Error loading monitoring data:', error)
      toast.error('Erro ao carregar dados de monitoramento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone style={{ width: '16px', height: '16px' }} />
      case 'tablet':
        return <Tablet style={{ width: '16px', height: '16px' }} />
      default:
        return <Monitor style={{ width: '16px', height: '16px' }} />
    }
  }

  const filterByDateTime = (dateString: string) => {
    if (!dateString) return true
    const date = new Date(dateString)
    
    if (startDate) {
      const start = new Date(startDate)
      if (startTime) {
        const [hours, minutes] = startTime.split(':')
        start.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      } else {
        start.setHours(0, 0, 0, 0)
      }
      if (date < start) return false
    }
    
    if (endDate) {
      const end = new Date(endDate)
      if (endTime) {
        const [hours, minutes] = endTime.split(':')
        end.setHours(parseInt(hours), parseInt(minutes), 59, 999)
      } else {
        end.setHours(23, 59, 59, 999)
      }
      if (date > end) return false
    }
    
    return true
  }

  const clearDateFilters = () => {
    setStartDate('')
    setEndDate('')
    setStartTime('')
    setEndTime('')
  }

  const filteredLoginLogs = loginLogs.filter(log => {
    const matchesSearch = log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address?.includes(searchTerm) ||
      log.city?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = filterByDateTime(log.created_at)
    return matchesSearch && matchesDate
  })

  const filteredPageViews = pageViews.filter(view => {
    const matchesSearch = view.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      view.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      view.page_path?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = filterByDateTime(view.created_at)
    return matchesSearch && matchesDate
  })

  const filteredUserStats = userStats.filter(stat =>
    stat.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stat.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Estatísticas
  const totalLogins = loginLogs.length
  const successfulLogins = loginLogs.filter(l => l.success).length
  const failedLogins = loginLogs.filter(l => !l.success).length
  const uniqueUsers = new Set(loginLogs.filter(l => l.user_id).map(l => l.user_id)).size
  const totalPageViews = pageViews.length

  if (!isSuperAdmin) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--foreground)' }}>
          <Activity style={{ width: '48px', height: '48px', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p>Verificando permissões...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)'
    }}>
      <Toaster position="top-right" richColors />
      
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
            {/* Logo e Título */}
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
              <div style={{ 
                height: '24px', 
                width: '1px', 
                backgroundColor: 'var(--border)'
              }} />
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: 'var(--foreground-muted)'
              }}>
                Monitoramento
              </span>
            </div>

            {/* Ações do Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                <Building2 size={18} />
                <span>Gabinetes</span>
              </Link>
              <Link
                href="/admin/indicadores"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                }}
              >
                <BarChart3 size={18} />
                <span>Indicadores</span>
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
        {/* Título e Botão Atualizar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--foreground)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Activity style={{ width: '28px', height: '28px', color: '#8b5cf6' }} />
              Monitoramento de Atividades
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'var(--foreground-muted)',
              marginTop: '4px'
            }}>
              Acompanhe logins, acessos e navegação dos usuários
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)'
            }}
          >
            <RefreshCw style={{ width: '18px', height: '18px', animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Atualizar</span>
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
          marginBottom: '20px'
        }} className="stats-grid">
          {/* Total de Logins */}
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
                <LogIn style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>Total Logins</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>{totalLogins}</p>
              </div>
            </div>
          </div>

          {/* Logins com Sucesso */}
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
                <CheckCircle style={{ width: '20px', height: '20px', color: '#22c55e' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>Sucesso</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e', margin: 0 }}>{successfulLogins}</p>
              </div>
            </div>
          </div>

          {/* Logins com Falha */}
          <div style={{
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
                <XCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>Falhas</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444', margin: 0 }}>{failedLogins}</p>
              </div>
            </div>
          </div>

          {/* Usuários Únicos */}
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
                <Users style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>Usuários</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>{uniqueUsers}</p>
              </div>
            </div>
          </div>

          {/* Total de Visualizações */}
          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '10px'
              }}>
                <Eye style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>Páginas</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>{totalPageViews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Busca e Filtros */}
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid var(--border)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Campo de Busca */}
            <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: 'var(--foreground-muted)'
              }} />
              <input
                type="text"
                placeholder="Buscar por usuário, email, IP ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: 'var(--foreground)'
                }}
              />
            </div>

            {/* Botão de Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: showFilters ? 'var(--primary)' : 'var(--background)',
                color: showFilters ? 'white' : 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <Filter size={18} />
              <span>Filtros</span>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['logins', 'pages', 'users'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: activeTab === tab ? 'var(--primary)' : 'var(--background)',
                    color: activeTab === tab ? 'white' : 'var(--foreground)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {tab === 'logins' && 'Logins'}
                  {tab === 'pages' && 'Páginas'}
                  {tab === 'users' && 'Usuários'}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros Expandidos */}
          {showFilters && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', marginBottom: '6px' }}>
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'var(--foreground)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', marginBottom: '6px' }}>
                    Hora Inicial
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'var(--foreground)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', marginBottom: '6px' }}>
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'var(--foreground)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--foreground)', marginBottom: '6px' }}>
                    Hora Final
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'var(--foreground)'
                    }}
                  />
                </div>
              </div>

              {/* Filtros Rápidos */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Hoje', action: () => { const today = new Date().toISOString().split('T')[0]; setStartDate(today); setEndDate(today); setStartTime(''); setEndTime(''); } },
                  { label: 'Ontem', action: () => { const y = new Date(); y.setDate(y.getDate() - 1); const d = y.toISOString().split('T')[0]; setStartDate(d); setEndDate(d); setStartTime(''); setEndTime(''); } },
                  { label: 'Últimos 7 dias', action: () => { const t = new Date(); const w = new Date(t); w.setDate(w.getDate() - 7); setStartDate(w.toISOString().split('T')[0]); setEndDate(t.toISOString().split('T')[0]); setStartTime(''); setEndTime(''); } },
                  { label: 'Últimos 30 dias', action: () => { const t = new Date(); const m = new Date(t); m.setDate(m.getDate() - 30); setStartDate(m.toISOString().split('T')[0]); setEndDate(t.toISOString().split('T')[0]); setStartTime(''); setEndTime(''); } },
                  { label: 'Este mês', action: () => { const t = new Date(); const f = new Date(t.getFullYear(), t.getMonth(), 1); setStartDate(f.toISOString().split('T')[0]); setEndDate(t.toISOString().split('T')[0]); setStartTime(''); setEndTime(''); } },
                ].map((filter) => (
                  <button
                    key={filter.label}
                    onClick={filter.action}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
                {(startDate || endDate) && (
                  <button
                    onClick={clearDateFilters}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <X size={14} />
                    Limpar
                  </button>
                )}
              </div>

              {/* Indicador de Filtro Ativo */}
              {(startDate || endDate) && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px'
                }}>
                  <p style={{ fontSize: '13px', color: '#8b5cf6', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Filter size={14} />
                    Filtro ativo: 
                    {startDate && ` De ${new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR')}${startTime ? ` às ${startTime}` : ''}`}
                    {endDate && ` até ${new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR')}${endTime ? ` às ${endTime}` : ''}`}
                    {' | '}
                    {activeTab === 'logins' && `${filteredLoginLogs.length} de ${loginLogs.length} registros`}
                    {activeTab === 'pages' && `${filteredPageViews.length} de ${pageViews.length} registros`}
                    {activeTab === 'users' && `${filteredUserStats.length} de ${userStats.length} registros`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conteúdo das Tabs */}
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '48px',
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            border: '1px solid var(--border)'
          }}>
            <RefreshCw style={{ width: '32px', height: '32px', color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Tab de Logins */}
            {activeTab === 'logins' && (
              <div style={{
                backgroundColor: 'var(--card)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                overflow: 'hidden'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--background)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Usuário</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>IP</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Localização</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Dispositivo</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Navegador</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Data/Hora</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Detalhes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoginLogs.map((log) => (
                        <>
                          <tr key={log.id} style={{ borderTop: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 16px' }}>
                              {log.success ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontSize: '13px' }}>
                                  <CheckCircle size={16} />
                                  Sucesso
                                </span>
                              ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '13px' }}>
                                  <XCircle size={16} />
                                  Falha
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div>
                                <p style={{ fontWeight: 500, margin: 0, fontSize: '14px' }}>{log.user_name || '-'}</p>
                                <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', margin: 0 }}>{log.email}</p>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px' }}>{log.ip_address || '-'}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                                <MapPin size={14} style={{ color: 'var(--foreground-muted)' }} />
                                <span>{log.city ? `${log.city}, ${log.region || log.country}` : '-'}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                {getDeviceIcon(log.device_type)}
                                <span style={{ textTransform: 'capitalize' }}>{log.device_type || '-'}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div>
                                <p style={{ margin: 0, fontSize: '13px' }}>{log.browser} {log.browser_version}</p>
                                <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', margin: 0 }}>{log.os} {log.os_version}</p>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: '13px' }}>{formatDate(log.created_at)}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <button
                                onClick={() => toggleRowExpansion(log.id)}
                                style={{
                                  padding: '4px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--foreground-muted)'
                                }}
                              >
                                {expandedRows.has(log.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </td>
                          </tr>
                          {expandedRows.has(log.id) && (
                            <tr style={{ backgroundColor: 'var(--background)' }}>
                              <td colSpan={8} style={{ padding: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', fontSize: '13px' }}>
                                  <div>
                                    <p style={{ color: 'var(--foreground-muted)', margin: '0 0 4px 0' }}>User Agent</p>
                                    <p style={{ fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', margin: 0 }}>{log.user_agent}</p>
                                  </div>
                                  <div>
                                    <p style={{ color: 'var(--foreground-muted)', margin: '0 0 4px 0' }}>ISP</p>
                                    <p style={{ margin: 0 }}>{log.isp || '-'}</p>
                                  </div>
                                  <div>
                                    <p style={{ color: 'var(--foreground-muted)', margin: '0 0 4px 0' }}>Timezone</p>
                                    <p style={{ margin: 0 }}>{log.timezone || '-'}</p>
                                  </div>
                                  <div>
                                    <p style={{ color: 'var(--foreground-muted)', margin: '0 0 4px 0' }}>Coordenadas</p>
                                    <p style={{ margin: 0 }}>{log.latitude && log.longitude ? `${log.latitude}, ${log.longitude}` : '-'}</p>
                                  </div>
                                  <div>
                                    <p style={{ color: 'var(--foreground-muted)', margin: '0 0 4px 0' }}>Session ID</p>
                                    <p style={{ fontFamily: 'monospace', fontSize: '11px', margin: 0 }}>{log.session_id || '-'}</p>
                                  </div>
                                  {!log.success && log.failure_reason && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                      <p style={{ color: 'var(--foreground-muted)', margin: '0 0 4px 0' }}>Motivo da Falha</p>
                                      <p style={{ color: '#ef4444', margin: 0 }}>{log.failure_reason}</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                  {filteredLoginLogs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--foreground-muted)' }}>
                      <LogIn style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                      <p>Nenhum log de login encontrado</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab de Páginas */}
            {activeTab === 'pages' && (
              <div style={{
                backgroundColor: 'var(--card)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                overflow: 'hidden'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--background)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Usuário</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Página</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Dispositivo</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Navegador</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Data/Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPageViews.map((view) => (
                        <tr key={view.id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div>
                              <p style={{ fontWeight: 500, margin: 0, fontSize: '14px' }}>{view.user_name || '-'}</p>
                              <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', margin: 0 }}>{view.email}</p>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div>
                              <p style={{ fontWeight: 500, margin: 0, fontSize: '14px' }}>{view.page_title || view.page_path}</p>
                              <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', margin: 0 }}>{view.page_path}</p>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                              {getDeviceIcon(view.device_type)}
                              <span style={{ textTransform: 'capitalize' }}>{view.device_type || '-'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <p style={{ margin: 0, fontSize: '13px' }}>{view.browser} / {view.os}</p>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '13px' }}>{formatDate(view.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPageViews.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--foreground-muted)' }}>
                      <Eye style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                      <p>Nenhuma visualização de página encontrada</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab de Usuários */}
            {activeTab === 'users' && (
              <div style={{
                backgroundColor: 'var(--card)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                overflow: 'hidden'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--background)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Usuário</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Total Logins</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Último Login</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Última Localização</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Páginas Vistas</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)' }}>Última Página</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUserStats.map((stat) => (
                        <tr key={stat.id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div>
                              <p style={{ fontWeight: 500, margin: 0, fontSize: '14px' }}>{stat.user_name || '-'}</p>
                              <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', margin: 0 }}>{stat.email}</p>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '4px 10px',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              color: '#3b82f6',
                              borderRadius: '9999px',
                              fontSize: '13px',
                              fontWeight: 600
                            }}>
                              {stat.total_logins}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '13px' }}>{formatDate(stat.last_login_at)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                              <MapPin size={14} style={{ color: 'var(--foreground-muted)' }} />
                              <span>{stat.last_city ? `${stat.last_city}, ${stat.last_country}` : '-'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '4px 10px',
                              backgroundColor: 'rgba(245, 158, 11, 0.1)',
                              color: '#f59e0b',
                              borderRadius: '9999px',
                              fontSize: '13px',
                              fontWeight: 600
                            }}>
                              {stat.total_page_views}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '13px' }}>{stat.last_page_viewed || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUserStats.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--foreground-muted)' }}>
                      <Users style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                      <p>Nenhuma estatística de usuário encontrada</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Rodapé */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        color: 'var(--foreground-muted)',
        fontSize: '13px',
        borderTop: '1px solid var(--border)',
        marginTop: '40px'
      }}>
        <p style={{ margin: 0 }}>DATA-RO INTELIGÊNCIA TERRITORIAL</p>
        <p style={{ margin: '4px 0 0 0' }}>Todos os direitos reservados. 2026.</p>
      </footer>

      {/* CSS para animação */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 1280px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
