// Serviço de Provisionamento de Gabinetes
// Responsável por criar gabinetes e seus usuários admin iniciais
import { createClient } from '@supabase/supabase-js';
import type { Gabinete } from '@/types/onboarding';
import { validateEnv, validateServerEnv } from '@/lib/env-validation';

const env = validateEnv();
const serverEnv = validateServerEnv();

// Cliente com service role para operações administrativas
const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface CreateGabineteRequest {
  // Dados básicos do gabinete
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
  chefe_de_gabinete?: string;
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

export interface CreateGabineteResponse {
  success: boolean;
  error?: string;
  gabinete?: Gabinete;
  admin_user?: {
    id: string;
    email: string;
    temporary_password: string;
  };
}

export class GabineteProvisioningService {
  /**
   * Gera uma senha temporária segura usando aleatoriedade criptográfica
   */
  private static generateTemporaryPassword(): string {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    
    // Usar crypto.getRandomValues para aleatoriedade criptográfica
    const randomValues = new Uint8Array(length * 2);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomValues);
    } else {
      // Fallback para Node.js
      const nodeCrypto = require('crypto');
      nodeCrypto.randomFillSync(randomValues);
    }
    
    let password = '';
    
    // Garantir pelo menos 1 de cada tipo
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[randomValues[0] % 26];
    password += 'abcdefghijklmnopqrstuvwxyz'[randomValues[1] % 26];
    password += '0123456789'[randomValues[2] % 10];
    password += '!@#$%&*'[randomValues[3] % 7];
    
    // Completar o resto com caracteres aleatórios
    for (let i = 4; i < length; i++) {
      password += charset[randomValues[i] % charset.length];
    }
    
    // Embaralhar usando Fisher-Yates
    const chars = password.split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomValues[i + length] % (i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    
    return chars.join('');
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
      .from('gabinetes')
      .select('id')
      .eq('slug', slug)
      .single();
    
    // Se existir, adicionar sufixo numérico
    if (existing) {
      let counter = 1;
      let newSlug = `${slug}-${counter}`;
      
      while (true) {
        const { data } = await supabaseAdmin
          .from('gabinetes')
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
   * Provisiona um novo gabinete com usuário admin
   * Este é o método principal do provisionamento
   */
  static async provisionGabinete(request: CreateGabineteRequest): Promise<CreateGabineteResponse> {
    try {
      // Validações básicas
      if (!request.name) {
        return { success: false, error: 'Nome do gabinete é obrigatório' };
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
      
      // 1. Criar gabinete na tabela gabinetes (nome da tabela no DB permanece "gabinetes")
      const { data: gabinete, error: gabineteError } = await supabaseAdmin
        .from('gabinetes')
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
          chefe_de_gabinete: request.chefe_de_gabinete || null,
          assessor_2: request.assessor_2 || null,
          logo_url: request.logo_url || null,
          plano: request.plano || 'basico',
          settings: {},
          ativo: true,
          metadata: request.metadata || {},
        })
        .select()
        .single();
      
      if (gabineteError || !gabinete) {
        console.error('Erro ao criar gabinete:', gabineteError);
        return { success: false, error: 'Erro ao criar gabinete' };
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
          gabinete_id: gabinete.id,
        },
        app_metadata: {
          role: 'admin',
          gabinete_id: gabinete.id,
        },
      });
      
      if (authError || !authUser.user) {
        console.error('Erro ao criar usuário auth:', authError);
        
        // Rollback: Deletar gabinete criado
        await supabaseAdmin.from('gabinetes').delete().eq('id', gabinete.id);
        
        return { success: false, error: 'Erro ao criar usuário de autenticação' };
      }
      
      // 4. Criar perfil do usuário vinculado ao gabinete
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: request.admin_email,
          full_name: request.admin_full_name || null,
          role: 'admin',
          gabinete_id: gabinete.id,
          onboarding_completed: false,
          onboarding_step: 0,
          metadata: {
            is_gabinete_creator: true,
            created_via: 'provisioning',
          },
        });
      
      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        
        // Rollback: Deletar usuário e gabinete
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        await supabaseAdmin.from('gabinetes').delete().eq('id', gabinete.id);
        
        return { success: false, error: 'Erro ao criar perfil do usuário' };
      }
      
      // 5. Retornar sucesso com credenciais
      return {
        success: true,
        gabinete: gabinete as Gabinete,
        admin_user: {
          id: authUser.user.id,
          email: request.admin_email,
          temporary_password: temporaryPassword,
        },
      };
    } catch (error) {
      console.error('Erro no provisionGabinete:', error);
      return { success: false, error: 'Erro interno ao provisionar gabinete' };
    }
  }

  /**
   * Lista todos os gabinetes (para super admin)
   */
  static async listGabinetes(filters?: {
    type?: string;
    uf?: string;
    ativo?: boolean;
    search?: string;
  }): Promise<{ data: Gabinete[] | null; error: string | null }> {
    try {
      let query = supabaseAdmin.from('gabinetes').select('*');
      
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
        console.error('Erro ao listar gabinetes:', error);
        return { data: null, error: 'Erro ao listar gabinetes' };
      }
      
      return { data: data as Gabinete[], error: null };
    } catch (error) {
      console.error('Erro no listGabinetes:', error);
      return { data: null, error: 'Erro interno ao listar gabinetes' };
    }
  }

  /**
   * Busca um gabinete por ID
   */
  static async getGabinete(gabineteId: string): Promise<{ data: Gabinete | null; error: string | null }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('gabinetes')
        .select('*')
        .eq('id', gabineteId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar gabinete:', error);
        return { data: null, error: 'Erro ao buscar gabinete' };
      }
      
      return { data: data as Gabinete, error: null };
    } catch (error) {
      console.error('Erro no getGabinete:', error);
      return { data: null, error: 'Erro interno ao buscar gabinete' };
    }
  }

  /**
   * Atualiza um gabinete
   */
  static async updateGabinete(
    gabineteId: string,
    updates: Partial<CreateGabineteRequest>
  ): Promise<{ success: boolean; error?: string; gabinete?: Gabinete }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('gabinetes')
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
          chefe_de_gabinete: updates.chefe_de_gabinete,
          assessor_2: updates.assessor_2,
          logo_url: updates.logo_url,
          plano: updates.plano,
          metadata: updates.metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gabineteId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar gabinete:', error);
        return { success: false, error: 'Erro ao atualizar gabinete' };
      }
      
      return { success: true, gabinete: data as Gabinete };
    } catch (error) {
      console.error('Erro no updateGabinete:', error);
      return { success: false, error: 'Erro interno ao atualizar gabinete' };
    }
  }

  /**
   * Ativa ou desativa um gabinete
   */
  static async toggleGabineteStatus(
    gabineteId: string
  ): Promise<{ success: boolean; error?: string; gabinete?: Gabinete }> {
    try {
      // Buscar status atual
      const { data: currentGabinete } = await supabaseAdmin
        .from('gabinetes')
        .select('ativo')
        .eq('id', gabineteId)
        .single();
      
      if (!currentGabinete) {
        return { success: false, error: 'Gabinete não encontrado' };
      }
      
      // Inverter status
      const { data, error } = await supabaseAdmin
        .from('gabinetes')
        .update({ ativo: !currentGabinete.ativo, updated_at: new Date().toISOString() })
        .eq('id', gabineteId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao alterar status do gabinete:', error);
        return { success: false, error: 'Erro ao alterar status' };
      }
      
      return { success: true, gabinete: data as Gabinete };
    } catch (error) {
      console.error('Erro no toggleGabineteStatus:', error);
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
