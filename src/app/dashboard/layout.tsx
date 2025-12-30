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
  User
} from 'lucide-react'
import { Toaster } from 'sonner'

const SIDEBAR_WIDTH = 256

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Providências', href: '/dashboard/providencias', icon: FileText },
  { name: 'Cidadãos', href: '/dashboard/cidadaos', icon: Users },
  { name: 'Órgãos', href: '/dashboard/orgaos', icon: Building2 },
  { name: 'Categorias', href: '/dashboard/categorias', icon: FolderOpen },
]

const bottomNavigation = [
  { name: 'Notificações', href: '/dashboard/notificacoes', icon: Bell },
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
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
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          height: '100%',
          width: `${SIDEBAR_WIDTH}px`,
          transform: (isDesktop || sidebarOpen) ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          backgroundColor: '#111827',
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
              color: '#9CA3AF'
            }}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        )}

        {/* Logo */}
        <div style={{ padding: '16px', borderBottom: '1px solid #374151' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <Image
                src="/providata-logo-final.png"
                alt="ProviDATA"
                width={32}
                height={32}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>ProviDATA</span>
          </Link>
        </div>

        {/* Tenant Info */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #374151' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tenant?.parlamentar_name || 'Carregando...'}
          </p>
          <p style={{ fontSize: '12px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tenant?.cargo?.replace('_', ' ') || 'deputado estadual'}
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    backgroundColor: active ? '#16a34a' : 'transparent',
                    color: active ? 'white' : '#D1D5DB',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom Navigation */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #374151' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    backgroundColor: active ? '#16a34a' : 'transparent',
                    color: active ? 'white' : '#D1D5DB',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #374151' }}>
          <a 
            href="https://dataro-it.com.br" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontSize: '12px', color: '#6B7280', textDecoration: 'none' }}
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
          transition: 'margin-left 0.3s ease'
        }}
      >
        {/* Header */}
        <header 
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            backgroundColor: 'var(--card)',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', padding: '0 16px' }}>
            {/* Mobile menu button */}
            {!isDesktop && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ThemeToggle />
              
              {/* Notifications */}
              <Link 
                href="/dashboard/notificacoes"
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  color: 'var(--foreground-muted)',
                  textDecoration: 'none'
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
                    gap: '8px',
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User style={{ width: '16px', height: '16px', color: 'white' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>
                    {user?.nome?.split(' ')[0] || 'Usuário'}
                  </span>
                  <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--foreground-muted)' }} />
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
                      width: '192px',
                      backgroundColor: 'var(--card)',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      border: '1px solid var(--border)',
                      zIndex: 50
                    }}>
                      <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.nome || 'Usuário'}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.email}
                        </p>
                      </div>
                      <div style={{ padding: '4px' }}>
                        <Link
                          href="/dashboard/configuracoes"
                          onClick={() => setUserMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            fontSize: '14px',
                            color: 'var(--foreground)',
                            textDecoration: 'none',
                            borderRadius: '6px'
                          }}
                        >
                          <Settings style={{ width: '16px', height: '16px' }} />
                          Configurações
                        </Link>
                        <button
                          onClick={handleLogout}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            fontSize: '14px',
                            color: '#dc2626',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            width: '100%',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <LogOut style={{ width: '16px', height: '16px' }} />
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
        <main style={{ flex: 1, padding: isDesktop ? '24px' : '16px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
