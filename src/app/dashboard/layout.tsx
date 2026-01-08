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
  Copyright,
  MapPin,
  Files
} from 'lucide-react'
import { Toaster } from 'sonner'

const SIDEBAR_WIDTH = 280

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Providências', href: '/dashboard/providencias', icon: FileText },
  { name: 'Cidadãos', href: '/dashboard/cidadaos', icon: Users },
  { name: 'Documentos', href: '/dashboard/documentos', icon: Files },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: FileBarChart },
  { name: 'Mapa de Calor', href: '/dashboard/mapa-calor', icon: MapPin },
  { name: 'Categorias', href: '/dashboard/categorias', icon: FolderOpen },
  { name: 'Órgãos', href: '/dashboard/orgaos', icon: Building2 }
]

const adminNavigation = [
  { name: 'Notificações', href: '/dashboard/notificacoes', icon: Bell },
  { name: 'Administração', href: '/dashboard/administracao', icon: Shield },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings }
]

// Cargo mapping constants for role display
const PARLIAMENTARY_CARGO_LABELS: Record<string, string> = {
  deputado_estadual: 'Deputado',
  deputado_federal: 'Deputado',
  vereador: 'Vereador',
  senador: 'Senador',
  prefeito: 'Prefeito',
  governador: 'Governador',
  admin: 'Administrador',
  super_admin: 'Super Administrador'
}

const SYSTEM_ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  assessor: 'Assessor',
  operador: 'Operador',
  visualizador: 'Visualizador'
}

