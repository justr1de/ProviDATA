// =====================================================
// TIPOS PARA GABINETES - MODELO SIMPLIFICADO
// =====================================================

// Tipo para Gabinete (fonte de verdade)
export interface Gabinete {
  id: string
  name: string
  slug: string
  type: 'gabinete' | 'organization' | 'municipal' | 'estadual' | 'federal'
  
  // Informações parlamentares
  parlamentar_name?: string
  parlamentar_nickname?: string
  parlamentar_cargo?: 'vereador' | 'prefeito' | 'deputado_estadual' | 'deputado_federal' | 'senador' | 'governador'
  partido?: string
  
  // Localização
  uf?: string
  municipio?: string
  endereco?: string
  
  // Contatos
  telefone?: string
  telefone_parlamentar?: string
  telefone_gabinete?: string
  telefone_adicional?: string
  email?: string
  email_parlamentar?: string
  email_gabinete?: string
  
  // Assessores
  chefe_de_gabinete?: string
  assessor_2?: string
  
  // Configurações
  logo_url?: string
  settings?: Record<string, unknown>
  plano?: 'basico' | 'profissional' | 'enterprise'
  
  // Status
  ativo: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Metadados
  metadata?: Record<string, unknown>
}

export interface Convite {
  id: string
  email: string
  gabinete_id: string
  cargo: 'admin' | 'gestor' | 'assessor' | 'operador' | 'visualizador'
  token: string
  status: 'pendente' | 'aceito' | 'expirado' | 'revogado'
  validade: string
  aceito_em?: string
  created_at: string
  updated_at: string
  convidado_por?: string
  aceito_por?: string
  metadata?: Record<string, unknown>
  gabinete?: Gabinete
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  role: 'super_admin' | 'admin' | 'gestor' | 'assessor' | 'operador' | 'visualizador'
  gabinete_id?: string
  avatar_url?: string
  onboarding_completed: boolean
  onboarding_step: number
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
  gabinete?: Gabinete
}

// =====================================================
// TIPOS LEGADOS (MANTER COMPATIBILIDADE)
// =====================================================

export interface User {
  id: string
  gabinete_id: string
  nome: string
  email: string
  telefone?: string
  cargo?: string
  role: 'admin' | 'assessor' | 'colaborador'
  avatar_url?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Cidadao {
  id: string
  gabinete_id: string
  nome: string
  cpf?: string
  rg?: string
  data_nascimento?: string
  genero?: string
  email?: string
  telefone?: string
  celular?: string
  cep?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface Orgao {
  id: string
  gabinete_id: string
  nome: string
  tipo: 'secretaria_municipal' | 'secretaria_estadual' | 'mp_estadual' | 'mp_federal' | 'defensoria' | 'tribunal_contas' | 'outros'
  sigla?: string
  email?: string
  telefone?: string
  endereco?: string
  responsavel?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  gabinete_id: string
  nome: string
  descricao?: string
  cor: string
  icone?: string
  ativo: boolean
  created_at: string
}

export interface Providencia {
  id: string
  gabinete_id: string
  numero_protocolo: string
  cidadao_id?: string
  categoria_id?: string
  orgao_destino_id?: string
  usuario_responsavel_id?: string
  titulo: string
  descricao: string
  localizacao_tipo?: 'bairro' | 'rua' | 'regiao' | 'especifico'
  localizacao_descricao?: string
  latitude?: number
  longitude?: number
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  status: 'pendente' | 'em_analise' | 'encaminhado' | 'em_andamento' | 'concluido' | 'arquivado'
  prazo_estimado?: string
  data_encaminhamento?: string
  data_conclusao?: string
  observacoes_internas?: string
  created_at: string
  updated_at: string
  // Relations
  cidadao?: Cidadao
  categoria?: Categoria
  orgao_destino?: Orgao
  usuario_responsavel?: User
}

export interface Anexo {
  id: string
  providencia_id: string
  nome: string
  tipo: 'imagem' | 'video' | 'documento' | 'audio'
  mime_type?: string
  tamanho_bytes?: number
  url: string
  descricao?: string
  created_at: string
}

export interface HistoricoProvidencia {
  id: string
  providencia_id: string
  usuario_id?: string
  acao: string
  status_anterior?: string
  status_novo?: string
  observacao?: string
  created_at: string
  usuario?: { nome: string }
}

export interface Historico {
  id: string
  providencia_id: string
  usuario_id?: string
  tipo: 'criacao' | 'atualizacao' | 'encaminhamento' | 'resposta' | 'conclusao' | 'comentario'
  descricao: string
  dados_anteriores?: Record<string, unknown>
  dados_novos?: Record<string, unknown>
  created_at: string
  usuario?: User
}

export interface Notificacao {
  id: string
  gabinete_id: string
  usuario_id?: string
  providencia_id?: string
  tipo: 'nova_providencia' | 'atualizacao' | 'prazo_proximo' | 'prazo_vencido' | 'resposta' | 'info' | 'alerta' | 'prazo' | 'sucesso'
  titulo: string
  mensagem?: string
  lida: boolean
  enviado_email: boolean
  enviado_push: boolean
  created_at: string
}

export interface DashboardStats {
  gabinete_id: string
  total_providencias: number
  pendentes: number
  em_analise: number
  encaminhadas: number
  em_andamento: number
  concluidas: number
  arquivadas: number
  urgentes: number
  atrasadas: number
  este_mes: number
}

// =====================================================
// TIPOS PARA FUNÇÕES E RESPOSTAS - GABINETES
// =====================================================

export interface AceitarConviteResponse {
  success: boolean
  error?: string
  cargo?: string
  gabinete_id?: string
}

export interface RevogarConviteResponse {
  success: boolean
  error?: string
  message?: string
}

export interface EstatisticasGabinete {
  total_usuarios: number
  total_admins: number
  total_gestores: number
  total_assessores: number
  total_operadores: number
  total_visualizadores: number
  convites_pendentes: number
  convites_aceitos: number
}

export interface ConviteFormData {
  email: string
  gabinete_id: string
  cargo: 'admin' | 'gestor' | 'assessor' | 'operador' | 'visualizador'
  metadata?: Record<string, unknown>
}

export interface GabineteFormData {
  nome: string
  municipio: string
  uf: string
  parlamentar_nome?: string
  parlamentar_cargo?: 'vereador' | 'prefeito' | 'deputado_estadual' | 'deputado_federal' | 'senador' | 'governador'
  partido?: string
  telefone?: string // Campo legado
  email?: string // Campo legado
  telefone_parlamentar?: string
  telefone_gabinete?: string
  telefone_adicional?: string
  email_parlamentar?: string
  email_gabinete?: string
  chefe_de_gabinete?: string
  assessor_2?: string
  endereco?: string
  logo_url?: string
  settings?: Record<string, unknown>
}

// =====================================================
// TIPOS PARA FILTROS E QUERIES
// =====================================================

export interface ConviteFilters {
  status?: 'pendente' | 'aceito' | 'expirado' | 'revogado'
  gabinete_id?: string
  email?: string
  cargo?: string
}

export interface GabineteFilters {
  uf?: string
  municipio?: string
  ativo?: boolean
  parlamentar_cargo?: string
}
