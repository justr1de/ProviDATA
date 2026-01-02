// API Route: /api/invites/accept
// Aceitar convite (público)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OnboardingService } from '@/lib/services/onboarding.service';

/**
 * POST /api/invites/accept
 * Aceita um convite usando o token
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Validar body
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    // Aceitar convite
    const result = await OnboardingService.acceptInvite(token, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      role: result.role,
      gabinete_id: result.gabinete_id,
    });
  } catch (error) {
    console.error('Erro ao aceitar convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invites/accept?token=xxx
 * Busca informações do convite (público)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar convite
    const { data: invite, error } = await OnboardingService.getInviteByToken(token);

    if (error || !invite) {
      return NextResponse.json(
        { error: error || 'Convite não encontrado' },
        { status: 404 }
      );
    }

    // Retornar apenas informações públicas
    return NextResponse.json({
      email: invite.email,
      role: invite.role,
      tenant: invite.tenant, // Novo campo usando Tenant
      organization: invite.organization, // Legado - compatibilidade
      expires_at: invite.expires_at,
    });
  } catch (error) {
    console.error('Erro ao buscar convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
