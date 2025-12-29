
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Shield, BarChart, Map, FileText, Users, Building, MapPin } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const StatCard = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string, label: string }) => (
  <div className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
    <div className="bg-white/20 p-3 rounded-lg">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/80">{label}</p>
    </div>
  </div>
)

const FeatureItem = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="flex items-start gap-4">
    <div className="bg-white/20 p-2 rounded-md mt-1">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <h4 className="font-semibold text-white">{title}</h4>
      <p className="text-sm text-white/80">{description}</p>
    </div>
  </div>
)

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
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error('Erro ao fazer login', {
          description: error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : error.message,
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
    <div className="min-h-screen w-full flex bg-white dark:bg-gray-900">
      <Toaster position="top-right" richColors />

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-4">
            <Image src="/dataro-logo-final.png" alt="DATA-RO" width={64} height={64} style={{ objectFit: 'contain', borderRadius: '12px', backgroundColor: '#ffffff', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ProviDATA</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gestão de Pedidos de Providência</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Bem-vindo!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Entre com suas credenciais para acessar o sistema.</p>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-8 flex items-start gap-3">
            <Shield className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Acesso Restrito</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400/80">Este sistema é de uso exclusivo. Apenas usuários autorizados pelos administradores podem acessar.</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-900 transition-all disabled:opacity-50">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Entrar</>}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Acessar Demonstração
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Info Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-600 to-teal-700 flex-col justify-center p-12 text-white">
        <div className="max-w-md mx-auto">
          <h2 className="text-4xl font-bold leading-tight mb-4">SISTEMA DE GESTÃO DE PEDIDOS DE PROVIDÊNCIA</h2>
          <p className="text-lg text-white/90 mb-10">Plataforma completa para organizar, rastrear e gerenciar as solicitações dos cidadãos, garantindo transparência e eficiência no gabinete parlamentar.</p>
          
          <div className="grid grid-cols-2 gap-5 mb-10">
            <StatCard icon={FileText} value="10k+" label="Pedidos Gerenciados" />
            <StatCard icon={Building} value="50+" label="Gabinetes Atendidos" />
            <StatCard icon={MapPin} value="150+" label="Municípios Cobertos" />
            <StatCard icon={Users} value="8+" label="Anos de Dados" />
          </div>

          <h3 className="text-2xl font-bold mb-6">Funcionalidades Principais</h3>
          <div className="space-y-5">
            <FeatureItem icon={BarChart} title="Dashboard Analítico" description="Visão geral com métricas e status de todos os pedidos em tempo real." />
            <FeatureItem icon={Map} title="Mapa de Demandas" description="Visualização geográfica das solicitações para identificar áreas prioritárias." />
            <FeatureItem icon={FileText} title="Análise de Resultados" description="Compare o volume e tipo de pedidos entre diferentes regiões e períodos." />
          </div>
        </div>
      </div>
    </div>
  )
}
