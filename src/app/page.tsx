'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-[var(--foreground)]">ProviDATA</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Recursos
            </a>
            <a href="#sobre" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Sobre
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link 
              href="/login" 
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors hidden sm:block"
            >
              Entrar
            </Link>
            <Link 
              href="/cadastro" 
              className="text-sm px-4 py-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity font-medium"
            >
              Começar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Sistema Multi-tenant para Gabinetes
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] tracking-tight mb-6 leading-tight">
            Gestão de Providências
            <span className="block text-[var(--muted-foreground)]">Parlamentares</span>
          </h1>
          
          <p className="text-lg text-[var(--muted-foreground)] max-w-xl mx-auto mb-10 leading-relaxed">
            Organize as solicitações dos cidadãos de forma simples e transparente. 
            Acompanhe prazos, encaminhe demandas e mantenha todos informados.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/cadastro" 
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity"
            >
              Criar conta gratuita
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--foreground)] font-medium hover:bg-[var(--muted)] transition-colors"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--foreground)]">100%</div>
            <div className="text-sm text-[var(--muted-foreground)] mt-1">Gratuito</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--foreground)]">Multi</div>
            <div className="text-sm text-[var(--muted-foreground)] mt-1">Tenant</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--foreground)]">LGPD</div>
            <div className="text-sm text-[var(--muted-foreground)] mt-1">Conforme</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-lg mx-auto">
              Funcionalidades pensadas para otimizar o trabalho do gabinete parlamentar
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Providências',
                description: 'Registre e acompanhe todas as solicitações com protocolo automático.'
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Cidadãos',
                description: 'Banco de dados organizado com informações dos solicitantes.'
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                title: 'Órgãos',
                description: 'Encaminhe para secretarias, MP, defensoria e outros órgãos.'
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
                title: 'Notificações',
                description: 'Alertas de prazos e atualizações em tempo real.'
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Dashboard',
                description: 'Estatísticas e indicadores de desempenho em tempo real.'
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'Segurança',
                description: 'Dados isolados por gabinete com criptografia e LGPD.'
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted-foreground)]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)] mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-4">
            Sobre o Projeto
          </h2>
          <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
            O ProviDATA foi desenvolvido especialmente para atender às necessidades dos gabinetes 
            parlamentares brasileiros, com foco em simplicidade, transparência e eficiência no 
            atendimento ao cidadão.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <span>Desenvolvido por</span>
            <span className="font-semibold text-[var(--foreground)]">DATA-RO INTELIGÊNCIA TERRITORIAL</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-4">
            Comece agora
          </h2>
          <p className="text-[var(--muted-foreground)] mb-8">
            Cadastre seu gabinete gratuitamente e organize suas providências de forma profissional.
          </p>
          <Link 
            href="/cadastro" 
            className="inline-flex px-6 py-3 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity"
          >
            Criar conta gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">
              ProviDATA © {new Date().getFullYear()}
            </span>
          </div>
          <div className="text-sm text-[var(--muted-foreground)]">
            Desenvolvido por{' '}
            <a 
              href="https://dataro-it.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--foreground)] hover:underline"
            >
              DATA-RO INTELIGÊNCIA TERRITORIAL
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
