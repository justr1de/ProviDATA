// API Route: /api/admin/gabinetes/[id]
// Gerenciamento de gabinete individual (somente super-admin)

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
 * Busca um gabinete específico (somente super-admin)
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { gabinete } = { gabinete: { id: params.id } }; // Exemplo, ajuste conforme sua lógica
    // ... resto do código
}) {
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
    
    // Buscar gabinete
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
 * PATCH /api/admin/gabinetes/[id]
 * Atualiza um gabinete (somente super-admin)
 */
// ✅ CÓDIGO NOVO (Com await)
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> } // Mudou a tipagem
) {
  const params = await props.params; // <--- Adicione esta linha obrigatória
  const id = params.id; // Agora você pode usar o id

  // ... continue o resto da função (remova o destructuring do argumento se tiver)
}  try {
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
    
    // Atualizar gabinete
    const result = await GabineteProvisioningService.updateGabinete(id, body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      gabinete: result.gabinete,
      message: 'Gabinete atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar gabinete:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/gabinetes/[id]/toggle-status
 * Ativa ou desativa um gabinete (somente super-admin)
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
