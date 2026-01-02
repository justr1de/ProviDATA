import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'

export async function middleware(request: NextRequest) {
  // 1. Prepara a resposta base (permite a requisição continuar por padrão)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Configura o cliente Supabase para manipular cookies
  const supabase = createServerClient(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Atualiza cookies na requisição (para o servidor)
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          // Atualiza resposta (para o navegador)
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Verifica a sessão do usuário
  // IMPORTANTE: Isso renova o token se ele estiver expirando
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Regras de Proteção de Rotas
  const path = request.nextUrl.pathname

  // Regra A: Protege a área /admin
  // Se NÃO tem usuário E tenta acessar /admin -> Redireciona para /login
  if (!user && path.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Regra B: Redireciona usuário logado para fora do login
  // Se TEM usuário E tenta acessar /login -> Redireciona para /admin/gabinetes
  if (user && path === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/gabinetes'
    return NextResponse.redirect(url)
  }

  // Se nenhuma regra bloquear, retorna a resposta original
  return response
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas, EXCETO:
     * - _next/static (arquivos estáticos)
     * - _next/image (imagens otimizadas)
     * - favicon.ico
     * - arquivos de imagem (svg, png, jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}