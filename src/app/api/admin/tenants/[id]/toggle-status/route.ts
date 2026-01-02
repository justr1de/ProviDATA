// API Route: /api/admin/tenants/[id]/toggle-status
// Ativa/desativa um gabinete (somente super-admin)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GabineteProvisioningService } from '@/lib/services/gabinete-provisioning.service';
import { getSuperAdminEmails } from '@/lib/env-validation';

// Lista de emails de super admins (configurável via variável de ambiente)
const SUPER_ADMIN_EMAILS = getSuperAdminEmails();

/**
 * Verifica se o usuário é super admin
 */
async function isSuperAdmin(): Promise<{ isSuper: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { isSuper: false, error: 'Não autenticado' };
  }
  
  if (!user.email || !SUPER_ADMIN_EMAILS.includes(user.email)) {
    return { isSuper: false, error: 'Acesso negado: apenas super admin' };
  }
  
  return { isSuper: true };
}

/**
 * POST /api/admin/tenants/[id]/toggle-status
 * Alterna o status ativo/inativo de um gabinete
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isSuper, error: authError } = await isSuperAdmin();
    
    if (!isSuper) {
      return NextResponse.json(
        { error: authError || 'Acesso negado' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    
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
      message: `Gabinete ${result.gabinete?.ativo ? 'ativado' : 'desativado'} com sucesso` 
    });
  } catch (error) {
    console.error('Erro ao alterar status do gabinete:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
