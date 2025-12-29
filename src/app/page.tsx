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
  Layers,
  CreditCard,
  Info,
  PhoneCall,
  Key
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

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

const navItems = [
  { name: 'Recursos', icon: Layers, href: '#recursos' },
  { name: 'Planos', icon: CreditCard, href: '#planos' },
  { name: 'Sobre', icon: Info, href: '#sobre' },
  { name: 'Contato', icon: PhoneCall, href: '#contato' },
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

// Palavras para marca d'água - mais palavras e espalhadas
const watermarkWords = [
  'Cidadão', 'Saúde', 'Educação', 'Segurança', 'Meio Ambiente', 
  'Infraestrutura', 'Transporte', 'Assistência', 'Cultura', 'Esporte',
  'Habitação', 'Saneamento', 'Iluminação', 'Mobilidade', 'Acessibilidade',
  'Cidadão', 'Saúde', 'Educação', 'Segurança', 'Meio Ambiente'
];

export default function HomePage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
    email: '',
    telefone: '',
    mensagem: '',
    // Campo Honeypot para proteção anti-bot
    email_confirm: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const isDark = resolvedTheme === 'dark';
  
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');

    // Validação Honeypot: Se o campo email_confirm estiver preenchido, é um bot.
    if (formData.email_confirm) {
      console.warn('Tentativa de submissão de bot detectada (Honeypot preenchido).');
      setFormStatus('success'); // Simula sucesso para não dar dica ao bot
      setFormData({ nome: '', cargo: '', email: '', telefone: '', mensagem: '', email_confirm: '' });
      setTimeout(() => {
        setShowContactForm(false);
        setFormStatus('idle');
      }, 3000);
      return;
    }
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar');
      }
      
      setFormStatus('success');
      setFormData({ nome: '', cargo: '', email: '', telefone: '', mensagem: '' });
      
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
      
      {/* HEADER com marca d'água espalhada */}
      <header style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50, 
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
        backdropFilter: 'blur(8px)',
        overflow: 'hidden'
      }}>
        {/* Marca d'água espalhada no fundo do header */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '20px',
          padding: '0 20px',
          opacity: isDark ? 0.04 : 0.06,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          {watermarkWords.map((word, index) => (
            <span 
              key={index}
              style={{
                fontSize: `${12 + (index % 3) * 2}px`,
                fontWeight: 700,
                color: isDark ? '#ffffff' : '#16a34a',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                whiteSpace: 'nowrap',
                transform: `rotate(${(index % 5) * 2 - 4}deg)`
              }}
            >
              {word}
            </span>
          ))}
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
            
            {/* Logos - Mesmo tamanho */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
	              {/* Logo DATA-RO - Fundo removido (v3 - Quebra de Cache) */}
	              <Link href="https://dataro-it.com.br" target="_blank" rel="noopener noreferrer">
	                <Image 
	                  src="/dataro-v3-clean.png" 
	                  alt="DATA-RO" 
	                  width={72} 
	                  height={72} 
	                  style={{ objectFit: 'contain' }}
	                />
	              </Link>
              
	              {/* Logo ProviDATA - Aumentado e Fundo removido (v3 - Quebra de Cache) */}
	              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
	                <Image 
	                  src="/providata-v3-clean.png" 
	                  alt="ProviDATA" 
	                  width={120} 
	                  height={120} 
	                  style={{ objectFit: 'contain' }}
	                />
	                <span style={{ fontWeight: 700, fontSize: '42px', color: isDark ? '#f1f5f9' : '#1e293b' }}>ProviDATA</span>
	              </Link>
            </div>

            {/* Nav - Botões com efeito espelho */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {navItems.map((item) => (
                <a 
                  key={item.name}
                  href={item.href} 
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: 600,
                    color: isDark ? '#e2e8f0' : '#374151',
                    textDecoration: 'none',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? '#1e293b' : '#f3f4f6',
                    border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                    boxShadow: isDark 
                      ? '0 4px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.2)' 
                      : '0 4px 6px rgba(0,0,0,0.08), inset 0 2px 0 rgba(255,255,255,1), inset 0 -2px 4px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Efeito espelho/reflexo */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: isDark 
                      ? 'linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)'
                      : 'linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)',
                    borderRadius: '10px 10px 0 0',
                    pointerEvents: 'none'
                  }} />
                  <item.icon style={{ width: '16px', height: '16px', color: '#16a34a', position: 'relative', zIndex: 1 }} />
                  <span style={{ position: 'relative', zIndex: 1 }}>{item.name}</span>
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Botão Entrar - Verde com ícone de chave e efeito espelho */}
              <Link 
                href="/login" 
                style={{ 
                  padding: '12px 24px',
                  borderRadius: '10px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Efeito espelho */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)',
                  borderRadius: '10px 10px 0 0',
                  pointerEvents: 'none'
                }} />
                <Key style={{ width: '18px', height: '18px', position: 'relative', zIndex: 1 }} />
                <span style={{ position: 'relative', zIndex: 1 }}>Entrar</span>
              </Link>
              
              {/* Botão Dia/Noite com efeito espelho */}
              <button
                onClick={toggleTheme}
                style={{ 
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                  backgroundColor: isDark ? '#1e293b' : '#f3f4f6',
                  color: isDark ? '#fbbf24' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isDark 
                    ? '0 4px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' 
                    : '0 4px 6px rgba(0,0,0,0.08), inset 0 2px 0 rgba(255,255,255,1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              >
                {/* Efeito espelho */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: isDark 
                    ? 'linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)'
                    : 'linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)',
                  borderRadius: '12px 12px 0 0',
                  pointerEvents: 'none'
                }} />
                {isDark ? <Sun style={{ width: '24px', height: '24px', position: 'relative', zIndex: 1 }} /> : <Moon style={{ width: '24px', height: '24px', position: 'relative', zIndex: 1 }} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ paddingTop: '200px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Badge */}
          <div style={{ 
            display: 'inline-block', 
            padding: '12px 24px', 
            borderRadius: '9999px', 
            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
            color: isDark ? '#4ade80' : '#15803d',
            fontSize: '15px',
            fontWeight: 600,
            marginBottom: '40px',
            border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0'}`
          }}>
            ✨ A solução completa para gabinetes parlamentares
          </div>

	          {/* Title com efeito 3D */}
	          <h1 style={{ 
	            fontSize: 'clamp(36px, 5vw, 56px)', 
	            fontWeight: 800, 
	            lineHeight: 1.15,
	            marginBottom: '28px',
	          }}>
	            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '16px' }}>
	              <Image 
	                src="/providata-v3-clean.png" 
	                alt="ProviDATA" 
	                width={200} 
	                height={200} 
	                style={{ 
	                  objectFit: 'contain',
	                  boxShadow: '0 0 60px rgba(22, 163, 74, 0.9), 0 0 120px rgba(22, 163, 74, 0.7)',
	                  filter: 'drop-shadow(0 0 15px rgba(22, 163, 74, 1))',
	                  transition: 'transform 0.3s ease-in-out',
	                  ':hover': {
	                    transform: 'scale(1.05)',
	                  }
	                }}
	              />
	              <span style={{ 
	                color: '#16a34a',
	                display: 'block',
	                textShadow: isDark 
	                  ? '0 1px 0 #0d5a2d, 0 2px 0 #0a4a25, 0 3px 0 #083d1f, 0 4px 0 #063018, 0 5px 10px rgba(0,0,0,0.5)' 
	                  : '0 1px 0 #15803d, 0 2px 0 #166534, 0 3px 0 #14532d, 0 4px 0 #052e16, 0 5px 10px rgba(0,0,0,0.15)',
	                letterSpacing: '-0.02em'
	              }}>
	                Plataforma para Gestão de
	              </span>
	            </div>
	            <span style={{ 
	              color: isDark ? '#ffffff' : '#1e293b',
	              display: 'block',
	              marginTop: '8px',
	              textShadow: isDark 
	                ? '0 1px 0 #0d5a2d, 0 2px 0 #0a4a25, 0 3px 0 #083d1f, 0 4px 0 #063018, 0 5px 0 #042310, 0 6px 15px rgba(0,0,0,0.6)' 
	                : '0 1px 0 #15803d, 0 2px 0 #166534, 0 3px 0 #14532d, 0 4px 0 #052e16, 0 5px 0 #022c22, 0 6px 15px rgba(0,0,0,0.2)',
	              letterSpacing: '-0.02em'
	            }}>
	              Pedidos de Providência
	            </span>
	          </h1>

          {/* Subtitle */}
          <p style={{ 
            fontSize: '20px', 
            lineHeight: 1.7,
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px auto',
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
            gap: '20px',
            marginBottom: '72px'
          }}>
            <Link 
              href="/demo"
              style={{ 
                padding: '18px 36px', 
                borderRadius: '12px', 
                backgroundColor: '#16a34a',
                color: 'white',
                fontWeight: 700,
                fontSize: '17px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(22, 163, 74, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
                borderRadius: '12px 12px 0 0',
                pointerEvents: 'none'
              }} />
              <span style={{ position: 'relative', zIndex: 1 }}>Acessar demonstração</span>
              <ArrowRight style={{ width: '22px', height: '22px', position: 'relative', zIndex: 1 }} />
            </Link>
            <button 
              onClick={() => setShowContactForm(true)}
              style={{ 
                padding: '18px 36px', 
                borderRadius: '12px', 
                border: `2px solid ${isDark ? '#334155' : '#d1d5db'}`,
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                fontWeight: 700,
                fontSize: '17px',
                color: isDark ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: isDark 
                  ? '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' 
                  : '0 4px 12px rgba(0,0,0,0.08), inset 0 2px 0 rgba(255,255,255,1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: isDark 
                  ? 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)'
                  : 'linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)',
                borderRadius: '12px 12px 0 0',
                pointerEvents: 'none'
              }} />
              <span style={{ position: 'relative', zIndex: 1 }}>Entrar em contato</span>
            </button>
          </div>

          {/* Stats */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '56px',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#16a34a' }}>Gestão</div>
              <div style={{ fontSize: '15px', marginTop: '6px', color: isDark ? '#94a3b8' : '#64748b' }}>Inteligente</div>
            </div>
            <div style={{ width: '2px', height: '56px', backgroundColor: isDark ? '#334155' : '#d1d5db', borderRadius: '2px' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#16a34a' }}>Acompanhamento</div>
              <div style={{ fontSize: '15px', marginTop: '6px', color: isDark ? '#94a3b8' : '#64748b' }}>em tempo real</div>
            </div>
            <div style={{ width: '2px', height: '56px', backgroundColor: isDark ? '#334155' : '#d1d5db', borderRadius: '2px' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#16a34a' }}>LGPD</div>
              <div style={{ fontSize: '15px', marginTop: '6px', color: isDark ? '#94a3b8' : '#64748b' }}>Conforme</div>
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" style={{ 
        padding: '100px 24px', 
        backgroundColor: isDark ? '#1e293b' : '#f9fafb' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <h2 style={{ 
              fontSize: '40px', 
              fontWeight: 700, 
              marginBottom: '20px',
              color: isDark ? '#f1f5f9' : '#1e293b'
            }}>
              Tudo que você precisa
            </h2>
            <p style={{ 
              fontSize: '19px', 
              maxWidth: '600px', 
              margin: '0 auto',
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
              Funcionalidades pensadas para otimizar o trabalho do gabinete parlamentar
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
            gap: '28px'
          }}>
            {features.map((feature, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '36px',
                  borderRadius: '20px',
                  border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  boxShadow: isDark 
                    ? '0 4px 12px rgba(0,0,0,0.3)' 
                    : '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '16px', 
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '28px'
                }}>
                  <feature.icon style={{ width: '32px', height: '32px', color: '#16a34a' }} />
                </div>
                <h3 style={{ 
                  fontSize: '22px', 
                  fontWeight: 700, 
                  marginBottom: '14px',
                  color: isDark ? '#f1f5f9' : '#1e293b'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  fontSize: '16px', 
                  lineHeight: 1.7,
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
        padding: '100px 24px',
        backgroundColor: isDark ? '#0f172a' : '#ffffff'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <h2 style={{ 
              fontSize: '40px', 
              fontWeight: 700, 
              marginBottom: '20px',
              color: isDark ? '#f1f5f9' : '#1e293b'
            }}>
              Planos e Preços
            </h2>
            <p style={{ 
              fontSize: '19px', 
              maxWidth: '600px', 
              margin: '0 auto',
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
              Escolha o plano ideal para o seu gabinete. Todos incluem suporte técnico e atualizações.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '32px',
            alignItems: 'stretch'
          }}>
            {/* Plano Básico */}
            <div style={{ 
              padding: '40px',
              borderRadius: '20px',
              border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              boxShadow: isDark 
                ? '0 10px 30px rgba(0, 0, 0, 0.2)' 
                : '0 10px 30px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease-in-out',
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              ':hover': {
                transform: 'translateY(-5px)',
                boxShadow: isDark ? '0 15px 40px rgba(0, 0, 0, 0.3)' : '0 15px 40px rgba(0, 0, 0, 0.15)',
              }
            }}>
              <h3 style={{ 
                fontSize: '26px', 
                fontWeight: 700, 
                marginBottom: '10px',
                color: isDark ? '#f1f5f9' : '#1e293b'
              }}>
                Básico
              </h3>
              <p style={{ 
                fontSize: '15px', 
                marginBottom: '28px',
                color: isDark ? '#94a3b8' : '#64748b'
              }}>
                Para gabinetes menores
              </p>
              <div style={{ 
                fontSize: '42px', 
                fontWeight: 700, 
                marginBottom: '32px',
                color: '#16a34a'
              }}>
                Consulte
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '36px' }}>
                {planoBasico.map((item, index) => (
                  <li 
                    key={index}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      marginBottom: '16px',
                      color: isDark ? '#94a3b8' : '#64748b',
                      fontSize: '16px'
                    }}
                  >
                    <Check style={{ width: '22px', height: '22px', color: '#16a34a' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setShowContactForm(true)}
                style={{ 
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${isDark ? '#334155' : '#d1d5db'}`,
                  backgroundColor: 'transparent',
                  fontWeight: 700,
                  fontSize: '16px',
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                Solicitar proposta
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Plano Ilimitado */}
            <div style={{ 
              padding: '40px',
              borderRadius: '20px',
              border: '2px solid #16a34a',
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(22, 163, 74, 0.25)',
              transition: 'transform 0.3s ease-in-out',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              ':hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 40px rgba(22, 163, 74, 0.35)',
              }
            }}>
              <div style={{ 
                position: 'absolute',
                top: '-14px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '8px 20px',
                borderRadius: '9999px',
                backgroundColor: '#16a34a',
                color: 'white',
                fontSize: '13px',
                fontWeight: 700
              }}>
                Recomendado
              </div>
              <h3 style={{ 
                fontSize: '26px', 
                fontWeight: 700, 
                marginBottom: '10px',
                color: isDark ? '#f1f5f9' : '#1e293b'
              }}>
                Ilimitado
              </h3>
              <p style={{ 
                fontSize: '15px', 
                marginBottom: '28px',
                color: isDark ? '#94a3b8' : '#64748b'
              }}>
                Para gabinetes completos
              </p>
              <div style={{ 
                fontSize: '42px', 
                fontWeight: 700, 
                marginBottom: '32px',
                color: '#16a34a'
              }}>
                Consulte
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '36px' }}>
                {planoIlimitado.map((item, index) => (
                  <li 
                    key={index}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      marginBottom: '16px',
                      color: isDark ? '#94a3b8' : '#64748b',
                      fontSize: '16px'
                    }}
                  >
                    <Check style={{ width: '22px', height: '22px', color: '#16a34a' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setShowContactForm(true)}
                style={{ 
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#16a34a',
                  fontWeight: 700,
                  fontSize: '16px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
                }}
              >
                Solicitar proposta
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" style={{ 
        padding: '100px 24px', 
        backgroundColor: isDark ? '#1e293b' : '#f9fafb' 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '40px', 
            fontWeight: 700, 
            marginBottom: '28px',
            color: isDark ? '#f1f5f9' : '#1e293b'
          }}>
            Sobre o Projeto
          </h2>
          <p style={{ 
            fontSize: '19px', 
            lineHeight: 1.8, 
            marginBottom: '36px',
            color: isDark ? '#94a3b8' : '#64748b'
          }}>
            O ProviDATA foi desenvolvido especialmente para atender às necessidades dos gabinetes 
            parlamentares brasileiros, com foco em simplicidade, transparência e eficiência no 
            atendimento ao cidadão. Nossa plataforma permite que vereadores, deputados e senadores 
            gerenciem todas as demandas de forma organizada e profissional.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Desenvolvido por</span>
            <span style={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#1e293b' }}>DATA-RO INTELIGÊNCIA TERRITORIAL</span>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" style={{ 
        padding: '100px 24px',
        backgroundColor: isDark ? '#0f172a' : '#ffffff'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '20px', 
            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 36px auto'
          }}>
            <Mail style={{ width: '36px', height: '36px', color: '#16a34a' }} />
          </div>
          
          <h2 style={{ 
            fontSize: '40px', 
            fontWeight: 700, 
            marginBottom: '20px',
            color: isDark ? '#f1f5f9' : '#1e293b'
          }}>
            Entre em contato
          </h2>
          <p style={{ 
            fontSize: '19px', 
            marginBottom: '48px', 
            maxWidth: '600px', 
            margin: '0 auto 48px auto',
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
            gap: '20px'
          }}>
            <a 
              href="mailto:contato@dataro-it.com.br"
              style={{ 
                padding: '18px 36px', 
                borderRadius: '12px', 
                backgroundColor: '#16a34a',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(22, 163, 74, 0.4)'
              }}
            >
              <Mail style={{ width: '22px', height: '22px' }} />
              contato@dataro-it.com.br
            </a>
            {/* WhatsApp apenas com ícone */}
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#25D366',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(37, 211, 102, 0.4)'
              }}
              title="Fale conosco pelo WhatsApp"
            >
              <MessageCircle style={{ width: '28px', height: '28px' }} />
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER - Centralizado */}
      <footer style={{ 
        padding: '28px 24px', 
        borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
        backgroundColor: isDark ? '#0f172a' : '#ffffff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          {/* Logos centralizadas */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '16px' }}>
            <Link href="https://dataro-it.com.br" target="_blank" rel="noopener noreferrer">
              <Image 
                src="/dataro-logo.jpeg" 
                alt="DATA-RO" 
                width={44} 
                height={44} 
                style={{ borderRadius: '10px' }}
              />
            </Link>
            <Image 
              src="/providata-logo.png" 
              alt="ProviDATA" 
              width={44} 
              height={44} 
              style={{ borderRadius: '10px', objectFit: 'contain' }}
            />
            <span style={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#1e293b' }}>ProviDATA</span>
          </div>
          {/* Texto centralizado */}
          <div style={{ fontSize: '14px', color: isDark ? '#64748b' : '#94a3b8' }}>
            <span>Desenvolvido por </span>
            <a 
              href="https://dataro-it.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b', textDecoration: 'none' }}
            >
              DATA-RO INTELIGÊNCIA TERRITORIAL
            </a>
            <span> • Todos os direitos reservados. © 2025</span>
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
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <button
              onClick={() => setShowContactForm(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isDark ? '#334155' : '#f3f4f6',
                color: isDark ? '#94a3b8' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X style={{ width: '22px', height: '22px' }} />
            </button>

            <h3 style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '12px',
              color: isDark ? '#f1f5f9' : '#1e293b'
            }}>
              Entre em contato
            </h3>
            <p style={{
              fontSize: '15px',
              marginBottom: '32px',
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
              Preencha o formulário abaixo e nossa equipe entrará em contato em breve.
            </p>

            {formStatus === 'success' ? (
              <div style={{
                padding: '24px',
                borderRadius: '12px',
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                textAlign: 'center'
              }}>
                <Check style={{ width: '48px', height: '48px', color: '#16a34a', margin: '0 auto 16px auto' }} />
                <p style={{ fontWeight: 600, color: '#16a34a', fontSize: '17px' }}>
                  Mensagem enviada com sucesso!
                </p>
                <p style={{ color: isDark ? '#94a3b8' : '#64748b', marginTop: '8px' }}>
                  Entraremos em contato em breve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#374151', fontSize: '14px' }}>
                    Nome completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                {/* Campo Honeypot - Visível para bots, invisível para humanos */}
                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, height: 0, width: 0, overflow: 'hidden' }}>
                  <label htmlFor="email_confirm">Nao preencha este campo</label>
                  <input
                    type="text"
                    id="email_confirm"
                    name="email_confirm"
                    value={formData.email_confirm}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#374151', fontSize: '14px' }}>
                    Cargo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                    placeholder="Ex: Vereador, Assessor, etc."
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#374151', fontSize: '14px' }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                    placeholder="seu@email.com"
                  />
                </div>
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#374151', fontSize: '14px' }}>
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                    placeholder="(00) 0 0000-0000"
                  />
                </div>
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#374151', fontSize: '14px' }}>
                    Mensagem (Opcional)
                  </label>
                  <textarea
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: '15px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                    placeholder="Deixe sua mensagem aqui..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={formStatus === 'loading'}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: formStatus === 'loading' ? 'not-allowed' : 'pointer',
                    opacity: formStatus === 'loading' ? 0.7 : 1,
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
                  }}
                >
                  {formStatus === 'loading' ? 'Enviando...' : 'Enviar mensagem'}
                </button>
                {formStatus === 'error' && (
                  <p style={{ color: '#ef4444', marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
                    Erro ao enviar. Tente novamente.
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
