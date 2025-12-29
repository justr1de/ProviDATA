'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Users,
  Building2,
  Eye,
  MoreVertical,
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

const priorityLabels: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}

const ITEMS_PER_PAGE = 10

export default function ProvidenciasPage() {
  const [providencias, setProvidencias] = useState<Providencia[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const { tenant } = useAuthStore()
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
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })

        if (statusFilter) {
          query = query.eq('status', statusFilter)
        }

        if (priorityFilter) {
          query = query.eq('prioridade', priorityFilter)
        }

        if (search) {
          query = query.or(`titulo.ilike.%${search}%,numero_protocolo.ilike.%${search}%,descricao.ilike.%${search}%`)
        }

        // Pagination
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Providências</h1>
          <p className="text-[var(--muted-foreground)]">
            Gerencie todas as providências do gabinete
          </p>
        </div>
        <Link href="/dashboard/providencias/nova">
          <Button>
            <Plus className="w-4 h-4" />
            Nova Providência
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por título, protocolo ou descrição..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-40"
              />
              <Select
                options={priorityOptions}
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>
              {totalCount} providência{totalCount !== 1 ? 's' : ''} encontrada{totalCount !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : providencias.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="text-[var(--muted-foreground)]">
                Nenhuma providência encontrada
              </p>
              {(search || statusFilter || priorityFilter) && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('')
                    setPriorityFilter('')
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {providencias.map((providencia) => (
                <Link
                  key={providencia.id}
                  href={`/dashboard/providencias/${providencia.id}`}
                  className="block"
                >
                  <div className="flex items-start gap-4 p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-[var(--muted-foreground)]">
                          {providencia.numero_protocolo}
                        </span>
                        <Badge className={`status-${providencia.status}`}>
                          {statusLabels[providencia.status]}
                        </Badge>
                        <Badge className={`priority-${providencia.prioridade}`}>
                          {priorityLabels[providencia.prioridade]}
                        </Badge>
                        {providencia.categoria && (
                          <Badge 
                            variant="outline"
                            style={{ borderColor: providencia.categoria.cor, color: providencia.categoria.cor }}
                          >
                            {providencia.categoria.nome}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium mb-1">{providencia.titulo}</h4>
                      <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-2">
                        {providencia.descricao}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
                        {providencia.cidadao && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {providencia.cidadao.nome}
                          </span>
                        )}
                        {providencia.orgao_destino && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {providencia.orgao_destino.sigla || providencia.orgao_destino.nome}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(providencia.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        {providencia.prazo_estimado && (
                          <span className={`flex items-center gap-1 ${
                            new Date(providencia.prazo_estimado) < new Date() && 
                            !['concluido', 'arquivado'].includes(providencia.status)
                              ? 'text-red-600 font-medium'
                              : ''
                          }`}>
                            Prazo: {format(new Date(providencia.prazo_estimado), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)]">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
