// Serviço de Provisionamento de Tenants
// Responsável por criar tenants e seus usuários admin iniciais
import { createClient } from '@supabase/supabase-js';
import type { Tenant } from '@/types/onboarding';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente com service role para operações administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface CreateTenantRequest {
  // Dados básicos do tenant
  name: string;
  slug?: string;
  type: 'gabinete' | 'organization' | 'municipal' | 'estadual' | 'federal';
  
  // Dados parlamentares (opcional)
  parlamentar_name?: string;
  parlamentar_nickname?: string;
  parlamentar_cargo?: 'vereador' | 'prefeito' | 'deputado_estadual' | 'deputado_federal' | 'senador' | 'governador';
  partido?: string;
  
  // Localização
  uf?: string;
  municipio?: string;
  endereco?: string;
  
  // Contatos
  telefone?: string;
  telefone_parlamentar?: string;
  telefone_gabinete?: string;
  telefone_adicional?: string;
  email?: string;
  email_parlamentar?: string;
  email_gabinete?: string;
  
  // Assessores
  assessor_1?: string;
  assessor_2?: string;
  
  // Configurações
  logo_url?: string;
  plano?: 'basico' | 'profissional' | 'enterprise';
  
  // Usuário admin inicial
  admin_email: string;
  admin_full_name?: string;
  
  // Metadados
  metadata?: Record<string, unknown>;
}

export interface CreateTenantResponse {
  success: boolean;
  error?: string;
  tenant?: Tenant;
  admin_user?: {
    id: string;
    email: string;
    temporary_password: string;
  };
}

export class TenantProvisioningService {
  /**
   * Gera uma senha temporária segura
   */
  private static generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let password = '';
    
    // Garantir pelo menos 1 maiúscula, 1 minúscula, 1 número e 1 especial
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%&*'[Math.floor(Math.random() * 7)];
    
    // Completar o resto
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Embaralhar
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Gera um slug único a partir do nome
   */
  private static async generateSlug(name: string, baseSlug?: string): Promise<string> {
    let slug = baseSlug || name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
      .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim
    
    // Verificar se o slug já existe
    const { data: existing } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .single();
    
    // Se existir, adicionar sufixo numérico
    if (existing) {
      let counter = 1;
      let newSlug = `${slug}-${counter}`;
      
      while (true) {
        const { data } = await supabaseAdmin
          .from('tenants')
          .select('id')
          .eq('slug', newSlug)
          .single();
        
        if (!data) {
          slug = newSlug;
          break;
        }
        
        counter++;
        newSlug = `${slug}-${counter}`;
        
        // Limite de segurança
        if (counter > 100) {
          throw new Error('Não foi possível gerar um slug único');
        }
      }
    }
    
    return slug;
  }

  /**
   * Provisiona um novo tenant com usuário admin
   * Este é o método principal do provisionamento
   */
  static async provisionTenant(request: CreateTenantRequest): Promise<CreateTenantResponse> {
    try {
      // Validações básicas
      if (!request.name) {
        return { success: false, error: 'Nome do tenant é obrigatório' };
      }
      
      if (!request.admin_email) {
        return { success: false, error: 'Email do admin é obrigatório' };
      }
      
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.admin_email)) {
        return { success: false, error: 'Email inválido' };
      }
      
      // Verificar se o email já está em uso
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const emailExists = existingUser?.users?.some(u => u.email === request.admin_email);
      
      if (emailExists) {
        return { success: false, error: 'Este email já está cadastrado no sistema' };
      }
      
      // Gerar slug único
      const slug = await this.generateSlug(request.name, request.slug);
      
