'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Settings, 
  Building2,
  Bell,
  Shield,
  Save
} from 'lucide-react'
import { toast } from 'sonner'

export default function ConfiguracoesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [tenantData, setTenantData] = useState({
    name: '',
    parlamentar_name: '',
    partido: '',
    email_contato: '',
    telefone_contato: '',
  })
  const { tenant, setTenant } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    if (tenant) {
      setTenantData({
        name: tenant.name || '',
        parlamentar_name: tenant.parlamentar_name || '',
        partido: tenant.partido || '',
        email_contato: tenant.email_contato || '',
        telefone_contato: tenant.telefone_contato || '',
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-[var(--muted-foreground)]">
          Gerencie as configurações do seu gabinete
        </p>
      </div>

      {/* Dados do Gabinete */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Dados do Gabinete
          </CardTitle>
          <CardDescription>
            Informações básicas do gabinete parlamentar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nome do Gabinete"
            value={tenantData.name}
            onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Parlamentar"
              value={tenantData.parlamentar_name}
              onChange={(e) => setTenantData({ ...tenantData, parlamentar_name: e.target.value })}
            />
            
            <Input
              label="Partido"
              value={tenantData.partido}
              onChange={(e) => setTenantData({ ...tenantData, partido: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="email"
              label="E-mail de Contato"
              value={tenantData.email_contato}
              onChange={(e) => setTenantData({ ...tenantData, email_contato: e.target.value })}
            />
            
            <Input
              label="Telefone de Contato"
              value={tenantData.telefone_contato}
              onChange={(e) => setTenantData({ ...tenantData, telefone_contato: e.target.value })}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} isLoading={isLoading}>
              <Save className="w-4 h-4" />
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure como deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--secondary)]">
            <div>
              <p className="font-medium">Notificações por E-mail</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Receba atualizações sobre providências por e-mail
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--secondary)]">
            <div>
              <p className="font-medium">Alertas de Prazo</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Receba alertas quando providências estiverem próximas do prazo
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--secondary)]">
            <div>
              <p className="font-medium">Resumo Semanal</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Receba um resumo semanal das atividades do gabinete
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Configurações de segurança da conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-[var(--secondary)]">
            <p className="font-medium mb-2">Alterar Senha</p>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Recomendamos alterar sua senha periodicamente para maior segurança
            </p>
            <Button variant="outline">
              Alterar Senha
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-[var(--secondary)]">
            <p className="font-medium mb-2">Sessões Ativas</p>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Gerencie os dispositivos conectados à sua conta
            </p>
            <Button variant="outline">
              Ver Sessões
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sobre */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Sobre o Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <h3 className="text-xl font-bold mb-2">ProviDATA</h3>
            <p className="text-[var(--muted-foreground)] mb-4">
              Sistema de Gestão de Providências Parlamentares
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Versão 1.0.0
            </p>
            <div className="mt-6 pt-4 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)]">
                Desenvolvido por{' '}
                <a 
                  href="https://dataro-it.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--primary)] hover:underline"
                >
                  DATA-RO INTELIGÊNCIA TERRITORIAL
                </a>
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-2">
                Todos os direitos reservados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
