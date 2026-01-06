'use client';
// Build v4 - Valores removidos dos planos, grid 3x2

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useTheme } from '@/providers/theme-provider';
// import { createBrowserClient } from '@supabase/ssr';
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
  Key,
  Menu
} from 'lucide-react';

// Cliente Supabase removido - não utilizado nesta página

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      setFormData({ nome: '', cargo: '', email: '', telefone: '', mensagem: '', email_confirm: '' });
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
      color: isDark ? '#f1f5f9' : '#1e293b',
      position: 'relative'
    }}>
      {/* Mapa do Brasil como background gigante de toda a página */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        backgroundImage: 'url(/brazil-map.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'contain',
        opacity: isDark ? 0.15 : 0.12,
        filter: isDark ? 'brightness(1.5) grayscale(0.3)' : 'sepia(0.2) hue-rotate(80deg)',
        mixBlendMode: isDark ? 'lighten' : 'normal'
      }} />
      
      {/* HEADER RESPONSIVO */}
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
        {/* Marca d'água espalhada no fundo do header - escondida em mobile */}
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
                transform: `rotate(${(index % 5) * 2 - 4}deg)`,
                display: 'none' // Escondido por padrão, mostrar apenas em desktop via media query
              }}
              className="watermark-word"
            >
              {word}
            </span>
          ))}
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
            
            {/* Logos - Responsivo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Logo DATA-RO - Menor em mobile */}
              <Link href="https://dataro-it.com.br" target="_blank" rel="noopener noreferrer">
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  backgroundColor: '#ffffff', 
                  borderRadius: '10px', 
                  padding: '4px', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Image 
                    src="/dataro-logo-final.png" 
                    alt="DATA-RO" 
                    width={36} 
                    height={36}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </Link>
              
              {/* Logo ProviDATA - Texto escondido em mobile pequeno */}
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  backgroundColor: '#ffffff', 
                  borderRadius: '10px', 
                  padding: '4px', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Image 
                    src="/providata-logo-final.png" 
                    alt="ProviDATA" 
                    width={36} 
                    height={36}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <span 
                  className="text-providata-gradient logo-text-desktop" 
                  style={{ fontWeight: 800, fontSize: '24px', letterSpacing: '-0.02em' }}
                >
                  ProviDATA
                </span>
              </Link>
            </div>

            {/* Nav Desktop - Escondido em mobile */}
            <nav className="nav-desktop" style={{ display: 'none', alignItems: 'center', gap: '12px' }}>
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="nav-item"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isDark ? '#e2e8f0' : '#374151',
                    textDecoration: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#1e293b' : '#f3f4f6',
                    border: `1px solid ${isDark ? '#4b5563' : '#cbd5e1'}`,
                    boxShadow: isDark
                      ? '0 2px 4px rgba(0,0,0,0.3)'
                      : '0 2px 4px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <item.icon style={{ width: '14px', height: '14px', color: '#16a34a' }} />
                  <span>{item.name}</span>
                </a>
              ))}
            </nav>

            {/* Actions - Sempre visíveis */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Botão Entrar - SEMPRE VISÍVEL */}
              <Link
                href="/login"
                className="login-button"
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.35)',
                  whiteSpace: 'nowrap'
                }}
              >
                <Key style={{ width: '16px', height: '16px' }} />
                <span>Entrar</span>
              </Link>
              
              {/* Botão Dia/Noite */}
              <button
                onClick={toggleTheme}
                style={{ 
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#4b5563' : '#cbd5e1'}`,
                  backgroundColor: isDark ? '#1e293b' : '#f3f4f6',
                  color: isDark ? '#fbbf24' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isDark 
                    ? '0 2px 4px rgba(0,0,0,0.3)' 
                    : '0 2px 4px rgba(0,0,0,0.05)',
                  flexShrink: 0
                }}
                title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              >
                {isDark ? <Sun style={{ width: '20px', height: '20px' }} /> : <Moon style={{ width: '20px', height: '20px' }} />}
              </button>

              {/* Menu Hamburger - Apenas mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="menu-mobile-btn"
                style={{ 
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#4b5563' : '#cbd5e1'}`,
                  backgroundColor: isDark ? '#1e293b' : '#f3f4f6',
                  color: isDark ? '#e2e8f0' : '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isDark 
                    ? '0 2px 4px rgba(0,0,0,0.3)' 
                    : '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                {mobileMenuOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
              </button>
            </div>
          </div>

          {/* Menu Mobile Dropdown */}
          {mobileMenuOpen && (
            <div 
              className="mobile-menu"
              style={{
                position: 'absolute',
                top: '72px',
                left: 0,
                right: 0,
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {navItems.map((item) => (
                <a 
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ 
                    fontSize: '15px', 
                    fontWeight: 600,
                    color: isDark ? '#e2e8f0' : '#374151',
                    textDecoration: 'none',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? '#0f172a' : '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <item.icon style={{ width: '18px', height: '18px', color: '#16a34a' }} />
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* CSS para responsividade */}
      <style jsx global>{`
        /* Mobile primeiro */
        .logo-text-desktop {
          display: none !important;
        }
        .nav-desktop {
          display: none !important;
        }
        .menu-mobile-btn {
          display: flex !important;
        }
        .watermark-word {
          display: none !important;
        }
        
        /* Tablet (768px+) */
        @media (min-width: 768px) {
          .logo-text-desktop {
            display: inline !important;
          }
          .menu-mobile-btn {
            display: none !important;
          }
          .nav-desktop {
            display: flex !important;
          }
          .watermark-word {
            display: inline !important;
          }
        }
        
        /* Desktop (1024px+) */
        @media (min-width: 1024px) {
          .logo-text-desktop {
            font-size: 28px !important;
          }
        }

        /* Efeitos de Hover */
        
        /* Cards de Recursos */
        .feature-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .feature-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 40px rgba(22, 163, 74, 0.25) !important;
        }

        /* Card Plano Básico */
        .plan-card-basic {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .plan-card-basic:hover {
          transform: translateY(-6px) scale(1.03);
          background-color: #16a34a !important;
          color: white !important;
          box-shadow: 0 25px 50px rgba(22, 163, 74, 0.4) !important;
        }
        .plan-card-basic:hover * {
          color: white !important;
        }
        .plan-card-basic:hover .check-icon {
          color: white !important;
        }
        .plan-card-basic:hover button {
          background-color: white !important;
          color: #16a34a !important;
        }

        /* Card Plano Ilimitado */
        .plan-card-premium {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .plan-card-premium:hover {
          transform: translateY(-6px) scale(1.03);
          background-color: #16a34a !important;
          color: white !important;
          box-shadow: 0 30px 60px rgba(22, 163, 74, 0.6) !important;
          filter: brightness(1.1);
        }
        .plan-card-premium:hover * {
          color: white !important;
        }
        .plan-card-premium:hover .check-icon {
          color: white !important;
        }
        .plan-card-premium:hover button {
          background-color: white !important;
          color: #16a34a !important;
        }

        /* Botões CTA */
        .cta-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cta-button:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(22, 163, 74, 0.6) !important;
          filter: brightness(1.1);
        }

        /* Botão WhatsApp */
        .whatsapp-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .whatsapp-button:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(37, 211, 102, 0.6) !important;
          filter: brightness(1.1);
        }

        /* Botão Entrar */
        .login-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .login-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(22, 163, 74, 0.5) !important;
          filter: brightness(1.15);
        }

        /* Botão nav items */
        .nav-item {
          transition: all 0.2s ease;
        }
        .nav-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3) !important;
        }
      `}</style>

      {/* HERO */}
      <section style={{ paddingTop: '140px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Badge */}
          <div style={{ 
            display: 'inline-block', 
            padding: '10px 20px', 
            borderRadius: '9999px', 
            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
            color: isDark ? 'var(--foreground)' : 'var(--foreground)',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '32px',
            border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0'}`
          }}>
            ✨ A solução completa para gabinetes parlamentares
          </div>

          {/* Title com efeito 3D */}
          <h1 style={{ 
            fontSize: 'clamp(32px, 8vw, 64px)', 
            fontWeight: 900, 
            lineHeight: 1.1, 
            marginBottom: '24px',
            letterSpacing: '-0.03em'
          }}>
            <span style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>Plataforma para </span>
            <span style={{ 
              color: '#16a34a',
              textShadow: isDark 
                ? '2px 2px 0 #0f172a, 4px 4px 0 rgba(22, 163, 74, 0.3)' 
                : '2px 2px 0 #ffffff, 4px 4px 0 rgba(22, 163, 74, 0.2)'
            }}>
              Gestão de Providências
            </span>
            <span style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}> Parlamentares</span>
          </h1>

          {/* Subtitle */}
          <p style={{ 
            fontSize: 'clamp(16px, 4vw, 20px)', 
            color: isDark ? '#94a3b8' : '#64748b', 
            maxWidth: '700px', 
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Organize, acompanhe e gerencie todas as demandas do seu gabinete em um único lugar. 
            Mais eficiência, transparência e resultados para o cidadão.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
            <button
              onClick={() => setShowContactForm(true)}
              className="cta-button"
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                backgroundColor: '#16a34a',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
                width: '100%',
                maxWidth: '300px',
                justifyContent: 'center'
              }}
            >
              Solicitar Demonstração
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </button>
            
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-button"
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                backgroundColor: '#25D366',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
                width: '100%',
                maxWidth: '300px',
                justifyContent: 'center'
              }}
            >
              <MessageCircle style={{ width: '20px', height: '20px' }} />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" style={{ padding: '80px 16px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, marginBottom: '16px' }}>
              Recursos <span style={{ color: '#16a34a' }}>Completos</span>
            </h2>
            <p style={{ fontSize: '18px', color: isDark ? '#94a3b8' : '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Tudo que seu gabinete precisa para uma gestão eficiente
            </p>
          </div>
          
          <div className="features-grid" style={{ 
            display: 'grid', 
            gap: '24px'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card"
                style={{
                  padding: '32px',
                  borderRadius: '20px',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '14px', 
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <feature.icon style={{ width: '28px', height: '28px', color: '#16a34a' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ fontSize: '15px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6, flex: 1 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" style={{ padding: '80px 16px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, marginBottom: '16px' }}>
              Planos <span style={{ color: '#16a34a' }}>Flexíveis</span>
            </h2>
            <p style={{ fontSize: '18px', color: isDark ? '#94a3b8' : '#64748b' }}>
              Escolha o plano ideal para seu gabinete
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px' 
          }}>
            {/* Plano Básico */}
            <div className="plan-card-basic" style={{
              padding: '32px',
              borderRadius: '20px',
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Básico</h3>
              <p style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '24px' }}>Para gabinetes menores</p>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>Consulte</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
                {planoBasico.map((item, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '15px' }}>
                    <Check className="check-icon" style={{ width: '18px', height: '18px', color: '#16a34a' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowContactForm(true)}
                style={{ 
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: isDark ? '#334155' : '#f1f5f9',
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  fontWeight: 600,
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Começar Agora
              </button>
            </div>

            {/* Plano Ilimitado */}
            <div className="plan-card-premium" style={{
              padding: '32px',
              borderRadius: '20px',
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: '#fbbf24',
                color: '#1e293b',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                POPULAR
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Ilimitado</h3>
              <p style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '24px' }}>Para gabinetes de qualquer porte</p>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '24px', fontWeight: 700 }}>Consulte</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
                {planoIlimitado.map((item, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '15px' }}>
                    <Check className="check-icon" style={{ width: '18px', height: '18px', color: '#16a34a' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowContactForm(true)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: isDark ? '#334155' : '#f1f5f9',
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  fontWeight: 600,
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Começar Agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" style={{ padding: '80px 16px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, marginBottom: '24px' }}>
            Sobre o <span style={{ color: '#16a34a' }}>ProviDATA</span>
          </h2>
          <p style={{ fontSize: '18px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.8, marginBottom: '32px' }}>
            O ProviDATA é uma solução desenvolvida pela <strong>DATA-RO Inteligência Territorial</strong> especialmente 
            para gabinetes parlamentares que buscam modernizar e otimizar a gestão de providências e demandas dos cidadãos.
          </p>
          <p style={{ fontSize: '18px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.8 }}>
            Com anos de experiência em soluções tecnológicas para o setor público, entendemos as necessidades 
            específicas dos gabinetes e desenvolvemos uma plataforma completa, segura e fácil de usar.
          </p>
        </div>
      </section>

      {/* CONTATO / CTA */}
      <section id="contato" style={{ padding: '80px 16px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, marginBottom: '24px' }}>
            Pronto para <span style={{ color: '#16a34a' }}>Começar</span>?
          </h2>
          <p style={{ fontSize: '18px', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '40px' }}>
            Entre em contato conosco e solicite uma demonstração gratuita
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
            <button
              onClick={() => setShowContactForm(true)}
              className="cta-button"
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                backgroundColor: '#16a34a',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
                width: '100%',
                maxWidth: '300px',
                justifyContent: 'center'
              }}
            >
              <Mail style={{ width: '20px', height: '20px' }} />
              Solicitar Contato
            </button>
            
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-button"
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                backgroundColor: '#25D366',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
                width: '100%',
                maxWidth: '300px',
                justifyContent: 'center'
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
        padding: '40px 16px', 
        borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <Image 
              src="/providata-logo-final.png" 
              alt="ProviDATA" 
              width={40} 
              height={40}
              style={{ objectFit: 'contain' }}
            />
            <span className="text-providata-gradient" style={{ fontWeight: 800, fontSize: '24px' }}>ProviDATA</span>
          </div>
          <p style={{ fontSize: '14px', color: isDark ? '#64748b' : '#94a3b8', marginBottom: '8px' }}>
            Sistema de Gestão de Providências Parlamentares
          </p>
          <p style={{ fontSize: '13px', color: isDark ? '#475569' : '#cbd5e1' }}>
            © {new Date().getFullYear()} DATA-RO Inteligência Territorial. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* MODAL DE CONTATO */}
      {showContactForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Solicitar Demonstração</h3>
              <button
                onClick={() => setShowContactForm(false)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? '#334155' : '#f1f5f9',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#94a3b8' : '#64748b'
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitLead} style={{ padding: '24px' }}>
              {formStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    backgroundColor: '#dcfce7', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <Check style={{ width: '32px', height: '32px', color: '#16a34a' }} />
                  </div>
                  <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Mensagem Enviada!</h4>
                  <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Entraremos em contato em breve.</p>
                </div>
              ) : (
                <>
                  {/* Campo Honeypot - invisível para usuários, visível para bots */}
                  <input
                    type="text"
                    name="email_confirm"
                    value={formData.email_confirm}
                    onChange={(e) => setFormData({...formData, email_confirm: e.target.value})}
                    style={{ 
                      position: 'absolute',
                      left: '-9999px',
                      opacity: 0,
                      height: 0,
                      width: 0
                    }}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                        backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Cargo/Função *</label>
                    <input
                      type="text"
                      required
                      value={formData.cargo}
                      onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                      placeholder="Ex: Deputado Estadual, Assessor..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                        backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>E-mail *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                        backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Telefone/WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      placeholder="(00) 00000-0000"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                        backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        fontSize: '15px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Mensagem</label>
                    <textarea
                      value={formData.mensagem}
                      onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                      rows={3}
                      placeholder="Conte-nos sobre seu gabinete..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                        backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                        color: isDark ? '#f1f5f9' : '#1e293b',
                        fontSize: '15px',
                        resize: 'none'
                      }}
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
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '15px',
                      border: 'none',
                      cursor: formStatus === 'loading' ? 'not-allowed' : 'pointer',
                      opacity: formStatus === 'loading' ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {formStatus === 'loading' ? 'Enviando...' : 'Enviar Solicitação'}
                    {formStatus !== 'loading' && <ArrowRight style={{ width: '18px', height: '18px' }} />}
                  </button>

                  {formStatus === 'error' && (
                    <p style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', marginTop: '12px' }}>
                      Erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.
                    </p>
                  )}
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
