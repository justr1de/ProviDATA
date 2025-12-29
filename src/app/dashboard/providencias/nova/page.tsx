'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Save, 
  User, 
  FileText,
  MapPin,
  Building2,
  AlertCircle,
  Plus,
  Search,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import type { Cidadao, Categoria, Orgao } from '@/types/database'

const priorityOptions = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

const localizacaoTipoOptions = [
  { value: '', label: 'Selecione o tipo' },
  { value: 'bairro', label: 'Bairro' },
  { value: 'rua', label: 'Rua/Avenida' },
  { value: 'regiao', label: 'Região' },
  { value: 'especifico', label: 'Local Específico' },
]

export default function NovaProvidenciaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [cidadaos, setCidadaos] = useState<Cidadao[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [orgaos, setOrgaos] = useState<Orgao[]>([])
  const [searchCidadao, setSearchCidadao] = useState('')
  const [showCidadaoSearch, setShowCidadaoSearch] = useState(false)
  const [selectedCidadao, setSelectedCidadao] = useState<Cidadao | null>(null)
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    orgao_destino_id: '',
    prioridade: 'media',
    localizacao_tipo: '',
    localizacao_descricao: '',
    prazo_estimado: '',
    observacoes_internas: '',
  })

  const router = useRouter()
  const supabase = createClient()
  const { tenant, user } = useAuthStore()

  useEffect(() => {
    const loadData = async () => {
      if (!tenant) return

      // Carregar categorias
      const { data: categoriasData } = await supabase
        .from('categorias')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('ativo', true)
        .order('nome')

      if (categoriasData) setCategorias(categoriasData)

      // Carregar órgãos
      const { data: orgaosData } = await supabase
        .from('orgaos')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('ativo', true)
        .order('nome')

      if (orgaosData) setOrgaos(orgaosData)
    }

    loadData()
  }, [tenant, supabase])

  useEffect(() => {
    const searchCidadaos = async () => {
      if (!tenant || searchCidadao.length < 2) {
        setCidadaos([])
        return
      }

      const { data } = await supabase
        .from('cidadaos')
        .select('*')
        .eq('tenant_id', tenant.id)
        .or(`nome.ilike.%${searchCidadao}%,cpf.ilike.%${searchCidadao}%`)
        .limit(5)

      if (data) setCidadaos(data)
    }

    const debounce = setTimeout(searchCidadaos, 300)
    return () => clearTimeout(debounce)
  }, [searchCidadao, tenant, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const generateProtocolo = async () => {
    if (!tenant) return ''
    
    const ano = new Date().getFullYear()
    const { count } = await supabase
      .from('providencias')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .like('numero_protocolo', `${ano}-%`)

    const sequencia = ((count || 0) + 1).toString().padStart(6, '0')
    return `${ano}-${sequencia}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tenant || !user) {
      toast.error('Erro de autenticação')
      return
    }

    if (!formData.titulo || !formData.descricao) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    setIsLoading(true)

    try {
      const numero_protocolo = await generateProtocolo()

      const { error } = await supabase
        .from('providencias')
        .insert({
          tenant_id: tenant.id,
          numero_protocolo,
          cidadao_id: selectedCidadao?.id || null,
          categoria_id: formData.categoria_id || null,
          orgao_destino_id: formData.orgao_destino_id || null,
          usuario_responsavel_id: user.id,
          titulo: formData.titulo,
          descricao: formData.descricao,
          prioridade: formData.prioridade,
          localizacao_tipo: formData.localizacao_tipo || null,
          localizacao_descricao: formData.localizacao_descricao || null,
          prazo_estimado: formData.prazo_estimado || null,
          observacoes_internas: formData.observacoes_internas || null,
          status: 'pendente',
        })

      if (error) throw error

      toast.success('Providência criada com sucesso!', {
        description: `Protocolo: ${numero_protocolo}`,
      })
      
      router.push('/dashboard/providencias')
    } catch (error) {
      console.error('Error creating providencia:', error)
      toast.error('Erro ao criar providência')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/providencias">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nova Providência</h1>
          <p className="text-[var(--muted-foreground)]">
            Registre uma nova solicitação de providência
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cidadão */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Cidadão Solicitante
            </CardTitle>
            <CardDescription>
              Selecione ou cadastre o cidadão que está fazendo a solicitação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCidadao ? (
              <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--secondary)]">
                <div>
                  <p className="font-medium">{selectedCidadao.nome}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {selectedCidadao.cpf && `CPF: ${selectedCidadao.cpf}`}
                    {selectedCidadao.telefone && ` • Tel: ${selectedCidadao.telefone}`}
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedCidadao(null)
                    setShowCidadaoSearch(true)
                  }}
                >
                  Alterar
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    placeholder="Buscar cidadão por nome ou CPF..."
                    value={searchCidadao}
                    onChange={(e) => {
                      setSearchCidadao(e.target.value)
                      setShowCidadaoSearch(true)
                    }}
                    onFocus={() => setShowCidadaoSearch(true)}
                    icon={<Search className="w-4 h-4" />}
                  />
                  
                  {showCidadaoSearch && cidadaos.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {cidadaos.map((cidadao) => (
                        <button
                          key={cidadao.id}
                          type="button"
                          className="w-full px-4 py-3 text-left hover:bg-[var(--secondary)] transition-colors"
                          onClick={() => {
                            setSelectedCidadao(cidadao)
                            setShowCidadaoSearch(false)
                            setSearchCidadao('')
                          }}
                        >
                          <p className="font-medium">{cidadao.nome}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {cidadao.cpf && `CPF: ${cidadao.cpf}`}
                            {cidadao.bairro && ` • ${cidadao.bairro}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--muted-foreground)]">ou</span>
                  <Link href="/dashboard/cidadaos/novo?redirect=providencia">
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="w-4 h-4" />
                      Cadastrar Novo Cidadão
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detalhes da Providência */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detalhes da Providência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              name="titulo"
              label="Título *"
              placeholder="Resumo da solicitação"
              value={formData.titulo}
              onChange={handleChange}
              required
            />

            <Textarea
              name="descricao"
              label="Descrição Detalhada *"
              placeholder="Descreva o problema ou solicitação com o máximo de detalhes possível..."
              value={formData.descricao}
              onChange={handleChange}
              className="min-h-[150px]"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name="categoria_id"
                label="Categoria"
                options={[
                  { value: '', label: 'Selecione uma categoria' },
                  ...categorias.map(c => ({ value: c.id, label: c.nome }))
                ]}
                value={formData.categoria_id}
                onChange={handleChange}
              />

              <Select
                name="prioridade"
                label="Prioridade"
                options={priorityOptions}
                value={formData.prioridade}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name="orgao_destino_id"
                label="Órgão Destinatário"
                options={[
                  { value: '', label: 'Selecione o órgão' },
                  ...orgaos.map(o => ({ value: o.id, label: o.sigla ? `${o.sigla} - ${o.nome}` : o.nome }))
                ]}
                value={formData.orgao_destino_id}
                onChange={handleChange}
              />

              <Input
                type="date"
                name="prazo_estimado"
                label="Prazo Estimado"
                value={formData.prazo_estimado}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Localização do Problema
            </CardTitle>
            <CardDescription>
              Informe onde o problema está localizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              name="localizacao_tipo"
              label="Tipo de Localização"
              options={localizacaoTipoOptions}
              value={formData.localizacao_tipo}
              onChange={handleChange}
            />

            <Textarea
              name="localizacao_descricao"
              label="Descrição da Localização"
              placeholder="Ex: Rua das Flores, próximo ao número 123, em frente à escola municipal..."
              value={formData.localizacao_descricao}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* Observações Internas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Observações Internas
            </CardTitle>
            <CardDescription>
              Notas visíveis apenas para a equipe do gabinete
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="observacoes_internas"
              placeholder="Anotações internas sobre esta providência..."
              value={formData.observacoes_internas}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* LGPD Notice */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Os dados pessoais coletados serão tratados de acordo com a Lei Geral de Proteção de Dados (LGPD) 
            e utilizados exclusivamente para o acompanhamento desta providência.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboard/providencias">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" isLoading={isLoading}>
            <Save className="w-4 h-4" />
            Criar Providência
          </Button>
        </div>
      </form>
    </div>
  )
}
