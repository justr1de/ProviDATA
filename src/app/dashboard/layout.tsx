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
  User,
  FileBarChart,
  Shield,
  Palette,
  ImageIcon
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

const bottomNavigation = [
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
  const [isDesktop, setIsDesktop] = useState(false)
  const [customBgImage, setCustomBgImage] = useState<string | null>(null)
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#16a34a')
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  
  const { user, tenant, setUser, setTenant, reset } = useAuthStore()

  // Detectar largura da tela
  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  // Carregar configurações de personalização
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

      {/* Sidebar */}
      <aside 
        className="sidebar-themed"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          height: '100%',
          width: `${SIDEBAR_WIDTH}px`,
          transform: (isDesktop || sidebarOpen) ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease, background-color 0.3s ease',
          borderRightWidth: '1px',
          borderRightStyle: 'solid',
          display: 'flex',
          flexDirection: 'column'
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
              color: 'inherit'
            }}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        )}

        {/* Logo */}
        <div style={{ padding: '20px', borderBottom: '1px solid' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Image
                src="/providata-logo-final.png"
                alt="ProviDATA"
                width={36}
                height={36}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span className="sidebar-text" style={{ fontSize: '20px', fontWeight: 'bold' }}>ProviDATA</span>
          </Link>
        </div>

        {/* Tenant Info */}
        <div className="sidebar-accent" style={{ padding: '16px 20px', borderBottom: '1px solid' }}>
          <p className="sidebar-text" style={{ fontSize: '15px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
            {tenant?.parlamentar_name || 'Carregando...'}
          </p>
          <p className="sidebar-muted" style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tenant?.cargo?.replace('_', ' ') || 'deputado estadual'}
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: active ? '600' : '500',
                    textDecoration: 'none',
                    backgroundColor: active ? customPrimaryColor : 'transparent',
                    color: active ? 'white' : 'inherit',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 2px 8px rgba(22, 163, 74, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <Icon style={{ width: '22px', height: '22px', flexShrink: 0 }} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom Navigation */}
        <div style={{ padding: '16px', borderTop: '1px solid' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {bottomNavigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: active ? '600' : '500',
                    textDecoration: 'none',
                    backgroundColor: active ? customPrimaryColor : 'transparent',
                    color: active ? 'white' : 'inherit',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 2px 8px rgba(22, 163, 74, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <Icon style={{ width: '22px', height: '22px', flexShrink: 0 }} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-accent" style={{ padding: '16px 20px', borderTop: '1px solid' }}>
          <a 
            href="https://dataro-it.com.br" 
            target="_blank" 
            rel="noopener noreferrer"
            className="sidebar-muted"
            style={{ fontSize: '12px', textDecoration: 'none' }}
          >
            DATA-RO Inteligência Territorial
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
          backgroundColor: customBgImage ? 'rgba(var(--background-rgb), 0.95)' : 'transparent'
        }}
      >
        {/* Header */}
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
                        <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.nome || 'Usuário'}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
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
          {children}
        </main>
      </div>
    </div>
  )
}
