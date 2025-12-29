'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Building2,
  Phone,
  Mail,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import type { Orgao } from '@/types/database'
import { toast } from 'sonner'

const tipoLabels: Record<string, string> = {
  secretaria_municipal: 'Secretaria Municipal',
  secretaria_estadual: 'Secretaria Estadual',
  mp_estadual: 'Ministério Público Estadual',
  mp_federal: 'Ministério Público Federal',
  defensoria: 'Defensoria Pública',
  tribunal_contas: 'Tribunal de Contas',
  outros: 'Outros',
}

export default function OrgaosPage() {
  const [orgaos, setOrgaos] = useState<Orgao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { tenant } = useAuthStore()
  const supabase = createClient()

  const loadOrgaos = async () => {
    if (!tenant) return

    setIsLoading(true)
    try {
      let query = supabase
        .from('orgaos')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('nome')

      if (search) {
        query = query.or(`nome.ilike.%${search}%,sigla.ilike.%${search}%`)
      }

      const { data, error } = await query

      if (error) throw error

      setOrgaos(data || [])
    } catch (error) {
      console.error('Error loading orgaos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrgaos()
  }, [tenant, search])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este órgão?')) return

    try {
      const { error } = await supabase
        .from('orgaos')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Órgão excluído com sucesso')
      loadOrgaos()
    } catch (error) {
      console.error('Error deleting orgao:', error)
      toast.error('Erro ao excluir órgão')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Órgãos</h1>
          <p className="text-[var(--muted-foreground)]">
            Gerencie os órgãos destinatários das providências
          </p>
        </div>
        <Link href="/dashboard/orgaos/novo">
          <Button>
            <Plus className="w-4 h-4" />
            Novo Órgão
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar por nome ou sigla..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {orgaos.length} órgão{orgaos.length !== 1 ? 's' : ''} cadastrado{orgaos.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orgaos.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="text-[var(--muted-foreground)]">
                {search ? 'Nenhum órgão encontrado' : 'Nenhum órgão cadastrado ainda'}
              </p>
              {!search && (
                <Link href="/dashboard/orgaos/novo">
                  <Button className="mt-4">
                    <Plus className="w-4 h-4" />
                    Cadastrar Primeiro Órgão
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orgaos.map((orgao) => (
                <div
                  key={orgao.id}
                  className="p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{orgao.nome}</h4>
                        {orgao.sigla && (
                          <Badge variant="secondary">{orgao.sigla}</Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {tipoLabels[orgao.tipo]}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/dashboard/orgaos/${orgao.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(orgao.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-[var(--muted-foreground)]">
                    {orgao.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {orgao.email}
                      </p>
                    )}
                    {orgao.telefone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {orgao.telefone}
                      </p>
                    )}
                    {orgao.responsavel && (
                      <p>Responsável: {orgao.responsavel}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
