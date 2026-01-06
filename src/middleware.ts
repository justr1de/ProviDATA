import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Email do super admin geral do sistema
const SUPER_ADMIN_EMAIL = 'contato@dataro-it.com.br';

// ===== CACHE DE AUTENTICAÇÃO =====
// Cache em memória para tokens JWT validados (reduz chamadas ao Supabase)
// TTL: 60 segundos (previne uso de tokens expirados)
interface CacheEntry {
  user: {
    id: string
    email?: string
    app_metadata?: Record<string, unknown>
    user_metadata?: Record<string, unknown>
  } | null
  profile: {
    role: string
    tenant_id?: string
  } | null
  timestamp: number
}

const authCache = new Map<string, CacheEntry>()
const CACHE_TTL = 60 * 1000 // 1 minuto

// Limpeza periódica do cache (previne memory leak)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of authCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      authCache.delete(key)
    }
  }
}, CACHE_TTL)

// Extrai o token de acesso dos cookies
function getAccessToken(request: NextRequest): string | null {
  const cookies = request.cookies.getAll()
  const authCookie = cookies.find(c =>
    c.name.startsWith('sb-') && c.name.includes('-auth-token')
  )
  return authCookie?.value || null
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // ===== OTIMIZAÇÃO 1: Pular rotas públicas =====
  // Não precisa verificar autenticação em rotas públicas
  const isPublicRoute =
    path === '/login' ||
    path === '/cadastro' ||
    path === '/' ||
    path.startsWith('/api/leads') ||
    path.startsWith('/_next') ||
    path.startsWith('/static')

  // Apenas verifica autenticação em rotas protegidas
  const needsAuth = path.startsWith('/admin') || path.startsWith('/dashboard')

  if (!needsAuth && !isPublicRoute) {
    return NextResponse.next()
  }

  // 1. Prepara a resposta base
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Configura o cliente Supabase para manipular cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  // ===== OTIMIZAÇÃO 2: Cache de usuário =====
  const token = getAccessToken(request)
  let user = null
  let userProfile = null

  if (token) {
    const cached = authCache.get(token)
    const now = Date.now()

    // Usa cache se ainda válido
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      user = cached.user
      userProfile = cached.profile
    } else {
      // Cache miss ou expirado - busca do Supabase
      const { data: { user: fetchedUser } } = await supabase.auth.getUser()
      user = fetchedUser

      // Busca o profile do usuário para verificar o role
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role, tenant_id')
          .eq('id', user.id)
          .single()
        
        userProfile = profile

        // Armazena no cache
        authCache.set(token, { user, profile, timestamp: now })
      }
    }
  } else {
    // Sem token - busca diretamente (pode renovar token)
    const { data: { user: fetchedUser } } = await supabase.auth.getUser()
    user = fetchedUser

    // Busca o profile do usuário
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()
      
      userProfile = profile
    }
  }

  // 3. Regras de Proteção de Rotas
  
  // Regra A: Protege a área /admin
  if (!user && path.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Regra B: Protege a área /dashboard
  if (!user && path.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Regra C: Redireciona usuário logado para fora do login
  if (user && path === '/login') {
    const url = request.nextUrl.clone()
    
    // Verifica se é super admin
    const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL || userProfile?.role === 'super_admin'
    
    // Super admins vão para /admin/gabinetes, demais para /dashboard
    url.pathname = isSuperAdmin ? '/admin/gabinetes' : '/dashboard'
    return NextResponse.redirect(url)
  }

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