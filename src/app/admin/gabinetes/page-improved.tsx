'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  X, 
  Search, 
  Filter, 
  Building2, 
  Loader2,
  CheckCircle2,
  XCircle,
  MapPin,
  ChevronDown,
  ChevronUp,
  LogOut
} from 'lucide-react'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import type { Gabinete } from '@/types/database'

// --- CONSTANTES ---
const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const

const CARGO_OPTIONS = [
  { value: '', label: 'Todos os cargos' },
  { value: 'vereador', label: 'Vereador' },
  { value: 'prefeito', label: 'Prefeito' },
  { value: 'deputado_estadual', label: 'Deputado Estadual' },
  { value: 'deputado_federal', label: 'Deputado Federal' },
  { value: 'senador', label: 'Senador' },
  { value: 'governador', label: 'Governador' }
] as const

// --- TIPOS ---
type FilterStatus = 'all' | 'ativo' | 'inativo'

interface FormData {
  nome: string
  municipio: string
  uf: string
  parlamentar_nome: string
  parlamentar_cargo: string
  partido: string
  telefone_parlamentar: string
  telefone_gabinete: string
  telefone_adicional: string
  email_parlamentar: string
  email_gabinete: string
  assessor_1: string
  assessor_2: string
}

// --- VALORES INICIAIS ---
const INITIAL_FORM_DATA: FormData = {
  nome: '',
  municipio: '',
  uf: 'RO',
  parlamentar_nome: '',
  parlamentar_cargo: 'deputado_estadual',
  partido: '',
  telefone_parlamentar: '',
  telefone_gabinete: '',
  telefone_adicional: '',
  email_parlamentar: '',
  email_gabinete: '',
  assessor_1: '',
  assessor_2: ''
}

