'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
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

  return (
    <div className="px-1 md:px-2">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Users style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
            <h1 className="text-xl md:text-2xl lg:text-[28px] font-bold" style={{ color: 'var(--foreground)' }}>
              Cidadãos
            </h1>
          </div>
          <p className="text-sm md:text-base" style={{ color: 'var(--foreground-muted)' }}>
            Gerencie os cidadãos cadastrados
          </p>
        </div>
        <Link href="/dashboard/cidadaos/novo" style={{ textDecoration: 'none' }}>
          <button style={buttonStyle}>
            <Plus style={{ width: '18px', height: '18px' }} />
            Novo Cidadão
          </button>
        </Link>
      </div>

      {/* Main Card */}
      <div style={cardStyle}>
        {/* Card Header with Search */}
        <div style={cardHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
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
                placeholder="Buscar por nome, CPF ou e-mail..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>
              {totalCount} cidadão{totalCount !== 1 ? 's' : ''} cadastrado{totalCount !== 1 ? 's' : ''}
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
          ) : cidadaos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Users style={{ width: '48px', height: '48px', color: 'var(--foreground-muted)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '16px', color: 'var(--foreground-muted)', marginBottom: '16px' }}>
                {search ? 'Nenhum cidadão encontrado' : 'Nenhum cidadão cadastrado ainda'}
              </p>
              {!search && (
                <Link href="/dashboard/cidadaos/novo" style={{ textDecoration: 'none' }}>
                  <button style={buttonStyle}>
                    <Plus style={{ width: '18px', height: '18px' }} />
                    Cadastrar Primeiro Cidadão
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cidadaos.map((cidadao) => (
                <Link
                  key={cidadao.id}
                  href={`/dashboard/cidadaos/${cidadao.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--muted)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>
                      {cidadao.nome.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '6px' }}>
                        {cidadao.nome}
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--foreground-muted)' }}>
                        {cidadao.cpf && (
                          <span>CPF: {cidadao.cpf}</span>
                        )}
                        {cidadao.telefone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone style={{ width: '14px', height: '14px' }} />
                            {cidadao.telefone}
                          </span>
                        )}
                        {cidadao.email && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail style={{ width: '14px', height: '14px' }} />
                            {cidadao.email}
                          </span>
                        )}
                        {cidadao.bairro && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin style={{ width: '14px', height: '14px' }} />
                            {cidadao.bairro}
                          </span>
                        )}
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
