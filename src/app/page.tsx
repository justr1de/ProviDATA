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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color, #ffffff)' }} className="dark:bg-gray-950">
      
      {/* HEADER */}
      <header style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50, 
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderBottom: '1px solid #e5e7eb',
        backdropFilter: 'blur(8px)'
      }} className="dark:bg-gray-950/95 dark:border-gray-800">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #22c55e, #15803d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '18px' }} className="text-gray-900 dark:text-white">ProviDATA</span>
            </Link>

            {/* Nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden md:flex">
              <a href="#recursos" style={{ fontSize: '14px' }} className="text-gray-600 dark:text-gray-400 hover:text-green-600">Recursos</a>
              <a href="#planos" style={{ fontSize: '14px' }} className="text-gray-600 dark:text-gray-400 hover:text-green-600">Planos</a>
              <a href="#sobre" style={{ fontSize: '14px' }} className="text-gray-600 dark:text-gray-400 hover:text-green-600">Sobre</a>
              <a href="#contato" style={{ fontSize: '14px' }} className="text-gray-600 dark:text-gray-400 hover:text-green-600">Contato</a>
            </nav>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ThemeToggle />
              <Link href="/login" style={{ fontSize: '14px' }} className="text-gray-600 dark:text-gray-400 hover:text-gray-900">
                Entrar
              </Link>
              <Link href="/demo" style={{ 
                padding: '8px 16px', 
                borderRadius: '8px', 
                backgroundColor: '#16a34a',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500
              }}>
                Demo
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ paddingTop: '180px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Badge */}
          <div style={{ 
            display: 'inline-block', 
            padding: '8px 16px', 
            borderRadius: '9999px', 
            backgroundColor: '#dcfce7',
            color: '#15803d',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '32px'
          }} className="dark:bg-green-900/30 dark:text-green-400">
            Plataforma SaaS para Gabinetes Parlamentares
          </div>

          {/* Title */}
          <h1 style={{ 
            fontSize: 'clamp(36px, 5vw, 60px)', 
            fontWeight: 700, 
            lineHeight: 1.1,
            marginBottom: '24px'
          }} className="text-gray-900 dark:text-white">
            Gestão de Providências
            <br />
            <span style={{ color: '#16a34a' }}>Parlamentares</span>
          </h1>

          {/* Subtitle */}
          <p style={{ 
            fontSize: '20px', 
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: '700px',
            margin: '0 auto 40px auto'
          }} className="text-gray-600 dark:text-gray-400">
            Organize as solicitações dos cidadãos de forma simples e transparente. 
            Acompanhe prazos, encaminhe demandas e mantenha todos informados.
          </p>

          {/* CTAs */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '16px',
            marginBottom: '64px'
          }}>
            <Link 
              href="/demo"
              style={{ 
                padding: '16px 32px', 
                borderRadius: '8px', 
                backgroundColor: '#16a34a',
                color: 'white',
                fontWeight: 600,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Acessar demonstração
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </Link>
            <a 
              href="#contato"
              style={{ 
                padding: '16px 32px', 
                borderRadius: '8px', 
                border: '2px solid #d1d5db',
                fontWeight: 600,
                fontSize: '16px'
              }}
              className="text-gray-900 dark:text-white dark:border-gray-700 hover:border-green-500"
            >
              Falar com consultor
            </a>
          </div>

          {/* Stats */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '48px',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#16a34a' }}>SaaS</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }} className="text-gray-500">Modelo</div>
            </div>
            <div style={{ width: '1px', height: '48px', backgroundColor: '#d1d5db' }} className="dark:bg-gray-700 hidden sm:block"></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#16a34a' }}>Multi</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }} className="text-gray-500">Tenant</div>
            </div>
            <div style={{ width: '1px', height: '48px', backgroundColor: '#d1d5db' }} className="dark:bg-gray-700 hidden sm:block"></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#16a34a' }}>LGPD</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }} className="text-gray-500">Conforme</div>
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" style={{ padding: '80px 24px', backgroundColor: '#f9fafb' }} className="dark:bg-gray-900">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }} className="text-gray-900 dark:text-white">
              Tudo que você precisa
            </h2>
            <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto' }} className="text-gray-600 dark:text-gray-400">
              Funcionalidades pensadas para otimizar o trabalho do gabinete parlamentar
            </p>
          </div>

          {/* Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '24px'
          }}>
            {features.map((feature, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '32px',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  transition: 'border-color 0.2s'
                }}
                className="dark:bg-gray-800 dark:border-gray-700 hover:border-green-500"
              >
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '12px', 
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }} className="dark:bg-green-900/30">
                  <feature.icon style={{ width: '28px', height: '28px', color: '#16a34a' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }} className="text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p style={{ fontSize: '16px', lineHeight: 1.6 }} className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }} className="text-gray-900 dark:text-white">
              Planos e Preços
            </h2>
            <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto' }} className="text-gray-600 dark:text-gray-400">
              Escolha o plano ideal para o seu gabinete. Todos incluem suporte técnico e atualizações.
            </p>
          </div>

          {/* Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '32px'
          }}>
            
            {/* Básico */}
            <div style={{ 
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white'
            }} className="dark:bg-gray-800 dark:border-gray-700">
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }} className="text-gray-900 dark:text-white">Básico</h3>
              <p style={{ marginBottom: '24px' }} className="text-gray-500">Para gabinetes menores</p>
              
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#16a34a', marginBottom: '32px' }}>Consulte</div>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                {planoBasico.map((item, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: '#dcfce7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }} className="dark:bg-green-900/30">
                      <Check style={{ width: '12px', height: '12px', color: '#16a34a' }} />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="#contato"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #d1d5db',
                  fontWeight: 600
                }}
                className="text-gray-900 dark:text-white dark:border-gray-600 hover:border-green-500"
              >
                Solicitar proposta
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </a>
            </div>

            {/* Profissional */}
            <div style={{ 
              padding: '32px',
              borderRadius: '16px',
              border: '2px solid #16a34a',
              backgroundColor: 'white',
              position: 'relative'
            }} className="dark:bg-gray-800">
              <div style={{ 
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '4px 16px',
                borderRadius: '9999px',
                backgroundColor: '#16a34a',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500
              }}>
                Recomendado
              </div>
              
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }} className="text-gray-900 dark:text-white">Profissional</h3>
              <p style={{ marginBottom: '24px' }} className="text-gray-500">Para gabinetes completos</p>
              
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#16a34a', marginBottom: '32px' }}>Consulte</div>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                {planoProfissional.map((item, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: '#dcfce7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }} className="dark:bg-green-900/30">
                      <Check style={{ width: '12px', height: '12px', color: '#16a34a' }} />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="#contato"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  fontWeight: 600
                }}
              >
                Solicitar proposta
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" style={{ padding: '80px 24px', backgroundColor: '#f9fafb' }} className="dark:bg-gray-900">
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '24px' }} className="text-gray-900 dark:text-white">
            Sobre o Projeto
          </h2>
          <p style={{ fontSize: '18px', lineHeight: 1.8, marginBottom: '32px' }} className="text-gray-600 dark:text-gray-400">
            O ProviDATA foi desenvolvido especialmente para atender às necessidades dos gabinetes 
            parlamentares brasileiros, com foco em simplicidade, transparência e eficiência no 
            atendimento ao cidadão. Nossa plataforma permite que vereadores, deputados e senadores 
            gerenciem todas as demandas de forma organizada e profissional.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} className="text-gray-500">
            <span>Desenvolvido por</span>
            <span style={{ fontWeight: 700 }} className="text-gray-900 dark:text-white">DATA-RO INTELIGÊNCIA TERRITORIAL</span>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            backgroundColor: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px auto'
          }} className="dark:bg-green-900/30">
            <Mail style={{ width: '32px', height: '32px', color: '#16a34a' }} />
          </div>
          
          <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }} className="text-gray-900 dark:text-white">
            Entre em contato
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }} className="text-gray-600 dark:text-gray-400">
            Fale com nossa equipe comercial para conhecer melhor o sistema e receber uma proposta personalizada.
          </p>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '16px'
          }}>
            <a 
              href="mailto:contato@dataro-it.com.br"
              style={{ 
                padding: '16px 32px', 
                borderRadius: '8px', 
                backgroundColor: '#16a34a',
                color: 'white',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Mail style={{ width: '20px', height: '20px' }} />
              contato@dataro-it.com.br
            </a>
            <a 
              href="https://wa.me/5569999999999"
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                padding: '16px 32px', 
                borderRadius: '8px', 
                border: '2px solid #d1d5db',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              className="text-gray-900 dark:text-white dark:border-gray-700 hover:border-green-500"
            >
              <MessageCircle style={{ width: '20px', height: '20px' }} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px', borderTop: '1px solid #e5e7eb' }} className="dark:border-gray-800">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #22c55e, #15803d)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText style={{ width: '16px', height: '16px', color: 'white' }} />
            </div>
            <span style={{ fontWeight: 700 }} className="text-gray-900 dark:text-white">ProviDATA</span>
            <span className="text-gray-500">© 2025</span>
          </div>
          <a 
            href="https://dataro-it.com.br" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontSize: '14px' }}
            className="text-gray-500 hover:text-green-600"
          >
            Desenvolvido por DATA-RO INTELIGÊNCIA TERRITORIAL
          </a>
        </div>
      </footer>
    </div>
  );
}
