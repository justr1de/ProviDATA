'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  FileText, 
  Users, 
  Building2, 
  Bell, 
  BarChart3, 
  Shield,
  ArrowRight,
  Check,
  Mail,
  MessageCircle,
  Sparkles,
  Zap,
  ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Providências',
    description: 'Registre e acompanhe solicitações com protocolo automático e timeline completa.',
  },
  {
    icon: Users,
    title: 'Cidadãos',
    description: 'Banco de dados organizado com histórico completo de cada solicitante.',
  },
  {
    icon: Building2,
    title: 'Órgãos',
    description: 'Encaminhe para secretarias, MP, defensoria e outros órgãos públicos.',
  },
  {
    icon: Bell,
    title: 'Notificações',
    description: 'Alertas automáticos de prazos e atualizações em tempo real.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard',
    description: 'Estatísticas e indicadores de desempenho para tomada de decisão.',
  },
  {
    icon: Shield,
    title: 'Segurança',
    description: 'Dados isolados por gabinete com criptografia e conformidade LGPD.',
  },
];

const plans = [
  {
    name: 'Básico',
    description: 'Para gabinetes menores',
    features: [
      'Até 3 usuários',
      'Providências ilimitadas',
      'Dashboard básico',
      'Suporte por e-mail',
    ],
    highlighted: false,
  },
  {
    name: 'Profissional',
    description: 'Para gabinetes completos',
    features: [
      'Usuários ilimitados',
      'Providências ilimitadas',
      'Dashboard avançado',
      'Relatórios personalizados',
      'Notificações por e-mail',
      'Suporte prioritário',
    ],
    highlighted: true,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--foreground)]">ProviDATA</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-sm text-[var(--foreground-secondary)] hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Recursos
            </a>
            <a href="#planos" className="text-sm text-[var(--foreground-secondary)] hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Planos
            </a>
            <a href="#sobre" className="text-sm text-[var(--foreground-secondary)] hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Sobre
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link 
              href="/login"
              className="text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              Entrar
            </Link>
            <Link 
              href="/demo"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/20"
            >
              <Sparkles className="w-4 h-4" />
              Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 hero-gradient">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Plataforma SaaS para Gabinetes Parlamentares
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-6 leading-tight">
            Gestão de{' '}
            <span className="gradient-text">Providências</span>
            <br />
            Parlamentares
          </h1>
          
          <p className="text-lg sm:text-xl text-[var(--foreground-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Organize as solicitações dos cidadãos de forma simples e transparente. 
            Acompanhe prazos, encaminhe demandas e mantenha todos informados.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              href="/demo"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-xl shadow-green-600/25 hover:shadow-green-600/40 hover:-translate-y-0.5"
            >
              Acessar demonstração
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#contato"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-[var(--border)] text-[var(--foreground)] font-semibold hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-all"
            >
              Falar com consultor
            </a>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { label: 'Modelo', value: 'SaaS' },
              { label: 'Tenant', value: 'Multi' },
              { label: 'Conforme', value: 'LGPD' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-[var(--muted-foreground)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-24 px-6 bg-[var(--background-secondary)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              Funcionalidades pensadas para otimizar o trabalho do gabinete parlamentar
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-green-500/50 transition-all card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 flex items-center justify-center mb-4 group-hover:from-green-500/20 group-hover:to-green-600/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
              Planos e Preços
            </h2>
            <p className="text-[var(--foreground-secondary)]">
              Escolha o plano ideal para o seu gabinete. Todos incluem suporte técnico e atualizações.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`
                  relative p-8 rounded-2xl border-2 transition-all card-hover
                  ${plan.highlighted 
                    ? 'border-green-500 bg-gradient-to-b from-green-500/5 to-transparent' 
                    : 'border-[var(--border)] bg-[var(--card)]'
                  }
                `}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-semibold">
                    Recomendado
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-[var(--foreground-secondary)] mb-6">
                  {plan.description}
                </p>
                
                <div className="mb-8">
                  <span className="text-3xl font-bold gradient-text">Consulte</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3 text-sm text-[var(--foreground-secondary)]">
                      <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <a 
                  href="#contato"
                  className={`
                    w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all
                    ${plan.highlighted 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-600/20' 
                      : 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400'
                    }
                  `}
                >
                  Solicitar proposta
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-24 px-6 bg-[var(--background-secondary)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-6">
            Sobre o Projeto
          </h2>
          <p className="text-[var(--foreground-secondary)] mb-8 leading-relaxed">
            O ProviDATA foi desenvolvido especialmente para atender às necessidades dos gabinetes 
            parlamentares brasileiros, com foco em simplicidade, transparência e eficiência no 
            atendimento ao cidadão.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <span className="text-sm text-[var(--foreground-secondary)]">Desenvolvido por</span>
            <span className="font-bold text-[var(--foreground)]">DATA-RO INTELIGÊNCIA TERRITORIAL</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-24 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-600/20">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
            Entre em contato
          </h2>
          <p className="text-[var(--foreground-secondary)] mb-10">
            Fale com nossa equipe comercial para conhecer melhor o sistema e receber uma proposta personalizada.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="mailto:contato@dataro-it.com.br"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/20"
            >
              <Mail className="w-5 h-5" />
              contato@dataro-it.com.br
            </a>
            <a 
              href="https://wa.me/5569999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[var(--border)] text-[var(--foreground)] font-semibold hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">
              ProviDATA © 2025
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
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
        </div>
      </footer>
    </div>
  );
}
