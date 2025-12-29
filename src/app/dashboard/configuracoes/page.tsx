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

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
  const labelClass = "block text-sm font-medium text-[var(--foreground)] mb-1.5"

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Configurações</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Gerencie as configurações do seu gabinete
        </p>
      </div>

      {/* Imagem do Parlamentar */}
      <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center gap-2 text-[var(--foreground)] mb-4">
          <Camera className="w-4 h-4" />
          <h3 className="font-medium text-sm">Imagem do Parlamentar</h3>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[var(--muted)] flex items-center justify-center overflow-hidden border-2 border-[var(--border)]">
              {tenantData.logo_url ? (
                <img 
                  src={tenantData.logo_url} 
                  alt="Foto do parlamentar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-[var(--muted-foreground)]" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-sm text-[var(--foreground)] font-medium">Foto de perfil</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              JPG, PNG ou GIF. Máximo 2MB.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mt-2 text-xs text-blue-500 hover:underline disabled:opacity-50"
            >
              Alterar imagem
            </button>
          </div>
        </div>
      </div>

      {/* Tema e Aparência */}
      <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center gap-2 text-[var(--foreground)] mb-4">
          <Palette className="w-4 h-4" />
          <h3 className="font-medium text-sm">Tema e Aparência</h3>
        </div>
        
        <div className="space-y-6">
          {/* Modo de Cor */}
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-3">Modo de cor</label>
            <ThemeSelector />
          </div>

          {/* Cor do Tema */}
          <div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-3">Cor principal</label>
            <div className="flex flex-wrap gap-3">
              {themePresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setColors({
                    primary: preset.primary,
                    primaryLight: preset.primary,
                    primaryDark: preset.primary,
                    accent: preset.accent,
                  })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    colors.primary === preset.primary
                      ? 'border-[var(--foreground)] bg-[var(--muted)]'
                      : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span className="text-sm text-[var(--foreground)]">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dados do Gabinete */}
      <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center gap-2 text-[var(--foreground)] mb-4">
          <Building2 className="w-4 h-4" />
          <h3 className="font-medium text-sm">Dados do Gabinete</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Nome do Gabinete</label>
            <input
              value={tenantData.name}
              onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
              className={inputClass}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nome do Parlamentar</label>
              <input
                value={tenantData.parlamentar_name}
                onChange={(e) => setTenantData({ ...tenantData, parlamentar_name: e.target.value })}
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>Partido</label>
              <input
                value={tenantData.partido}
                onChange={(e) => setTenantData({ ...tenantData, partido: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>E-mail de Contato</label>
              <input
                type="email"
                value={tenantData.email_contato}
                onChange={(e) => setTenantData({ ...tenantData, email_contato: e.target.value })}
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>Telefone de Contato</label>
              <input
                value={tenantData.telefone_contato}
                onChange={(e) => setTenantData({ ...tenantData, telefone_contato: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSave} 
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>

      {/* Notificações */}
      <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center gap-2 text-[var(--foreground)] mb-4">
          <Bell className="w-4 h-4" />
          <h3 className="font-medium text-sm">Notificações</h3>
        </div>
        
        <div className="space-y-3">
          {[
            { title: 'Notificações por E-mail', desc: 'Receba atualizações sobre providências por e-mail', defaultChecked: true },
            { title: 'Alertas de Prazo', desc: 'Receba alertas quando providências estiverem próximas do prazo', defaultChecked: true },
            { title: 'Resumo Semanal', desc: 'Receba um resumo semanal das atividades do gabinete', defaultChecked: false },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-[var(--muted)]">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultChecked} />
                <div className="w-10 h-5 bg-[var(--border)] rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Segurança */}
      <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center gap-2 text-[var(--foreground)] mb-4">
          <Shield className="w-4 h-4" />
          <h3 className="font-medium text-sm">Segurança</h3>
        </div>
        
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-[var(--muted)]">
            <p className="text-sm font-medium text-[var(--foreground)]">Alterar Senha</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 mb-3">
              Recomendamos alterar sua senha periodicamente
            </p>
            <button className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm text-[var(--foreground)] hover:bg-[var(--background)] transition-colors">
              Alterar Senha
            </button>
          </div>
        </div>
      </div>

      {/* Sobre */}
      <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center gap-2 text-[var(--foreground)] mb-4">
          <Settings className="w-4 h-4" />
          <h3 className="font-medium text-sm">Sobre o Projeto</h3>
        </div>
        
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[var(--foreground)]">ProviDATA</h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Sistema de Gestão de Providências Parlamentares
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Versão 1.0.0
          </p>
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted-foreground)]">
              Desenvolvido por{' '}
              <a 
                href="https://dataro-it.com.br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-[var(--foreground)] hover:underline"
              >
                DATA-RO INTELIGÊNCIA TERRITORIAL
              </a>
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
