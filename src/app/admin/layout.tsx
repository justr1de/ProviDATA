import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'

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
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
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
      <div className="flex h-screen items-center justify-center bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 flex-col gap-4">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p>Seu usuário <strong>{user.email}</strong> não tem permissão de administrador.</p>
        <p>Role encontrada: <strong>{userRole || 'Nenhuma'}</strong></p>
        <a href="/dashboard" className="px-4 py-2 bg-red-200 dark:bg-red-800 rounded hover:bg-red-300 dark:hover:bg-red-700">
          Voltar ao Dashboard
        </a>
      </div>
    )
  }

  // Layout simplificado - permite que as páginas filhas definam seu próprio layout
  return (
    <>
      <Toaster position="top-right" richColors />
      {children}
    </>
  )
}
