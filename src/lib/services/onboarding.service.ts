// Serviço de Onboarding - Backend
import { createClient } from '@supabase/supabase-js';
import type {
  Invite,
  CreateInviteRequest,
  AcceptInviteResponse,
  Profile,
  Gabinete,
} from '@/types/onboarding';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Email do super admin geral do sistema
const SUPER_ADMIN_EMAIL = 'contato@dataro-it.com.br';

// Cliente com service role para operações administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export class OnboardingService {
  /**
   * Verifica se o usuário é o super admin do sistema
   */
  private static async isSuperAdmin(userId: string): Promise<boolean> {
    try {
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
      return user?.user?.email === SUPER_ADMIN_EMAIL;
    } catch (error) {
      console.error('Erro ao verificar super admin:', error);
      return false;
    }
  }

  /**
   * Cria um novo convite usando gabinete_id
   */
  static async createInvite(
    request: CreateInviteRequest,
    invitedBy: string
  ): Promise<{ data: Invite | null; error: string | null }> {
    try {
      // Verificar se é super admin
      const isSuperAdmin = await this.isSuperAdmin(invitedBy);

      // Verificar se o usuário que está convidando é admin
      const { data: inviterProfile, error: inviterError } = await supabaseAdmin
        .from('profiles')
        .select('role, gabinete_id')
        .eq('id', invitedBy)
        .single();

      if (inviterError || !inviterProfile) {
        return { data: null, error: 'Usuário não encontrado' };
      }

      // Super admin pode convidar para qualquer gabinete
      // Outros admins/gestores só podem convidar para seu próprio gabinete
      if (!isSuperAdmin && !['admin', 'gestor'].includes(inviterProfile.role)) {
        return { data: null, error: 'Apenas administradores e gestores podem criar convites' };
      }

      // Determinar gabinete_id: se fornecido no request, usar; senão, usar do perfil do convidador
      const targetGabineteId = request.gabinete_id || inviterProfile.gabinete_id;

      if (!targetGabineteId) {
        return { data: null, error: 'gabinete_id é obrigatório' };
      }

      // Se não é super admin, validar que está convidando para seu próprio gabinete
      if (!isSuperAdmin && targetGabineteId !== inviterProfile.gabinete_id) {
        return { data: null, error: 'Você só pode criar convites para seu próprio gabinete' };
      }

      // Verificar se já existe convite pendente para este email no mesmo gabinete
      const { data: existingInvite } = await supabaseAdmin
        .from('invites')
        .select('id, status')
        .eq('email', request.email)
        .eq('gabinete_id', targetGabineteId)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        return { data: null, error: 'Já existe um convite pendente para este email neste gabinete' };
      }

      // Calcular data de expiração
      const expiresInDays = request.expires_in_days || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      // Criar convite
      const { data: invite, error: createError } = await supabaseAdmin
        .from('invites')
        .insert({
          email: request.email,
          role: request.role,
          gabinete_id: targetGabineteId,
          invited_by: invitedBy,
          expires_at: expiresAt.toISOString(),
          metadata: request.metadata || {},
        })
        .select('*, gabinete:tenants(*), inviter:profiles!invited_by(*)')
        .single();

      if (createError) {
        console.error('Erro ao criar convite:', createError);
        return { data: null, error: 'Erro ao criar convite' };
      }

      return { data: invite as Invite, error: null };
    } catch (error) {
      console.error('Erro no createInvite:', error);
      return { data: null, error: 'Erro interno ao criar convite' };
    }
  }

  /**
   * Lista convites de um gabinete
   */
  static async listInvites(
    gabineteId: string,
    userId: string
  ): Promise<{ data: Invite[] | null; error: string | null }> {
    try {
      // Verificar se é super admin
      const isSuperAdmin = await this.isSuperAdmin(userId);

      // Verificar se o usuário é admin/gestor do gabinete
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role, gabinete_id')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return { data: null, error: 'Usuário não encontrado' };
      }

      // Super admin pode listar convites de qualquer gabinete
      if (!isSuperAdmin && (!['admin', 'gestor'].includes(profile.role) || profile.gabinete_id !== gabineteId)) {
        return { data: null, error: 'Sem permissão para listar convites deste gabinete' };
      }

      // Buscar convites
      const { data: invites, error: invitesError } = await supabaseAdmin
        .from('invites')
        .select('*, gabinete:tenants(*), inviter:profiles!invited_by(*)')
        .eq('gabinete_id', gabineteId)
        .order('created_at', { ascending: false });

      if (invitesError) {
        console.error('Erro ao listar convites:', invitesError);
        return { data: null, error: 'Erro ao listar convites' };
      }

      return { data: invites as Invite[], error: null };
    } catch (error) {
      console.error('Erro no listInvites:', error);
      return { data: null, error: 'Erro interno ao listar convites' };
    }
  }

  /**
   * Busca convite por token (público)
   */
  static async getInviteByToken(
    token: string
  ): Promise<{ data: Invite | null; error: string | null }> {
    try {
      const { data: invite, error: inviteError } = await supabaseAdmin
        .from('invites')
        .select('*, gabinete:tenants(*)')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invite) {
        return { data: null, error: 'Convite não encontrado ou expirado' };
      }

      // Verificar se expirou
      if (new Date(invite.expires_at) < new Date()) {
        // Marcar como expirado
        await supabaseAdmin
          .from('invites')
          .update({ status: 'expired' })
          .eq('id', invite.id);

        return { data: null, error: 'Convite expirado' };
      }

      return { data: invite as Invite, error: null };
    } catch (error) {
      console.error('Erro no getInviteByToken:', error);
      return { data: null, error: 'Erro interno ao buscar convite' };
    }
  }

  /**
   * Aceita um convite usando a função unificada do banco
   */
  static async acceptInvite(
    token: string,
    userId: string
  ): Promise<AcceptInviteResponse> {
    try {
      // Usar a função SQL unificada para aceitar o convite
      const { data, error } = await supabaseAdmin.rpc('accept_invite_unified', {
        invite_token: token,
        user_id: userId,
      });

      if (error) {
        console.error('Erro ao aceitar convite:', error);
        return { success: false, error: 'Erro ao aceitar convite' };
      }

      // Converter gabinete_id para organization_id para compatibilidade
      const response = data as AcceptInviteResponse;
      if (response.success && response.gabinete_id) {
        return {
          ...response,
          organization_id: response.gabinete_id, // Compatibilidade
        };
      }

      return response;
    } catch (error) {
      console.error('Erro no acceptInvite:', error);
      return { success: false, error: 'Erro interno ao aceitar convite' };
    }
  }

  /**
   * Revoga um convite
   */
  static async revokeInvite(
    inviteId: string,
    userId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Verificar se é super admin
      const isSuperAdmin = await this.isSuperAdmin(userId);

      // Verificar se o usuário é admin/gestor
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role, gabinete_id')
        .eq('id', userId)
        .single();

      if (profileError || !profile || (!isSuperAdmin && !['admin', 'gestor'].includes(profile.role))) {
        return { success: false, error: 'Sem permissão para revogar convites' };
      }

      // Buscar convite
      const { data: invite, error: inviteError } = await supabaseAdmin
        .from('invites')
        .select('gabinete_id')
        .eq('id', inviteId)
        .single();

      if (inviteError || !invite) {
        return { success: false, error: 'Convite não encontrado' };
      }

      // Super admin pode revogar qualquer convite
      // Outros admins/gestores só podem revogar convites do seu gabinete
      if (!isSuperAdmin && invite.gabinete_id !== profile.gabinete_id) {
        return { success: false, error: 'Sem permissão para revogar este convite' };
      }

      // Revogar convite
      const { error: updateError } = await supabaseAdmin
        .from('invites')
        .update({ status: 'revoked' })
        .eq('id', inviteId);

      if (updateError) {
        console.error('Erro ao revogar convite:', updateError);
        return { success: false, error: 'Erro ao revogar convite' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro no revokeInvite:', error);
      return { success: false, error: 'Erro interno ao revogar convite' };
    }
  }

  /**
   * Reenvia um convite (cria novo token)
   */
  static async resendInvite(
    inviteId: string,
    userId: string
  ): Promise<{ data: Invite | null; error: string | null }> {
    try {
      // Verificar se é super admin
      const isSuperAdmin = await this.isSuperAdmin(userId);

      // Verificar permissões
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role, gabinete_id')
        .eq('id', userId)
        .single();

      if (profileError || !profile || (!isSuperAdmin && !['admin', 'gestor'].includes(profile.role))) {
        return { data: null, error: 'Sem permissão para reenviar convites' };
      }

      // Buscar convite
      const { data: invite, error: inviteError } = await supabaseAdmin
        .from('invites')
        .select('*')
        .eq('id', inviteId)
        .single();

      if (inviteError || !invite) {
        return { data: null, error: 'Convite não encontrado' };
      }

      // Super admin pode reenviar qualquer convite
      // Outros admins/gestores só podem reenviar convites do seu gabinete
      if (!isSuperAdmin && invite.gabinete_id !== profile.gabinete_id) {
        return { data: null, error: 'Sem permissão para reenviar este convite' };
      }

      // Gerar novo token e estender expiração
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      const { data: updatedInvite, error: updateError } = await supabaseAdmin
        .from('invites')
        .update({
          status: 'pending',
          expires_at: newExpiresAt.toISOString(),
          // O token será regenerado automaticamente pelo banco
        })
        .eq('id', inviteId)
        .select('*, gabinete:tenants(*)')
        .single();

      if (updateError) {
        console.error('Erro ao reenviar convite:', updateError);
        return { data: null, error: 'Erro ao reenviar convite' };
      }

      return { data: updatedInvite as Invite, error: null };
    } catch (error) {
      console.error('Erro no resendInvite:', error);
      return { data: null, error: 'Erro interno ao reenviar convite' };
    }
  }

  /**
   * Atualiza o progresso do onboarding
   */
  static async updateOnboardingProgress(
    userId: string,
    step: number,
    completed: boolean = false
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          onboarding_step: step,
          onboarding_completed: completed,
        })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao atualizar onboarding:', error);
        return { success: false, error: 'Erro ao atualizar progresso' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro no updateOnboardingProgress:', error);
      return { success: false, error: 'Erro interno ao atualizar progresso' };
    }
  }

  /**
   * Busca perfil do usuário com gabinete
   */
  static async getProfile(
    userId: string
  ): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('*, gabinete:tenants(*)')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return { data: null, error: 'Erro ao buscar perfil' };
      }

      return { data: profile as Profile, error: null };
    } catch (error) {
      console.error('Erro no getProfile:', error);
      return { data: null, error: 'Erro interno ao buscar perfil' };
    }
  }

  /**
   * Expira convites antigos (pode ser chamado por cron job)
   */
  static async expireOldInvites(): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabaseAdmin.rpc('expire_old_invites');

      if (error) {
        console.error('Erro ao expirar convites:', error);
        return { success: false, error: 'Erro ao expirar convites' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro no expireOldInvites:', error);
      return { success: false, error: 'Erro interno ao expirar convites' };
    }
  }

  /**
   * Busca gabinete por ID
   */
  static async getGabinete(
    gabineteId: string
  ): Promise<{ data: Gabinete | null; error: string | null }> {
    try {
      const { data: gabinete, error } = await supabaseAdmin
        .from('tenants')
        .select('*')
        .eq('id', gabineteId)
        .single();

      if (error) {
        console.error('Erro ao buscar gabinete:', error);
        return { data: null, error: 'Erro ao buscar gabinete' };
      }

      return { data: gabinete as Gabinete, error: null };
    } catch (error) {
      console.error('Erro no getGabinete:', error);
      return { data: null, error: 'Erro interno ao buscar gabinete' };
    }
  }
}
