// API Route: /api/invites
// Gerenciamento de convites (CRUD)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OnboardingService } from '@/lib/services/onboarding.service';
import type { CreateInviteRequest } from '@/types/onboarding';

// Email do super admin geral do sistema
const SUPER_ADMIN_EMAIL = 'contato@dataro-it.com.br';

/**
 * GET /api/invites
 * Lista convites do gabinete do usuário
 */
export async function GET(request: NextRequest) {
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

    // Buscar perfil do usuário com gabinete_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('gabinete_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se é super admin
    const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;

    if (!isSuperAdmin && !['admin', 'gestor'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Apenas administradores e gestores podem listar convites' },
        { status: 403 }
      );
    }

    // Determinar gabinete_id
    const gabineteId = profile.gabinete_id;

    if (!isSuperAdmin && !gabineteId) {
      return NextResponse.json(
        { error: 'Usuário não pertence a um gabinete' },
        { status: 400 }
      );
    }

    // Listar convites
    const { data: invites, error } = await OnboardingService.listInvites(
      gabineteId,
      user.id
    );

    if (error) {
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    return NextResponse.json({ invites });
  } catch (error) {
    console.error('Erro ao listar convites:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invites
 * Cria um novo convite
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

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('gabinete_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se é super admin
    const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;

    if (!isSuperAdmin && !['admin', 'gestor'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Apenas administradores e gestores podem criar convites' },
        { status: 403 }
      );
    }

    // Ler o body
    const body: CreateInviteRequest = await request.json();

    // Determinar gabinete_id
    const targetGabineteId = body.gabinete_id || profile.gabinete_id;

    // Super admin deve especificar o gabinete
    if (isSuperAdmin && !targetGabineteId) {
      return NextResponse.json(
        { error: 'Super admin deve especificar o gabinete do convite' },
        { status: 400 }
      );
    }

    if (!body.email || !body.role) {
      return NextResponse.json(
        { error: 'Email e role são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar role
    const validRoles = ['super_admin', 'admin', 'gestor', 'assessor', 'operador', 'visualizador'];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: 'Role inválido' },
        { status: 400 }
      );
    }

    // Criar convite
    const { data: invite, error } = await OnboardingService.createInvite(
      {
        ...body,
        gabinete_id: targetGabineteId,
      },
      user.id
    );

    if (error) {
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    return NextResponse.json({ invite }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
