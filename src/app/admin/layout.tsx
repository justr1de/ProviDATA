import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Copyright } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Next.js 15/16: cookies() agora retorna diretamente o RequestCookies
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Apenas leitura no Server Component
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // OTIMIZAÇÃO: Usar dados do JWT ao invés de query ao banco
  // O role já vem no app_metadata ou user_metadata do JWT
  const userRole = user.app_metadata?.role || user.user_metadata?.role

  if (userRole !== 'admin' && userRole !== 'super_admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50 text-red-800 flex-col gap-4">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p>Seu usuário <strong>{user.email}</strong> não tem permissão de administrador.</p>
        <p>Role encontrada: <strong>{userRole || 'Nenhuma'}</strong></p>
        <a href="/dashboard" className="px-4 py-2 bg-red-200 rounded hover:bg-red-300">
          Voltar ao Dashboard
        </a>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Cabeçalho com Logos */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 mb-6 sm:mb-8">
            {/* Logo ProviDATA */}
            <div className="flex-shrink-0">
              <Image
                src="/providata-logo-trans.png"
                alt="ProviDATA"
                width={180}
                height={60}
                className="h-14 sm:h-16 w-auto object-contain"
                priority
              />
            </div>

            {/* Logo DATA-RO */}
            <div className="flex-shrink-0">
              <Image
                src="/dataro-logo-trans.png"
                alt="DATA-RO"
                width={180}
                height={60}
                className="h-14 sm:h-16 w-auto object-contain"
                priority
              />
            </div>
          </div>

          {/* Título do Sistema */}
          <div className="text-center border-t border-gray-200 pt-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                ProviDATA
              </span>
              {' '}—{' '}
              <span className="text-gray-700">
                Gestão de Pedidos de Providência
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Painel Administrativo - {user.email}
            </p>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Rodapé */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
            <p className="text-sm sm:text-base text-gray-700 font-medium flex items-center gap-2 flex-wrap justify-center">
              Desenvolvido por{' '}
              <span className="font-bold text-green-600">
                DATA-RO INTELIGÊNCIA TERRITORIAL
              </span>
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2 text-gray-600 text-xs sm:text-sm">
            <span>Todos os direitos reservados.</span>
            <span>2026</span>
            <Copyright className="w-4 h-4" />
          </div>
        </div>
      </footer>
    </div>
  )
}