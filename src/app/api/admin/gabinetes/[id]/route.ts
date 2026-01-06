import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GabineteProvisioningService } from '@/lib/services/gabinete-provisioning.service';

const SUPER_ADMIN_EMAIL = 'contato@dataro-it.com.br';

async function isSuperAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.email !== SUPER_ADMIN_EMAIL) return false;
  return true;
}

// ✅ GET - Código corrigido para Next.js 16
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = params.id;

  try {
    if (!await isSuperAdmin()) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { data: gabinete, error } = await GabineteProvisioningService.getGabinete(id);
    
    if (error || !gabinete) {
      return NextResponse.json({ error: 'Gabinete não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ gabinete });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// ✅ PATCH - Código corrigido para Next.js 16
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = params.id;

  try {
    if (!await isSuperAdmin()) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const result = await GabineteProvisioningService.updateGabinete(id, body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      gabinete: result.gabinete,
      message: 'Gabinete atualizado com sucesso'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
