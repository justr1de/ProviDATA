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
  const [tenantData, setTenantData] = useState({
    name: '',
    parlamentar_name: '',
    partido: '',
    email_contato: '',
    telefone_contato: '',
    logo_url: '',
  })
  const { tenant, setTenant } = useAuthStore()
  const { colors, setColors } = useTheme()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tenant) {
      setTenantData({
        name: tenant.name || '',
        parlamentar_name: tenant.parlamentar_name || '',
        partido: tenant.partido || '',
        email_contato: tenant.email_contato || '',
        telefone_contato: tenant.telefone_contato || '',
        logo_url: (tenant as any).logo_url || '',
      })
    }
  }, [tenant])

  const handleSave = async () => {
    if (!tenant) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({
          name: tenantData.name,
          parlamentar_name: tenantData.parlamentar_name,
          partido: tenantData.partido || null,
          email_contato: tenantData.email_contato || null,
          telefone_contato: tenantData.telefone_contato || null,
        })
        .eq('id', tenant.id)
        .select()
        .single()

      if (error) throw error

      setTenant(data)
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !tenant) return

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
      const fileName = `${tenant.id}/logo.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(fileName)

      setTenantData({ ...tenantData, logo_url: publicUrl })
      toast.success('Imagem carregada com sucesso!')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Erro ao carregar imagem')
    } finally {
      setIsUploading(false)
    }
  }

  const themePresets = [
    { name: 'Azul', primary: '#3b82f6', accent: '#8b5cf6' },
    { name: 'Verde', primary: '#22c55e', accent: '#14b8a6' },
    { name: 'Roxo', primary: '#8b5cf6', accent: '#ec4899' },
    { name: 'Laranja', primary: '#f97316', accent: '#eab308' },
    { name: 'Vermelho', primary: '#ef4444', accent: '#f97316' },
    { name: 'Cinza', primary: '#6b7280', accent: '#374151' },
  ]

  // Estilos padronizados
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    overflow: 'hidden'
  }

  const cardHeaderStyle: React.CSSProperties = {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }

  const cardContentStyle: React.CSSProperties = {
    padding: '24px'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '14px',
    outline: 'none'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--foreground)',
    marginBottom: '8px'
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

  const buttonOutlineStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }

  return (
    <div style={{ padding: '0 8px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Settings style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--foreground)' }}>
            Configurações
          </h1>
        </div>
        <p style={{ fontSize: '16px', color: 'var(--foreground-muted)' }}>
          Gerencie as configurações do seu gabinete
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Imagem do Parlamentar */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Camera style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>
              Imagem do Parlamentar
            </h3>
          </div>
          <div style={cardContentStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '3px solid var(--border)'
                }}>
                  {tenantData.logo_url ? (
                    <img 
                      src={tenantData.logo_url} 
                      alt="Foto do parlamentar" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User style={{ width: '40px', height: '40px', color: 'var(--foreground-muted)' }} />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {isUploading ? (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    <Upload style={{ width: '16px', height: '16px' }} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>
                  Foto de perfil
                </p>
                <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginBottom: '12px' }}>
                  JPG, PNG ou GIF. Máximo 2MB.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{ ...buttonOutlineStyle, padding: '8px 16px', fontSize: '13px' }}
                >
                  <Upload style={{ width: '14px', height: '14px' }} />
                  Alterar imagem
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tema e Aparência */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Palette style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>
              Tema e Aparência
            </h3>
          </div>
          <div style={cardContentStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Modo de Cor */}
              <div>
                <label style={{ ...labelStyle, marginBottom: '12px' }}>Modo de cor</label>
                <ThemeSelector />
              </div>

              {/* Cor do Tema */}
              <div>
                <label style={{ ...labelStyle, marginBottom: '12px' }}>Cor principal</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {themePresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setColors({
                        primary: preset.primary,
                        primaryLight: preset.primary,
                        primaryDark: preset.primary,
                        accent: preset.accent,
                      })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: colors.primary === preset.primary 
                          ? '2px solid var(--foreground)' 
                          : '1px solid var(--border)',
                        backgroundColor: colors.primary === preset.primary 
                          ? 'var(--muted)' 
                          : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div 
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: preset.primary
                        }}
                      />
                      <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dados do Gabinete */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Building2 style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>
              Dados do Gabinete
            </h3>
          </div>
          <div style={cardContentStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Nome do Gabinete</label>
                <input
                  value={tenantData.name}
                  onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
                  style={inputStyle}
                  placeholder="Digite o nome do gabinete"
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Nome do Parlamentar</label>
                  <input
                    value={tenantData.parlamentar_name}
                    onChange={(e) => setTenantData({ ...tenantData, parlamentar_name: e.target.value })}
                    style={inputStyle}
                    placeholder="Digite o nome do parlamentar"
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>Partido</label>
                  <input
                    value={tenantData.partido}
                    onChange={(e) => setTenantData({ ...tenantData, partido: e.target.value })}
                    style={inputStyle}
                    placeholder="Ex: DEMO"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>E-mail de Contato</label>
                  <input
                    type="email"
                    value={tenantData.email_contato}
                    onChange={(e) => setTenantData({ ...tenantData, email_contato: e.target.value })}
                    style={inputStyle}
                    placeholder="contato@exemplo.com"
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>Telefone de Contato</label>
                  <input
                    value={tenantData.telefone_contato}
                    onChange={(e) => setTenantData({ ...tenantData, telefone_contato: e.target.value })}
                    style={inputStyle}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button 
                  onClick={handleSave} 
                  disabled={isLoading}
                  style={{ ...buttonStyle, opacity: isLoading ? 0.7 : 1 }}
                >
                  {isLoading ? (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    <Save style={{ width: '18px', height: '18px' }} />
                  )}
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Bell style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>
              Notificações
            </h3>
          </div>
          <div style={cardContentStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: 'Notificações por E-mail', desc: 'Receba atualizações sobre providências por e-mail', defaultChecked: true },
                { title: 'Alertas de Prazo', desc: 'Receba alertas quando providências estiverem próximas do prazo', defaultChecked: true },
                { title: 'Resumo Semanal', desc: 'Receba um resumo semanal das atividades do gabinete', defaultChecked: false },
              ].map((item, index) => (
                <div 
                  key={index} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--muted)'
                  }}
                >
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '4px' }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>
                      {item.desc}
                    </p>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} defaultChecked={item.defaultChecked} />
                    <div style={{
                      width: '44px',
                      height: '24px',
                      backgroundColor: item.defaultChecked ? 'var(--primary)' : 'var(--border)',
                      borderRadius: '12px',
                      position: 'relative',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: item.defaultChecked ? '22px' : '2px',
                        width: '20px',
                        height: '20px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: 'all 0.2s ease'
                      }} />
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Shield style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>
              Segurança
            </h3>
          </div>
          <div style={cardContentStyle}>
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: 'var(--muted)'
            }}>
              <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '4px' }}>
                Alterar Senha
              </p>
              <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginBottom: '16px' }}>
                Recomendamos alterar sua senha periodicamente
              </p>
              <button style={buttonOutlineStyle}>
                <Shield style={{ width: '16px', height: '16px' }} />
                Alterar Senha
              </button>
            </div>
          </div>
        </div>

        {/* Sobre */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Settings style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>
              Sobre o Projeto
            </h3>
          </div>
          <div style={cardContentStyle}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <svg style={{ width: '36px', height: '36px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--foreground)', marginBottom: '4px' }}>
                ProviDATA
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', marginBottom: '8px' }}>
                Sistema de Gestão de Providências Parlamentares
              </p>
              <p style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>
                Versão 1.0.0
              </p>
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>
                  Desenvolvido por{' '}
                  <a 
                    href="https://dataro-it.com.br" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontWeight: '600', color: 'var(--foreground)', textDecoration: 'none' }}
                  >
                    DATA-RO INTELIGÊNCIA TERRITORIAL
                  </a>
                </p>
                <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '4px' }}>
                  Todos os direitos reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
