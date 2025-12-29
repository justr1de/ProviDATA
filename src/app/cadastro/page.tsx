'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
  const selectClass = "w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm appearance-none cursor-pointer"
  const labelClass = "block text-sm font-medium text-[var(--foreground)] mb-1.5"

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] transition-colors">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-[var(--foreground)]">ProviDATA</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Criar Conta</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Cadastre seu gabinete para começar a gerenciar providências
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados do Gabinete */}
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-4">
              <div className="flex items-center gap-2 text-[var(--foreground)] mb-2">
                <Building2 className="w-4 h-4" />
                <h3 className="font-medium text-sm">Dados do Gabinete</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nome do Gabinete</label>
                  <input
                    name="nomeGabinete"
                    placeholder="Ex: Gabinete do Vereador João"
                    value={formData.nomeGabinete}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                
                <div>
                  <label className={labelClass}>Nome do Parlamentar</label>
                  <input
                    name="parlamentarName"
                    placeholder="Nome completo"
                    value={formData.parlamentarName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Cargo</label>
                  <select
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    required
                    className={selectClass}
                  >
                    <option value="">Selecione</option>
                    {cargoOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={labelClass}>Partido</label>
                  <input
                    name="partido"
                    placeholder="Ex: PSDB"
                    value={formData.partido}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                
                <div>
                  <label className={labelClass}>Estado (UF)</label>
                  <select
                    name="uf"
                    value={formData.uf}
                    onChange={handleChange}
                    required
                    className={selectClass}
                  >
                    <option value="">Selecione</option>
                    {ufOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.cargo === 'vereador' && (
                <div>
                  <label className={labelClass}>Município</label>
                  <input
                    name="municipio"
                    placeholder="Nome do município"
                    value={formData.municipio}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              )}
            </div>

            {/* Dados do Usuário */}
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-4">
              <div className="flex items-center gap-2 text-[var(--foreground)] mb-2">
                <User className="w-4 h-4" />
                <h3 className="font-medium text-sm">Dados do Administrador</h3>
              </div>
              
              <div>
                <label className={labelClass}>Seu Nome</label>
                <input
                  name="nomeUsuario"
                  placeholder="Nome completo"
                  value={formData.nomeUsuario}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={labelClass}>Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Repita a senha"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Aviso LGPD */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--muted-foreground)]">
                Seus dados serão tratados de acordo com a Lei Geral de Proteção de Dados (LGPD). 
                Ao criar sua conta, você concorda com nossa política de privacidade.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[var(--muted-foreground)]">
              Já tem uma conta?{' '}
            </span>
            <Link 
              href="/login" 
              className="text-[var(--foreground)] hover:underline font-medium"
            >
              Faça login
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
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
      </footer>
    </div>
  )
}
