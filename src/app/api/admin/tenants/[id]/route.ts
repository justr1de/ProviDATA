// API Route: /api/admin/tenants/[id]
// Gerenciamento de gabinete individual (somente super-admin)

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
 * GET /api/admin/tenants/[id]
 * Busca um gabinete específico (somente super-admin)
 */
export async function GET(
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
    
    const { data: gabinete, error } = await GabineteProvisioningService.getGabinete(id);
    
    if (error || !gabinete) {
      return NextResponse.json(
        { error: error || 'Gabinete não encontrado' },
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
 * PATCH /api/admin/tenants/[id]
 * Atualiza um gabinete (somente super-admin)
 */
export async function PATCH(
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
    const updates = await request.json();
    
    const result = await GabineteProvisioningService.updateGabinete(id, updates);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ gabinete: result.gabinete });
  } catch (error) {
    console.error('Erro ao atualizar gabinete:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tenants/[id]
 * Remove um gabinete (somente super-admin)
 */
export async function DELETE(
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
    
    // Note: Instead of deleting, we should deactivate
    const result = await GabineteProvisioningService.toggleGabineteStatus(id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Gabinete desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao remover gabinete:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
