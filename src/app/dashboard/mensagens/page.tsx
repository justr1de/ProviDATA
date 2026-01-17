'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { isSuperAdmin } from '@/lib/auth-utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Mail, 
  MessageCircle, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Send,
  Loader2,
  RefreshCw,
  Filter,
  Calendar,
  X
} from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'

interface EmailTracking {
  id: string
  tracking_id: string
  providencia_id: string
  gabinete_id: string
  destinatario_email: string
  destinatario_nome: string
  assunto: string
  status: string
  enviado_em: string
  aberto_em: string | null
  total_aberturas: number
  created_at: string
}

interface NotificacaoCidadao {
  id: string
  providencia_id: string
  cidadao_id: string
  gabinete_id: string
  tipo_notificacao: string
  assunto: string
  mensagem: string
  status: string
  destinatario: string
  erro_mensagem: string | null
  enviado_em: string | null
  entregue_em: string | null
  lido_em: string | null
  created_at: string
  cidadao?: { nome: string }
  providencia?: { numero_protocolo: string; titulo: string }
}

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  enviado: { bg: '#dbeafe', text: '#1e40af', icon: Send },
  entregue: { bg: '#dcfce7', text: '#166534', icon: CheckCircle2 },
  lido: { bg: '#d1fae5', text: '#065f46', icon: Eye },
  aberto: { bg: '#d1fae5', text: '#065f46', icon: Eye },
  pendente: { bg: '#fef3c7', text: '#92400e', icon: Clock },
  erro: { bg: '#fecaca', text: '#991b1b', icon: XCircle },
  falha: { bg: '#fecaca', text: '#991b1b', icon: XCircle },
}

const statusLabels: Record<string, string> = {
  enviado: 'Enviado',
  entregue: 'Entregue',
  lido: 'Lido',
  aberto: 'Aberto',
  pendente: 'Pendente',
  erro: 'Erro',
  falha: 'Falha',
}

const ITEMS_PER_PAGE = 10

