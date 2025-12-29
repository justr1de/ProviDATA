'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useTheme } from '@/providers/theme-provider';
import { createBrowserClient } from '@supabase/ssr';
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
  Moon,
  X,
  Phone
} from 'lucide-react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

const planoIlimitado = [
  'Usuários ilimitados',
  'Providências ilimitadas',
  'Dashboard avançado',
  'Relatórios personalizados',
  'Notificações por e-mail',
  'Suporte prioritário',
];

export default function HomePage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
    email: '',
    telefone: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const isDark = resolvedTheme === 'dark';
  
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    
    try {
      const { error } = await supabase
        .from('leads')
        .insert([formData]);
      
      if (error) throw error;
      
      setFormStatus('success');
      setFormData({ nome: '', cargo: '', email: '', telefone: '' });
      
      setTimeout(() => {
        setShowContactForm(false);
        setFormStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar lead:', error);
      setFormStatus('error');
    }
  };

  const whatsappNumber = '5569999089202';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Olá! Tenho interesse em conhecer o ProviDATA.`;

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
            
            {/* Logos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Logo DATA-RO */}
              <Link href="https://dataro-it.com.br" target="_blank" rel="noopener noreferrer">
                <Image 
                  src="/dataro-logo.jpeg" 
                  alt="DATA-RO" 
                  width={48} 
                  height={48} 
                  style={{ borderRadius: '8px' }}
                />
              </Link>
              
              {/* Logo ProviDATA */}
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, #22c55e, #15803d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText style={{ width: '22px', height: '22px', color: 'white' }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '20px', color: isDark ? '#f1f5f9' : '#1e293b' }}>ProviDATA</span>
              </Link>
            </div>

            {/* Nav - Botões em alto relevo minimalista */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {['Recursos', 'Planos', 'Sobre', 'Contato'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: 600,
                    color: isDark ? '#e2e8f0' : '#374151',
                    textDecoration: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#1e293b' : '#f3f4f6',
                    border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                    boxShadow: isDark 
                      ? '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' 
                      : '0 2px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Botão Entrar - Verde com letras brancas */}
              <Link 
                href="/login" 
                style={{ 
                  padding: '10px 24px',
                  borderRadius: '8px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                }}
              >
                Entrar
              </Link>
              
              {/* Botão Dia/Noite - Depois do Entrar */}
              <button
                onClick={toggleTheme}
                style={{ 
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                  backgroundColor: isDark ? '#1e293b' : '#f3f4f6',
                  color: isDark ? '#fbbf24' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isDark 
                    ? '0 2px 4px rgba(0,0,0,0.3)' 
                    : '0 2px 4px rgba(0,0,0,0.05)'
                }}
                title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              >
                {isDark ? <Sun style={{ width: '22px', height: '22px' }} /> : <Moon style={{ width: '22px', height: '22px' }} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ paddingTop: '180px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Badge - Mais interessante */}
          <div style={{ 
            display: 'inline-block', 
            padding: '10px 20px', 
            borderRadius: '9999px', 
            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
            color: isDark ? '#4ade80' : '#15803d',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '32px',
            border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0'}`
          }}>
            ✨ A solução completa para gabinetes parlamentares
          </div>

          {/* Title - Sem "Gestão de Providências" */}
          <h1 style={{ 
            fontSize: 'clamp(36px, 5vw, 60px)', 
            fontWeight: 800, 
            lineHeight: 1.1,
            marginBottom: '24px',
            color: isDark ? '#f1f5f9' : '#1e293b'
          }}>
            <span style={{ color: '#16a34a' }}>Plataforma para Gestão de</span>
            <br />
            <span style={{ color: '#16a34a' }}>Pedidos de Providência</span>
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
                borderRadius: '10px', 
                backgroundColor: '#16a34a',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)'
              }}
            >
              Acessar demonstração
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </Link>
            <button 
              onClick={() => setShowContactForm(true)}
              style={{ 
                padding: '16px 32px', 
                borderRadius: '10px', 
                border: `2px solid ${isDark ? '#334155' : '#d1d5db'}`,
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                fontWeight: 700,
                fontSize: '16px',
                color: isDark ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Entrar em contato
            </button>
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

              <button 
                onClick={() => setShowContactForm(true)}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: `2px solid ${isDark ? '#334155' : '#d1d5db'}`,
                  backgroundColor: 'transparent',
                  fontWeight: 600,
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  cursor: 'pointer'
                }}
              >
                Solicitar proposta
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Ilimitado (antes Profissional) */}
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
                padding: '6px 20px',
                borderRadius: '9999px',
                backgroundColor: '#16a34a',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600
              }}>
                Recomendado
              </div>
              
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                marginBottom: '8px',
                color: isDark ? '#f1f5f9' : '#1e293b'
              }}>Ilimitado</h3>
              <p style={{ marginBottom: '24px', color: isDark ? '#94a3b8' : '#64748b' }}>Para gabinetes completos</p>
              
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#16a34a', marginBottom: '32px' }}>Consulte</div>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                {planoIlimitado.map((item, index) => (
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

              <button 
                onClick={() => setShowContactForm(true)}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: '#16a34a',
                  border: 'none',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)'
                }}
              >
                Solicitar proposta
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
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
                borderRadius: '10px', 
                backgroundColor: '#16a34a',
                color: 'white',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)'
              }}
            >
              <Mail style={{ width: '20px', height: '20px' }} />
              contato@dataro-it.com.br
            </a>
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                padding: '16px 32px', 
                borderRadius: '10px', 
                backgroundColor: '#25D366',
                color: 'white',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)'
              }}
            >
              <MessageCircle style={{ width: '20px', height: '20px' }} />
              (69) 9 9908-9202
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="https://dataro-it.com.br" target="_blank" rel="noopener noreferrer">
              <Image 
                src="/dataro-logo.jpeg" 
                alt="DATA-RO" 
                width={40} 
                height={40} 
                style={{ borderRadius: '8px' }}
              />
            </Link>
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
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: isDark ? '#64748b' : '#94a3b8' }}>
            <span>Desenvolvido por</span>
            <a 
              href="https://dataro-it.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b', textDecoration: 'none' }}
            >
              DATA-RO INTELIGÊNCIA TERRITORIAL
            </a>
            <span>•</span>
            <span>© 2025 Todos os direitos reservados</span>
          </div>
        </div>
      </footer>

      {/* MODAL DE CONTATO */}
      {showContactForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <button
              onClick={() => setShowContactForm(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isDark ? '#94a3b8' : '#64748b'
              }}
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>

            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: 700, 
              marginBottom: '8px',
              color: isDark ? '#f1f5f9' : '#1e293b'
            }}>
              Entrar em contato
            </h3>
            <p style={{ 
              marginBottom: '24px', 
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: '14px'
            }}>
              Preencha o formulário abaixo e nossa equipe entrará em contato em breve.
            </p>

            {formStatus === 'success' ? (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#dcfce7',
                borderRadius: '12px'
              }}>
                <Check style={{ width: '48px', height: '48px', color: '#16a34a', margin: '0 auto 16px' }} />
                <p style={{ fontWeight: 600, color: '#16a34a' }}>Mensagem enviada com sucesso!</p>
                <p style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '8px' }}>
                  Nossa equipe entrará em contato em breve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '14px', 
                    fontWeight: 500,
                    color: isDark ? '#e2e8f0' : '#374151'
                  }}>
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    placeholder="Seu nome"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '14px', 
                    fontWeight: 500,
                    color: isDark ? '#e2e8f0' : '#374151'
                  }}>
                    Cargo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    placeholder="Ex: Vereador, Assessor, etc."
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '14px', 
                    fontWeight: 500,
                    color: isDark ? '#e2e8f0' : '#374151'
                  }}>
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    placeholder="seu@email.com"
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontSize: '14px', 
                    fontWeight: 500,
                    color: isDark ? '#e2e8f0' : '#374151'
                  }}>
                    Telefone/WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    placeholder="(00) 0 0000-0000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formStatus === 'loading'}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: '#16a34a',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: formStatus === 'loading' ? 'not-allowed' : 'pointer',
                    opacity: formStatus === 'loading' ? 0.7 : 1,
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)'
                  }}
                >
                  {formStatus === 'loading' ? 'Enviando...' : 'Enviar'}
                </button>

                {formStatus === 'error' && (
                  <p style={{ 
                    marginTop: '16px', 
                    color: '#ef4444', 
                    fontSize: '14px', 
                    textAlign: 'center' 
                  }}>
                    Ocorreu um erro. Tente novamente.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
