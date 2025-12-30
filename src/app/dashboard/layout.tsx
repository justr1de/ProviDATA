'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Building2, 
  FolderOpen,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  User,
  FileBarChart,
  Shield,
  Palette,
  Copyright
} from 'lucide-react'
import { Toaster } from 'sonner'

const SIDEBAR_WIDTH = 280

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Providências', href: '/dashboard/providencias', icon: FileText },
  { name: 'Cidadãos', href: '/dashboard/cidadaos', icon: Users },
  { name: 'Órgãos', href: '/dashboard/orgaos', icon: Building2 },
  { name: 'Categorias', href: '/dashboard/categorias', icon: FolderOpen },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: FileBarChart },
]

const adminNavigation = [
  { name: 'Notificações', href: '/dashboard/notificacoes', icon: Bell },
  { name: 'Administração', href: '/dashboard/administracao', icon: Shield },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [adminExpanded, setAdminExpanded] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [customBgImage, setCustomBgImage] = useState<string | null>(null)
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#16a34a')
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  
  const { user, tenant, setUser, setTenant, reset } = useAuthStore()

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  useEffect(() => {
    const savedBgImage = localStorage.getItem('providata-bg-image')
    const savedPrimaryColor = localStorage.getItem('providata-primary-color')
    
    if (savedBgImage) setCustomBgImage(savedBgImage)
    if (savedPrimaryColor) setCustomPrimaryColor(savedPrimaryColor)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*, tenant:tenants(*)')
        .eq('id', authUser.id)
        .single()

      if (userData) {
        setUser(userData)
        if (userData.tenant) {
          setTenant(userData.tenant)
        }
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    reset()
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  // Estilos CSS para efeito de brilho e animação de spin
  const glowStyle = `
    @keyframes glow {
      0% { box-shadow: 0 0 5px rgba(22, 163, 74, 0.3); }
      50% { box-shadow: 0 0 20px rgba(22, 163, 74, 0.6), 0 0 30px rgba(22, 163, 74, 0.4); }
      100% { box-shadow: 0 0 5px rgba(22, 163, 74, 0.3); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .nav-button:hover:not(.active) {
      animation: glow 1.5s ease-in-out infinite;
      background: linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0.2) 100%) !important;
    }
    .nav-button.active {
      box-shadow: 0 4px 15px rgba(22, 163, 74, 0.4);
    }
  `

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--background)',
        backgroundImage: customBgImage ? `url(${customBgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <style>{glowStyle}</style>
      <Toaster position="top-right" richColors />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Sempre escura */}
      <aside 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          height: '100%',
          width: `${SIDEBAR_WIDTH}px`,
          transform: (isDesktop || sidebarOpen) ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
        }}
      >
        {/* Close button for mobile */}
        {!isDesktop && sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        )}

        {/* Logo ProviDATA - Sem fundo branco, preenche o espaço */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Link href="/dashboard" style={{ display: 'block', textDecoration: 'none', width: '100%' }}>
            <Image
              src="/providata-logo-final.png"
              alt="ProviDATA"
              width={240}
              height={70}
              style={{ 
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(22, 163, 74, 0.3))'
              }}
              priority
            />
          </Link>
        </div>

        {/* Tenant Info */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(22, 163, 74, 0.1)'
        }}>
          <p style={{ 
            fontSize: '15px', 
            fontWeight: '600', 
            color: 'white',
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap', 
            marginBottom: '4px',
            margin: 0
          }}>
            {tenant?.parlamentar_name || 'Carregando...'}
          </p>
          <p style={{ 
            fontSize: '13px', 
            color: 'rgba(255,255,255,0.6)',
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            margin: '4px 0 0 0'
          }}>
            {tenant?.cargo?.replace('_', ' ') || 'deputado estadual'}
          </p>
        </div>

        {/* Navigation - Botões com ícones e efeito de brilho */}
        <nav style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`nav-button ${active ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: active ? '600' : '500',
                    textDecoration: 'none',
                    backgroundColor: active ? customPrimaryColor : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    border: active ? 'none' : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <Icon style={{ width: '20px', height: '20px' }} />
                  </div>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Admin Section - Escondível */}
        <div style={{ 
          padding: '0 16px 16px', 
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={() => setAdminExpanded(!adminExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '14px 18px',
              marginTop: '16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings style={{ width: '18px', height: '18px' }} />
              Administração
            </span>
            {adminExpanded ? (
              <ChevronUp style={{ width: '18px', height: '18px' }} />
            ) : (
              <ChevronDown style={{ width: '18px', height: '18px' }} />
            )}
          </button>

          {adminExpanded && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px',
              marginTop: '8px',
              paddingLeft: '8px',
              borderLeft: '2px solid rgba(22, 163, 74, 0.3)'
            }}>
              {adminNavigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`nav-button ${active ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: active ? '600' : '500',
                      textDecoration: 'none',
                      backgroundColor: active ? customPrimaryColor : 'transparent',
                      color: 'white',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Icon style={{ width: '18px', height: '18px' }} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer - Logo DATA-RO visível, sem quebra de linha */}
        <div style={{ 
          padding: '16px 20px', 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <a 
            href="https://dataro-it.com.br" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <Image
                src="/dataro-logo.png"
                alt="DATA-RO"
                width={20}
                height={20}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span style={{ 
              fontSize: '11px', 
              color: 'rgba(255,255,255,0.6)',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              DATA-RO Inteligência Territorial
            </span>
            <Copyright style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
          </a>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div 
        style={{
          marginLeft: isDesktop ? `${SIDEBAR_WIDTH}px` : '0',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.3s ease',
          backgroundColor: 'var(--background)'
        }}
      >
        {/* Header - Cores padronizadas */}
        <header 
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            backgroundColor: 'var(--card)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', padding: isDesktop ? '0 24px' : '0 12px' }}>
            {/* Mobile menu button */}
            {!isDesktop && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--muted)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--foreground-muted)'
                }}
              >
                <Menu style={{ width: '24px', height: '24px' }} />
              </button>
            )}

            {/* Spacer for desktop */}
            {isDesktop && <div />}

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: isDesktop ? '16px' : '8px' }}>
              <ThemeToggle />
              
              {/* Notifications */}
              <Link 
                href="/dashboard/notificacoes"
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  color: 'var(--foreground-muted)',
                  textDecoration: 'none',
                  backgroundColor: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bell style={{ width: '20px', height: '20px' }} />
              </Link>

              {/* User menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--muted)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: customPrimaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User style={{ width: '18px', height: '18px', color: 'white' }} />
                  </div>
                  {isDesktop && (
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--foreground)' }}>
                      {user?.nome?.split(' ')[0] || 'Usuário'}
                    </span>
                  )}
                  <ChevronDown style={{ width: '18px', height: '18px', color: 'var(--foreground-muted)' }} />
                </button>

                {userMenuOpen && (
                  <>
                    <div 
                      style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      marginTop: '8px',
                      width: '220px',
                      backgroundColor: 'var(--card)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
                      border: '1px solid var(--border)',
                      zIndex: 50,
                      overflow: 'hidden'
                    }}>
                      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                        <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                          {user?.nome || 'Usuário'}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '2px 0 0 0' }}>
                          {user?.email}
                        </p>
                      </div>
                      <div style={{ padding: '8px' }}>
                        <Link
                          href="/dashboard/configuracoes"
                          onClick={() => setUserMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 14px',
                            fontSize: '14px',
                            color: 'var(--foreground)',
                            textDecoration: 'none',
                            borderRadius: '8px'
                          }}
                        >
                          <Settings style={{ width: '18px', height: '18px' }} />
                          Configurações
                        </Link>
                        <Link
                          href="/dashboard/configuracoes/aparencia"
                          onClick={() => setUserMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 14px',
                            fontSize: '14px',
                            color: 'var(--foreground)',
                            textDecoration: 'none',
                            borderRadius: '8px'
                          }}
                        >
                          <Palette style={{ width: '18px', height: '18px' }} />
                          Aparência
                        </Link>
                        <button
                          onClick={handleLogout}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 14px',
                            fontSize: '14px',
                            color: '#dc2626',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            width: '100%',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <LogOut style={{ width: '18px', height: '18px' }} />
                          Sair
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: isDesktop ? '32px' : '20px', paddingBottom: '40px' }}>
          {/* Cabeçalho Global - ProviDATA */}
          <div style={{
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border)'
          }}>
            <h1 style={{
              fontSize: isDesktop ? '24px' : '18px',
              fontWeight: '700',
              color: 'var(--foreground)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ProviDATA
              </span>
              <span style={{ color: 'var(--foreground-muted)', fontWeight: '400' }}>—</span>
              <span style={{ fontWeight: '500', color: 'var(--foreground-secondary)' }}>
                Gestão de Pedidos de Providência
              </span>
            </h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
