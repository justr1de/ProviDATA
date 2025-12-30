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
  ExternalLink
} from 'lucide-react'
import { Toaster } from 'sonner'

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
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { user, tenant, setUser, setTenant, setLoading, isLoading } = useAuthStore()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          router.push('/login')
          return
        }

        const { data: userData } = await supabase
          .from('users')
          .select('*, tenants(*)')
          .eq('id', authUser.id)
          .single()

        if (userData) {
          setUser(userData)
          setTenant(userData.tenants)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [supabase, router, setUser, setTenant, setLoading])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--muted-foreground)]">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background-secondary)] transition-colors">
      <Toaster position="top-right" richColors />
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-[var(--sidebar-border)]">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white shadow-lg">
                <Image 
                  src="/providata-logo-final.png" 
                  alt="ProviDATA" 
                  fill 
                  className="object-contain p-1"
                />
              </div>
              <div>
                <span className="font-bold text-lg text-[var(--foreground)]">ProviDATA</span>
                <p className="text-[10px] text-[var(--muted-foreground)] -mt-0.5">Gestão de Providências</p>
              </div>
            </Link>
            <button 
              className="lg:hidden p-2 hover:bg-[var(--sidebar-item-hover)] rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </div>

          {/* Tenant Info */}
          {tenant && (
            <div className="px-6 py-5 border-b border-[var(--sidebar-border)] bg-[var(--primary-muted)]">
              <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                {tenant.parlamentar_name}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] truncate mt-1">
                {tenant.cargo === 'vereador' ? 'Vereador(a)' : 
                 tenant.cargo === 'deputado_estadual' ? 'Deputado(a) Estadual' :
                 tenant.cargo === 'deputado_federal' ? 'Deputado(a) Federal' : 'Senador(a)'}
                {tenant.partido && ` · ${tenant.partido}`}
              </p>
            </div>
          )}

          {/* Main Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Menu Principal
            </p>
            <div className="space-y-1.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-600/25' 
                        : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-item-hover)]'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--muted-foreground)]'}`} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Bottom Navigation */}
          <div className="px-4 py-4 border-t border-[var(--sidebar-border)]">
            <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Sistema
            </p>
            <div className="space-y-1.5">
              {bottomNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-600/25' 
                        : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-item-hover)]'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--muted-foreground)]'}`} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Footer with DATA-RO */}
          <div className="px-6 py-4 border-t border-[var(--sidebar-border)]">
            <a 
              href="https://dataro-it.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <div className="relative w-6 h-6 rounded overflow-hidden bg-white">
                <Image 
                  src="/dataro-logo-final.png" 
                  alt="DATA-RO" 
                  fill 
                  className="object-contain p-0.5"
                />
              </div>
              <span>DATA-RO Inteligência</span>
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 transition-all duration-300" style={{ paddingLeft: isLargeScreen ? '288px' : '0' }}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]">
          <div className="flex items-center justify-between h-full px-4 md:px-6">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2.5 hover:bg-[var(--muted)] rounded-xl transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-[var(--foreground)]" />
            </button>

            <div className="flex-1" />

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <Link
                href="/dashboard/notificacoes"
                className="relative p-2.5 hover:bg-[var(--muted)] rounded-xl transition-colors hidden sm:flex"
              >
                <Bell className="w-5 h-5 text-[var(--muted-foreground)]" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-[var(--background)]" />
              </Link>

              {/* User menu */}
              <div className="relative ml-1">
                <button
                  className="flex items-center gap-2.5 p-2 hover:bg-[var(--muted)] rounded-xl transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-[var(--foreground)] max-w-[100px] truncate">
                      {user?.nome?.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      {user?.role === 'super_admin' ? 'Super Admin' : 'Usuário'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)] hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                      <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border-b border-[var(--border)]">
                        <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user?.nome}</p>
                        <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/dashboard/configuracoes"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--foreground)] rounded-xl hover:bg-[var(--muted)] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 text-[var(--muted-foreground)]" />
                          Configurações
                        </Link>
                        <button
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" />
                          Sair da conta
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
        <main className="p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-4 md:px-6 lg:px-8 py-6 border-t border-[var(--border)] text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            Desenvolvido por{' '}
            <a 
              href="https://dataro-it.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-green-600 dark:text-green-400 hover:underline"
            >
              DATA-RO INTELIGÊNCIA TERRITORIAL
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
