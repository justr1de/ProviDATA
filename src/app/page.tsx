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
  MessageCircle
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Providências',
    description: 'Registre e acompanhe todas as solicitações com protocolo automático e timeline completa de cada demanda.',
  },
  {
    icon: Users,
    title: 'Cidadãos',
    description: 'Banco de dados organizado com histórico completo de cada solicitante e suas demandas anteriores.',
  },
  {
    icon: Building2,
    title: 'Órgãos',
    description: 'Encaminhe para secretarias municipais, estaduais, MP, Defensoria e outros órgãos públicos.',
  },
  {
    icon: Bell,
    title: 'Notificações',
    description: 'Alertas automáticos de prazos e atualizações em tempo real para toda a equipe do gabinete.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard',
    description: 'Estatísticas e indicadores de desempenho para tomada de decisão e prestação de contas.',
  },
  {
    icon: Shield,
    title: 'Segurança',
    description: 'Dados isolados por gabinete com criptografia de ponta e total conformidade com a LGPD.',
  },
];

const planoBasico = [
  'Até 3 usuários',
  'Providências ilimitadas',
  'Dashboard básico',
  'Suporte por e-mail',
];

const planoProfissional = [
  'Usuários ilimitados',
  'Providências ilimitadas',
  'Dashboard avançado',
  'Relatórios personalizados',
  'Notificações por e-mail',
  'Suporte prioritário',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      
      {/* ========== HEADER ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/25">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl hidden sm:block">ProviDATA</span>
            </Link>

            {/* Nav Desktop */}
            <nav className="hidden md:flex items-center gap-10">
              <a href="#recursos" className="text-sm font-medium text-[var(--foreground-secondary)] hover:text-green-600 dark:hover:text-green-400 transition-colors">
                Recursos
              </a>
              <a href="#planos" className="text-sm font-medium text-[var(--foreground-secondary)] hover:text-green-600 dark:hover:text-green-400 transition-colors">
                Planos
              </a>
              <a href="#sobre" className="text-sm font-medium text-[var(--foreground-secondary)] hover:text-green-600 dark:hover:text-green-400 transition-colors">
                Sobre
              </a>
              <a href="#contato" className="text-sm font-medium text-[var(--foreground-secondary)] hover:text-green-600 dark:hover:text-green-400 transition-colors">
                Contato
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link 
                href="/login"
                className="text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/demo"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/25"
              >
                Demo
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section className="pt-32 sm:pt-40 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 mb-10">
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Plataforma SaaS para Gabinetes Parlamentares
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-8">
            Gestão de Providências
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700">
              Parlamentares
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[var(--foreground-secondary)] max-w-3xl mx-auto mb-12 leading-relaxed">
            Organize as solicitações dos cidadãos de forma simples e transparente. 
            Acompanhe prazos, encaminhe demandas e mantenha todos informados.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20">
            <Link 
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-xl shadow-green-600/30"
            >
              Acessar demonstração
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#contato"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl border-2 border-[var(--border)] font-semibold text-lg hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-all"
            >
              Falar com consultor
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 sm:gap-20">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">SaaS</div>
              <div className="text-sm text-[var(--foreground-secondary)]">Modelo</div>
            </div>
            <div className="w-px h-12 bg-[var(--border)]"></div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">Multi</div>
              <div className="text-sm text-[var(--foreground-secondary)]">Tenant</div>
            </div>
            <div className="w-px h-12 bg-[var(--border)]"></div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">LGPD</div>
              <div className="text-sm text-[var(--foreground-secondary)]">Conforme</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section id="recursos" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[var(--background-secondary)]">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Tudo que você precisa
            </h2>
            <p className="text-lg sm:text-xl text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              Funcionalidades pensadas para otimizar o trabalho do gabinete parlamentar
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-8 sm:p-10 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-[var(--foreground-secondary)] leading-relaxed text-base sm:text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING SECTION ========== */}
      <section id="planos" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Planos e Preços
            </h2>
            <p className="text-lg sm:text-xl text-[var(--foreground-secondary)] max-w-2xl mx-auto">
              Escolha o plano ideal para o seu gabinete. Todos incluem suporte técnico e atualizações.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            
            {/* Plano Básico */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Básico</h3>
                <p className="text-[var(--foreground-secondary)]">Para gabinetes menores</p>
              </div>
              
              <div className="mb-10">
                <span className="text-4xl sm:text-5xl font-bold text-green-600 dark:text-green-400">Consulte</span>
              </div>

              <ul className="space-y-5 mb-10">
                {planoBasico.map((item, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-[var(--foreground-secondary)] text-lg">{item}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="#contato"
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl border-2 border-[var(--border)] font-semibold text-lg hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-all"
              >
                Solicitar proposta
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Plano Profissional */}
            <div className="relative p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-green-500/5 to-transparent border-2 border-green-500/40">
              
              {/* Badge Recomendado */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-6 py-2 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold shadow-lg shadow-green-600/30">
                  Recomendado
                </span>
              </div>

              <div className="mb-8 mt-4">
                <h3 className="text-2xl font-bold mb-2">Profissional</h3>
                <p className="text-[var(--foreground-secondary)]">Para gabinetes completos</p>
              </div>
              
              <div className="mb-10">
                <span className="text-4xl sm:text-5xl font-bold text-green-600 dark:text-green-400">Consulte</span>
              </div>

              <ul className="space-y-5 mb-10">
                {planoProfissional.map((item, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-[var(--foreground-secondary)] text-lg">{item}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="#contato"
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/30"
              >
                Solicitar proposta
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ABOUT SECTION ========== */}
      <section id="sobre" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[var(--background-secondary)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8">
            Sobre o Projeto
          </h2>
          <p className="text-lg sm:text-xl text-[var(--foreground-secondary)] leading-relaxed mb-10">
            O ProviDATA foi desenvolvido especialmente para atender às necessidades dos gabinetes 
            parlamentares brasileiros, com foco em simplicidade, transparência e eficiência no 
            atendimento ao cidadão. Nossa plataforma permite que vereadores, deputados e senadores 
            gerenciem todas as demandas de forma organizada e profissional.
          </p>
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <span className="text-[var(--foreground-secondary)]">Desenvolvido por</span>
            <span className="font-bold text-lg">DATA-RO INTELIGÊNCIA TERRITORIAL</span>
          </div>
        </div>
      </section>

      {/* ========== CONTACT SECTION ========== */}
      <section id="contato" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-600/30">
            <Mail className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Entre em contato
          </h2>
          <p className="text-lg sm:text-xl text-[var(--foreground-secondary)] mb-12">
            Fale com nossa equipe comercial para conhecer melhor o sistema e receber uma proposta personalizada.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <a 
              href="mailto:contato@dataro-it.com.br"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-green-500 transition-all"
            >
              <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-lg">contato@dataro-it.com.br</span>
            </a>
            <a 
              href="https://wa.me/5569999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-green-500 transition-all"
            >
              <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-lg">WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">ProviDATA</span>
            <span className="text-[var(--foreground-secondary)]">© 2025</span>
          </div>
          <p className="text-[var(--foreground-secondary)]">
            Desenvolvido por{' '}
            <a 
              href="https://dataro-it.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-[var(--foreground)] hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              DATA-RO INTELIGÊNCIA TERRITORIAL
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