      // 1. Criar tenant na tabela tenants
      const { data: tenant, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .insert({
          name: request.name,
          slug: slug,
          type: request.type,
          parlamentar_name: request.parlamentar_name || null,
          parlamentar_nickname: request.parlamentar_nickname || null,
          parlamentar_cargo: request.parlamentar_cargo || null,
          partido: request.partido || null,
          uf: request.uf || null,
          municipio: request.municipio || null,
          endereco: request.endereco || null,
          telefone: request.telefone || null,
          telefone_parlamentar: request.telefone_parlamentar || null,
          telefone_gabinete: request.telefone_gabinete || null,
          telefone_adicional: request.telefone_adicional || null,
          email: request.email || null,
          email_parlamentar: request.email_parlamentar || null,
          email_gabinete: request.email_gabinete || null,
          assessor_1: request.assessor_1 || null,
          assessor_2: request.assessor_2 || null,
          logo_url: request.logo_url || null,
          plano: request.plano || 'basico',
          settings: {},
          ativo: true,
          metadata: request.metadata || {},
        })
        .select()
        .single();
      
      if (tenantError || !tenant) {
        console.error('Erro ao criar tenant:', tenantError);
        return { success: false, error: 'Erro ao criar tenant' };
      }
      
      // 2. Gerar senha temporária
      const temporaryPassword = this.generateTemporaryPassword();
      
      // 3. Criar usuário no Auth com senha temporária
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: request.admin_email,
        password: temporaryPassword,
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          full_name: request.admin_full_name || '',
          role: 'admin',
          gabinete_id: tenant.id,
        },
        app_metadata: {
          role: 'admin',
          gabinete_id: tenant.id,
        },
      });
      
      if (authError || !authUser.user) {
        console.error('Erro ao criar usuário auth:', authError);
        
        // Rollback: Deletar tenant criado
        await supabaseAdmin.from('tenants').delete().eq('id', tenant.id);
        
        return { success: false, error: 'Erro ao criar usuário de autenticação' };
      }
      
      // 4. Criar perfil do usuário vinculado ao tenant
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: request.admin_email,
          full_name: request.admin_full_name || null,
          role: 'admin',
          gabinete_id: tenant.id,
          onboarding_completed: false,
          onboarding_step: 0,
          metadata: {
            is_tenant_creator: true,
            created_via: 'provisioning',
          },
        });
      
      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        
        // Rollback: Deletar usuário e tenant
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        await supabaseAdmin.from('tenants').delete().eq('id', tenant.id);
        
        return { success: false, error: 'Erro ao criar perfil do usuário' };
      }
      
      // 5. Retornar sucesso com credenciais
      return {
        success: true,
        tenant: tenant as Tenant,
        admin_user: {
          id: authUser.user.id,
          email: request.admin_email,
          temporary_password: temporaryPassword,
        },
      };
    } catch (error) {
      console.error('Erro no provisionTenant:', error);
      return { success: false, error: 'Erro interno ao provisionar tenant' };
    }
  }

  /**
   * Lista todos os tenants (para super admin)
   */
  static async listTenants(filters?: {
    type?: string;
    uf?: string;
    ativo?: boolean;
    search?: string;
  }): Promise<{ data: Tenant[] | null; error: string | null }> {
    try {
      let query = supabaseAdmin.from('tenants').select('*');
      
      // Aplicar filtros
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.uf) {
        query = query.eq('uf', filters.uf);
      }
      
      if (filters?.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo);
      }
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,municipio.ilike.%${filters.search}%,parlamentar_name.ilike.%${filters.search}%`);
      }
      
      // Ordenar por data de criação (mais recentes primeiro)
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao listar tenants:', error);
        return { data: null, error: 'Erro ao listar tenants' };
      }
      
      return { data: data as Tenant[], error: null };
    } catch (error) {
      console.error('Erro no listTenants:', error);
      return { data: null, error: 'Erro interno ao listar tenants' };
    }
  }

  /**
   * Busca um tenant por ID
   */
  static async getTenant(tenantId: string): Promise<{ data: Tenant | null; error: string | null }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar tenant:', error);
        return { data: null, error: 'Erro ao buscar tenant' };
      }
      
      return { data: data as Tenant, error: null };
    } catch (error) {
      console.error('Erro no getTenant:', error);
      return { data: null, error: 'Erro interno ao buscar tenant' };
    }
  }

  /**
   * Atualiza um tenant
   */
  static async updateTenant(
    tenantId: string,
    updates: Partial<CreateTenantRequest>
  ): Promise<{ success: boolean; error?: string; tenant?: Tenant }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('tenants')
        .update({
          name: updates.name,
          parlamentar_name: updates.parlamentar_name,
          parlamentar_nickname: updates.parlamentar_nickname,
          parlamentar_cargo: updates.parlamentar_cargo,
          partido: updates.partido,
          uf: updates.uf,
          municipio: updates.municipio,
          endereco: updates.endereco,
          telefone: updates.telefone,
          telefone_parlamentar: updates.telefone_parlamentar,
          telefone_gabinete: updates.telefone_gabinete,
          telefone_adicional: updates.telefone_adicional,
          email: updates.email,
          email_parlamentar: updates.email_parlamentar,
          email_gabinete: updates.email_gabinete,
          assessor_1: updates.assessor_1,
          assessor_2: updates.assessor_2,
          logo_url: updates.logo_url,
          plano: updates.plano,
          metadata: updates.metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tenantId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar tenant:', error);
        return { success: false, error: 'Erro ao atualizar tenant' };
      }
      
      return { success: true, tenant: data as Tenant };
    } catch (error) {
      console.error('Erro no updateTenant:', error);
      return { success: false, error: 'Erro interno ao atualizar tenant' };
    }
  }

  /**
   * Ativa ou desativa um tenant
   */
  static async toggleTenantStatus(
    tenantId: string
  ): Promise<{ success: boolean; error?: string; tenant?: Tenant }> {
    try {
      // Buscar status atual
      const { data: currentTenant } = await supabaseAdmin
        .from('tenants')
        .select('ativo')
        .eq('id', tenantId)
        .single();
      
      if (!currentTenant) {
        return { success: false, error: 'Tenant não encontrado' };
      }
      
      // Inverter status
      const { data, error } = await supabaseAdmin
        .from('tenants')
        .update({ ativo: !currentTenant.ativo, updated_at: new Date().toISOString() })
        .eq('id', tenantId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao alterar status do tenant:', error);
        return { success: false, error: 'Erro ao alterar status' };
      }
      
      return { success: true, tenant: data as Tenant };
    } catch (error) {
      console.error('Erro no toggleTenantStatus:', error);
      return { success: false, error: 'Erro interno ao alterar status' };
    }
  }

  /**
   * Reseta a senha de um usuário admin (gera nova senha temporária)
   */
  static async resetAdminPassword(
    userId: string
  ): Promise<{ success: boolean; error?: string; temporary_password?: string }> {
    try {
      const temporaryPassword = this.generateTemporaryPassword();
      
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: temporaryPassword,
      });
      
      if (error) {
        console.error('Erro ao resetar senha:', error);
        return { success: false, error: 'Erro ao resetar senha' };
      }
      
      return { success: true, temporary_password: temporaryPassword };
    } catch (error) {
      console.error('Erro no resetAdminPassword:', error);
      return { success: false, error: 'Erro interno ao resetar senha' };
    }
  }
}