// --- COMPONENTE PRINCIPAL ---
export default function GabinetesPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // --- ESTADOS ---
  const [gabinetes, setGabinetes] = useState<Gabinete[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUF, setFilterUF] = useState('')
  const [filterCargo, setFilterCargo] = useState('')
  const [filterPartido, setFilterPartido] = useState('')
  const [filterCidade, setFilterCidade] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  // Estado do Formulário
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)

  // --- ESTATÍSTICAS ---
  const stats = useMemo(() => {
    const total = gabinetes.length
    const ativos = gabinetes.filter(g => g.ativo).length
    const inativos = total - ativos
    
    // Aplicar filtros para contar resultados
    const filteredGabinetes = gabinetes.filter(gabinete => {
      const matchesSearch = searchTerm === '' || 
        gabinete.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gabinete.parlamentar_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gabinete.municipio?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesUF = filterUF === '' || gabinete.uf === filterUF
      const matchesCargo = filterCargo === '' || gabinete.parlamentar_cargo === filterCargo
      const matchesPartido = filterPartido === '' || gabinete.partido?.toLowerCase().includes(filterPartido.toLowerCase())
      const matchesCidade = filterCidade === '' || gabinete.municipio?.toLowerCase().includes(filterCidade.toLowerCase())
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'ativo' && gabinete.ativo) ||
        (filterStatus === 'inativo' && !gabinete.ativo)
      
      return matchesSearch && matchesUF && matchesCargo && matchesPartido && matchesCidade && matchesStatus
    })
    
    return { total, ativos, inativos, filtrados: filteredGabinetes.length }
  }, [gabinetes, searchTerm, filterUF, filterCargo, filterPartido, filterCidade, filterStatus])

  // --- GABINETES FILTRADOS ---
  const filteredGabinetes = useMemo(() => {
    return gabinetes.filter(gabinete => {
      const matchesSearch = searchTerm === '' || 
        gabinete.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gabinete.parlamentar_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gabinete.municipio?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesUF = filterUF === '' || gabinete.uf === filterUF
      const matchesCargo = filterCargo === '' || gabinete.parlamentar_cargo === filterCargo
      const matchesPartido = filterPartido === '' || gabinete.partido?.toLowerCase().includes(filterPartido.toLowerCase())
      const matchesCidade = filterCidade === '' || gabinete.municipio?.toLowerCase().includes(filterCidade.toLowerCase())
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'ativo' && gabinete.ativo) ||
        (filterStatus === 'inativo' && !gabinete.ativo)
      
      return matchesSearch && matchesUF && matchesCargo && matchesPartido && matchesCidade && matchesStatus
    })
  }, [gabinetes, searchTerm, filterUF, filterCargo, filterPartido, filterCidade, filterStatus])

  // --- FUNÇÕES ---
  const carregarGabinetes = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gabinetes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      setGabinetes(data || [])
    } catch (error) {
      console.error('Erro ao carregar gabinetes:', error)
      toast.error('Erro ao carregar gabinetes. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('gabinetes')
        .insert([{
          nome: formData.nome,
          municipio: formData.municipio,
          uf: formData.uf,
          parlamentar_nome: formData.parlamentar_nome,
          parlamentar_cargo: formData.parlamentar_cargo,
          partido: formData.partido,
          telefone_parlamentar: formData.telefone_parlamentar,
          telefone_gabinete: formData.telefone_gabinete,
          telefone_adicional: formData.telefone_adicional,
          email_parlamentar: formData.email_parlamentar,
          email_gabinete: formData.email_gabinete,
          assessor_1: formData.assessor_1,
          assessor_2: formData.assessor_2,
          ativo: true
        }])
      
      if (error) {
        throw error
      }
      
      toast.success('Gabinete criado com sucesso!')
      setShowModal(false)
      setFormData(INITIAL_FORM_DATA)
      await carregarGabinetes()
    } catch (error) {
      console.error('Erro ao criar gabinete:', error)
      toast.error('Erro ao criar gabinete. Por favor, tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }, [formData, supabase, carregarGabinetes])

  const toggleStatus = useCallback(async (gabinete: Gabinete) => {
    try {
      const novoStatus = !gabinete.ativo
      const { error } = await supabase
        .from('gabinetes')
        .update({ ativo: novoStatus })
        .eq('id', gabinete.id)
      
      if (error) {
        throw error
      }
      
      toast.success(`Gabinete ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`)
      await carregarGabinetes()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status do gabinete. Por favor, tente novamente.')
    }
  }, [supabase, carregarGabinetes])

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      toast.success('Logout realizado com sucesso!')
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast.error('Erro ao fazer logout. Por favor, tente novamente.')
    }
  }, [supabase, router])

  const limparFiltros = useCallback(() => {
    setSearchTerm('')
    setFilterUF('')
    setFilterCargo('')
    setFilterPartido('')
    setFilterCidade('')
    setFilterStatus('all')
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setFormData(INITIAL_FORM_DATA)
  }, [])

  // --- HELPERS DE FORMATAÇÃO ---
  const formatCargo = useCallback((cargo?: string) => {
    if (!cargo) return '-'
    return cargo
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }, [])

  const formatDate = useCallback((date: string) => {
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return '-'
    }
  }, [])

  // --- EFEITOS ---
  useEffect(() => {
    carregarGabinetes()
  }, [carregarGabinetes])

  // --- JSX (RENDERIZAÇÃO) ---
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)'
    }}>
      {/* --- HEADER PRINCIPAL --- */}
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
                  style={{ height: '40px', width: 'auto' }}
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
                Administração
              </span>
            </div>

            {/* Ações do Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
              >
                <LogOut size={18} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '24px 32px'
      }}>
        {/* Título e Botão */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
marginBottom: '20px'
          }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--foreground)',
                margin: 0
              }}>
                Gerenciar Gabinetes
              </h1>
              <p style={{
                fontSize: '14px',
                color: 'var(--foreground-muted)',
                marginTop: '4px'
              }}>
                Visualize e gerencie as organizações cadastradas no sistema
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <Plus size={20} />
              <span>Novo Gabinete</span>
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '20px'
        }} className="stats-grid">
          {/* Total */}
          <div className="stat-card" style={{
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
                <Building2 style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>Total</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>{stats.total}</p>
              </div>
            </div>
          </div>

          {/* Ativos */}
          <div className="stat-card" style={{
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
                <CheckCircle2 style={{ width: '20px', height: '20px', color: '#22c55e' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>Ativos</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e', margin: 0 }}>{stats.ativos}</p>
              </div>
            </div>
          </div>

          {/* Inativos */}
          <div className="stat-card" style={{
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
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>Inativos</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444', margin: 0 }}>{stats.inativos}</p>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="stat-card" style={{
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderRadius: '10px'
              }}>
                <Search style={{ width: '20px', height: '20px', color: '#a855f7' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', margin: 0 }}>Resultados</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#a855f7', margin: 0 }}>{stats.filtrados}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Ferramentas */}
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid var(--border)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {/* Campo de Busca */}
              <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <Search style={{ width: '20px', height: '20px', color: 'var(--foreground-muted)' }} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, município, parlamentar..."
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 44px',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    fontSize: '14px',
                    outline: 'none'
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
                  backgroundColor: showFilters ? 'rgba(22, 163, 74, 0.1)' : 'var(--background)',
                  color: showFilters ? '#16a34a' : 'var(--foreground)',
                  border: `1px solid ${showFilters ? '#16a34a' : 'var(--border)'}`,
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Filter size={18} />
                <span>Filtros</span>
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Painel de Filtros Expansível */}
            {showFilters && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border)'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', marginBottom: '6px' }}>
                    UF
                  </label>
                  <select
                    value={filterUF}
                    onChange={(e) => setFilterUF(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Todas</option>
                    {UF_OPTIONS.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', marginBottom: '6px' }}>
                    Cargo
                  </label>
                  <select
                    value={filterCargo}
                    onChange={(e) => setFilterCargo(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      fontSize: '14px'
                    }}
                  >
                    {CARGO_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', marginBottom: '6px' }}>
                    Partido
                  </label>
                  <input
                    type="text"
                    value={filterPartido}
                    onChange={(e) => setFilterPartido(e.target.value)}
                    placeholder="Ex: PT, PSDB..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', marginBottom: '6px' }}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={filterCidade}
                    onChange={(e) => setFilterCidade(e.target.value)}
                    placeholder="Ex: Porto Velho..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--foreground-muted)', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">Todos</option>
                    <option value="ativo">Ativos</option>
                    <option value="inativo">Inativos</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={limparFiltros}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--destructive)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabela de Gabinetes */}
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px',
              color: 'var(--foreground-muted)'
            }}>
              <Loader2 style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
              <span style={{ marginLeft: '12px', fontSize: '16px' }}>Carregando gabinetes...</span>
            </div>
          ) : filteredGabinetes.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px',
              color: 'var(--foreground-muted)'
            }}>
              <Building2 style={{ width: '48px', height: '48px', marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', fontWeight: 500 }}>Nenhum gabinete encontrado</p>
              <p style={{ fontSize: '14px', marginTop: '4px' }}>Tente ajustar os filtros ou criar um novo gabinete</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--background)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)', borderBottom: '1px solid var(--border)' }}>GABINETE</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)', borderBottom: '1px solid var(--border)' }}>PARLAMENTAR</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)', borderBottom: '1px solid var(--border)' }}>CARGO</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)', borderBottom: '1px solid var(--border)' }}>LOCALIZAÇÃO</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)', borderBottom: '1px solid var(--border)' }}>CADASTRO</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--foreground-muted)', borderBottom: '1px solid var(--border)' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGabinetes.map((gabinete, index) => (
                    <tr 
                      key={gabinete.id}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--background)',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(22, 163, 74, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Building2 style={{ width: '18px', height: '18px', color: '#16a34a' }} />
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                              {gabinete.nome}
                            </p>
                            {gabinete.partido && (
                              <span style={{
                                display: 'inline-block',
                                marginTop: '4px',
                                padding: '2px 8px',
                                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                                color: '#16a34a',
                                fontSize: '11px',
                                fontWeight: 600,
                                borderRadius: '4px'
                              }}>
                                {gabinete.partido}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: '14px', color: 'var(--foreground)' }}>
                        {gabinete.parlamentar_nome || '-'}
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: '14px', color: 'var(--foreground)' }}>
                        {formatCargo(gabinete.parlamentar_cargo)}
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--foreground)' }}>
                          <MapPin style={{ width: '14px', height: '14px', color: 'var(--foreground-muted)' }} />
                          {gabinete.municipio && gabinete.uf ? `${gabinete.municipio}/${gabinete.uf}` : 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: '14px', color: 'var(--foreground-muted)' }}>
                        {formatDate(gabinete.created_at)}
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                        <button
                          onClick={() => toggleStatus(gabinete)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            backgroundColor: gabinete.ativo ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: gabinete.ativo ? '#22c55e' : '#ef4444',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {gabinete.ativo ? (
                            <>
                              <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle style={{ width: '14px', height: '14px' }} />
                              Inativo
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* --- RODAPÉ --- */}
      <footer style={{
        backgroundColor: 'var(--card)',
        borderTop: '1px solid var(--border)',
        padding: '24px',
        textAlign: 'center',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <Image
            src="/dataro-logo-final.png"
            alt="DATA-RO"
            width={120}
            height={40}
            style={{ height: '32px', width: 'auto' }}
          />
        </div>
        <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', margin: 0 }}>
          Desenvolvido por <strong style={{ color: '#16a34a' }}>DATA-RO INTELIGÊNCIA TERRITORIAL</strong>
        </p>
        <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '4px' }}>
          © 2026 Todos os direitos reservados.
        </p>
      </footer>

      {/* --- MODAL DE NOVO GABINETE --- */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Header do Modal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                Novo Gabinete
              </h2>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--foreground-muted)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Nome do Gabinete */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--foreground)', marginBottom: '6px' }}>
                    Nome do Gabinete *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    placeholder="Ex: Gabinete do Deputado João Silva"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Parlamentar */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--foreground)', marginBottom: '6px' }}>
                      Nome do Parlamentar
                    </label>
                    <input
                      type="text"
                      value={formData.parlamentar_nome}
                      onChange={(e) => setFormData({ ...formData, parlamentar_nome: e.target.value })}
                      placeholder="Nome completo"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--foreground)', marginBottom: '6px' }}>
                      Cargo
                    </label>
                    <select
                      value={formData.parlamentar_cargo}
                      onChange={(e) => setFormData({ ...formData, parlamentar_cargo: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)',
                        fontSize: '14px'
                      }}
                    >
                      {CARGO_OPTIONS.filter(o => o.value !== '').map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Localização */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--foreground)', marginBottom: '6px' }}>
                      Município
                    </label>
                    <input
                      type="text"
                      value={formData.municipio}
                      onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                      placeholder="Ex: Porto Velho"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--foreground)', marginBottom: '6px' }}>
                      UF
                    </label>
                    <select
                      value={formData.uf}
                      onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)',
                        fontSize: '14px'
                      }}
                    >
                      {UF_OPTIONS.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--foreground)', marginBottom: '6px' }}>
                      Partido
                    </label>
                    <input
                      type="text"
                      value={formData.partido}
                      onChange={(e) => setFormData({ ...formData, partido: e.target.value })}
                      placeholder="Ex: PT"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Botões do Formulário */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border)'
              }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Criar Gabinete
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS para animação de spin */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 1280px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
