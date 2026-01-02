// API Route: /api/admin/tenants
// Gerenciamento de gabinetes (somente super-admin)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GabineteProvisioningService, CreateGabineteRequest } from '@/lib/services/gabinete-provisioning.service';
import { getSuperAdminEmails } from '@/lib/env-validation';

// Lista de emails de super admins (configurável via variável de ambiente)
const SUPER_ADMIN_EMAILS = getSuperAdminEmails();

/**
 * Verifica se o usuário é super admin
 */
async function isSuperAdmin(request: NextRequest): Promise<{ isSuper: boolean; error?: string }> {
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
 * GET /api/admin/tenants
 * Lista todos os gabinetes (somente super-admin)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar se é super admin
    const { isSuper, error: authError } = await isSuperAdmin(request);
    
    if (!isSuper) {
      return NextResponse.json(
        { error: authError || 'Acesso negado' },
        { status: 403 }
      );
    }
    
    // Buscar filtros da query string
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      type: searchParams.get('type') || undefined,
      uf: searchParams.get('uf') || undefined,
      ativo: searchParams.get('ativo') === 'true' ? true : searchParams.get('ativo') === 'false' ? false : undefined,
      search: searchParams.get('search') || undefined,
    };
    
    // Listar gabinetes
    const { data: gabinetes, error } = await GabineteProvisioningService.listGabinetes(filters);
    
    if (error) {
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ gabinetes });
  } catch (error) {
    console.error('Erro ao listar gabinetes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tenants
 * Provisiona um novo gabinete com usuário admin (somente super-admin)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se é super admin
    const { isSuper, error: authError } = await isSuperAdmin(request);
    
    if (!isSuper) {
      return NextResponse.json(
        { error: authError || 'Acesso negado' },
        { status: 403 }
      );
    }
    
    // Ler o body
    const body: CreateGabineteRequest = await request.json();
    
    // Validações básicas
    if (!body.name || !body.admin_email) {
      return NextResponse.json(
        { error: 'Nome do gabinete e email do admin são obrigatórios' },
        { status: 400 }
      );
    }
    
    if (!body.type) {
      return NextResponse.json(
        { error: 'Tipo do gabinete é obrigatório' },
        { status: 400 }
      );
    }
    
    // Provisionar gabinete
    const result = await GabineteProvisioningService.provisionGabinete(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    // Retornar sucesso com credenciais (IMPORTANTE: Esta senha deve ser enviada ao admin via email seguro)
    return NextResponse.json(
      {
        success: true,
        gabinete: result.gabinete,
        admin_user: result.admin_user,
        message: 'Gabinete provisionado com sucesso. Envie as credenciais ao admin de forma segura.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao provisionar gabinete:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
