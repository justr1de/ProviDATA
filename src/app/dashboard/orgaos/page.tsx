'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { isSuperAdmin } from '@/lib/auth-utils'
import { 
  Plus, 
  Search, 
  Building2,
  Phone,
  Mail,
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
  empresa_privada: 'Empresa Privada',
  autarquia_municipal: 'Autarquia Municipal',
  autarquia_estadual: 'Autarquia Estadual',
  autarquia_federal: 'Autarquia Federal',
  outros: 'Outros',
}

export default function OrgaosPage() {
  const [orgaos, setOrgaos] = useState<Orgao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { user, gabinete: tenant } = useAuthStore()
  const supabase = createClient()

  const loadOrgaos = async () => {
    if (!tenant) return

    setIsLoading(true)
    try {
      let query = supabase
        .from('orgaos')
        .select('*')
      
      // Filtrar por tenant apenas se não for super admin
      if (!isSuperAdmin(user)) {
        query = query.eq('tenant_id', tenant.id)
      }
      
      query = query.order('nome')

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

  // Estilos padronizados
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    overflow: 'hidden'
  }

  const cardHeaderStyle: React.CSSProperties = {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }

  const cardContentStyle: React.CSSProperties = {
    padding: '24px'
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
    outline: 'none',
    maxWidth: '400px'
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

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: 'var(--primary-muted)',
    color: 'var(--primary)'
  }

  const badgeOutlineStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--foreground-muted)'
  }

  return (
    <div style={{ padding: '0 24px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row',
        alignItems: 'flex-start', 
        justifyContent: 'space-between', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Building2 style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--foreground)', margin: 0 }}>
              Órgãos
            </h1>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--foreground-muted)', margin: 0, paddingLeft: '44px' }}>
            Gerencie os órgãos destinatários das providências
          </p>
        </div>
        <Link href="/dashboard/orgaos/novo" style={{ textDecoration: 'none' }}>
          <button style={buttonStyle}>
            <Plus style={{ width: '18px', height: '18px' }} />
            Novo Órgão
          </button>
        </Link>
      </div>

      {/* Main Card */}
      <div style={cardStyle}>
        {/* Card Header with Search */}
        <div style={cardHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', width: '100%' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
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
                placeholder="Buscar por nome ou sigla..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={inputStyle}
              />
            </div>
            <span style={{ fontSize: '14px', color: 'var(--foreground-muted)', whiteSpace: 'nowrap' }}>
              {orgaos.length} órgão{orgaos.length !== 1 ? 's' : ''} cadastrado{orgaos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div style={cardContentStyle}>
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
          ) : orgaos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Building2 style={{ width: '48px', height: '48px', color: 'var(--foreground-muted)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '16px', color: 'var(--foreground-muted)', marginBottom: '16px' }}>
                {search ? 'Nenhum órgão encontrado' : 'Nenhum órgão cadastrado ainda'}
              </p>
              {!search && (
                <Link href="/dashboard/orgaos/novo" style={{ textDecoration: 'none' }}>
                  <button style={buttonStyle}>
                    <Plus style={{ width: '18px', height: '18px' }} />
                    Cadastrar Primeiro Órgão
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {orgaos.map((orgao) => (
                <div
                  key={orgao.id}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--muted)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>
                          {orgao.nome}
                        </h4>
                        {orgao.sigla && (
                          <span style={badgeStyle}>{orgao.sigla}</span>
                        )}
                      </div>
                      <span style={badgeOutlineStyle}>
                        {tipoLabels[orgao.tipo]}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Link href={`/dashboard/orgaos/${orgao.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--background)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'var(--foreground-muted)'
                        }}>
                          <Edit style={{ width: '16px', height: '16px' }} />
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(orgao.id)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--background)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#ef4444'
                        }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--foreground-muted)' }}>
                    {orgao.email && (
                      <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail style={{ width: '14px', height: '14px' }} />
                        {orgao.email}
                      </p>
                    )}
                    {orgao.telefone && (
                      <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone style={{ width: '14px', height: '14px' }} />
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
        </div>
      </div>
    </div>
  )
}
