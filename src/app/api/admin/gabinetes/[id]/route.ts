// API Route: /api/admin/gabinetes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GabineteProvisioningService } from '@/lib/services/gabinete-provisioning.service';

// Email do super admin geral do sistema
const SUPER_ADMIN_EMAIL = 'contato@dataro-it.com.br';

/**
 * Verifica se o usuário é super admin
 */
async function isSuperAdmin(): Promise<{ isSuper: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { isSuper: false, error: 'Não autenticado' };
  }
  
  if (user.email !== SUPER_ADMIN_EMAIL) {
    return { isSuper: false, error: 'Acesso negado: apenas super admin' };
  }
  
  return { isSuper: true };
}

/**
 * GET /api/admin/gabinetes/[id]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Correção Next.js 16: params é Promise
) {
  // ✅ Aguarda os parâmetros antes de usar
  const { id } = await context.params;

  try {
    const { isSuper, error: authError } = await isSuperAdmin();

    if (!isSuper) {
      return NextResponse.json(
        { error: authError || 'Acesso negado' },
        { status: 403 }
      );
    }

    const { data: gabinete, error } = await GabineteProvisioningService.getGabinete(id);

    if (error || !gabinete) {
      return NextResponse.json(
        { error: error?.message || 'Gabinete não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ gabinete });

  } catch (error) {
    console.error('Erro ao buscar gabinete:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/gabinetes/[id]
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Correção Next.js 16: params é Promise
) {
  // ✅ Aguarda os parâmetros antes de usar
  const { id } = await context.params;

  try {
    const { isSuper, error: authError } = await isSuperAdmin();

    if (!isSuper) {
      return NextResponse.json(
        { error: authError || 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { data, error } = await GabineteProvisioningService.updateGabinete(id, body);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ gabinete: data });

  } catch (error) {
    console.error('Erro ao atualizar gabinete:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
