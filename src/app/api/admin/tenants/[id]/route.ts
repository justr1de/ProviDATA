// API Route: /api/admin/tenants/[id]
// Gerenciamento de tenant individual (somente super-admin)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TenantProvisioningService } from '@/lib/services/tenant-provisioning.service';

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
 * GET /api/admin/tenants/[id]
 * Busca um tenant específico (somente super-admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se é super admin
    const { isSuper, error: authError } = await isSuperAdmin();
    
    if (!isSuper) {
      return NextResponse.json(
        { error: authError || 'Acesso negado' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    
    // Buscar tenant
    const { data: tenant, error } = await TenantProvisioningService.getTenant(id);
    
    if (error || !tenant) {
      return NextResponse.json(
        { error: error || 'Tenant não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('Erro ao buscar tenant:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/tenants/[id]
 * Atualiza um tenant (somente super-admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se é super admin
    const { isSuper, error: authError } = await isSuperAdmin();
    
    if (!isSuper) {
      return NextResponse.json(
        { error: authError || 'Acesso negado' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    const body = await request.json();
    
    // Atualizar tenant
    const result = await TenantProvisioningService.updateTenant(id, body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      tenant: result.tenant,
      message: 'Tenant atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar tenant:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/tenants/[id]/toggle-status
 * Ativa ou desativa um tenant (somente super-admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se é super admin
    const { isSuper, error: authError } = await isSuperAdmin();
    
    if (!isSuper) {
      return NextResponse.json(
        { error: authError || 'Acesso negado' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    
    // Verificar se é uma requisição de toggle-status
    const url = new URL(request.url);
    if (!url.pathname.endsWith('/toggle-status')) {
      return NextResponse.json(
        { error: 'Endpoint não encontrado' },
        { status: 404 }
      );
    }
    
    // Alterar status
    const result = await TenantProvisioningService.toggleTenantStatus(id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      tenant: result.tenant,
      message: `Tenant ${result.tenant?.ativo ? 'ativado' : 'desativado'} com sucesso`,
    });
  } catch (error) {
    console.error('Erro ao alterar status do tenant:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
