'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
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
  Info,
  Calendar,
  Tag,
  Flag
} from 'lucide-react'
import { toast } from 'sonner'
import type { Cidadao, Categoria, Orgao } from '@/types/database'

const priorityOptions = [
  { value: 'baixa', label: 'Baixa', color: '#22c55e' },
  { value: 'media', label: 'Média', color: '#f59e0b' },
  { value: 'alta', label: 'Alta', color: '#f97316' },
  { value: 'urgente', label: 'Urgente', color: '#ef4444' },
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
  const { gabinete: tenant, user } = useAuthStore()

  useEffect(() => {
    const loadData = async () => {
      if (!tenant) return

      const { data: categoriasData } = await supabase
        .from('categorias')
        .select('*')
        .eq('gabinete_id', tenant.id)
        .eq('ativo', true)
        .order('nome')

      if (categoriasData) setCategorias(categoriasData)

      const { data: orgaosData } = await supabase
        .from('orgaos')
        .select('*')
        .eq('gabinete_id', tenant.id)
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
        .eq('gabinete_id', tenant.id)
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
      .eq('gabinete_id', tenant.id)
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
          gabinete_id: tenant.id,
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

  // Estilos do formulário
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderRadius: '20px',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
  }

  const cardHeaderStyle: React.CSSProperties = {
    padding: '24px 32px',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--muted)'
  }

  const cardContentStyle: React.CSSProperties = {
    padding: '32px'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--foreground)',
    marginBottom: '10px'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '2px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    outline: 'none'
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '140px',
    resize: 'vertical',
    lineHeight: '1.6'
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 14px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '20px',
    paddingRight: '48px'
  }

  const fieldGroupStyle: React.CSSProperties = {
    marginBottom: '28px'
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px'
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '36px' }}>
        <Link href="/dashboard/providencias" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: 'var(--muted)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--foreground)',
            transition: 'all 0.2s ease'
          }}>
            <ArrowLeft style={{ width: '22px', height: '22px' }} />
          </button>
        </Link>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--foreground)', marginBottom: '6px' }}>
            Nova Providência
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--foreground-muted)' }}>
            Registre uma nova solicitação de providência parlamentar
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Cidadão Solicitante */}
        <div style={{ ...cardStyle, marginBottom: '28px' }}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User style={{ width: '22px', height: '22px', color: 'var(--primary)' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>
                  Cidadão Solicitante
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', marginTop: '2px' }}>
                  Selecione ou cadastre o cidadão que está fazendo a solicitação
                </p>
              </div>
            </div>
          </div>
          <div style={cardContentStyle}>
            {selectedCidadao ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderRadius: '14px',
                backgroundColor: 'var(--muted)',
                border: '2px solid var(--primary)'
              }}>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>
                    {selectedCidadao.nome}
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', marginTop: '4px' }}>
                    {selectedCidadao.cpf && `CPF: ${selectedCidadao.cpf}`}
                    {selectedCidadao.telefone && ` • Tel: ${selectedCidadao.telefone}`}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedCidadao(null)
                    setShowCidadaoSearch(true)
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Alterar
                </button>
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <Search style={{
                    position: 'absolute',
                    left: '18px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: 'var(--foreground-muted)'
                  }} />
                  <input
                    type="text"
                    placeholder="Buscar cidadão por nome ou CPF..."
                    value={searchCidadao}
                    onChange={(e) => {
                      setSearchCidadao(e.target.value)
                      setShowCidadaoSearch(true)
                    }}
                    onFocus={() => setShowCidadaoSearch(true)}
                    style={{
                      ...inputStyle,
                      paddingLeft: '52px'
                    }}
                  />
                  
                  {showCidadaoSearch && cidadaos.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '8px',
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                      zIndex: 10,
                      maxHeight: '280px',
                      overflowY: 'auto'
                    }}>
                      {cidadaos.map((cidadao) => (
                        <button
                          key={cidadao.id}
                          type="button"
                          onClick={() => {
                            setSelectedCidadao(cidadao)
                            setShowCidadaoSearch(false)
                            setSearchCidadao('')
                          }}
                          style={{
                            width: '100%',
                            padding: '16px 20px',
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)' }}>
                            {cidadao.nome}
                          </p>
                          <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginTop: '4px' }}>
                            {cidadao.cpf && `CPF: ${cidadao.cpf}`}
                            {cidadao.bairro && ` • ${cidadao.bairro}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>ou</span>
                  <Link href="/dashboard/cidadaos/novo?redirect=providencia" style={{ textDecoration: 'none' }}>
                    <button type="button" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--muted)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      <Plus style={{ width: '18px', height: '18px' }} />
                      Cadastrar Novo Cidadão
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detalhes da Providência */}
        <div style={{ ...cardStyle, marginBottom: '28px' }}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText style={{ width: '22px', height: '22px', color: '#6366f1' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>
                  Detalhes da Providência
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', marginTop: '2px' }}>
                  Informações sobre a solicitação
                </p>
              </div>
            </div>
          </div>
          <div style={cardContentStyle}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Título da Providência <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="titulo"
                placeholder="Resumo da solicitação (ex: Solicitação de reparo em via pública)"
                value={formData.titulo}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Descrição Detalhada <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                name="descricao"
                placeholder="Descreva o problema ou solicitação com o máximo de detalhes possível. Inclua informações como: o que está acontecendo, desde quando, quem é afetado, etc."
                value={formData.descricao}
                onChange={handleChange}
                required
                style={textareaStyle}
              />
            </div>

            <div style={{ ...gridStyle, marginBottom: '28px' }}>
              <div>
                <label style={labelStyle}>
                  <Tag style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Categoria
                </label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  <Flag style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Prioridade
                </label>
                <select
                  name="prioridade"
                  value={formData.prioridade}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  {priorityOptions.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>
                  <Building2 style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Órgão Destinatário
                </label>
                <select
                  name="orgao_destino_id"
                  value={formData.orgao_destino_id}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  <option value="">Selecione o órgão</option>
                  {orgaos.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.sigla ? `${o.sigla} - ${o.nome}` : o.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  <Calendar style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Prazo Estimado
                </label>
                <input
                  type="date"
                  name="prazo_estimado"
                  value={formData.prazo_estimado}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Localização */}
        <div style={{ ...cardStyle, marginBottom: '28px' }}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MapPin style={{ width: '22px', height: '22px', color: '#f59e0b' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>
                  Localização do Problema
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', marginTop: '2px' }}>
                  Informe onde o problema está localizado
                </p>
              </div>
            </div>
          </div>
          <div style={cardContentStyle}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Tipo de Localização</label>
              <select
                name="localizacao_tipo"
                value={formData.localizacao_tipo}
                onChange={handleChange}
                style={selectStyle}
              >
                {localizacaoTipoOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Descrição da Localização</label>
              <textarea
                name="localizacao_descricao"
                placeholder="Ex: Rua das Flores, próximo ao número 123, em frente à escola municipal..."
                value={formData.localizacao_descricao}
                onChange={handleChange}
                style={{ ...textareaStyle, minHeight: '100px' }}
              />
            </div>
          </div>
        </div>

        {/* Observações Internas */}
        <div style={{ ...cardStyle, marginBottom: '28px' }}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertCircle style={{ width: '22px', height: '22px', color: '#8b5cf6' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>
                  Observações Internas
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', marginTop: '2px' }}>
                  Notas visíveis apenas para a equipe do gabinete
                </p>
              </div>
            </div>
          </div>
          <div style={cardContentStyle}>
            <textarea
              name="observacoes_internas"
              placeholder="Anotações internas sobre esta providência (não serão visíveis para o cidadão)..."
              value={formData.observacoes_internas}
              onChange={handleChange}
              style={{ ...textareaStyle, minHeight: '100px' }}
            />
          </div>
        </div>

        {/* LGPD Notice */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          padding: '20px 24px',
          borderRadius: '14px',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          marginBottom: '32px'
        }}>
          <Info style={{ width: '22px', height: '22px', color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '14px', color: 'var(--foreground)', lineHeight: '1.6' }}>
            Os dados pessoais coletados serão tratados de acordo com a <strong>Lei Geral de Proteção de Dados (LGPD)</strong> 
            e utilizados exclusivamente para o acompanhamento desta providência.
          </p>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '16px',
          paddingBottom: '40px'
        }}>
          <Link href="/dashboard/providencias" style={{ textDecoration: 'none' }}>
            <button type="button" style={{
              padding: '14px 28px',
              borderRadius: '12px',
              backgroundColor: 'var(--muted)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              Cancelar
            </button>
          </Link>
          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 32px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              border: 'none',
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Criando...
              </>
            ) : (
              <>
                <Save style={{ width: '20px', height: '20px' }} />
                Criar Providência
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
