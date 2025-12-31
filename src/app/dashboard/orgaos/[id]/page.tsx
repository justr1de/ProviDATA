'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { ArrowLeft, Save, Building2 } from 'lucide-react'
import { toast } from 'sonner'

const tipoOptions = [
  { value: 'secretaria_municipal', label: 'Secretaria Municipal' },
  { value: 'secretaria_estadual', label: 'Secretaria Estadual' },
  { value: 'mp_estadual', label: 'Ministério Público Estadual' },
  { value: 'mp_federal', label: 'Ministério Público Federal' },
  { value: 'defensoria', label: 'Defensoria Pública' },
  { value: 'tribunal_contas', label: 'Tribunal de Contas' },
  { value: 'outros', label: 'Outros' },
]

export default function EditarOrgaoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'secretaria_municipal',
    sigla: '',
    email: '',
    telefone: '',
    endereco: '',
    responsavel: '',
  })

  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { tenant } = useAuthStore()
  const orgaoId = params.id as string

  useEffect(() => {
    const loadOrgao = async () => {
      if (!tenant || !orgaoId) return

      try {
        const { data, error } = await supabase
          .from('orgaos')
          .select('*')
          .eq('id', orgaoId)
          .eq('tenant_id', tenant.id)
          .single()

        if (error) throw error

        if (data) {
          setFormData({
            nome: data.nome || '',
            tipo: data.tipo || 'secretaria_municipal',
            sigla: data.sigla || '',
            email: data.email || '',
            telefone: data.telefone || '',
            endereco: data.endereco || '',
            responsavel: data.responsavel || '',
          })
        }
      } catch (error) {
        console.error('Error loading orgao:', error)
        toast.error('Erro ao carregar dados do órgão')
        router.push('/dashboard/orgaos')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadOrgao()
  }, [tenant, orgaoId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tenant) {
      toast.error('Erro de autenticação')
      return
    }

    if (!formData.nome || !formData.tipo) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('orgaos')
        .update({
          nome: formData.nome,
          tipo: formData.tipo,
          sigla: formData.sigla || null,
          email: formData.email || null,
          telefone: formData.telefone || null,
          endereco: formData.endereco || null,
          responsavel: formData.responsavel || null,
        })
        .eq('id', orgaoId)
        .eq('tenant_id', tenant.id)

      if (error) throw error

      toast.success('Órgão atualizado com sucesso!')
      router.push('/dashboard/orgaos')
    } catch (error) {
      console.error('Error updating orgao:', error)
      toast.error('Erro ao atualizar órgão')
    } finally {
      setIsLoading(false)
    }
  }

  // Estilos do formulário
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    marginBottom: '24px',
  }

  const cardHeaderStyle: React.CSSProperties = {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--muted)',
  }

  const cardContentStyle: React.CSSProperties = {
    padding: '24px',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--foreground)',
    marginBottom: '8px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '20px',
    paddingRight: '40px',
    cursor: 'pointer',
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical',
  }

  const inputGroupStyle: React.CSSProperties = {
    marginBottom: '20px',
  }

  const iconContainerStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
  }

  if (isLoadingData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--border)'
      }}>
        <Link href="/dashboard/orgaos" style={{ textDecoration: 'none' }}>
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
            color: 'var(--foreground)',
          }}>
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
          </button>
        </Link>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: 'var(--foreground)',
            margin: '0 0 4px 0'
          }}>
            Editar Órgão
          </h1>
          <p style={{ 
            fontSize: '15px', 
            color: 'var(--foreground-muted)',
            margin: 0
          }}>
            Atualize os dados do órgão
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Dados do Órgão */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconContainerStyle}>
                <Building2 style={{ width: '18px', height: '18px', color: '#16a34a' }} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>
                Dados do Órgão
              </h2>
            </div>
          </div>
          <div style={cardContentStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Nome do Órgão *</label>
              <input
                type="text"
                name="nome"
                placeholder="Ex: Secretaria Municipal de Obras"
                value={formData.nome}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Tipo *</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                  style={selectStyle}
                >
                  {tipoOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={labelStyle}>Sigla</label>
                <input
                  type="text"
                  name="sigla"
                  placeholder="Ex: SEMOB"
                  value={formData.sigla}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input
                  type="email"
                  name="email"
                  placeholder="contato@orgao.gov.br"
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  placeholder="(00) 0000-0000"
                  value={formData.telefone}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Responsável</label>
              <input
                type="text"
                name="responsavel"
                placeholder="Nome do responsável pelo órgão"
                value={formData.responsavel}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '0' }}>
              <label style={labelStyle}>Endereço</label>
              <textarea
                name="endereco"
                placeholder="Endereço completo do órgão"
                value={formData.endereco}
                onChange={handleChange}
                style={textareaStyle}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
          <Link href="/dashboard/orgaos" style={{ textDecoration: 'none' }}>
            <button 
              type="button" 
              style={{
                ...buttonStyle,
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              Cancelar
            </button>
          </Link>
          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              ...buttonStyle,
              backgroundColor: 'var(--primary)',
              color: 'white',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <Save style={{ width: '16px', height: '16px' }} />
            )}
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  )
}
