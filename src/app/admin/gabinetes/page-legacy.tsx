'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Search, Filter, DoorOpen, Building2, Loader2, Edit2, Copyright } from 'lucide-react'
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
  chefe_de_gabinete: string
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
  chefe_de_gabinete: '',
  assessor_2: ''
}

// --- COMPONENTE PRINCIPAL ---
export default function GabinetesPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // DEBUG: confirmar que ESTE arquivo está sendo renderizado no client
  // (aparece no console do navegador)
  console.log('[DEBUG][GabinetesPage] render', {
    file: 'src/app/admin/gabinetes/page.tsx',
    ts: new Date().toISOString(),
  })

  // --- ESTADOS ---
  const [gabinetes, setGabinetes] = useState<Gabinete[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingGabinete, setEditingGabinete] = useState<Gabinete | null>(null)

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
      const dataToSave = {
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
        chefe_de_gabinete: formData.chefe_de_gabinete?.trim() || null,
        assessor_2: formData.assessor_2?.trim() || null,
        ativo: true
      }
      
      if (editingGabinete) {
        // Atualizar gabinete existente
        const { error } = await supabase
          .from('gabinetes')
          .update(dataToSave)
          .eq('id', editingGabinete.id)
        
        if (error) throw error
        toast.success('Gabinete atualizado com sucesso!')
      } else {
        // Criar novo gabinete
        const { error } = await supabase.from('gabinetes').insert([dataToSave])
        if (error) throw error
        toast.success('Gabinete criado com sucesso!')
      }
      
      setShowModal(false)
      setFormData(INITIAL_FORM_DATA)
      setEditingGabinete(null)
      await carregarGabinetes()
    } catch (error) {
      console.error('Erro ao salvar gabinete:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar gabinete'
      toast.error(`Erro ao salvar gabinete: ${errorMessage}`)
    } finally {
      setSubmitting(false)
    }
  }, [formData, supabase, carregarGabinetes, editingGabinete])

  const handleEdit = useCallback((gabinete: Gabinete) => {
    setEditingGabinete(gabinete)
    setFormData({
      nome: gabinete.nome || '',
      municipio: gabinete.municipio || '',
      uf: gabinete.uf || 'RO',
      parlamentar_nome: gabinete.parlamentar_nome || '',
      parlamentar_cargo: gabinete.parlamentar_cargo || 'deputado_estadual',
      partido: gabinete.partido || '',
      telefone_parlamentar: gabinete.telefone_parlamentar || '',
      telefone_gabinete: gabinete.telefone_gabinete || '',
      telefone_adicional: gabinete.telefone_adicional || '',
      email_parlamentar: gabinete.email_parlamentar || '',
      email_gabinete: gabinete.email_gabinete || '',
      chefe_de_gabinete: gabinete.chefe_de_gabinete || '',
      assessor_2: gabinete.assessor_2 || ''
    })
    setShowModal(true)
  }, [])

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
    setEditingGabinete(null)
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

  // --- ESTILOS COMUNS (INPUTS/SELECTS) ---
  const inputClassName = "w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
  const labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"

  // --- JSX (RENDERIZAÇÃO) ---
  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col"
      data-debug-page="admin-gabinetes:page.tsx"
    >
      {/* --- CABEÇALHO PRINCIPAL --- */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo ProviDATA */}
          <div className="flex items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700">
            <Image
              src="/providata-logo-trans.png"
              alt="ProviDATA"
              width={200}
              height={60}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>
          
          {/* Barra de ações */}
          <div className="h-16 flex items-center justify-between">
            {/* Título */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center text-green-600 dark:text-green-400">
                <Building2 size={20} />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gestão de <span className="text-green-600 dark:text-green-400">Gabinetes</span>
              </h1>
            </div>

            {/* Ações: Tema e Logout */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 rounded-md transition-colors text-sm font-medium"
                aria-label="Fazer logout"
              >
                <DoorOpen size={18} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL CENTRALIZADO --- */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Título da Página e Botão de Ação */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Gabinetes</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Visualize e gerencie as organizações cadastradas no sistema.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingGabinete(null)
              setFormData(INITIAL_FORM_DATA)
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md font-medium transition-colors shadow-sm whitespace-nowrap"
            aria-label="Criar novo gabinete"
          >
            <Plus size={20} />
            <span>Novo Gabinete</span>
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Total */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Gabinetes</p>
            <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          {/* Card 2: Ativos */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gabinetes Ativos</p>
            <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-500">
              {stats.ativos}
            </p>
          </div>
          {/* Card 3: Filtrados */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resultados da Busca</p>
            <p className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-500">
              {stats.filtrados}
            </p>
          </div>
        </div>

        {/* Barra de Ferramentas (Busca e Botão Filtro) */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Campo de Busca */}
          <div className="relative flex-1 w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white sm:text-sm transition-shadow"
              placeholder="Buscar por nome, município, parlamentar..."
              aria-label="Campo de busca"
            />
          </div>

          {/* Botão de Toggle do Painel de Filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors w-full md:w-auto justify-center border ${
              showFilters 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            aria-label={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            aria-expanded={showFilters}
          >
            <Filter size={18} />
            <span>Filtros</span>
          </button>
        </div>

        {/* Painel Expansível de Filtros */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 sm:p-6 mb-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro UF */}
              <div>
                <label htmlFor="filter-uf" className={labelClassName}>Estado (UF)</label>
                <select 
                  id="filter-uf"
                  value={filterUF} 
                  onChange={(e) => setFilterUF(e.target.value)} 
                  className={inputClassName}
                  aria-label="Filtrar por estado"
                >
                  <option value="">Todos os estados</option>
                  {UF_OPTIONS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
              {/* Filtro Cidade */}
              <div>
                <label htmlFor="filter-cidade" className={labelClassName}>Cidade</label>
                <select 
                  id="filter-cidade"
                  value={filterCidade} 
                  onChange={(e) => setFilterCidade(e.target.value)} 
                  className={inputClassName}
                  aria-label="Filtrar por cidade"
                >
                  <option value="">Todas as cidades</option>
                  {cidadesUnicas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Filtro Cargo */}
              <div>
                <label htmlFor="filter-cargo" className={labelClassName}>Cargo</label>
                <select 
                  id="filter-cargo"
                  value={filterCargo} 
                  onChange={(e) => setFilterCargo(e.target.value)} 
                  className={inputClassName}
                  aria-label="Filtrar por cargo"
                >
                  {CARGO_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              {/* Filtro Partido */}
              <div>
                <label htmlFor="filter-partido" className={labelClassName}>Partido</label>
                <select 
                  id="filter-partido"
                  value={filterPartido} 
                  onChange={(e) => setFilterPartido(e.target.value)} 
                  className={inputClassName}
                  aria-label="Filtrar por partido"
                >
                  <option value="">Todos os partidos</option>
                  {partidosUnicos.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {/* Filtro Status */}
              <div>
                <label htmlFor="filter-status" className={labelClassName}>Status</label>
                <select 
                  id="filter-status"
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)} 
                  className={inputClassName}
                  aria-label="Filtrar por status"
                >
                  <option value="all">Todos</option>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                </select>
              </div>
              {/* Botão Limpar Filtros */}
              <div className="flex items-end lg:col-start-4">
                <button
                  onClick={limparFiltros}
                  className="w-full px-4 py-2.5 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Limpar todos os filtros"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Área de Conteúdo: Tabela ou Estado Vazio ou Loading */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            // --- LOADING STATE ---
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-green-600" />
              <p>Carregando gabinetes...</p>
            </div>
          ) : filteredGabinetes.length === 0 ? (
            // --- EMPTY STATE ---
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Building2 size={48} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {searchTerm || filterStatus !== 'all' ? 'Nenhum resultado encontrado' : 'Nenhum gabinete cadastrado'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tente ajustar seus filtros ou termos de busca.'
                  : 'Comece criando o primeiro gabinete do sistema.'}
              </p>
              {gabinetes.length === 0 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
                  aria-label="Criar primeiro gabinete"
                >
                  <Plus size={20} />
                  <span>Criar meu primeiro gabinete</span>
                </button>
              )}
            </div>
          ) : (
            // --- TABELA DE DADOS ---
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gabinete</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parlamentar</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cargo</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Localização</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cadastro</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredGabinetes.map((gabinete) => (
                    <tr key={gabinete.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{gabinete.nome || '-'}</div>
                        {gabinete.partido && <div className="text-xs text-gray-500 dark:text-gray-400">{gabinete.partido}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {gabinete.parlamentar_nome || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatCargo(gabinete.parlamentar_cargo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {gabinete.municipio || '-'}/{gabinete.uf || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(gabinete.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => toggleStatus(gabinete)}
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            gabinete.ativo 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200'
                          }`}
                          aria-label={`${gabinete.ativo ? 'Desativar' : 'Ativar'} gabinete ${gabinete.nome}`}
                        >
                          {gabinete.ativo ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleEdit(gabinete)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                          aria-label={`Editar gabinete ${gabinete.nome}`}
                        >
                          <Edit2 size={16} />
                          Alterar
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
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-3">
            {/* Logo DATA-RO */}
            <div className="flex items-center gap-2">
              <Image
                src="/dataro-logo-trans.png"
                alt="DATA-RO"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </div>
            
            {/* Texto */}
            <div className="text-center">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Desenvolvido por{' '}
                <span className="font-bold text-green-600 dark:text-green-400">
                  DATA-RO INTELIGÊNCIA TERRITORIAL
                </span>
              </p>
              <div className="flex items-center justify-center gap-2 mt-1 text-gray-600 dark:text-gray-400 text-xs">
                <Copyright className="w-3 h-3" />
                <span>{new Date().getFullYear()} - Todos os direitos reservados</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* --- MODAL NOVO/EDITAR GABINETE --- */}
      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" 
            onClick={handleCloseModal}
            aria-hidden="true"
          />
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-[95%] sm:w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto z-[60]"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex items-center justify-between z-10">
              <h3 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
                {editingGabinete ? 'Alterar Gabinete' : 'Novo Gabinete'}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Seção 1: Dados Básicos */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Dados do Gabinete</h4>
                <div>
                  <label htmlFor="nome" className={labelClassName}>Nome do Gabinete *</label>
                  <input 
                    id="nome"
                    type="text" 
                    value={formData.nome} 
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })} 
                    required 
                    className={inputClassName} 
                    placeholder="Ex: Gabinete do Deputado João Silva"
                    maxLength={255}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="municipio" className={labelClassName}>Município *</label>
                    <input 
                      id="municipio"
                      type="text" 
                      value={formData.municipio} 
                      onChange={(e) => setFormData({ ...formData, municipio: e.target.value })} 
                      required 
                      className={inputClassName} 
                      placeholder="Ex: Porto Velho"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label htmlFor="uf" className={labelClassName}>UF *</label>
                    <select 
                      id="uf"
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
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Dados do Parlamentar</h4>
                <div>
                  <label htmlFor="parlamentar-nome" className={labelClassName}>Nome do Parlamentar</label>
                  <input 
                    id="parlamentar-nome"
                    type="text" 
                    value={formData.parlamentar_nome} 
                    onChange={(e) => setFormData({ ...formData, parlamentar_nome: e.target.value })} 
                    className={inputClassName}
                    placeholder="Ex: João Silva"
                    maxLength={255}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cargo" className={labelClassName}>Cargo</label>
                    <select 
                      id="cargo"
                      value={formData.parlamentar_cargo} 
                      onChange={(e) => setFormData({ ...formData, parlamentar_cargo: e.target.value })} 
                      className={inputClassName}
                    >
                      {CARGO_OPTIONS.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="partido" className={labelClassName}>Partido</label>
                    <input 
                      id="partido"
                      type="text" 
                      value={formData.partido} 
                      onChange={(e) => setFormData({ ...formData, partido: e.target.value.toUpperCase() })} 
                      maxLength={10} 
                      className={inputClassName} 
                      placeholder="Ex: PT"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Contatos */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Contatos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="tel-parlamentar" className={labelClassName}>Tel. Parlamentar</label>
                    <input 
                      id="tel-parlamentar"
                      type="tel" 
                      value={formData.telefone_parlamentar} 
                      onChange={(e) => setFormData({ ...formData, telefone_parlamentar: e.target.value })} 
                      className={inputClassName}
                      placeholder="(00) 00000-0000"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label htmlFor="tel-gabinete" className={labelClassName}>Tel. Gabinete</label>
                    <input 
                      id="tel-gabinete"
                      type="tel" 
                      value={formData.telefone_gabinete} 
                      onChange={(e) => setFormData({ ...formData, telefone_gabinete: e.target.value })} 
                      className={inputClassName}
                      placeholder="(00) 00000-0000"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label htmlFor="tel-adicional" className={labelClassName}>Tel. Adicional</label>
                    <input 
                      id="tel-adicional"
                      type="tel" 
                      value={formData.telefone_adicional} 
                      onChange={(e) => setFormData({ ...formData, telefone_adicional: e.target.value })} 
                      className={inputClassName}
                      placeholder="(00) 00000-0000"
                      maxLength={20}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email-parlamentar" className={labelClassName}>E-mail Parlamentar</label>
                    <input 
                      id="email-parlamentar"
                      type="email" 
                      value={formData.email_parlamentar} 
                      onChange={(e) => setFormData({ ...formData, email_parlamentar: e.target.value })} 
                      className={inputClassName}
                      placeholder="email@exemplo.com"
                      maxLength={255}
                    />
                  </div>
                  <div>
                    <label htmlFor="email-gabinete" className={labelClassName}>E-mail Gabinete</label>
                    <input 
                      id="email-gabinete"
                      type="email" 
                      value={formData.email_gabinete} 
                      onChange={(e) => setFormData({ ...formData, email_gabinete: e.target.value })} 
                      className={inputClassName}
                      placeholder="gabinete@exemplo.com"
                      maxLength={255}
                    />
                  </div>
                </div>
              </div>

              {/* Seção 4: Assessores */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Assessores (Opcional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="chefe-de-gabinete" className={labelClassName}>Chefe de Gabinete</label>
                    <input 
                      id="chefe-de-gabinete"
                      type="text" 
                      value={formData.chefe_de_gabinete} 
                      onChange={(e) => setFormData({ ...formData, chefe_de_gabinete: e.target.value })} 
                      className={inputClassName}
                      placeholder="Nome do chefe de gabinete"
                      maxLength={255}
                    />
                  </div>
                  <div>
                    <label htmlFor="assessor-2" className={labelClassName}>Assessor 2</label>
                    <input 
                      id="assessor-2"
                      type="text" 
                      value={formData.assessor_2} 
                      onChange={(e) => setFormData({ ...formData, assessor_2: e.target.value })} 
                      className={inputClassName}
                      placeholder="Nome do assessor"
                      maxLength={255}
                    />
                  </div>
                </div>
              </div>

              {/* Botões do Formulário */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="flex-1 px-5 py-3 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="flex-1 px-5 py-3 text-sm font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? (editingGabinete ? 'Atualizando...' : 'Criando...') : (editingGabinete ? 'Atualizar Gabinete' : 'Criar Gabinete')}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
