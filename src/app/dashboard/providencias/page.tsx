'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { isSuperAdmin } from '@/lib/auth-utils'
import { 
  Plus, 
  Search, 
  FileText,
  Calendar,
  Users,
  Building2,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import type { Providencia } from '@/types/database'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusOptions = [
  { value: '', label: 'Todos os Status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'encaminhado', label: 'Encaminhado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'arquivado', label: 'Arquivado' },
]

const priorityOptions = [
  { value: '', label: 'Todas as Prioridades' },
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  em_analise: 'Em Análise',
  encaminhado: 'Encaminhado',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pendente: { bg: '#fef3c7', text: '#92400e' },
  em_analise: { bg: '#dbeafe', text: '#1e40af' },
  encaminhado: { bg: '#e0e7ff', text: '#3730a3' },
  em_andamento: { bg: '#cffafe', text: '#0e7490' },
  concluido: { bg: '#dcfce7', text: '#166534' },
  arquivado: { bg: '#f3f4f6', text: '#374151' },
}

const priorityLabels: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  baixa: { bg: '#dcfce7', text: '#166534' },
  media: { bg: '#fef3c7', text: '#92400e' },
  alta: { bg: '#fed7aa', text: '#9a3412' },
  urgente: { bg: '#fecaca', text: '#991b1b' },
}

const ITEMS_PER_PAGE = 10

function ProvidenciasContent() {
  const [providencias, setProvidencias] = useState<Providencia[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const { user, gabinete: tenant } = useAuthStore()
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    const status = searchParams.get('status')
    if (status) {
      setStatusFilter(status)
    }
  }, [searchParams])

  useEffect(() => {
    const loadProvidencias = async () => {
      if (!tenant) return

      setIsLoading(true)
      try {
        let query = supabase
          .from('providencias')
          .select(`
            *,
            cidadao:cidadaos(nome),
            categoria:categorias(nome, cor),
            orgao_destino:orgaos(nome, sigla)
          `, { count: 'exact' })
        
        // Filtrar por gabinete apenas se não for super admin
        if (!isSuperAdmin(user)) {
          query = query.eq('gabinete_id', tenant.id)
        }
        
        query = query.order('created_at', { ascending: false })

        if (statusFilter) {
          query = query.eq('status', statusFilter)
        }

        if (priorityFilter) {
          query = query.eq('prioridade', priorityFilter)
        }

        if (search) {
          query = query.or(`titulo.ilike.%${search}%,numero_protocolo.ilike.%${search}%,descricao.ilike.%${search}%`)
        }

        const from = (currentPage - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1
        query = query.range(from, to)

        const { data, count, error } = await query

        if (error) throw error

        setProvidencias(data || [])
        setTotalCount(count || 0)
      } catch (error) {
        console.error('Error loading providencias:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProvidencias()
  }, [tenant, supabase, statusFilter, priorityFilter, search, currentPage])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  // Estilos padronizados
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    overflow: 'hidden'
  }

  const cardHeaderStyle: React.CSSProperties = {
    padding: '16px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }

  const cardContentStyle: React.CSSProperties = {
    padding: '16px'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    paddingLeft: '44px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '14px',
    outline: 'none'
  }

  const selectStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '14px',
    cursor: 'pointer',
    minWidth: '140px'
  }

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '10px',
    backgroundColor: 'var(--primary)',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }

  const badgeStyle = (colors: { bg: string; text: string }): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: colors.bg,
    color: colors.text
  })

  return (
    <div className="px-1 md:px-2">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FileText style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
            <h1 className="text-xl md:text-2xl lg:text-[28px] font-bold" style={{ color: 'var(--foreground)' }}>
              Providências
            </h1>
          </div>
          <p className="text-sm md:text-base" style={{ color: 'var(--foreground-muted)' }}>
            Gerencie todas as providências do gabinete
          </p>
        </div>
        <Link href="/dashboard/providencias/nova" style={{ textDecoration: 'none' }}>
          <button style={buttonStyle}>
            <Plus style={{ width: '18px', height: '18px' }} />
            Nova Providência
          </button>
        </Link>
      </div>

      {/* Main Card */}
      <div style={cardStyle}>
        {/* Card Header with Filters */}
        <div style={cardHeaderStyle}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-1">
            <div className="relative flex-1 sm:max-w-[400px]">
              <Search style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '18px', 
                height: '18px', 
                color: 'var(--foreground-muted)' 
              }} />
              <input
                type="text"
                placeholder="Buscar por título, protocolo ou descrição..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                style={inputStyle}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              style={selectStyle}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value)
                setCurrentPage(1)
              }}
              style={selectStyle}
            >
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Card Content */}
        <div style={cardContentStyle}>
          {/* Results Count */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>
              {totalCount} providência{totalCount !== 1 ? 's' : ''} encontrada{totalCount !== 1 ? 's' : ''}
            </h2>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--border)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : providencias.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FileText style={{ width: '48px', height: '48px', color: 'var(--foreground-muted)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '16px', color: 'var(--foreground-muted)', marginBottom: '16px' }}>
                Nenhuma providência encontrada
              </p>
              {(search || statusFilter || priorityFilter) && (
                <button
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('')
                    setPriorityFilter('')
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--foreground)',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {providencias.map((providencia) => (
                <Link
                  key={providencia.id}
                  href={`/dashboard/providencias/${providencia.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--muted)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--foreground-muted)' }}>
                            {providencia.numero_protocolo}
                          </span>
                          <span style={badgeStyle(statusColors[providencia.status] || statusColors.pendente)}>
                            {statusLabels[providencia.status]}
                          </span>
                          <span style={badgeStyle(priorityColors[providencia.prioridade] || priorityColors.media)}>
                            {priorityLabels[providencia.prioridade]}
                          </span>
                          {providencia.categoria && (
                            <span style={{
                              ...badgeStyle({ bg: `${providencia.categoria.cor}20`, text: providencia.categoria.cor }),
                              border: `1px solid ${providencia.categoria.cor}`
                            }}>
                              {providencia.categoria.nome}
                            </span>
                          )}
                        </div>

                        {/* Title and Description */}
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '6px' }}>
                          {providencia.titulo}
                        </h3>
                        <p style={{ 
                          fontSize: '14px', 
                          color: 'var(--foreground-muted)', 
                          lineHeight: '1.5',
                          marginBottom: '12px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {providencia.descricao}
                        </p>

                        {/* Meta Info */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--foreground-muted)' }}>
                          {providencia.cidadao && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Users style={{ width: '14px', height: '14px' }} />
                              {providencia.cidadao.nome}
                            </span>
                          )}
                          {providencia.orgao_destino && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Building2 style={{ width: '14px', height: '14px' }} />
                              {providencia.orgao_destino.sigla || providencia.orgao_destino.nome}
                            </span>
                          )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar style={{ width: '14px', height: '14px' }} />
                            {format(new Date(providencia.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>

                      <button style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--background)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--foreground-muted)'
                      }}>
                        <Eye style={{ width: '18px', height: '18px' }} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginTop: '24px', 
              paddingTop: '20px', 
              borderTop: '1px solid var(--border)' 
            }}>
              <p style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>
                Página {currentPage} de {totalPages}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: currentPage === 1 ? 'var(--foreground-muted)' : 'var(--foreground)',
                    fontSize: '14px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
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
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: currentPage === totalPages ? 'var(--foreground-muted)' : 'var(--foreground)',
                    fontSize: '14px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
                >
                  Próxima
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProvidenciasPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    }>
      <ProvidenciasContent />
    </Suspense>
  )
}
