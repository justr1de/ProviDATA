'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Eye, EyeOff, Shield, BarChart, Map, FileText, Users, Building, MapPin, Sparkles, Lock, RefreshCw, Clock, Zap, Headphones, GraduationCap, BookOpen } from 'lucide-react'
import { toast, Toaster } from 'sonner'

// Email do super admin geral do sistema
const SUPER_ADMIN_EMAIL = 'contato@dataro-it.com.br'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error('Informe um e-mail válido')
      return
    }
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error('Erro ao fazer login', {
          description: error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : error.message,
        })
        return
      }

      // Buscar o perfil do usuário para verificar o role
      const { data: profile } = await supabase
        .from('users')
        .select('role, gabinete_id')
        .eq('id', data.user?.id)
        .single()

      toast.success('Login realizado com sucesso!')

      // Verificar se é super admin
      const isSuperAdmin = data.user?.email === SUPER_ADMIN_EMAIL || profile?.role === 'super_admin'

      // Redirecionar baseado no role
      if (isSuperAdmin) {
        router.push('/admin/gabinetes')
      } else {
        router.push('/dashboard')
      }
      
      router.refresh()
    } catch {
      toast.error('Erro inesperado ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex' }}>
      <Toaster position="top-right" richColors />

      {/* ========== LADO ESQUERDO - FORMULÁRIO (FUNDO BRANCO) ========== */}
      <div 
        style={{ 
          width: '50%', 
          backgroundColor: '#ffffff', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          padding: '48px 64px'
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
          
          {/* Logos - MESMO TAMANHO DE CAIXA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
            {/* Logo DATA-RO */}
            <div 
              style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '8px',
                flexShrink: 0
              }}
            >
              <img 
                src="/dataro-logo-final.png" 
                alt="DATA-RO" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            
            {/* Logo ProviDATA */}
            <div 
              style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '4px',
                flexShrink: 0
              }}
            >
              <img 
                src="/providata-logo-final.png" 
                alt="ProviDATA" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            
            {/* Texto */}
            <div style={{ marginLeft: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>ProviDATA</h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Gestão de Pedidos de Providência</p>
            </div>
          </div>

          {/* Título */}
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Bem-vindo!</h2>
          <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '40px' }}>Entre com suas credenciais para acessar o sistema.</p>

          {/* Aviso Acesso Restrito */}
          <div 
            style={{ 
              backgroundColor: '#fffbeb', 
              border: '1px solid #fde68a', 
              borderRadius: '12px', 
              padding: '20px',
              marginBottom: '40px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div 
                style={{ 
                  backgroundColor: '#fef3c7', 
                  padding: '8px', 
                  borderRadius: '8px',
                  flexShrink: 0
                }}
              >
                <Shield style={{ width: '20px', height: '20px', color: '#d97706' }} />
              </div>
              <div>
                <h3 style={{ fontWeight: '600', color: '#92400e', fontSize: '16px', margin: 0 }}>Acesso Restrito</h3>
                <p style={{ fontSize: '14px', color: '#a16207', marginTop: '8px', lineHeight: '1.5' }}>
                  Este sistema é de uso exclusivo. Apenas usuários autorizados pelos administradores podem acessar.
                </p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  color: '#111827',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            {/* Senha */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '16px',
                    paddingRight: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    color: '#111827',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button 
              type="submit" 
              disabled={isLoading} 
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
                opacity: isLoading ? 0.5 : 1
              }}
            >
              {isLoading ? (
                <div style={{ width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  <ArrowRight style={{ width: '20px', height: '20px' }} />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Link Demonstração */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link 
              href="/" 
              style={{
                display: 'inline-block',
                color: '#4b5563',
                fontWeight: '500',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px 24px',
                textDecoration: 'none'
              }}
            >
              Acessar Demonstração
            </Link>
          </div>

          {/* Contato */}
          <div style={{ marginTop: '48px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>Para solicitar acesso, entre em contato:</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
              <a href="mailto:contato@dataro-it.com.br" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', textDecoration: 'none' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contato@dataro-it.com.br
              </a>
              <a href="tel:+5569999089202" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', textDecoration: 'none' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (69) 9 9908-9202
              </a>
            </div>
          </div>

          {/* Copyright */}
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px', marginTop: '40px' }}>
            © 2025 DATA-RO. Todos os direitos reservados.
          </p>

          {/* Logo rodapé */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '3px'
              }}
            >
              <img 
                src="/providata-logo-final.png" 
                alt="ProviDATA" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========== LADO DIREITO - PAINEL INFORMATIVO (DEGRADÊ VERDE) ========== */}
      <div 
        style={{ 
          width: '50%', 
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #0f766e 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 64px'
        }}
      >
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          
          {/* Título */}
          <h2 style={{ fontSize: '42px', fontWeight: 'bold', color: '#ffffff', lineHeight: '1.2', marginBottom: '32px' }}>
            SISTEMA DE GESTÃO DE PEDIDOS DE PROVIDÊNCIA
          </h2>

          {/* Descrição */}
          <p style={{ fontSize: '20px', color: '#bbf7d0', lineHeight: '1.6', marginBottom: '48px' }}>
            Plataforma completa para organizar, rastrear e gerenciar as solicitações dos cidadãos, garantindo transparência e eficiência no gabinete parlamentar.
          </p>

          {/* Cards de Estatísticas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
                  <Clock style={{ width: '28px', height: '28px', color: '#ffffff' }} />
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: 0, lineHeight: '1.3' }}>Relatórios pontuais</p>
                  <p style={{ fontSize: '14px', color: '#bbf7d0', marginTop: '4px' }}>e em tempo real</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
                  <Zap style={{ width: '28px', height: '28px', color: '#ffffff' }} />
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: 0, lineHeight: '1.3' }}>Simplicidade</p>
                  <p style={{ fontSize: '14px', color: '#bbf7d0', marginTop: '4px' }}>e eficiência</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
                  <Headphones style={{ width: '28px', height: '28px', color: '#ffffff' }} />
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: 0, lineHeight: '1.3' }}>Suporte técnico</p>
                  <p style={{ fontSize: '14px', color: '#bbf7d0', marginTop: '4px' }}>local 24/7</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
                  <GraduationCap style={{ width: '28px', height: '28px', color: '#ffffff' }} />
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: 0, lineHeight: '1.3' }}>Capacitação</p>
                  <p style={{ fontSize: '14px', color: '#bbf7d0', marginTop: '4px' }}>presencial inclusa</p>
                </div>
              </div>
            </div>
          </div>

          {/* Funcionalidades Principais */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <Sparkles style={{ width: '24px', height: '24px', color: '#bbf7d0' }} />
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>Funcionalidades Principais</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                  <BarChart style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', color: '#ffffff', fontSize: '18px', margin: 0 }}>Dashboard Analítico</h4>
                  <p style={{ color: '#bbf7d0', marginTop: '8px', lineHeight: '1.5' }}>
                    Visão geral com métricas e status de todos os pedidos em tempo real.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                  <Map style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', color: '#ffffff', fontSize: '18px', margin: 0 }}>Mapa de Demandas</h4>
                  <p style={{ color: '#bbf7d0', marginTop: '8px', lineHeight: '1.5' }}>
                    Visualização geográfica das solicitações para identificar áreas prioritárias.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                  <FileText style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', color: '#ffffff', fontSize: '18px', margin: 0 }}>Análise de Resultados</h4>
                  <p style={{ color: '#bbf7d0', marginTop: '8px', lineHeight: '1.5' }}>
                    Compare o volume e tipo de pedidos entre diferentes regiões e períodos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div style={{ paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
                <Lock style={{ width: '20px', height: '20px', color: '#bbf7d0' }} />
              </div>
              <span style={{ color: '#bbf7d0' }}>Dados Seguros</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
                <RefreshCw style={{ width: '20px', height: '20px', color: '#bbf7d0' }} />
              </div>
              <span style={{ color: '#bbf7d0' }}>Atualização Constante</span>
            </div>
          </div>

          {/* Desenvolvido por */}
          <p style={{ textAlign: 'center', color: 'rgba(187, 247, 208, 0.6)', fontSize: '14px', marginTop: '32px' }}>
            Desenvolvido por DATA-RO Inteligência Territorial
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          div[style*="width: 50%"]:first-of-type {
            width: 100% !important;
          }
          div[style*="width: 50%"]:last-of-type {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
