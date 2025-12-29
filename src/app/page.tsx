'use client';

import Link from 'next/link';
import { useTheme } from '@/providers/theme-provider';
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
  Sun,
  Moon
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
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const isDark = resolvedTheme === 'dark';
  
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#1e293b'
    }}>
      
      {/* HEADER */}
      <header style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50, 
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
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
              <span style={{ fontWeight: 700, fontSize: '18px', color: isDark ? '#f1f5f9' : '#1e293b' }}>ProviDATA</span>
            </Link>

            {/* Nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <a href="#recursos" style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', textDecoration: 'none' }}>Recursos</a>
              <a href="#planos" style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', textDecoration: 'none' }}>Planos</a>
              <a href="#sobre" style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', textDecoration: 'none' }}>Sobre</a>
              <a href="#contato" style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', textDecoration: 'none' }}>Contato</a>
            </nav>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Botão Dia/Noite */}
              <button
                onClick={toggleTheme}
                style={{ 
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#f1f5f9' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              >
                {isDark ? <Sun style={{ width: '20px', height: '20px' }} /> : <Moon style={{ width: '20px', height: '20px' }} />}
              </button>
              
              <Link 
                href="/login" 
                style={{ 
                  fontSize: '14px', 
                  color: isDark ? '#94a3b8' : '#64748b',
                  textDecoration: 'none'
                }}
              >
                Entrar
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
            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
            color: isDark ? '#4ade80' : '#15803d',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '32px'
          }}>
            Plataforma de Gestão e Acompanhamento para Gabinetes Parlamentares
          </div>

          {/* Title */}
          <h1 style={{ 
            fontSize: 'clamp(32px, 5vw, 56px)', 
            fontWeight: 700, 
            lineHeight: 1.1,
            marginBottom: '24px',
            color: isDark ? '#f1f5f9' : '#1e293b'
          }}>
            Gestão de Providências
            <br />
            <span style={{ color: '#16a34a' }}>Plataforma para Gestão de Pedidos de Providência</span>
          </h1>

          {/* Subtitle */}
          <p style={{ 
            fontSize: '20px', 
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: '700px',
            margin: '0 auto 40px auto',
            color: isDark ? '#94a3b8' : '#64748b'
          }}>
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
                gap: '8px',
                textDecoration: 'none'
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
                border: `2px solid ${isDark ? '#334155' : '#d1d5db'}`,
                fontWeight: 600,
                fontSize: '16px',
                color: isDark ? '#f1f5f9' : '#1e293b',
                textDecoration: 'none'
              }}
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
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>Acompanhamento</div>
              <div style={{ fontSize: '14px', marginTop: '4px', color: isDark ? '#94a3b8' : '#64748b' }}>em tempo real</div>
            </div>
            <div style={{ width: '1px', height: '48px', backgroundColor: isDark ? '#334155' : '#d1d5db' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>Gestão</div>
              <div style={{ fontSize: '14px', marginTop: '4px', color: isDark ? '#94a3b8' : '#64748b' }}>Inteligente</div>
            </div>
            <div style={{ width: '1px', height: '48px', backgroundColor: isDark ? '#334155' : '#d1d5db' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>LGPD</div>
              <div style={{ fontSize: '14px', marginTop: '4px', color: isDark ? '#94a3b8' : '#64748b' }}>Conforme</div>
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" style={{ 
        padding: '80px 24px', 
        backgroundColor: isDark ? '#1e293b' : '#f9fafb' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: 700, 
              marginBottom: '16px',
              color: isDark ? '#f1f5f9' : '#1e293b'
            }}>
              Tudo que você precisa
            </h2>
            <p style={{ 
              fontSize: '18px', 
              maxWidth: '600px', 
              margin: '0 auto',
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
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
                  border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                  backgroundColor: isDark ? '#0f172a' : '#ffffff'
                }}
              >
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '12px', 
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <feature.icon style={{ width: '28px', height: '28px', color: '#16a34a' }} />
                </div>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 700, 
                  marginBottom: '12px',
                  color: isDark ? '#f1f5f9' : '#1e293b'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  fontSize: '16px', 
                  lineHeight: 1.6,
                  color: isDark ? '#94a3b8' : '#64748b'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" style={{ 
        padding: '80px 24px',
        backgroundColor: isDark ? '#0f172a' : '#ffffff'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: 700, 
              marginBottom: '16px',
              color: isDark ? '#f1f5f9' : '#1e293b'
            }}>
              Planos e Preços
            </h2>
            <p style={{ 
              fontSize: '18px', 
              maxWidth: '600px', 
              margin: '0 auto',
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
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
              border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
              backgroundColor: isDark ? '#1e293b' : '#ffffff'
            }}>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                marginBottom: '8px',
                color: isDark ? '#f1f5f9' : '#1e293b'
              }}>Básico</h3>
              <p style={{ marginBottom: '24px', color: isDark ? '#94a3b8' : '#64748b' }}>Para gabinetes menores</p>
              
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#16a34a', marginBottom: '32px' }}>Consulte</div>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                {planoBasico.map((item, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Check style={{ width: '12px', height: '12px', color: '#16a34a' }} />
                    </div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{item}</span>
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
                  border: `2px solid ${isDark ? '#334155' : '#d1d5db'}`,
                  fontWeight: 600,
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  textDecoration: 'none'
                }}
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
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              position: 'relative'
            }}>
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
              
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                marginBottom: '8px',
                color: isDark ? '#f1f5f9' : '#1e293b'
              }}>Profissional</h3>
              <p style={{ marginBottom: '24px', color: isDark ? '#94a3b8' : '#64748b' }}>Para gabinetes completos</p>
              
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#16a34a', marginBottom: '32px' }}>Consulte</div>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                {planoProfissional.map((item, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Check style={{ width: '12px', height: '12px', color: '#16a34a' }} />
                    </div>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{item}</span>
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
                  fontWeight: 600,
                  textDecoration: 'none'
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
      <section id="sobre" style={{ 
        padding: '80px 24px', 
        backgroundColor: isDark ? '#1e293b' : '#f9fafb' 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: 700, 
            marginBottom: '24px',
            color: isDark ? '#f1f5f9' : '#1e293b'
          }}>
            Sobre o Projeto
          </h2>
          <p style={{ 
            fontSize: '18px', 
            lineHeight: 1.8, 
            marginBottom: '32px',
            color: isDark ? '#94a3b8' : '#64748b'
          }}>
            O ProviDATA foi desenvolvido especialmente para atender às necessidades dos gabinetes 
            parlamentares brasileiros, com foco em simplicidade, transparência e eficiência no 
            atendimento ao cidadão. Nossa plataforma permite que vereadores, deputados e senadores 
            gerenciem todas as demandas de forma organizada e profissional.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Desenvolvido por</span>
            <span style={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#1e293b' }}>DATA-RO INTELIGÊNCIA TERRITORIAL</span>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" style={{ 
        padding: '80px 24px',
        backgroundColor: isDark ? '#0f172a' : '#ffffff'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px auto'
          }}>
            <Mail style={{ width: '32px', height: '32px', color: '#16a34a' }} />
          </div>
          
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: 700, 
            marginBottom: '16px',
            color: isDark ? '#f1f5f9' : '#1e293b'
          }}>
            Entre em contato
          </h2>
          <p style={{ 
            fontSize: '18px', 
            marginBottom: '40px', 
            maxWidth: '600px', 
            margin: '0 auto 40px auto',
            color: isDark ? '#94a3b8' : '#64748b'
          }}>
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
                gap: '8px',
                textDecoration: 'none'
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
                border: `2px solid ${isDark ? '#334155' : '#d1d5db'}`,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: isDark ? '#f1f5f9' : '#1e293b',
                textDecoration: 'none'
              }}
            >
              <MessageCircle style={{ width: '20px', height: '20px' }} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ 
        padding: '24px', 
        borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
        backgroundColor: isDark ? '#0f172a' : '#ffffff'
      }}>
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
            <span style={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#1e293b' }}>ProviDATA</span>
            <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>© 2025</span>
          </div>
          <a 
            href="https://dataro-it.com.br" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontSize: '14px', color: isDark ? '#64748b' : '#94a3b8', textDecoration: 'none' }}
          >
            Desenvolvido por DATA-RO INTELIGÊNCIA TERRITORIAL
          </a>
        </div>
      </footer>
    </div>
  );
}
