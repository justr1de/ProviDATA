
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error('Erro ao fazer login', {
          description: error.message === 'Invalid login credentials' 
            ? 'E-mail ou senha incorretos' 
            : error.message,
        })
        return
      }

      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Erro inesperado ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] transition-colors">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-24 flex items-center justify-center relative">
          <div className="flex items-center gap-4">
            <Link href="https://dataro-it.com.br" target="_blank" rel="noopener noreferrer">
              <Image src="/dataro-logo-final.png" alt="DATA-RO" width={56} height={56} style={{ objectFit: 'contain', borderRadius: '12px', backgroundColor: '#ffffff', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
            </Link>
            <Link href="/" className="flex items-center gap-4">
              <Image src="/providata-logo-final.png" alt="ProviDATA" width={56} height={56} style={{ objectFit: 'contain', borderRadius: '12px', backgroundColor: '#ffffff', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
              <span className="text-providata-gradient font-extrabold text-4xl tracking-tight">ProviDATA</span>
            </Link>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-32 pb-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Card */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 sm:p-10 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <Image src="/providata-logo-final.png" alt="ProviDATA" width={80} height={80} style={{ objectFit: 'contain', borderRadius: '16px', backgroundColor: '#ffffff', padding: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
              </div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                Bem-vindo de volta
              </h1>
              <p className="text-lg text-[var(--foreground-secondary)]">
                Acesse sua conta para continuar
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-md font-medium text-[var(--foreground)]">
                  E-mail
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-[var(--muted-foreground)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--background)] border-2 border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-md font-medium text-[var(--foreground)]">
                  Senha
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-[var(--muted-foreground)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-[var(--background)] border-2 border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-[var(--border)] text-green-600 focus:ring-green-500/20"
                  />
                  <span className="text-md text-[var(--foreground-secondary)]">Lembrar-me</span>
                </label>
                <Link 
                  href="/recuperar-senha"
                  className="text-md text-green-600 dark:text-green-400 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center text-md text-[var(--muted-foreground)] mt-10 space-y-2">
            <p>
              Desenvolvido por{' '}
              <a 
                href="https://dataro-it.com.br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-[var(--foreground)] hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                DATA-RO INTELIGÊNCIA TERRITORIAL
              </a>
            </p>
            <p>&copy; {new Date().getFullYear()} ProviDATA. Todos os direitos reservados.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
