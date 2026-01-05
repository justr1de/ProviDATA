// API Route: /api/admin/gabinetes/[id]/toggle-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GabineteProvisioningService } from '@/lib/services/gabinete-provisioning.service';

const SUPER_ADMIN_EMAIL = 'contato@dataro-it.com.br';

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

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> } // ✅ Correção 1: params é uma Promise
) {
  // ✅ Correção 2: Aguardar os parâmetros
  const params = await props.params;
  const { id } = params;

  try {
    const { isSuper, error: authError } = await isSuperAdmin();
    
    if (!isSuper) {
      return NextResponse.json(
        { error: authError || 'Acesso negado' },
        { status: 403 }
      );
    }
    
    // Alterar status
    const result = await GabineteProvisioningService.toggleGabineteStatus(id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      gabinete: result.gabinete,
      message: `Gabinete ${result.gabinete?.ativo ? 'ativado' : 'desativado'} com sucesso`,
    });
  } catch (error) {
    console.error('Erro ao alterar status do gabinete:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
