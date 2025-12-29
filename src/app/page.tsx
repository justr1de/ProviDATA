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
    description: 'Registre e acompanhe todas as solicitações com protocolo automático e timeline completa.',
  },
  {
    icon: Users,
    title: 'Cidadãos',
    description: 'Banco de dados organizado com histórico completo de cada solicitante.',
  },
  {
    icon: Building2,
    title: 'Órgãos',
    description: 'Encaminhe para secretarias, MP, Defensoria e outros órgãos públicos.',
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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* ==================== HEADER ==================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">ProviDATA</span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#recursos" className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Recursos</a>
              <a href="#planos" className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Planos</a>
              <a href="#sobre" className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Sobre</a>
              <a href="#contato" className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">Contato</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Entrar
              </Link>
              <Link href="/demo" className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium">
                Demo
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== HERO ==================== */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-block px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium mb-8">
            Plataforma SaaS para Gabinetes Parlamentares
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Gestão de Providências
            <br />
            <span className="text-green-600 dark:text-green-400">Parlamentares</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Organize as solicitações dos cidadãos de forma simples e transparente. 
            Acompanhe prazos, encaminhe demandas e mantenha todos informados.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              href="/demo"
              className="w-full sm:w-auto px-8 py-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-lg flex items-center justify-center gap-2"
            >
              Acessar demonstração
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#contato"
              className="w-full sm:w-auto px-8 py-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold text-lg hover:border-green-500"
            >
              Falar com consultor
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">SaaS</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Modelo</div>
            </div>
            <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">Multi</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Tenant</div>
            </div>
            <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">LGPD</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Conforme</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== RECURSOS ==================== */}
      <section id="recursos" className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Funcionalidades pensadas para otimizar o trabalho do gabinete parlamentar
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PLANOS ==================== */}
      <section id="planos" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Planos e Preços
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Escolha o plano ideal para o seu gabinete. Todos incluem suporte técnico e atualizações.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Básico */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Básico</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Para gabinetes menores</p>
              
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-8">Consulte</div>

              <ul className="space-y-4 mb-8">
                {planoBasico.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="#contato"
                className="w-full py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold flex items-center justify-center gap-2 hover:border-green-500"
              >
                Solicitar proposta
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Profissional */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-800 border-2 border-green-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-green-600 text-white text-sm font-medium">
                Recomendado
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profissional</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Para gabinetes completos</p>
              
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-8">Consulte</div>

              <ul className="space-y-4 mb-8">
                {planoProfissional.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="#contato"
                className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2"
              >
                Solicitar proposta
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SOBRE ==================== */}
      <section id="sobre" className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Sobre o Projeto
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
            O ProviDATA foi desenvolvido especialmente para atender às necessidades dos gabinetes 
            parlamentares brasileiros, com foco em simplicidade, transparência e eficiência no 
            atendimento ao cidadão. Nossa plataforma permite que vereadores, deputados e senadores 
            gerenciem todas as demandas de forma organizada e profissional.
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <span>Desenvolvido por</span>
            <span className="font-bold text-gray-900 dark:text-white">DATA-RO INTELIGÊNCIA TERRITORIAL</span>
          </div>
        </div>
      </section>

      {/* ==================== CONTATO ==================== */}
      <section id="contato" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-8">
            <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Entre em contato
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Fale com nossa equipe comercial para conhecer melhor o sistema e receber uma proposta personalizada.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="mailto:contato@dataro-it.com.br"
              className="w-full sm:w-auto px-8 py-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              contato@dataro-it.com.br
            </a>
            <a 
              href="https://wa.me/5569999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold flex items-center justify-center gap-2 hover:border-green-500"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="py-8 px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">ProviDATA</span>
            <span className="text-gray-500 dark:text-gray-500">© 2025</span>
          </div>
          <a 
            href="https://dataro-it.com.br" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-gray-500 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400"
          >
            Desenvolvido por DATA-RO INTELIGÊNCIA TERRITORIAL
          </a>
        </div>
      </footer>
    </div>
  );
}
