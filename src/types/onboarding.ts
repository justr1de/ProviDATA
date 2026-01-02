// Tipos para o sistema de onboarding híbrido (Refatorado para tenant_id)

export type UserRole = 'super_admin' | 'admin' | 'gestor' | 'assessor' | 'operador' | 'visualizador';

export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export type TenantType = 'gabinete' | 'organization' | 'municipal' | 'estadual' | 'federal';

export type ParlamentarCargo = 'vereador' | 'prefeito' | 'deputado_estadual' | 'deputado_federal' | 'senador' | 'governador';

// Tipo unificado para Tenant (fonte de verdade)
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: TenantType;
  
  // Informações parlamentares
  parlamentar_name?: string;
  parlamentar_nickname?: string;
  parlamentar_cargo?: ParlamentarCargo;
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
  settings: Record<string, any>;
  plano?: 'basico' | 'profissional' | 'enterprise';
  
  // Status
  ativo: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Metadados
  metadata?: Record<string, any>;
}

// Tipo legado mantido para compatibilidade
export type OrganizationType = 'municipal' | 'estadual' | 'federal';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  tenant_id: string | null;
  organization_id?: string | null; // Legado - manter compatibilidade
  gabinete_id?: string | null; // Legado - manter compatibilidade
  avatar_url: string | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
  tenant?: Tenant; // Novo campo usando Tenant
  organization?: Organization; // Legado - manter compatibilidade
}

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  tenant_id: string | null;
  organization_id?: string | null; // Legado - manter compatibilidade
  invited_by: string | null;
  token: string;
  status: InviteStatus;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
  tenant?: Tenant; // Novo campo usando Tenant
  organization?: Organization; // Legado - manter compatibilidade
  inviter?: Profile;
}

export interface CreateInviteRequest {
  email: string;
  role: UserRole;
  gabinete_id?: string;
  tenant_id?: string;
  organization_id?: string; // Legado - manter compatibilidade
  expires_in_days?: number;
  metadata?: Record<string, unknown>;
}

export interface AcceptInviteRequest {
  token: string;
  user_id: string;
}

export interface AcceptInviteResponse {
  success: boolean;
  error?: string;
  role?: UserRole;
  tenant_id?: string;
  organization_id?: string; // Legado - manter compatibilidade
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 0,
    title: 'Bem-vindo',
    description: 'Introdução ao sistema ProviDATA',
    completed: false,
    required: true,
  },
  {
    id: 1,
    title: 'Perfil',
    description: 'Complete suas informações pessoais',
    completed: false,
    required: true,
  },
  {
    id: 2,
    title: 'Organização',
    description: 'Configure sua organização',
    completed: false,
    required: true,
  },
  {
    id: 3,
    title: 'Preferências',
    description: 'Ajuste suas preferências do sistema',
    completed: false,
    required: false,
  },
  {
    id: 4,
    title: 'Tutorial',
    description: 'Aprenda a usar as principais funcionalidades',
    completed: false,
    required: false,
  },
  {
    id: 5,
    title: 'Concluído',
    description: 'Você está pronto para começar!',
    completed: false,
    required: true,
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  gestor: 'Gestor',
  assessor: 'Assessor',
  operador: 'Operador',
  visualizador: 'Visualizador',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Acesso total ao sistema incluindo gestão de múltiplos tenants',
  admin: 'Acesso completo ao tenant, incluindo gerenciamento de usuários e configurações',
  gestor: 'Pode gerenciar providências e visualizar relatórios do tenant',
  assessor: 'Pode gerenciar providências e apoiar na gestão do gabinete',
  operador: 'Pode criar e editar providências',
  visualizador: 'Apenas visualização de dados',
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'manage_all_tenants',
    'manage_users',
    'manage_invites',
    'manage_tenant',
    'manage_providencias',
    'view_reports',
    'manage_settings',
    'view_all_data',
  ],
  admin: [
    'manage_users',
    'manage_invites',
    'manage_tenant',
    'manage_providencias',
    'view_reports',
    'manage_settings',
  ],
  gestor: [
    'manage_providencias',
    'view_reports',
    'view_users',
    'manage_invites',
  ],
  assessor: [
    'manage_providencias',
    'view_reports',
    'view_users',
  ],
  operador: [
    'create_providencias',
    'edit_providencias',
    'view_providencias',
  ],
  visualizador: [
    'view_providencias',
    'view_reports',
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, 'manage_users');
}

export function canManageInvites(role: UserRole): boolean {
  return hasPermission(role, 'manage_invites');
}
