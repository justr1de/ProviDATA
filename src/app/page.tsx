import Link from 'next/link'
import { 
  FileText, 
  Users, 
  Building2, 
  Bell, 
  Shield, 
  BarChart3,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Gestão de Providências',
    description: 'Registre e acompanhe todas as solicitações dos cidadãos com protocolo automático e histórico completo.'
  },
  {
    icon: Users,
    title: 'Cadastro de Cidadãos',
    description: 'Mantenha um banco de dados organizado com todas as informações dos solicitantes.'
  },
  {
    icon: Building2,
    title: 'Órgãos Destinatários',
    description: 'Cadastre secretarias, ministério público, defensoria e outros órgãos para encaminhamento.'
  },
  {
    icon: Bell,
    title: 'Notificações',
    description: 'Receba alertas sobre prazos, atualizações e mantenha o cidadão informado.'
  },
  {
    icon: Shield,
    title: 'Multi-tenant',
    description: 'Cada gabinete possui seu ambiente isolado e seguro, com dados protegidos.'
  },
  {
    icon: BarChart3,
    title: 'Dashboard Analítico',
    description: 'Visualize estatísticas e indicadores de desempenho em tempo real.'
  },
]

const benefits = [
  'Protocolo automático para cada providência',
  'Acompanhamento em tempo real',
  'Histórico completo de alterações',
  'Controle de prazos e alertas',
  'Relatórios e exportações',
  'Conformidade com LGPD',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">ProviDATA</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login"
                className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/cadastro"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-6">
            Gestão de Providências
            <br />
            <span className="text-[var(--primary)]">Parlamentares</span>
          </h1>
          <p className="text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto mb-10">
            Sistema completo para vereadores, deputados e senadores gerenciarem 
            as solicitações dos cidadãos de forma organizada e transparente.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/cadastro"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[var(--primary)] text-white text-lg font-medium hover:bg-[var(--primary)]/90 transition-colors"
            >
              Criar Conta Gratuita
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-[var(--border)] text-[var(--foreground)] text-lg font-medium hover:bg-[var(--secondary)] transition-colors"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              Funcionalidades pensadas para otimizar o trabalho do gabinete parlamentar
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[var(--muted-foreground)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6">
                Por que escolher o ProviDATA?
              </h2>
              <p className="text-lg text-[var(--muted-foreground)] mb-8">
                Desenvolvido especialmente para atender às necessidades dos gabinetes 
                parlamentares brasileiros, com foco em simplicidade e eficiência.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-[var(--foreground)]">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[var(--background)] rounded-2xl border border-[var(--border)] p-8 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--secondary)]">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 font-bold">12</span>
                  </div>
                  <div>
                    <p className="font-medium">Providências Pendentes</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Aguardando análise</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--secondary)]">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold">8</span>
                  </div>
                  <div>
                    <p className="font-medium">Em Andamento</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Encaminhadas aos órgãos</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--secondary)]">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold">45</span>
                  </div>
                  <div>
                    <p className="font-medium">Concluídas este mês</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Cidadãos atendidos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--primary)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Comece a usar o ProviDATA hoje mesmo
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Cadastre seu gabinete gratuitamente e organize suas providências de forma profissional.
          </p>
          <Link 
            href="/cadastro"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-[var(--primary)] text-lg font-medium hover:bg-white/90 transition-colors"
          >
            Criar Conta Gratuita
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[var(--background)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">ProviDATA</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] text-center">
              Desenvolvido por{' '}
              <a 
                href="https://dataro-it.com.br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                DATA-RO INTELIGÊNCIA TERRITORIAL
              </a>
              . Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
