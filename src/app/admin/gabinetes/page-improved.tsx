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
  DoorOpen, 
  Building2, 
  Loader2,
  CheckCircle2,
  XCircle,
  Users,
  MapPin,
  ChevronDown,
  ChevronUp
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

  // --- MEMOIZAÇÕES PARA PERFORMANCE ---
  
  // Gabinetes filtrados (otimizado com useMemo)
  const filteredGabinetes = useMemo(() => {
    let filtered = [...gabinetes]
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(g =>
        g.nome?.toLowerCase().includes(term) ||
        g.municipio?.toLowerCase().includes(term) ||
        g.parlamentar_nome?.toLowerCase().includes(term) ||
        g.partido?.toLowerCase().includes(term)
      )
    }
    
    if (filterUF) {
      filtered = filtered.filter(g => g.uf === filterUF)
    }
    
    if (filterCargo) {
      filtered = filtered.filter(g => g.parlamentar_cargo === filterCargo)
    }
    
    if (filterPartido) {
      const partido = filterPartido.toLowerCase()
      filtered = filtered.filter(g => g.partido?.toLowerCase().includes(partido))
    }
    
    if (filterCidade) {
      const cidade = filterCidade.toLowerCase()
      filtered = filtered.filter(g => g.municipio?.toLowerCase().includes(cidade))
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(g => g.ativo === (filterStatus === 'ativo'))
    }
    
    return filtered
  }, [gabinetes, searchTerm, filterUF, filterCargo, filterPartido, filterCidade, filterStatus])

  // Estatísticas
  const stats = useMemo(() => ({
    total: gabinetes.length,
    ativos: gabinetes.filter(g => g.ativo).length,
    inativos: gabinetes.filter(g => !g.ativo).length,
    filtrados: filteredGabinetes.length
  }), [gabinetes, filteredGabinetes.length])

  // Listas únicas para filtros
  const partidosUnicos = useMemo(
    () => Array.from(new Set(gabinetes.map(g => g.partido).filter(Boolean))).sort(),
    [gabinetes]
  )

  const cidadesUnicas = useMemo(
    () => Array.from(new Set(gabinetes.map(g => g.municipio).filter(Boolean))).sort(),
    [gabinetes]
  )

  // --- FUNÇÕES CALLBACK (OTIMIZADAS) ---
  
  const carregarGabinetes = useCallback(async () => {
    try {
      setLoading(true)
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
    
    // Validação aprimorada
    if (!formData.nome?.trim() || !formData.municipio?.trim() || !formData.uf) {
      toast.error('Preencha todos os campos obrigatórios (Nome, Município e UF)')
      return
    }

    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email_parlamentar && !emailRegex.test(formData.email_parlamentar)) {
      toast.error('E-mail do parlamentar inválido')
      return
    }
    if (formData.email_gabinete && !emailRegex.test(formData.email_gabinete)) {
      toast.error('E-mail do gabinete inválido')
      return
    }

    try {
      setSubmitting(true)
      
      // Prepara os dados, convertendo strings vazias para null
      const dataToInsert = {
        nome: formData.nome.trim(),
        municipio: formData.municipio.trim(),
        uf: formData.uf,
        parlamentar_cargo: formData.parlamentar_cargo,
        parlamentar_nome: formData.parlamentar_nome?.trim() || null,
        partido: formData.partido?.trim().toUpperCase() || null,
        telefone_parlamentar: formData.telefone_parlamentar?.trim() || null,
        telefone_gabinete: formData.telefone_gabinete?.trim() || null,
        telefone_adicional: formData.telefone_adicional?.trim() || null,
        email_parlamentar: formData.email_parlamentar?.trim() || null,
        email_gabinete: formData.email_gabinete?.trim() || null,
        assessor_1: formData.assessor_1?.trim() || null,
        assessor_2: formData.assessor_2?.trim() || null,
        ativo: true
      }
      
      const { error } = await supabase.from('gabinetes').insert([dataToInsert])
      
      if (error) {
        throw error
      }
      
      toast.success('Gabinete criado com sucesso!')
      setShowModal(false)
      setFormData(INITIAL_FORM_DATA)
      await carregarGabinetes()
    } catch (error: any) {
      console.error('Erro ao criar gabinete:', error)
      const errorMessage = error?.message || 'Erro desconhecido ao criar gabinete'
      toast.error(`Erro ao criar gabinete: ${errorMessage}`)
    } finally {
      setSubmitting(false)
    }
  }, [formData, supabase, carregarGabinetes])

  const toggleStatus = useCallback(async (gabinete: Gabinete) => {
    if (!gabinete?.id) {
      toast.error('ID do gabinete inválido')
      return
    }

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

  // --- ESTILOS COMUNS ---
  const inputClassName = "w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
  const labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"

  // --- JSX (RENDERIZAÇÃO) ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* --- HEADER PRINCIPAL --- */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Título */}
            <div className="flex items-center gap-4">
              <Link href="/admin/gabinetes" className="flex items-center gap-3">
                <Image
                  src="/providata-logo-final.png"
                  alt="ProviDATA"
                  width={180}
                  height={50}
                  className="h-10 w-auto"
                  priority
                />
              </Link>
              <div className="hidden sm:block h-6 w-px bg-gray-300 dark:bg-slate-600" />
              <span className="hidden sm:block text-sm font-medium text-gray-600 dark:text-slate-400">
                Gestão de Gabinetes
              </span>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <DoorOpen size={18} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título e Ação Principal */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Gerenciar Gabinetes
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Visualize e gerencie as organizações cadastradas no sistema
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Novo Gabinete</span>
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          {/* Ativos */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Ativos</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.ativos}</p>
              </div>
            </div>
          </div>

          {/* Inativos */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Inativos</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inativos}</p>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Resultados</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.filtrados}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Ferramentas */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Campo de Busca */}
            <div className="relative flex-1 w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition-shadow"
                placeholder="Buscar por nome, município, parlamentar..."
              />
            </div>

            {/* Botão de Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors w-full md:w-auto justify-center border ${
                showFilters 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                  : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600'
              }`}
            >
              <Filter size={18} />
              <span>Filtros</span>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Painel de Filtros Expansível */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Filtro UF */}
                <div>
                  <label className={labelClassName}>Estado (UF)</label>
                  <select 
                    value={filterUF} 
                    onChange={(e) => setFilterUF(e.target.value)} 
                    className={inputClassName}
                  >
                    <option value="">Todos os estados</option>
                    {UF_OPTIONS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>

                {/* Filtro Cidade */}
                <div>
                  <label className={labelClassName}>Cidade</label>
                  <select 
                    value={filterCidade} 
                    onChange={(e) => setFilterCidade(e.target.value)} 
                    className={inputClassName}
                  >
                    <option value="">Todas as cidades</option>
                    {cidadesUnicas.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Filtro Cargo */}
                <div>
                  <label className={labelClassName}>Cargo</label>
                  <select 
                    value={filterCargo} 
                    onChange={(e) => setFilterCargo(e.target.value)} 
                    className={inputClassName}
                  >
                    {CARGO_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                {/* Filtro Partido */}
                <div>
                  <label className={labelClassName}>Partido</label>
                  <select 
                    value={filterPartido} 
                    onChange={(e) => setFilterPartido(e.target.value)} 
                    className={inputClassName}
                  >
                    <option value="">Todos os partidos</option>
                    {partidosUnicos.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Filtro Status */}
                <div>
                  <label className={labelClassName}>Status</label>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)} 
                    className={inputClassName}
                  >
                    <option value="all">Todos</option>
                    <option value="ativo">Ativos</option>
                    <option value="inativo">Inativos</option>
                  </select>
                </div>
              </div>

              {/* Botão Limpar Filtros */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={limparFiltros}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Área de Conteúdo: Tabela ou Estado Vazio ou Loading */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
              <p className="text-gray-500 dark:text-slate-400">Carregando gabinetes...</p>
            </div>
          ) : filteredGabinetes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="h-20 w-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <Building2 size={40} className="text-gray-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {searchTerm || filterStatus !== 'all' ? 'Nenhum resultado encontrado' : 'Nenhum gabinete cadastrado'}
              </h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6 max-w-sm">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tente ajustar seus filtros ou termos de busca.'
                  : 'Comece criando o primeiro gabinete do sistema.'}
              </p>
              {gabinetes.length === 0 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Plus size={20} />
                  <span>Criar primeiro gabinete</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Gabinete</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Parlamentar</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Cargo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Localização</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Cadastro</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredGabinetes.map((gabinete) => (
                    <tr key={gabinete.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{gabinete.nome || '-'}</div>
                            {gabinete.partido && (
                              <div className="text-xs text-gray-500 dark:text-slate-400">{gabinete.partido}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300">
                        {gabinete.parlamentar_nome || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300">
                        {formatCargo(gabinete.parlamentar_cargo)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {gabinete.municipio || '-'}/{gabinete.uf || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                        {formatDate(gabinete.created_at)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleStatus(gabinete)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            gabinete.ativo 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                          }`}
                        >
                          {gabinete.ativo ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
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
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 dark:text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <span>Desenvolvido por</span>
            <span className="font-bold text-green-700 dark:text-green-400 flex items-center gap-1">
              <Building2 size={16} /> DATA-RO INTELIGÊNCIA TERRITORIAL
            </span>
          </div>
          <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* --- MODAL NOVO GABINETE --- */}
      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" 
            onClick={handleCloseModal}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 w-[95%] sm:w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto z-[60]">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-5 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Novo Gabinete</h3>
              <button 
                onClick={handleCloseModal} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-500 dark:text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Seção 1: Dados Básicos */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                  Dados do Gabinete
                </h4>
                <div>
                  <label className={labelClassName}>Nome do Gabinete *</label>
                  <input 
                    type="text" 
                    value={formData.nome} 
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })} 
                    required 
                    className={inputClassName} 
                    placeholder="Ex: Gabinete do Deputado João Silva"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClassName}>Município *</label>
                    <input 
                      type="text" 
                      value={formData.municipio} 
                      onChange={(e) => setFormData({ ...formData, municipio: e.target.value })} 
                      required 
                      className={inputClassName} 
                      placeholder="Ex: Porto Velho"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>UF *</label>
                    <select 
                      value={formData.uf} 
                      onChange={(e) => setFormData({ ...formData, uf: e.target.value })} 
                      required 
                      className={inputClassName}
                    >
                      {UF_OPTIONS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 2: Dados do Parlamentar */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                  Dados do Parlamentar
                </h4>
                <div>
                  <label className={labelClassName}>Nome do Parlamentar</label>
                  <input 
                    type="text" 
                    value={formData.parlamentar_nome} 
                    onChange={(e) => setFormData({ ...formData, parlamentar_nome: e.target.value })} 
                    className={inputClassName}
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClassName}>Cargo</label>
                    <select 
                      value={formData.parlamentar_cargo} 
                      onChange={(e) => setFormData({ ...formData, parlamentar_cargo: e.target.value })} 
                      className={inputClassName}
                    >
                      {CARGO_OPTIONS.filter(c => c.value).map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClassName}>Partido</label>
                    <input 
                      type="text" 
                      value={formData.partido} 
                      onChange={(e) => setFormData({ ...formData, partido: e.target.value })} 
                      className={inputClassName}
                      placeholder="Ex: PT, PSDB, MDB..."
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Contatos */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                  Contatos
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClassName}>E-mail do Parlamentar</label>
                    <input 
                      type="email" 
                      value={formData.email_parlamentar} 
                      onChange={(e) => setFormData({ ...formData, email_parlamentar: e.target.value })} 
                      className={inputClassName}
                      placeholder="parlamentar@email.com"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>E-mail do Gabinete</label>
                    <input 
                      type="email" 
                      value={formData.email_gabinete} 
                      onChange={(e) => setFormData({ ...formData, email_gabinete: e.target.value })} 
                      className={inputClassName}
                      placeholder="gabinete@email.com"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Telefone do Parlamentar</label>
                    <input 
                      type="tel" 
                      value={formData.telefone_parlamentar} 
                      onChange={(e) => setFormData({ ...formData, telefone_parlamentar: e.target.value })} 
                      className={inputClassName}
                      placeholder="(69) 99999-9999"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Telefone do Gabinete</label>
                    <input 
                      type="tel" 
                      value={formData.telefone_gabinete} 
                      onChange={(e) => setFormData({ ...formData, telefone_gabinete: e.target.value })} 
                      className={inputClassName}
                      placeholder="(69) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 4: Assessores */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                  Assessores
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClassName}>Assessor 1</label>
                    <input 
                      type="text" 
                      value={formData.assessor_1} 
                      onChange={(e) => setFormData({ ...formData, assessor_1: e.target.value })} 
                      className={inputClassName}
                      placeholder="Nome do assessor"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Assessor 2</label>
                    <input 
                      type="text" 
                      value={formData.assessor_2} 
                      onChange={(e) => setFormData({ ...formData, assessor_2: e.target.value })} 
                      className={inputClassName}
                      placeholder="Nome do assessor"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Criar Gabinete
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
