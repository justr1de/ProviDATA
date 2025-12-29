'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Users,
  Phone,
  Mail,
  MapPin,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import type { Cidadao } from '@/types/database'

const ITEMS_PER_PAGE = 10

export default function CidadaosPage() {
  const [cidadaos, setCidadaos] = useState<Cidadao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const { tenant } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    const loadCidadaos = async () => {
      if (!tenant) return

      setIsLoading(true)
      try {
        let query = supabase
          .from('cidadaos')
          .select('*', { count: 'exact' })
          .eq('tenant_id', tenant.id)
          .order('nome')

        if (search) {
          query = query.or(`nome.ilike.%${search}%,cpf.ilike.%${search}%,email.ilike.%${search}%`)
        }

        const from = (currentPage - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1
        query = query.range(from, to)

        const { data, count, error } = await query

        if (error) throw error

        setCidadaos(data || [])
        setTotalCount(count || 0)
      } catch (error) {
        console.error('Error loading cidadaos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCidadaos()
  }, [tenant, supabase, search, currentPage])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cidadãos</h1>
          <p className="text-[var(--muted-foreground)]">
            Gerencie os cidadãos cadastrados
          </p>
        </div>
        <Link href="/dashboard/cidadaos/novo">
          <Button>
            <Plus className="w-4 h-4" />
            Novo Cidadão
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar por nome, CPF ou e-mail..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            icon={<Search className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {totalCount} cidadão{totalCount !== 1 ? 's' : ''} cadastrado{totalCount !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : cidadaos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="text-[var(--muted-foreground)]">
                {search ? 'Nenhum cidadão encontrado' : 'Nenhum cidadão cadastrado ainda'}
              </p>
              {!search && (
                <Link href="/dashboard/cidadaos/novo">
                  <Button className="mt-4">
                    <Plus className="w-4 h-4" />
                    Cadastrar Primeiro Cidadão
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {cidadaos.map((cidadao) => (
                <Link
                  key={cidadao.id}
                  href={`/dashboard/cidadaos/${cidadao.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-medium text-lg">
                      {cidadao.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{cidadao.nome}</h4>
                      <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-[var(--muted-foreground)]">
                        {cidadao.cpf && (
                          <span>CPF: {cidadao.cpf}</span>
                        )}
                        {cidadao.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {cidadao.telefone}
                          </span>
                        )}
                        {cidadao.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {cidadao.email}
                          </span>
                        )}
                        {cidadao.bairro && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {cidadao.bairro}
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
