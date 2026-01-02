import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// OTIMIZAÇÃO: Cache simples para reduzir chamadas desnecessárias
// Em produção, considere usar Redis ou outro cache distribuído
const userCache = new Map<string, { user: any; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minuto

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // OTIMIZAÇÃO: Apenas verificar autenticação em rotas protegidas
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') ||
                           request.nextUrl.pathname.startsWith('/dashboard')
  
  if (!isProtectedRoute && request.nextUrl.pathname !== '/') {
    return supabaseResponse
  }

  // Obter token do cookie para cache
  const authToken = request.cookies.get('sb-access-token')?.value ||
                    request.cookies.get('sb-wntiupkhjtgiaxiicxeq-auth-token')?.value

  let user = null

  // OTIMIZAÇÃO: Verificar cache antes de fazer chamada ao Supabase
  if (authToken) {
    const cached = userCache.get(authToken)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      user = cached.user
    } else {
      // Cache expirado ou não existe, buscar do Supabase
      const { data: { user: fetchedUser } } = await supabase.auth.getUser()
      user = fetchedUser
      
      if (user && authToken) {
        userCache.set(authToken, { user, timestamp: now })
        
        // Limpar cache antigo (evitar memory leak)
        if (userCache.size > 1000) {
          const oldestKeys = Array.from(userCache.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp)
            .slice(0, 500)
            .map(([key]) => key)
          oldestKeys.forEach(key => userCache.delete(key))
        }
      }
    }
  } else {
    // Sem token, buscar normalmente
    const { data: { user: fetchedUser } } = await supabase.auth.getUser()
    user = fetchedUser
  }

  // Proteção da Rota ADMIN
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Se não tiver usuário -> Login
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verificar role dos metadados do JWT (já otimizado, não faz query ao banco)
    const userRole = user.app_metadata?.role || user.user_metadata?.role

    if (userRole !== 'admin' && userRole !== 'super_admin') {
       return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirecionamento Inteligente na raiz
  if (request.nextUrl.pathname === '/' && user) {
     const userRole = user.app_metadata?.role || user.user_metadata?.role
     if (userRole === 'admin' || userRole === 'super_admin') {
         return NextResponse.redirect(new URL('/admin', request.url))
     }
  }

  return supabaseResponse
}

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
