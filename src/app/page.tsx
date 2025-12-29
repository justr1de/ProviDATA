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
            <a href="#planos" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Planos
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
              href="/demo" 
              className="text-sm px-4 py-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity font-medium"
            >
              Demonstração
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
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
              href="/demo" 
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity"
            >
              Acessar demonstração
            </Link>
            <a 
              href="#contato" 
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--foreground)] font-medium hover:bg-[var(--muted)] transition-colors"
            >
              Falar com consultor
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--foreground)]">SaaS</div>
            <div className="text-sm text-[var(--muted-foreground)] mt-1">Modelo</div>
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

      {/* Pricing */}
      <section id="planos" className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-4">
              Planos e Preços
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-lg mx-auto">
              Escolha o plano ideal para o seu gabinete. Todos incluem suporte técnico e atualizações.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Plano Básico */}
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Básico</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">Para gabinetes menores</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-[var(--foreground)]">Consulte</span>
              </div>
              <ul className="space-y-3 mb-6">
                {['Até 3 usuários', 'Providências ilimitadas', 'Dashboard básico', 'Suporte por e-mail'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <a 
                href="#contato"
                className="block w-full py-2.5 text-center rounded-lg border border-[var(--border)] text-[var(--foreground)] font-medium hover:bg-[var(--muted)] transition-colors"
              >
                Solicitar proposta
              </a>
            </div>

            {/* Plano Profissional */}
            <div className="p-6 rounded-xl border-2 border-blue-500 bg-[var(--card)] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                Recomendado
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Profissional</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">Para gabinetes completos</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-[var(--foreground)]">Consulte</span>
              </div>
              <ul className="space-y-3 mb-6">
                {['Usuários ilimitados', 'Providências ilimitadas', 'Dashboard avançado', 'Relatórios personalizados', 'Notificações por e-mail', 'Suporte prioritário'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <a 
                href="#contato"
                className="block w-full py-2.5 text-center rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
              >
                Solicitar proposta
              </a>
            </div>
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

      {/* Contact CTA */}
      <section id="contato" className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-4">
            Entre em contato
          </h2>
          <p className="text-[var(--muted-foreground)] mb-8">
            Fale com nossa equipe comercial para conhecer melhor o sistema e receber uma proposta personalizada.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="mailto:contato@dataro-it.com.br"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              contato@dataro-it.com.br
            </a>
            <a 
              href="https://wa.me/5569999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--foreground)] font-medium hover:bg-[var(--muted)] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
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
