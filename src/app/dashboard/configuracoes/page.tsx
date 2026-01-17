'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { useTheme } from '@/providers/theme-provider'
import { ThemeSelector } from '@/components/ui/theme-toggle'
import { 
  Settings, 
  Building2,
  Bell,
  Shield,
  Save,
  Palette,
  Upload,
  Camera,
  User
} from 'lucide-react'
import { toast } from 'sonner'

export default function ConfiguracoesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [gabineteData, setGabineteData] = useState({
    nome: '',
    parlamentar_nome: '',
    parlamentar_nickname: '',
    parlamentar_cargo: '',
    partido: '',
    email: '',
    telefone: '',
    logo_url: '',
  })
  const { gabinete, setGabinete } = useAuthStore()
  const { colors, setColors } = useTheme()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (gabinete) {
      // Carregar dados do gabinete - a view tenants mapeia os campos
      setGabineteData({
        nome: gabinete.nome || (gabinete as any).name || '',
        parlamentar_nome: gabinete.parlamentar_nome || (gabinete as any).parlamentar_name || '',
        parlamentar_nickname: (gabinete as any).parlamentar_nickname || '',
        parlamentar_cargo: (gabinete as any).cargo || (gabinete as any).parlamentar_cargo || '',
        partido: gabinete.partido || '',
        email: (gabinete as any).email_contato || (gabinete as any).email || '',
        telefone: (gabinete as any).telefone_contato || (gabinete as any).telefone || '',
        logo_url: gabinete.logo_url || '',
      })
    }
  }, [gabinete])

  const handleSave = async () => {
    if (!gabinete) return

    setIsLoading(true)
    try {
      // Atualizar diretamente na tabela gabinetes (não na view tenants)
      const { data, error } = await supabase
        .from('gabinetes')
        .update({
          nome: gabineteData.nome,
          parlamentar_nome: gabineteData.parlamentar_nome,
          parlamentar_cargo: gabineteData.parlamentar_cargo || null,
          partido: gabineteData.partido || null,
          email: gabineteData.email || null,
          telefone: gabineteData.telefone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gabinete.id)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Atualizar o estado local com os novos dados
      if (data) {
        setGabinete({
          ...gabinete,
          nome: data.nome,
          parlamentar_nome: data.parlamentar_nome,
          partido: data.partido,
          logo_url: data.logo_url,
        })
      }
      toast.success('Configurações salvas com sucesso!')
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(`Erro ao salvar configurações: ${error.message || 'Erro desconhecido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !gabinete) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB')
      return
    }

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${gabinete.id}/logo.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(fileName)

      // Atualizar diretamente na tabela gabinetes
      const { error: updateError } = await supabase
        .from('gabinetes')
        .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', gabinete.id)

      if (updateError) throw updateError

      setGabineteData({ ...gabineteData, logo_url: publicUrl })
      setGabinete({ ...gabinete, logo_url: publicUrl })
      toast.success('Logo atualizado com sucesso!')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(`Erro ao fazer upload da imagem: ${error.message || 'Erro desconhecido'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--card)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    padding: '24px',
    marginBottom: '24px',
  }

  const cardHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border)',
  }

  const cardTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--foreground)',
  }

  const cardContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--muted-foreground)',
    marginBottom: '8px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const colorPresets = [
    { name: 'Azul Padrão', primary: '#3b82f6', primaryLight: '#60a5fa', primaryDark: '#2563eb', accent: '#8b5cf6' },
    { name: 'Verde Esmeralda', primary: '#10b981', primaryLight: '#34d399', primaryDark: '#059669', accent: '#06b6d4' },
    { name: 'Roxo Real', primary: '#8b5cf6', primaryLight: '#a78bfa', primaryDark: '#7c3aed', accent: '#ec4899' },
    { name: 'Rosa Vibrante', primary: '#ec4899', primaryLight: '#f472b6', primaryDark: '#db2777', accent: '#8b5cf6' },
    { name: 'Laranja Energia', primary: '#f97316', primaryLight: '#fb923c', primaryDark: '#ea580c', accent: '#eab308' },
    { name: 'Vermelho Intenso', primary: '#ef4444', primaryLight: '#f87171', primaryDark: '#dc2626', accent: '#f97316' },
    { name: 'Ciano Moderno', primary: '#06b6d4', primaryLight: '#22d3ee', primaryDark: '#0891b2', accent: '#3b82f6' },
    { name: 'Índigo Profundo', primary: '#6366f1', primaryLight: '#818cf8', primaryDark: '#4f46e5', accent: '#8b5cf6' },
  ]

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 700, 
          color: 'var(--foreground)',
          marginBottom: '8px'
        }}>
          Configurações
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '16px' }}>
          Gerencie as configurações do seu gabinete
        </p>
      </div>

      {/* Informações do Gabinete */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <Building2 size={24} style={{ color: 'var(--primary)' }} />
          <h2 style={cardTitleStyle}>Informações do Gabinete</h2>
        </div>
        <div style={cardContentStyle}>
          {/* Logo Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '20px' }}>
            <div 
              style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '12px',
                border: '2px dashed var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: 'var(--muted)',
                position: 'relative',
              }}
            >
              {gabineteData.logo_url ? (
                <img 
                  src={gabineteData.logo_url} 
                  alt="Logo do gabinete"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Camera size={32} style={{ color: 'var(--muted-foreground)' }} />
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.6 : 1,
                }}
              >
                <Upload size={16} />
                {isUploading ? 'Enviando...' : 'Alterar Logo'}
              </button>
              <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '8px' }}>
                PNG, JPG ou GIF. Máximo 2MB.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Nome do Gabinete</label>
              <input
                value={gabineteData.nome}
                onChange={(e) => setGabineteData({ ...gabineteData, nome: e.target.value })}
                style={inputStyle}
                placeholder="Digite o nome do gabinete"
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Nome do Parlamentar</label>
                <input
                  value={gabineteData.parlamentar_nome}
                  onChange={(e) => setGabineteData({ ...gabineteData, parlamentar_nome: e.target.value })}
                  style={inputStyle}
                  placeholder="Digite o nome do parlamentar"
                />
              </div>
              
              <div>
                <label style={labelStyle}>Apelido do Parlamentar</label>
                <input
                  value={gabineteData.parlamentar_nickname}
                  onChange={(e) => setGabineteData({ ...gabineteData, parlamentar_nickname: e.target.value })}
                  style={inputStyle}
                  placeholder="Ex: O médico do povo"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Cargo</label>
                <select
                  value={gabineteData.parlamentar_cargo}
                  onChange={(e) => setGabineteData({ ...gabineteData, parlamentar_cargo: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Selecione o cargo</option>
                  <option value="admin">Administrador</option>
                  <option value="vereador">Vereador(a)</option>
                  <option value="deputado_estadual">Deputado(a) Estadual</option>
                  <option value="deputado_federal">Deputado(a) Federal</option>
                  <option value="senador">Senador(a)</option>
                  <option value="prefeito">Prefeito(a)</option>
                  <option value="governador">Governador(a)</option>
                </select>
              </div>
              
              <div>
                <label style={labelStyle}>Partido</label>
                <input
                  value={gabineteData.partido}
                  onChange={(e) => setGabineteData({ ...gabineteData, partido: e.target.value })}
                  style={inputStyle}
                  placeholder="Ex: PSDB"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={labelStyle}>E-mail de Contato</label>
                <input
                  type="email"
                  value={gabineteData.email}
                  onChange={(e) => setGabineteData({ ...gabineteData, email: e.target.value })}
                  style={inputStyle}
                  placeholder="contato@gabinete.gov.br"
                />
              </div>
              
              <div>
                <label style={labelStyle}>Telefone de Contato</label>
                <input
                  value={gabineteData.telefone}
                  onChange={(e) => setGabineteData({ ...gabineteData, telefone: e.target.value })}
                  style={inputStyle}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aparência */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <Palette size={24} style={{ color: 'var(--primary)' }} />
          <h2 style={cardTitleStyle}>Aparência</h2>
        </div>
        <div style={cardContentStyle}>
          <div>
            <label style={labelStyle}>Tema</label>
            <ThemeSelector />
          </div>

          <div>
            <label style={labelStyle}>Cor Principal</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setColors({ primary: preset.primary, primaryLight: preset.primaryLight, primaryDark: preset.primaryDark, accent: preset.accent })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: colors.primary === preset.primary 
                      ? `2px solid ${preset.primary}` 
                      : '1px solid var(--border)',
                    background: colors.primary === preset.primary 
                      ? `${preset.primary}10` 
                      : 'var(--background)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div 
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%',
                      background: preset.primary,
                    }} 
                  />
                  <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botão Salvar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--primary)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <Save size={18} />
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  )
}
