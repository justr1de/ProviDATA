'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  MapPin,
  Phone,
  Info,
  Search,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

const generoOptions = [
  { value: '', label: 'Selecione' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
  { value: 'nao_informar', label: 'Prefiro não informar' },
]

const ufOptions = [
  { value: '', label: 'UF' },
  { value: 'AC', label: 'AC' },
  { value: 'AL', label: 'AL' },
  { value: 'AP', label: 'AP' },
  { value: 'AM', label: 'AM' },
  { value: 'BA', label: 'BA' },
  { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' },
  { value: 'ES', label: 'ES' },
  { value: 'GO', label: 'GO' },
  { value: 'MA', label: 'MA' },
  { value: 'MT', label: 'MT' },
  { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' },
  { value: 'PA', label: 'PA' },
  { value: 'PB', label: 'PB' },
  { value: 'PR', label: 'PR' },
  { value: 'PE', label: 'PE' },
  { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' },
  { value: 'RN', label: 'RN' },
  { value: 'RS', label: 'RS' },
  { value: 'RO', label: 'RO' },
  { value: 'RR', label: 'RR' },
  { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' },
  { value: 'SE', label: 'SE' },
  { value: 'TO', label: 'TO' },
]

// Função para validar CPF
const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '')
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false
  
  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false
  
  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false
  
  return true
}

function NovoCidadaoForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchingCEP, setIsSearchingCEP] = useState(false)
  const [cpfValid, setCpfValid] = useState<boolean | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    rg_orgao_emissor: '',
    data_nascimento: '',
    genero: '',
    email: '',
    telefone: '',
    celular: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    observacoes: '',
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { gabinete: tenant } = useAuthStore()

  const redirect = searchParams.get('redirect')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value)
    setFormData({ ...formData, cpf: formattedCPF })
    
    // Valida o CPF quando tiver 14 caracteres (formato completo)
    if (formattedCPF.length === 14) {
      setCpfValid(validateCPF(formattedCPF))
    } else {
      setCpfValid(null)
    }
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1')
  }

  // Função para buscar endereço pelo CEP
  const searchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '')
    
    if (cleanCEP.length !== 8) {
      toast.error('CEP deve ter 8 dígitos')
      return
    }

    setIsSearchingCEP(true)
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        toast.error('CEP não encontrado')
        return
      }
      
      setFormData(prev => ({
        ...prev,
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        uf: data.uf || '',
        complemento: data.complemento || prev.complemento,
      }))
      
      toast.success('Endereço encontrado!')
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      toast.error('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setIsSearchingCEP(false)
    }
  }

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCEP = formatCEP(e.target.value)
    setFormData({ ...formData, cep: formattedCEP })
    
    // Busca automática quando o CEP estiver completo
    if (formattedCEP.replace(/\D/g, '').length === 8) {
      await searchCEP(formattedCEP)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tenant) {
      toast.error('Erro de autenticação')
      return
    }

    if (!formData.nome) {
      toast.error('O nome é obrigatório')
      return
    }

    // Validar CPF se preenchido
    if (formData.cpf && !validateCPF(formData.cpf)) {
      toast.error('CPF inválido. Por favor, verifique o número informado.')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('cidadaos')
        .insert({
          gabinete_id: tenant.id,
          nome: formData.nome,
          cpf: formData.cpf || null,
          rg: formData.rg || null,
          rg_orgao_emissor: formData.rg_orgao_emissor || null,
          data_nascimento: formData.data_nascimento || null,
          genero: formData.genero || null,
          email: formData.email || null,
          telefone: formData.telefone || null,
          celular: formData.celular || null,
          cep: formData.cep || null,
          endereco: formData.endereco || null,
          numero: formData.numero || null,
          complemento: formData.complemento || null,
          bairro: formData.bairro || null,
          cidade: formData.cidade || null,
          uf: formData.uf || null,
          observacoes: formData.observacoes || null,
        })

      if (error) throw error

      toast.success('Cidadão cadastrado com sucesso!')
      
      if (redirect === 'providencia') {
        router.push('/dashboard/providencias/nova')
      } else {
        router.push('/dashboard/cidadaos')
      }
    } catch (error) {
      console.error('Error creating cidadao:', error)
      toast.error('Erro ao cadastrar cidadão')
    } finally {
      setIsLoading(false)
    }
  }

  // Estilos para cards com espaçamento profissional
  const cardStyle = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '24px',
  }

  const cardHeaderStyle = {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--muted-bg)',
  }

  const cardContentStyle = {
    padding: '24px',
  }

  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: 'var(--text-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: 0,
  }

  const iconContainerStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#dcfce7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const gridStyle = (cols: number) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '20px',
    marginBottom: '20px',
  })

  const inputGroupStyle = {
    marginBottom: '20px',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500' as const,
    color: 'var(--text-color)',
    marginBottom: '8px',
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    backgroundColor: 'var(--card)',
    color: 'var(--text-color)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const inputWithIconStyle = {
    ...inputStyle,
    paddingRight: '44px',
  }

  const selectStyle = {
    ...inputStyle,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '20px',
    paddingRight: '40px',
  }

  const textareaStyle = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical' as const,
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--border)'
      }}>
        <Link href="/dashboard/cidadaos">
          <button style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            <ArrowLeft style={{ width: '20px', height: '20px', color: 'var(--text-color)' }} />
          </button>
        </Link>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: 'var(--text-color)',
            margin: '0 0 4px 0'
          }}>
            Novo Cidadão
          </h1>
          <p style={{ 
            fontSize: '15px', 
            color: 'var(--text-muted)',
            margin: 0
          }}>
            Cadastre um novo cidadão no sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Dados Pessoais */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              <div style={iconContainerStyle}>
                <User style={{ width: '18px', height: '18px', color: '#16a34a' }} />
              </div>
              Dados Pessoais
            </h2>
          </div>
          <div style={cardContentStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Nome Completo *</label>
              <input
                type="text"
                name="nome"
                placeholder="Nome completo do cidadão"
                value={formData.nome}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>CPF</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={handleCPFChange}
                    maxLength={14}
                    style={{
                      ...inputWithIconStyle,
                      borderColor: cpfValid === false ? '#ef4444' : cpfValid === true ? '#22c55e' : 'var(--border)',
                    }}
                  />
                  {cpfValid !== null && (
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}>
                      {cpfValid ? (
                        <CheckCircle2 style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                      ) : (
                        <XCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                      )}
                    </div>
                  )}
                </div>
                {cpfValid === false && (
                  <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    CPF inválido
                  </p>
                )}
              </div>
              
              <div>
                <label style={labelStyle}>RG</label>
                <input
                  type="text"
                  name="rg"
                  placeholder="Número do RG"
                  value={formData.rg}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Órgão Emissor</label>
                <input
                  type="text"
                  name="rg_orgao_emissor"
                  placeholder="Ex: SSP/RO, DETRAN/RO"
                  value={formData.rg_orgao_emissor}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Data de Nascimento</label>
                <input
                  type="date"
                  name="data_nascimento"
                  value={formData.data_nascimento}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ maxWidth: '300px' }}>
              <label style={labelStyle}>Gênero</label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                style={selectStyle}
              >
                {generoOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              <div style={{...iconContainerStyle, backgroundColor: '#dbeafe'}}>
                <Phone style={{ width: '18px', height: '18px', color: '#2563eb' }} />
              </div>
              Contato
            </h2>
          </div>
          <div style={cardContentStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>E-mail</label>
              <input
                type="email"
                name="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  placeholder="(00) 0000-0000"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                  maxLength={15}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Celular</label>
                <input
                  type="text"
                  name="celular"
                  placeholder="(00) 00000-0000"
                  value={formData.celular}
                  onChange={(e) => setFormData({ ...formData, celular: formatPhone(e.target.value) })}
                  maxLength={15}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              <div style={{...iconContainerStyle, backgroundColor: '#fef3c7'}}>
                <MapPin style={{ width: '18px', height: '18px', color: '#d97706' }} />
              </div>
              Endereço
            </h2>
          </div>
          <div style={cardContentStyle}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div style={{ width: '200px' }}>
                <label style={labelStyle}>CEP</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="cep"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={handleCEPChange}
                    maxLength={9}
                    style={inputWithIconStyle}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}>
                    {isSearchingCEP ? (
                      <Loader2 style={{ width: '20px', height: '20px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Search style={{ width: '20px', height: '20px', color: 'var(--muted-foreground)' }} />
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => searchCEP(formData.cep)}
                disabled={isSearchingCEP || formData.cep.replace(/\D/g, '').length !== 8}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--text-color)',
                  cursor: isSearchingCEP || formData.cep.replace(/\D/g, '').length !== 8 ? 'not-allowed' : 'pointer',
                  opacity: isSearchingCEP || formData.cep.replace(/\D/g, '').length !== 8 ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <Search style={{ width: '16px', height: '16px' }} />
                Buscar CEP
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Endereço</label>
                <input
                  type="text"
                  name="endereco"
                  placeholder="Rua, Avenida, etc."
                  value={formData.endereco}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Número</label>
                <input
                  type="text"
                  name="numero"
                  placeholder="Nº"
                  value={formData.numero}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  placeholder="Apto, Bloco, etc."
                  value={formData.complemento}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Bairro</label>
                <input
                  type="text"
                  name="bairro"
                  placeholder="Nome do bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input
                  type="text"
                  name="cidade"
                  placeholder="Nome da cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>UF</label>
                <select
                  name="uf"
                  value={formData.uf}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  {ufOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              <div style={{...iconContainerStyle, backgroundColor: '#f3e8ff'}}>
                <Info style={{ width: '18px', height: '18px', color: '#7c3aed' }} />
              </div>
              Observações
            </h2>
            <p style={{ 
              fontSize: '13px', 
              color: 'var(--text-muted)', 
              margin: '8px 0 0 46px' 
            }}>
              Informações adicionais sobre o cidadão
            </p>
          </div>
          <div style={cardContentStyle}>
            <textarea
              name="observacoes"
              placeholder="Observações gerais..."
              value={formData.observacoes}
              onChange={handleChange}
              style={textareaStyle}
            />
          </div>
        </div>

        {/* LGPD Notice */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          padding: '18px 20px',
          borderRadius: '12px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          marginBottom: '28px',
        }}>
          <Info style={{ 
            width: '20px', 
            height: '20px', 
            color: '#2563eb', 
            flexShrink: 0, 
            marginTop: '2px' 
          }} />
          <p style={{ 
            fontSize: '14px', 
            color: '#1e40af', 
            lineHeight: '1.6',
            margin: 0
          }}>
            Os dados pessoais coletados serão tratados de acordo com a Lei Geral de Proteção de Dados (LGPD) 
            e utilizados exclusivamente para o registro e acompanhamento de providências parlamentares.
          </p>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '16px',
          paddingTop: '8px',
          paddingBottom: '40px',
        }}>
          <Link href="/dashboard/cidadaos">
            <button
              type="button"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)',
                color: 'var(--text-color)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Cancelar
            </button>
          </Link>
          <button
            type="submit"
            disabled={isLoading || cpfValid === false}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#16a34a',
              color: 'white',
              cursor: isLoading || cpfValid === false ? 'not-allowed' : 'pointer',
              opacity: isLoading || cpfValid === false ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            <Save style={{ width: '18px', height: '18px' }} />
            {isLoading ? 'Cadastrando...' : 'Cadastrar Cidadão'}
          </button>
        </div>
      </form>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function NovoCidadaoPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px',
        color: 'var(--text-muted)'
      }}>
        Carregando...
      </div>
    }>
      <NovoCidadaoForm />
    </Suspense>
  )
}
