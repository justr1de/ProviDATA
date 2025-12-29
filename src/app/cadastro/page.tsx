'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, User, Building2, FileText, Info } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const cargoOptions = [
  { value: 'vereador', label: 'Vereador(a)' },
  { value: 'deputado_estadual', label: 'Deputado(a) Estadual' },
  { value: 'deputado_federal', label: 'Deputado(a) Federal' },
  { value: 'senador', label: 'Senador(a)' },
]

const ufOptions = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

export default function CadastroPage() {
  const [formData, setFormData] = useState({
    nomeGabinete: '',
    parlamentarName: '',
    cargo: '',
    partido: '',
    uf: '',
    municipio: '',
    email: '',
    password: '',
    confirmPassword: '',
    nomeUsuario: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      // 1. Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        toast.error('Erro ao criar conta', { description: authError.message })
        return
      }

      if (!authData.user) {
        toast.error('Erro ao criar conta')
        return
      }

      // 2. Criar tenant (gabinete)
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: formData.nomeGabinete,
          slug: generateSlug(formData.nomeGabinete),
          parlamentar_name: formData.parlamentarName,
          cargo: formData.cargo,
          partido: formData.partido || null,
          uf: formData.uf,
          municipio: formData.municipio || null,
          email_contato: formData.email,
        })
        .select()
        .single()

      if (tenantError) {
        toast.error('Erro ao criar gabinete', { description: tenantError.message })
        return
      }

      // 3. Criar usuário na tabela users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          tenant_id: tenantData.id,
          nome: formData.nomeUsuario,
          email: formData.email,
          role: 'admin',
        })

      if (userError) {
        toast.error('Erro ao criar perfil', { description: userError.message })
        return
      }

      toast.success('Conta criada com sucesso!', {
        description: 'Verifique seu e-mail para confirmar o cadastro.',
      })
      
      router.push('/login')
    } catch {
      toast.error('Erro inesperado ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 py-8">
      <Toaster position="top-right" richColors />
      
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary)] text-white mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">ProviDATA</h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            Sistema de Gestão de Providências Parlamentares
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
            <CardDescription className="text-center">
              Cadastre seu gabinete para começar a gerenciar providências
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados do Gabinete */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[var(--foreground)]">
                  <Building2 className="w-5 h-5" />
                  <h3 className="font-semibold">Dados do Gabinete</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="nomeGabinete"
                    label="Nome do Gabinete"
                    placeholder="Ex: Gabinete do Vereador João"
                    value={formData.nomeGabinete}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    name="parlamentarName"
                    label="Nome do Parlamentar"
                    placeholder="Nome completo"
                    value={formData.parlamentarName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    name="cargo"
                    label="Cargo"
                    options={cargoOptions}
                    placeholder="Selecione o cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    name="partido"
                    label="Partido"
                    placeholder="Ex: PSDB"
                    value={formData.partido}
                    onChange={handleChange}
                  />
                  
                  <Select
                    name="uf"
                    label="Estado (UF)"
                    options={ufOptions}
                    placeholder="Selecione"
                    value={formData.uf}
                    onChange={handleChange}
                    required
                  />
                </div>

                {(formData.cargo === 'vereador') && (
                  <Input
                    name="municipio"
                    label="Município"
                    placeholder="Nome do município"
                    value={formData.municipio}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>

              {/* Dados do Usuário */}
              <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 text-[var(--foreground)]">
                  <User className="w-5 h-5" />
                  <h3 className="font-semibold">Dados do Administrador</h3>
                </div>
                
                <Input
                  name="nomeUsuario"
                  label="Seu Nome"
                  placeholder="Nome completo"
                  value={formData.nomeUsuario}
                  onChange={handleChange}
                  icon={<User className="w-4 h-4" />}
                  required
                />

                <Input
                  type="email"
                  name="email"
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="password"
                    name="password"
                    label="Senha"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    icon={<Lock className="w-4 h-4" />}
                    required
                  />
                  
                  <Input
                    type="password"
                    name="confirmPassword"
                    label="Confirmar Senha"
                    placeholder="Repita a senha"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={<Lock className="w-4 h-4" />}
                    required
                  />
                </div>
              </div>

              {/* Aviso LGPD */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Seus dados serão tratados de acordo com a Lei Geral de Proteção de Dados (LGPD). 
                  Ao criar sua conta, você concorda com nossa política de privacidade.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                isLoading={isLoading}
              >
                Criar Conta
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-[var(--muted-foreground)]">
                Já tem uma conta?{' '}
              </span>
              <Link 
                href="/login" 
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Faça login
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[var(--muted-foreground)] mt-8">
          Desenvolvido por{' '}
          <a 
            href="https://dataro-it.com.br" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            DATA-RO INTELIGÊNCIA TERRITORIAL
          </a>
          <br />
          Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
