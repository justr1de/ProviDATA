'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Eye, EyeOff, Shield, BarChart, Map, FileText, Users, Building, MapPin, Sparkles, Lock, RefreshCw } from 'lucide-react'
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
    <div className="min-h-screen w-full flex">
      <Toaster position="top-right" richColors />

      {/* ========== LADO ESQUERDO - FORMULÁRIO (FUNDO BRANCO) ========== */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12">
        <div className="w-full max-w-md mx-auto">
          
          {/* Logos - MESMO TAMANHO */}
          <div className="flex items-center gap-5 mb-12">
            <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center p-2">
              <Image 
                src="/LogoDATA-ROsemfundo.png" 
                alt="DATA-RO" 
                width={48} 
                height={48} 
                className="object-contain"
              />
            </div>
            <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center p-2">
              <Image 
                src="/LogoProviDATAsemfundo.png" 
                alt="ProviDATA" 
                width={48} 
                height={48} 
                className="object-contain"
              />
            </div>
            <div className="ml-2">
              <h1 className="text-2xl font-bold text-gray-800">ProviDATA</h1>
              <p className="text-sm text-gray-500">Gestão de Pedidos de Providência</p>
            </div>
          </div>

          {/* Título */}
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Bem-vindo!</h2>
          <p className="text-gray-600 text-lg mb-10">Entre com suas credenciais para acessar o sistema.</p>

          {/* Aviso Acesso Restrito */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-10">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-2 rounded-lg flex-shrink-0">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 text-base">Acesso Restrito</h3>
                <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                  Este sistema é de uso exclusivo. Apenas usuários autorizados pelos administradores podem acessar.
                </p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none pr-12"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-green-600 text-white font-semibold text-lg hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg shadow-green-600/30"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Link Demonstração */}
          <div className="text-center mt-6">
            <Link 
              href="/" 
              className="inline-block text-gray-600 hover:text-green-600 transition-colors font-medium border border-gray-200 rounded-xl px-6 py-3 hover:border-green-300"
            >
              Acessar Demonstração
            </Link>
          </div>

          {/* Contato */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm mb-4">Para solicitar acesso, entre em contato:</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a href="mailto:contato@dataro-it.com.br" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contato@dataro-it.com.br
              </a>
              <a href="tel:+5569999089202" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (69) 9 9908-9202
              </a>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-center text-gray-400 text-xs mt-10">
            © 2025 DATA-RO. Todos os direitos reservados.
          </p>

          {/* Logo rodapé */}
          <div className="flex justify-center mt-6">
            <div className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center p-2">
              <Image 
                src="/LogoProviDATAsemfundo.png" 
                alt="ProviDATA" 
                width={40} 
                height={40} 
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========== LADO DIREITO - PAINEL INFORMATIVO (DEGRADÊ VERDE) ========== */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-teal-800 flex-col justify-center px-12 xl:px-16 py-12">
        <div className="max-w-lg">
          
          {/* Título */}
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-8">
            SISTEMA DE GESTÃO DE PEDIDOS DE PROVIDÊNCIA
          </h2>

          {/* Descrição */}
          <p className="text-xl text-green-100 leading-relaxed mb-12">
            Plataforma completa para organizar, rastrear e gerenciar as solicitações dos cidadãos, garantindo transparência e eficiência no gabinete parlamentar.
          </p>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">10k+</p>
                  <p className="text-green-200 text-sm mt-1">Pedidos Gerenciados</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Building className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">50+</p>
                  <p className="text-green-200 text-sm mt-1">Gabinetes Atendidos</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">150+</p>
                  <p className="text-green-200 text-sm mt-1">Municípios Cobertos</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">8+</p>
                  <p className="text-green-200 text-sm mt-1">Anos de Dados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Funcionalidades Principais */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-6 h-6 text-green-200" />
              <h3 className="text-2xl font-bold text-white">Funcionalidades Principais</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
                  <BarChart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg">Dashboard Analítico</h4>
                  <p className="text-green-200 mt-2 leading-relaxed">
                    Visão geral com métricas e status de todos os pedidos em tempo real.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
                  <Map className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg">Mapa de Demandas</h4>
                  <p className="text-green-200 mt-2 leading-relaxed">
                    Visualização geográfica das solicitações para identificar áreas prioritárias.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg">Análise de Resultados</h4>
                  <p className="text-green-200 mt-2 leading-relaxed">
                    Compare o volume e tipo de pedidos entre diferentes regiões e períodos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="pt-8 border-t border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Lock className="w-5 h-5 text-green-200" />
              </div>
              <span className="text-green-200">Dados Seguros</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <RefreshCw className="w-5 h-5 text-green-200" />
              </div>
              <span className="text-green-200">Atualização Constante</span>
            </div>
          </div>

          {/* Desenvolvido por */}
          <p className="text-center text-green-300/60 text-sm mt-8">
            Desenvolvido por DATA-RO Inteligência Territorial
          </p>
        </div>
      </div>
    </div>
  )
}
