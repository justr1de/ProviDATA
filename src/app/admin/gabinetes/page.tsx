'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Search, Filter, DoorOpen, Building2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import type { Gabinete } from '@/types/database'

// --- CONSTANTES ---
const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

const CARGO_OPTIONS = [
  { value: '', label: 'Todos os cargos' },
  { value: 'vereador', label: 'Vereador' },
  { value: 'prefeito', label: 'Prefeito' },
  { value: 'deputado_estadual', label: 'Deputado Estadual' },
  { value: 'deputado_federal', label: 'Deputado Federal' },
  { value: 'senador', label: 'Senador' },
  { value: 'governador', label: 'Governador' }
]

export default function GabinetesPage() {
  const router = useRouter()
  const supabase = createClient()

  // --- ESTADOS (Lógica Original) ---
  const [gabinetes, setGabinetes] = useState<Gabinete[]>([])
  const [filteredGabinetes, setFilteredGabinetes] = useState<Gabinete[]>([])
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'ativo' | 'inativo'>('all')

  // Estado do Formulário
  const [formData, setFormData] = useState({
    nome: '', municipio: '', uf: 'RO', parlamentar_nome: '',
    parlamentar_cargo: 'deputado_estadual' as const, partido: '',
    telefone_parlamentar: '', telefone_gabinete: '', telefone_adicional: '',
    email_parlamentar: '', email_gabinete: '', assessor_1: '', assessor_2: ''
  })

  // --- EFEITOS ---
  useEffect(() => {
    carregarGabinetes()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [gabinetes, searchTerm, filterUF, filterCargo, filterPartido, filterCidade, filterStatus])

  // --- FUNÇÕES DE LÓGICA ---
  const carregarGabinetes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('gabinetes')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setGabinetes(data || [])
    } catch (error) {
      console.error('Erro ao carregar gabinetes:', error)
      toast.error('Erro ao carregar gabinetes')
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => {
    let filtered = [...gabinetes]
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(g =>
        g.nome.toLowerCase().includes(term) ||
        g.municipio.toLowerCase().includes(term) ||
        g.parlamentar_nome?.toLowerCase().includes(term) ||
        g.partido?.toLowerCase().includes(term)
      )
    }
    if (filterUF) filtered = filtered.filter(g => g.uf === filterUF)
    if (filterCargo) filtered = filtered.filter(g => g.parlamentar_cargo === filterCargo)
    if (filterPartido) filtered = filtered.filter(g => g.partido?.toLowerCase().includes(filterPartido.toLowerCase()))
    if (filterCidade) filtered = filtered.filter(g => g.municipio.toLowerCase().includes(filterCidade.toLowerCase()))
    if (filterStatus !== 'all') filtered = filtered.filter(g => g.ativo === (filterStatus === 'ativo'))
    setFilteredGabinetes(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome || !formData.municipio || !formData.uf) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    try {
      setSubmitting(true)
      // Prepara os dados, convertendo strings vazias para null onde necessário
      const dataToInsert = {
        ...formData,
        parlamentar_nome: formData.parlamentar_nome || null,
        partido: formData.partido || null,
        telefone_parlamentar: formData.telefone_parlamentar || null,
        telefone_gabinete: formData.telefone_gabinete || null,
        telefone_adicional: formData.telefone_adicional || null,
        email_parlamentar: formData.email_parlamentar || null,
        email_gabinete: formData.email_gabinete || null,
        assessor_1: formData.assessor_1 || null,
        assessor_2: formData.assessor_2 || null,
        ativo: true
      }
      
      const { error } = await supabase.from('gabinetes').insert([dataToInsert])
      if (error) throw error
      
      toast.success('Gabinete criado com sucesso!')
      setShowModal(false)
      // Reset do formulário
      setFormData({
        nome: '', municipio: '', uf: 'RO', parlamentar_nome: '',
        parlamentar_cargo: 'deputado_estadual', partido: '',
        telefone_parlamentar: '', telefone_gabinete: '', telefone_adicional: '',
        email_parlamentar: '', email_gabinete: '', assessor_1: '', assessor_2: ''
      })
      carregarGabinetes()
    } catch (error) {
      console.error('Erro ao criar gabinete:', error)
      toast.error('Erro ao criar gabinete')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleStatus = async (gabinete: Gabinete) => {
    try {
      const { error } = await supabase
        .from('gabinetes')
        .update({ ativo: !gabinete.ativo })
        .eq('id', gabinete.id)
      if (error) throw error
      toast.success(`Gabinete ${!gabinete.ativo ? 'ativado' : 'desativado'} com sucesso!`)
      carregarGabinetes()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status do gabinete')
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logout realizado com sucesso!')
      router.push('/login')
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  // --- HELPERS DE FORMATAÇÃO ---
  const formatCargo = (cargo?: string) => {
    if (!cargo) return '-'
    return cargo.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR')

  // --- DADOS PARA FILTROS ---
  const partidosUnicos = Array.from(new Set(gabinetes.map(g => g.partido).filter(Boolean))).sort()
  const cidadesUnicas = Array.from(new Set(gabinetes.map(g => g.municipio))).sort()

  // --- ESTILOS COMUNS (INPUTS/SELECTS) ---
  const inputClassName = "w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
  const labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"

  // --- JSX (RENDERIZAÇÃO) ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* --- CABEÇALHO PRINCIPAL (Novo Layout) --- */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Building2 size={20} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              ProviDATA <span className="font-normal text-gray-500 dark:text-gray-400">| Gestão</span>
            </h1>
          </div>

          {/* Ações: Tema e Logout */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 rounded-md transition-colors text-sm font-medium"
            >
              <DoorOpen size={18} />
              <span>Sair</span>
            </button>
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
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={20} />
            <span>Novo Gabinete</span>
          </button>
        </div>

        {/* Cards de Estatísticas (Estilizados) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Total */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Gabinetes</p>
            <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
              {gabinetes.length}
            </p>
          </div>
          {/* Card 2: Ativos */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gabinetes Ativos</p>
            <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-500">
              {gabinetes.filter(g => g.ativo).length}
            </p>
          </div>
          {/* Card 3: Filtrados */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resultados da Busca</p>
            <p className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-500">
              {filteredGabinetes.length}
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white sm:text-sm transition-shadow"
              placeholder="Buscar por nome, município, parlamentar..."
            />
          </div>

          {/* Botão de Toggle do Painel de Filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors w-full md:w-auto justify-center border ${
              showFilters 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' 
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
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
                <label className={labelClassName}>Estado (UF)</label>
                <select value={filterUF} onChange={(e) => setFilterUF(e.target.value)} className={inputClassName}>
                  <option value="">Todos os estados</option>
                  {UF_OPTIONS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
              {/* Filtro Cidade */}
              <div>
                <label className={labelClassName}>Cidade</label>
                <select value={filterCidade} onChange={(e) => setFilterCidade(e.target.value)} className={inputClassName}>
                  <option value="">Todas as cidades</option>
                  {cidadesUnicas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Filtro Cargo */}
              <div>
                <label className={labelClassName}>Cargo</label>
                <select value={filterCargo} onChange={(e) => setFilterCargo(e.target.value)} className={inputClassName}>
                  {CARGO_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              {/* Filtro Partido */}
              <div>
                <label className={labelClassName}>Partido</label>
                <select value={filterPartido} onChange={(e) => setFilterPartido(e.target.value)} className={inputClassName}>
                  <option value="">Todos os partidos</option>
                  {partidosUnicos.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {/* Filtro Status */}
              <div>
                <label className={labelClassName}>Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className={inputClassName}>
                  <option value="all">Todos</option>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                </select>
              </div>
              {/* Botão Limpar Filtros */}
              <div className="flex items-end lg:col-start-4">
                <button
                  onClick={() => {
                    setSearchTerm(''); setFilterUF(''); setFilterCargo('');
                    setFilterPartido(''); setFilterCidade(''); setFilterStatus('all');
                  }}
                  className="w-full px-4 py-2.5 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-600" />
              <p>Carregando gabinetes...</p>
            </div>
          ) : filteredGabinetes.length === 0 ? (
            // --- EMPTY STATE (Novo Design) ---
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
                  className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
                >
                  <Plus size={20} />
                  <span>Criar meu primeiro gabinete</span>
                </button>
              )}
            </div>
          ) : (
            // --- TABELA DE DADOS (Estilizada) ---
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredGabinetes.map((gabinete) => (
                    <tr key={gabinete.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{gabinete.nome}</div>
                        {gabinete.partido && <div className="text-xs text-gray-500 dark:text-gray-400">{gabinete.partido}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {gabinete.parlamentar_nome || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatCargo(gabinete.parlamentar_cargo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {gabinete.municipio}/{gabinete.uf}
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
                        >
                          {gabinete.ativo ? 'Ativo' : 'Inativo'}
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

      {/* --- RODAPÉ (Novo Layout) --- */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400 gap-4">
          <div className="flex items-center gap-2">
            <span>Desenvolvido por</span>
            <span className="font-bold text-blue-900 dark:text-blue-400 flex items-center gap-1">
              <Building2 size={16} /> DATA-RO INTELIGÊNCIA TERRITORIAL
            </span>
          </div>
          <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* --- MODAL NOVO GABINETE (Mantido o original com ajustes de estilo) --- */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowModal(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-[95%] sm:w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto z-[60]">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Novo Gabinete</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Seção 1: Dados Básicos */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-2">Dados do Gabinete</h4>
                <div>
                  <label className={labelClassName}>Nome do Gabinete *</label>
                  <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required className={inputClassName} placeholder="Ex: Gabinete do Deputado João Silva" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClassName}>Município *</label>
                    <input type="text" value={formData.municipio} onChange={(e) => setFormData({ ...formData, municipio: e.target.value })} required className={inputClassName} placeholder="Ex: Porto Velho" />
                  </div>
                  <div>
                    <label className={labelClassName}>UF *</label>
                    <select value={formData.uf} onChange={(e) => setFormData({ ...formData, uf: e.target.value })} required className={inputClassName}>
                      {UF_OPTIONS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 2: Dados do Parlamentar */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-2">Dados do Parlamentar</h4>
                <div>
                  <label className={labelClassName}>Nome do Parlamentar</label>
                  <input type="text" value={formData.parlamentar_nome} onChange={(e) => setFormData({ ...formData, parlamentar_nome: e.target.value })} className={inputClassName} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClassName}>Cargo</label>
                    <select value={formData.parlamentar_cargo} onChange={(e) => setFormData({ ...formData, parlamentar_cargo: e.target.value as any })} className={inputClassName}>
                      {CARGO_OPTIONS.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClassName}>Partido</label>
                    <input type="text" value={formData.partido} onChange={(e) => setFormData({ ...formData, partido: e.target.value.toUpperCase() })} maxLength={10} className={inputClassName} placeholder="Ex: PT" />
                  </div>
                </div>
              </div>

              {/* Seção 3: Contatos */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-2">Contatos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className={labelClassName}>Tel. Parlamentar</label><input type="tel" value={formData.telefone_parlamentar} onChange={(e) => setFormData({ ...formData, telefone_parlamentar: e.target.value })} className={inputClassName} /></div>
                  <div><label className={labelClassName}>Tel. Gabinete</label><input type="tel" value={formData.telefone_gabinete} onChange={(e) => setFormData({ ...formData, telefone_gabinete: e.target.value })} className={inputClassName} /></div>
                  <div><label className={labelClassName}>Tel. Adicional</label><input type="tel" value={formData.telefone_adicional} onChange={(e) => setFormData({ ...formData, telefone_adicional: e.target.value })} className={inputClassName} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelClassName}>E-mail Parlamentar</label><input type="email" value={formData.email_parlamentar} onChange={(e) => setFormData({ ...formData, email_parlamentar: e.target.value })} className={inputClassName} /></div>
                  <div><label className={labelClassName}>E-mail Gabinete</label><input type="email" value={formData.email_gabinete} onChange={(e) => setFormData({ ...formData, email_gabinete: e.target.value })} className={inputClassName} /></div>
                </div>
              </div>

               {/* Seção 4: Assessores */}
               <div className="space-y-4 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-2">Assessores (Opcional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelClassName}>Assessor 1</label><input type="text" value={formData.assessor_1} onChange={(e) => setFormData({ ...formData, assessor_1: e.target.value })} className={inputClassName} /></div>
                  <div><label className={labelClassName}>Assessor 2</label><input type="text" value={formData.assessor_2} onChange={(e) => setFormData({ ...formData, assessor_2: e.target.value })} className={inputClassName} /></div>
                </div>
              </div>

              {/* Botões do Formulário */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-5 py-3 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
                <button type="submit" disabled={submitting} className="flex-1 px-5 py-3 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Criando...' : 'Criar Gabinete'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}