// Helper function to get user display role/position
// TODO: Consider extracting cargo mapping to shared utility if reused elsewhere
// TODO: Move super admin email to environment variable for security
function getUserDisplayRole(
  user: { role?: string; email?: string } | null,
  gabinete: { parlamentar_cargo?: string } | null
): string {
  // Super Admin
  if (user?.role === 'super_admin' || user?.email === 'contato@dataro-it.com.br') {
    return 'Administrador'
  }

  // Parliamentary positions from gabinete
  if (gabinete?.parlamentar_cargo) {
    return PARLIAMENTARY_CARGO_LABELS[gabinete.parlamentar_cargo] || 'Parlamentar'
  }

  // Fallback to system role
  return SYSTEM_ROLE_LABELS[user?.role || ''] || 'Usuário'
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [adminExpanded, setAdminExpanded] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [customBgImage, setCustomBgImage] = useState<string | null>(null)
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#16a34a')
  const [allGabinetes, setAllGabinetes] = useState<any[]>([])
  const [showGabineteSelector, setShowGabineteSelector] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const { user, gabinete, setUser, setGabinete, reset } = useAuthStore()

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
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userData) {
        setUser(userData)
        
        // Verificar se é super admin e se há gabinete selecionado no localStorage
        const isSuperAdmin = userData.role === 'super_admin' || authUser.email === 'contato@dataro-it.com.br'
        const savedGabineteId = localStorage.getItem('selectedGabineteId')
        
        // Se for super admin e tiver gabinete salvo no localStorage, usar esse
        if (isSuperAdmin && savedGabineteId) {
          const { data: gabineteData } = await supabase
            .from('gabinetes')
            .select('*')
            .eq('id', savedGabineteId)
            .single()
          
          if (gabineteData) {
            setGabinete(gabineteData)
          }
        } else if (userData.gabinete_id) {
          // Senão, buscar gabinete do usuário usando a VIEW tenants
          const { data: gabineteData } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', userData.gabinete_id)
            .single()
          
          if (gabineteData) {
            setGabinete(gabineteData)
          }
        }

        // Se for super admin, carregar todos os gabinetes
        if (isSuperAdmin) {
          const { data: gabinetes } = await supabase
            .from('gabinetes')
            .select('id, nome, parlamentar_nome, municipio, uf, ativo')
            .eq('ativo', true)
            .order('nome')
          
          if (gabinetes) {
            setAllGabinetes(gabinetes)
          }
        }
      }
    }

    checkAuth()
  }, [router, setGabinete, setUser, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    reset()
    router.push('/login')
  }

  // Função para trocar de gabinete (super admin)
  const handleSwitchGabinete = async (gabineteId: string) => {
    const selectedGabinete = allGabinetes.find(g => g.id === gabineteId)
    if (selectedGabinete) {
      // Buscar dados completos do gabinete
      const { data: gabineteData } = await supabase
        .from('gabinetes')
        .select('*')
        .eq('id', gabineteId)
        .single()
      
      if (gabineteData) {
        // Salvar no localStorage para persistência
        // Usar o ID do gabineteData para garantir consistência
        localStorage.setItem('selectedGabineteId', gabineteData.id)
        localStorage.setItem('selectedGabinete', JSON.stringify(gabineteData))
        
        setGabinete(gabineteData)
        setShowGabineteSelector(false)
        // Recarregar a página para atualizar os dados
        window.location.reload()
      }
    }
  }

  // Verificar se é super admin
  const isSuperAdmin = user?.role === 'super_admin' || user?.email === 'contato@dataro-it.com.br'

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

      {/* Sidebar - Tema responsivo */}
      <aside
        className="sidebar-theme"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          height: '100%',
          width: `${SIDEBAR_WIDTH}px`,
          transform: isDesktop || sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
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
              color: 'white'
            }}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        )}

        {/* Logo ProviDATA - Ocupa todo o espaço do cabeçalho */}
        <div
          className="sidebar-logo-container"
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            borderBottom: '1px solid rgba(22, 163, 74, 0.2)'
          }}
        >
          <Link 
            href="/dashboard" 
            className="logo-link"
            style={{ 
              display: 'block', 
              textDecoration: 'none', 
              width: '100%'
            }}
          >
            <div className="logo-wrapper">
              <Image
                src="/providata-logo-final.png"
                alt="ProviDATA"
                width={280}
                height={100}
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'cover',
                  display: 'block'
                }}
                priority
              />
            </div>
          </Link>
        </div>

        {/* Gabinete Info */}
        <div
          className="sidebar-gabinete"
          style={{
            padding: '16px 20px'
          }}
        >
          <p
            className="sidebar-gabinete-name"
            style={{
              fontSize: '11px',
              fontWeight: '600',
              overflow: 'visible',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              lineHeight: '1.4',
              marginBottom: '4px',
              margin: 0
            }}
          >
            {gabinete
              ? gabinete.parlamentar_cargo === 'admin' || gabinete.parlamentar_cargo === 'super_admin'
                ? gabinete.nome || 'Administração do Sistema'
                : `Gabinete do ${(gabinete.parlamentar_cargo?.replace('_', ' ') || 'deputado estadual')
                    .charAt(0)
                    .toUpperCase() + (gabinete.parlamentar_cargo?.replace('_', ' ') || 'deputado estadual').slice(1)} ${
                    gabinete.parlamentar_nome
                  }`
              : 'Carregando...'}
          </p>
          <p
            className="sidebar-gabinete-cargo"
            style={{
              fontSize: '13px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              margin: '4px 0 0 0'
            }}
          >
            {(() => {
              const cargo = gabinete?.parlamentar_cargo
              if (cargo === 'admin') return 'Administrador'
              if (cargo === 'super_admin') return 'Super Administrador'
              const cargoFormatado = cargo?.replace('_', ' ') || 'deputado estadual'
              return cargoFormatado.charAt(0).toUpperCase() + cargoFormatado.slice(1)
            })()}
          </p>
          
          {/* Seletor de Gabinetes - Apenas para Super Admin */}
          {isSuperAdmin && allGabinetes.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <button
                onClick={() => setShowGabineteSelector(!showGabineteSelector)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(22, 163, 74, 0.15)',
                  border: '1px solid rgba(22, 163, 74, 0.3)',
                  borderRadius: '8px',
                  color: '#22c55e',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>Trocar Gabinete</span>
                {showGabineteSelector ? (
                  <ChevronUp style={{ width: '16px', height: '16px' }} />
                ) : (
                  <ChevronDown style={{ width: '16px', height: '16px' }} />
                )}
              </button>
              
              {showGabineteSelector && (
                <div
                  style={{
                    marginTop: '8px',
                    backgroundColor: 'var(--background-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  {allGabinetes.map((gab) => (
                    <button
                      key={gab.id}
                      onClick={() => handleSwitchGabinete(gab.id)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: gabinete?.id === gab.id ? 'rgba(22, 163, 74, 0.2)' : 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--border)',
                        color: gabinete?.id === gab.id ? '#22c55e' : 'var(--foreground)',
                        fontSize: '11px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (gabinete?.id !== gab.id) {
                          e.currentTarget.style.backgroundColor = 'rgba(22, 163, 74, 0.1)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (gabinete?.id !== gab.id) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                        {gab.parlamentar_nome || gab.nome}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--foreground-muted)' }}>
                        {gab.municipio}/{gab.uf}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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
                  className={`sidebar-nav-item ${active ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: active ? '600' : '500',
                    textDecoration: 'none',
                    backgroundColor: active ? customPrimaryColor : undefined,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div
                    className="sidebar-nav-icon"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      backgroundColor: active ? 'rgba(255,255,255,0.2)' : undefined
                    }}
                  >
                    <Icon style={{ width: '20px', height: '20px' }} />
                  </div>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Admin Section - Escondível */}
        <div
          className="sidebar-admin-section"
          style={{
            padding: '0 16px 16px'
          }}
        >
          <button
            onClick={() => setAdminExpanded(!adminExpanded)}
            className="sidebar-admin-button"
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
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings style={{ width: '18px', height: '18px' }} />
              Administração
            </span>
            {adminExpanded ? <ChevronUp style={{ width: '18px', height: '18px' }} /> : <ChevronDown style={{ width: '18px', height: '18px' }} />}
          </button>

          {adminExpanded && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginTop: '8px',
                paddingLeft: '8px',
                borderLeft: '2px solid rgba(22, 163, 74, 0.3)'
              }}
            >
              {adminNavigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`sidebar-nav-item ${active ? 'active' : ''}`}
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

        {/* Footer - Logo DATA-RO visível */}
        <div
          className="sidebar-footer"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <a
            href="https://dataro-it.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-footer-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <Image
              src="/dataro-logo-final.png"
              alt="DATA-RO"
              width={32}
              height={32}
              style={{
                objectFit: 'contain',
                flexShrink: 0
              }}
            />
            <span
              className="sidebar-footer-text"
              style={{
                fontSize: '11px',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
            >
              DATA-RO Inteligência Territorial
            </span>
            <Copyright className="sidebar-footer-icon" style={{ width: '12px', height: '12px', flexShrink: 0 }} />
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '60px',
              padding: isDesktop ? '0 24px' : '0 12px'
            }}
          >
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

            {/* Slogan centralizado */}
            {isDesktop && (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <p style={{ 
                  fontSize: '11px', 
                  fontWeight: '500', 
                  color: 'var(--foreground-muted)',
                  margin: 0,
                  letterSpacing: '0.5px'
                }}>
                  A <span style={{ color: customPrimaryColor, fontWeight: '700' }}>EVOLUÇÃO</span> da OUVIDORIA, em <span style={{ color: customPrimaryColor, fontWeight: '700' }}>QUALQUER LUGAR</span> e à <span style={{ color: customPrimaryColor, fontWeight: '700' }}>QUALQUER HORA</span>
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: 'var(--foreground)',
                  margin: '2px 0 0 0'
                }}>
                  <span style={{ color: customPrimaryColor }}>ProviDATA</span> <span style={{ color: 'var(--foreground-muted)', fontWeight: '400' }}>—</span> Gestão de Pedidos de Providência
                </p>
              </div>
            )}

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
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: customPrimaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <User style={{ width: '18px', height: '18px', color: 'white' }} />
                  </div>
                  {isDesktop && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--foreground)', lineHeight: '1.2' }}>
                        {user?.nome?.split(' ')[0] || 'Usuário'}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--foreground-muted)', lineHeight: '1.2' }}>
                        {getUserDisplayRole(user, gabinete)}
                      </span>
                    </div>
                  )}
                  <ChevronDown style={{ width: '18px', height: '18px', color: 'var(--foreground-muted)' }} />
                </button>

                {userMenuOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setUserMenuOpen(false)} />
                    <div
                      style={{
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
                      }}
                    >
                      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                        <p
                          style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'var(--foreground)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            margin: 0
                          }}
                        >
                          {user?.nome || 'Usuário'}
                        </p>
                        <p
                          style={{
                            fontSize: '12px',
                            color: customPrimaryColor,
                            fontWeight: '600',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            margin: '4px 0 0 0'
                          }}
                        >
                          {getUserDisplayRole(user, gabinete)}
                        </p>
                        <p
                          style={{
                            fontSize: '13px',
                            color: 'var(--foreground-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            margin: '2px 0 0 0'
                          }}
                        >
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
        <main
          style={{
            flex: 1,
            paddingTop: isDesktop ? '32px' : '20px',
            paddingLeft: isDesktop ? '32px' : '20px',
            paddingRight: isDesktop ? '32px' : '20px',
            paddingBottom: '40px'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}