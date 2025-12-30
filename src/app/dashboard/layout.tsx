'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
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

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Providências', href: '/dashboard/providencias', icon: FileText },
  { name: 'Cidadãos', href: '/dashboard/cidadaos', icon: Users },
  { name: 'Órgãos', href: '/dashboard/orgaos', icon: Building2 },
  { name: 'Categorias', href: '/dashboard/categorias', icon: FolderOpen },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { user, tenant, setUser, setTenant, setLoading, isLoading } = useAuthStore()

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0)
  }, [pathname])

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
          <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-[var(--background)] border-r border-[var(--border)]
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-[var(--border)]">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-[var(--foreground)]">ProviDATA</span>
            </Link>
            <button 
              className="lg:hidden p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tenant info */}
          {tenant && (
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <p className="text-sm font-semibold text-[var(--foreground)] truncate">{tenant.parlamentar_name}</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
                {tenant.cargo === 'vereador' ? 'Vereador(a)' : 
                 tenant.cargo === 'deputado_estadual' ? 'Deputado(a) Estadual' :
                 tenant.cargo === 'deputado_federal' ? 'Deputado(a) Federal' : 'Senador(a)'}
                {tenant.partido && ` · ${tenant.partido}`}
              </p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white font-medium shadow-lg shadow-green-600/20' 
                      : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-[var(--border)] space-y-1">
            <Link
              href="/dashboard/notificacoes"
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all
                ${pathname === '/dashboard/notificacoes'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white font-medium shadow-lg shadow-green-600/20'
                  : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <Bell className="w-5 h-5" />
              Notificações
            </Link>
            <Link
              href="/dashboard/configuracoes"
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all
                ${pathname === '/dashboard/configuracoes'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white font-medium shadow-lg shadow-green-600/20'
                  : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="w-5 h-5" />
              Configurações
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-[256px] min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--background)] border-b border-[var(--border)]">
          <div className="flex items-center justify-between h-full px-4 md:px-6">
            <button
              className="lg:hidden p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <Link
                href="/dashboard/notificacoes"
                className="relative p-2.5 hover:bg-[var(--muted)] rounded-xl transition-colors hidden sm:flex"
              >
                <Bell className="w-5 h-5 text-[var(--muted-foreground)]" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 hover:bg-[var(--muted)] rounded-xl transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[var(--foreground)] max-w-[100px] truncate">
                    {user?.nome?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
                </button>

                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-xl z-50">
                      <div className="p-4 border-b border-[var(--border)]">
                        <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user?.nome}</p>
                        <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/dashboard/configuracoes"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Configurações
                        </Link>
                        <button
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" />
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
        <main className="p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-4 md:px-6 py-6 border-t border-[var(--border)] text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            Desenvolvido por{' '}
            <a 
              href="https://dataro-it.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-[var(--foreground)] hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              DATA-RO INTELIGÊNCIA TERRITORIAL
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
