'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Activity, 
  Users, 
  Globe, 
  Monitor, 
  Smartphone, 
  Tablet,
  Clock,
  MapPin,
  Eye,
  LogIn,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  Calendar,
  X
} from 'lucide-react'
import { toast, Toaster } from 'sonner'

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

    // Verificar se é super admin
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
      // Carregar logs de login
      const { data: logs, error: logsError } = await supabase
        .from('login_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

      if (logsError) throw logsError
      setLoginLogs(logs || [])

      // Carregar visualizações de página
      const { data: views, error: viewsError } = await supabase
        .from('page_views')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

      if (viewsError) throw viewsError
      setPageViews(views || [])

      // Carregar estatísticas de usuários
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .order('total_logins', { ascending: false })

      if (statsError) throw statsError
      setUserStats(stats || [])

    } catch (error) {
      console.error('Error loading monitoring data:', error)
      toast.error('Erro ao carregar dados de monitoramento')
    } finally {
      setIsLoading(false)
    }
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
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  // Função para filtrar por data/hora
  const filterByDateTime = (dateString: string) => {
    if (!dateString) return true
    const date = new Date(dateString)
    
    // Filtro de data inicial
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
    
    // Filtro de data final
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

  // Limpar filtros de data
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

  // Estatísticas gerais
  const totalLogins = loginLogs.length
  const successfulLogins = loginLogs.filter(l => l.success).length
  const failedLogins = loginLogs.filter(l => !l.success).length
  const uniqueUsers = new Set(loginLogs.filter(l => l.user_id).map(l => l.user_id)).size
  const totalPageViews = pageViews.length

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 animate-spin" />
          <p>Verificando permissões...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/gabinetes"
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-green-500" />
                Monitoramento de Atividades
              </h1>
              <p className="text-gray-400 text-sm">Acompanhe logins, acessos e navegação dos usuários</p>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <LogIn className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total de Logins</p>
                <p className="text-2xl font-bold">{totalLogins}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Logins Bem-sucedidos</p>
                <p className="text-2xl font-bold text-green-400">{successfulLogins}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Logins Falhos</p>
                <p className="text-2xl font-bold text-red-400">{failedLogins}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Usuários Únicos</p>
                <p className="text-2xl font-bold">{uniqueUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Eye className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Páginas Visualizadas</p>
                <p className="text-2xl font-bold">{totalPageViews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('logins')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'logins' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <LogIn className="w-4 h-4 inline mr-2" />
            Logs de Login ({loginLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pages' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Páginas Visitadas ({pageViews.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Estatísticas por Usuário ({userStats.length})
          </button>
        </div>

        {/* Search and Date Filters */}
        <div className="space-y-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email, nome, IP ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
            />
          </div>
          
          {/* Date/Time Filters */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                <span className="font-medium">Filtrar por Período</span>
              </div>
              {(startDate || endDate || startTime || endTime) && (
                <button
                  onClick={clearDateFilters}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Limpar Filtros
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Data Inicial */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                />
              </div>
              
              {/* Hora Inicial */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hora Inicial</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                />
              </div>
              
              {/* Data Final */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Data Final</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                />
              </div>
              
              {/* Hora Final */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hora Final</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            
            {/* Filtros rápidos */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0]
                  setStartDate(today)
                  setEndDate(today)
                  setStartTime('')
                  setEndTime('')
                }}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Hoje
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  const yesterday = new Date(today)
                  yesterday.setDate(yesterday.getDate() - 1)
                  setStartDate(yesterday.toISOString().split('T')[0])
                  setEndDate(yesterday.toISOString().split('T')[0])
                  setStartTime('')
                  setEndTime('')
                }}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Ontem
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  const weekAgo = new Date(today)
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  setStartDate(weekAgo.toISOString().split('T')[0])
                  setEndDate(today.toISOString().split('T')[0])
                  setStartTime('')
                  setEndTime('')
                }}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Últimos 7 dias
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  const monthAgo = new Date(today)
                  monthAgo.setDate(monthAgo.getDate() - 30)
                  setStartDate(monthAgo.toISOString().split('T')[0])
                  setEndDate(today.toISOString().split('T')[0])
                  setStartTime('')
                  setEndTime('')
                }}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Últimos 30 dias
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
                  setStartDate(firstDay.toISOString().split('T')[0])
                  setEndDate(today.toISOString().split('T')[0])
                  setStartTime('')
                  setEndTime('')
                }}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Este mês
              </button>
            </div>
            
            {/* Indicador de filtro ativo */}
            {(startDate || endDate) && (
              <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-400">
                  <Filter className="w-4 h-4 inline mr-1" />
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
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : (
          <>
            {/* Login Logs Tab */}
            {activeTab === 'logins' && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Usuário</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">IP</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Localização</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Dispositivo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Navegador</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Data/Hora</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredLoginLogs.map((log) => (
                        <>
                          <tr key={log.id} className="hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-3">
                              {log.success ? (
                                <span className="flex items-center gap-1 text-green-400">
                                  <CheckCircle className="w-4 h-4" />
                                  Sucesso
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-red-400">
                                  <XCircle className="w-4 h-4" />
                                  Falha
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">{log.user_name || '-'}</p>
                                <p className="text-sm text-gray-400">{log.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-sm">{log.ip_address || '-'}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{log.city ? `${log.city}, ${log.region || log.country}` : '-'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {getDeviceIcon(log.device_type)}
                                <span className="capitalize">{log.device_type || '-'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p>{log.browser} {log.browser_version}</p>
                                <p className="text-sm text-gray-400">{log.os} {log.os_version}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{formatDate(log.created_at)}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleRowExpansion(log.id)}
                                className="p-1 hover:bg-gray-600 rounded transition-colors"
                              >
                                {expandedRows.has(log.id) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                          </tr>
                          {expandedRows.has(log.id) && (
                            <tr className="bg-gray-700/30">
                              <td colSpan={8} className="px-4 py-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-400">User Agent</p>
                                    <p className="font-mono text-xs break-all">{log.user_agent}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">ISP</p>
                                    <p>{log.isp || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Timezone</p>
                                    <p>{log.timezone || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Coordenadas</p>
                                    <p>{log.latitude && log.longitude ? `${log.latitude}, ${log.longitude}` : '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Session ID</p>
                                    <p className="font-mono text-xs">{log.session_id || '-'}</p>
                                  </div>
                                  {!log.success && log.failure_reason && (
                                    <div className="col-span-2">
                                      <p className="text-gray-400">Motivo da Falha</p>
                                      <p className="text-red-400">{log.failure_reason}</p>
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
                    <div className="text-center py-12 text-gray-400">
                      <LogIn className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum log de login encontrado</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Page Views Tab */}
            {activeTab === 'pages' && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Usuário</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Página</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Dispositivo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Navegador</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Data/Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredPageViews.map((view) => (
                        <tr key={view.id} className="hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{view.user_name || '-'}</p>
                              <p className="text-sm text-gray-400">{view.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-mono text-sm">{view.page_path}</p>
                              {view.page_title && (
                                <p className="text-sm text-gray-400">{view.page_title}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(view.device_type)}
                              <span className="capitalize">{view.device_type || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p>{view.browser}</p>
                              <p className="text-sm text-gray-400">{view.os}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{formatDate(view.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPageViews.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma visualização de página encontrada</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Stats Tab */}
            {activeTab === 'users' && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Usuário</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Total Logins</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Páginas Vistas</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Último Login</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Última Localização</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Último Dispositivo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Última Página</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredUserStats.map((stat) => (
                        <tr key={stat.id} className="hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{stat.user_name || '-'}</p>
                              <p className="text-sm text-gray-400">{stat.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                              {stat.total_logins || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                              {stat.total_page_views || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{formatDate(stat.last_login_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{stat.last_city ? `${stat.last_city}, ${stat.last_country}` : '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p>{stat.last_browser || '-'}</p>
                              <p className="text-sm text-gray-400">{stat.last_os || '-'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-mono text-sm">{stat.last_page_viewed || '-'}</p>
                            {stat.last_page_viewed_at && (
                              <p className="text-xs text-gray-400">{formatDate(stat.last_page_viewed_at)}</p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUserStats.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma estatística de usuário encontrada</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700 mt-8">
        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
          <img src="/dataro-logo-final.png" alt="DATA-RO" className="h-6" />
          <span>DATA-RO Inteligência Territorial - Todos os direitos reservados</span>
        </div>
      </div>
    </div>
  )
}
