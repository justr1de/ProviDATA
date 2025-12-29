'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, FileText } from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Toaster position="top-right" richColors />
      
      <div className="w-full max-w-md animate-fade-in">
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
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Acesse sua conta para gerenciar providências
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
              
              <Input
                type="password"
                label="Senha"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <div className="flex items-center justify-end">
                <Link 
                  href="/recuperar-senha" 
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                isLoading={isLoading}
              >
                Entrar
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-[var(--muted-foreground)]">
                Não tem uma conta?{' '}
              </span>
              <Link 
                href="/cadastro" 
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Cadastre-se
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