export default function MensagensPage() {
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email')
  const [emails, setEmails] = useState<EmailTracking[]>([])
  const [whatsappMessages, setWhatsappMessages] = useState<NotificacaoCidadao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  const { user, gabinete: tenant } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    if (tenant?.id) {
      loadMessages()
    }
  }, [tenant?.id, activeTab, currentPage, statusFilter, dateFrom, dateTo])

  const loadMessages = async () => {
    if (!tenant?.id) return
    
    setIsLoading(true)
    try {
      if (activeTab === 'email') {
        await loadEmails()
      } else {
        await loadWhatsappMessages()
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadEmails = async () => {
    let query = supabase
      .from('email_tracking')
      .select('*', { count: 'exact' })
    
    if (!isSuperAdmin(user)) {
      query = query.eq('gabinete_id', tenant?.id)
    }

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    if (search) {
      query = query.or(`destinatario_email.ilike.%${search}%,destinatario_nome.ilike.%${search}%,assunto.ilike.%${search}%`)
    }

    // Filtro de data
    if (dateFrom) {
      query = query.gte('enviado_em', `${dateFrom}T00:00:00`)
    }
    if (dateTo) {
      query = query.lte('enviado_em', `${dateTo}T23:59:59`)
    }

    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const { data, count, error } = await query
      .order('enviado_em', { ascending: false })
      .range(from, to)

    if (error) throw error

    setEmails(data || [])
    setTotalCount(count || 0)
  }

  const loadWhatsappMessages = async () => {
    let query = supabase
      .from('notificacoes_cidadao')
      .select(`
        *,
        cidadao:cidadaos(nome),
        providencia:providencias(numero_protocolo, titulo)
      `, { count: 'exact' })
      .eq('tipo_notificacao', 'whatsapp')
    
    if (!isSuperAdmin(user)) {
      query = query.eq('gabinete_id', tenant?.id)
    }

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    if (search) {
      query = query.or(`destinatario.ilike.%${search}%,assunto.ilike.%${search}%`)
    }

    // Filtro de data
    if (dateFrom) {
      query = query.gte('created_at', `${dateFrom}T00:00:00`)
    }
    if (dateTo) {
      query = query.lte('created_at', `${dateTo}T23:59:59`)
    }

    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    setWhatsappMessages(data || [])
    setTotalCount(count || 0)
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const handleTabChange = (tab: 'email' | 'whatsapp') => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearch('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
  }

  const clearDateFilters = () => {
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return '-'
    }
  }

  const getStatusBadge = (status: string) => {
    const config = statusColors[status?.toLowerCase()] || statusColors.pendente
    const StatusIcon = config.icon
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: config.bg,
        color: config.text
      }}>
        <StatusIcon style={{ width: '14px', height: '14px' }} />
        {statusLabels[status?.toLowerCase()] || status || 'Desconhecido'}
      </span>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
            <Tooltip content="Central de Mensagens" position="right">
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
                <Send style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
            </Tooltip>
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: 'var(--text-color)',
                margin: 0
              }}>
                Central de Mensagens
              </h1>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--text-muted)',
                margin: '4px 0 0 0'
              }}>
                Acompanhe e-mails e mensagens de WhatsApp enviados
              </p>
            </div>
          </div>
          <Tooltip content="Atualizar lista" position="bottom">
            <button
              onClick={loadMessages}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: 'var(--muted-bg)',
                color: 'var(--text-muted)',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <RefreshCw style={{ 
                width: '18px', 
                height: '18px',
                animation: isLoading ? 'spin 1s linear infinite' : 'none'
              }} />
              Atualizar
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        backgroundColor: 'var(--card)',
        padding: '8px',
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <button
          onClick={() => handleTabChange('email')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.2s',
            backgroundColor: activeTab === 'email' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'email' ? 'white' : 'var(--text-muted)'
          }}
        >
          <Mail style={{ width: '20px', height: '20px' }} />
          E-mails Enviados
        </button>
        <button
          onClick={() => handleTabChange('whatsapp')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.2s',
            backgroundColor: activeTab === 'whatsapp' ? '#25D366' : 'transparent',
            color: activeTab === 'whatsapp' ? 'white' : 'var(--text-muted)'
          }}
        >
          <MessageCircle style={{ width: '20px', height: '20px' }} />
          WhatsApp Enviados
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
          <Search style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '18px',
            height: '18px',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder={activeTab === 'email' ? 'Buscar por e-mail, nome ou assunto...' : 'Buscar por telefone ou assunto...'}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            style={{
              width: '100%',
              padding: '12px 14px 12px 44px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card)',
              fontSize: '14px',
              color: 'var(--text-color)'
            }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <Filter style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            color: 'var(--text-muted)'
          }} />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            style={{
              padding: '12px 14px 12px 40px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card)',
              fontSize: '14px',
              color: 'var(--text-color)',
              cursor: 'pointer',
              minWidth: '180px'
            }}
          >
            <option value="">Todos os Status</option>
            <option value="enviado">Enviado</option>
            <option value="entregue">Entregue</option>
            <option value="lido">Lido</option>
            <option value="aberto">Aberto</option>
            <option value="pendente">Pendente</option>
            <option value="erro">Erro</option>
          </select>
        </div>
      </div>

      {/* Date Filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: 'var(--card)',
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-color)' }}>Período:</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>De:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              setCurrentPage(1)
            }}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--muted-bg)',
              fontSize: '14px',
              color: 'var(--text-color)',
              cursor: 'pointer'
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Até:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value)
              setCurrentPage(1)
            }}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--muted-bg)',
              fontSize: '14px',
              color: 'var(--text-color)',
              cursor: 'pointer'
            }}
          />
        </div>
        {(dateFrom || dateTo) && (
          <Tooltip content="Limpar filtro de data" position="top">
            <button
              onClick={clearDateFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: '14px', height: '14px' }} />
              Limpar
            </button>
          </Tooltip>
        )}
      </div>

      {/* Content */}
      <div style={{
        backgroundColor: 'var(--card)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            gap: '12px',
            color: 'var(--text-muted)'
          }}>
            <Loader2 style={{ width: '24px', height: '24px', animation: 'spin 1s linear infinite' }} />
            <span>Carregando mensagens...</span>
          </div>
        ) : (activeTab === 'email' ? emails.length === 0 : whatsappMessages.length === 0) ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            gap: '16px',
            color: 'var(--text-muted)'
          }}>
            {activeTab === 'email' ? (
              <Mail style={{ width: '48px', height: '48px', opacity: 0.5 }} />
            ) : (
              <MessageCircle style={{ width: '48px', height: '48px', opacity: 0.5 }} />
            )}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Nenhuma mensagem encontrada
              </p>
              <p style={{ fontSize: '14px', margin: 0 }}>
                {activeTab === 'email' 
                  ? 'Os e-mails enviados aparecerão aqui'
                  : 'As mensagens de WhatsApp enviadas aparecerão aqui'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--muted-bg)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                      Destinatário
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                      Assunto
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                      Status
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                      Enviado em
                    </th>
                    {activeTab === 'email' && (
                      <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                        Aberturas
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'email' ? (
                    emails.map((email) => (
                      <tr key={email.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-color)', margin: '0 0 2px 0' }}>
                              {email.destinatario_nome || 'Sem nome'}
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                              {email.destinatario_email}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <p style={{ 
                            fontSize: '14px', 
                            color: 'var(--text-color)', 
                            margin: 0,
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {email.assunto || 'Sem assunto'}
                          </p>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {getStatusBadge(email.status)}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                              {formatDate(email.enviado_em)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <Tooltip content={email.aberto_em ? `Última abertura: ${formatDate(email.aberto_em)}` : 'Não aberto'} position="top">
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '13px',
                              fontWeight: '600',
                              backgroundColor: email.total_aberturas > 0 ? '#dcfce7' : 'var(--muted-bg)',
                              color: email.total_aberturas > 0 ? '#166534' : 'var(--text-muted)'
                            }}>
                              <Eye style={{ width: '14px', height: '14px' }} />
                              {email.total_aberturas || 0}
                            </span>
                          </Tooltip>
                        </td>
                      </tr>
                    ))
                  ) : (
                    whatsappMessages.map((msg) => (
                      <tr key={msg.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-color)', margin: '0 0 2px 0' }}>
                              {msg.cidadao?.nome || 'Cidadão'}
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                              {msg.destinatario}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <p style={{ 
                              fontSize: '14px', 
                              color: 'var(--text-color)', 
                              margin: '0 0 2px 0',
                              maxWidth: '300px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {msg.assunto || 'Sem assunto'}
                            </p>
                            {msg.providencia && (
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                                Ref: {msg.providencia.numero_protocolo}
                              </p>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {getStatusBadge(msg.status)}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                              {formatDate(msg.enviado_em || msg.created_at)}
                            </span>
                          </div>
                          {msg.entregue_em && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <CheckCircle2 style={{ width: '14px', height: '14px', color: '#22c55e' }} />
                              <span style={{ fontSize: '12px', color: '#22c55e' }}>
                                Entregue: {formatDate(msg.entregue_em)}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderTop: '1px solid var(--border)',
                backgroundColor: 'var(--muted-bg)'
              }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--card)',
                      color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-color)',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      opacity: currentPage === 1 ? 0.5 : 1
                    }}
                  >
                    <ChevronLeft style={{ width: '16px', height: '16px' }} />
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--card)',
                      color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-color)',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      opacity: currentPage === totalPages ? 0.5 : 1
                    }}
                  >
                    Próximo
                    <ChevronRight style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }}>
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Send style={{ width: '24px', height: '24px', color: '#2563eb' }} />
          </div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-color)', margin: 0 }}>
              {totalCount}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Total {activeTab === 'email' ? 'de E-mails' : 'de WhatsApp'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
