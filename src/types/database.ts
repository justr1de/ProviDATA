export interface Tenant {
  id: string
  name: string
  slug: string
  parlamentar_name: string
  cargo: 'vereador' | 'deputado_estadual' | 'deputado_federal' | 'senador'
  partido?: string
  uf?: string
  municipio?: string
  logo_url?: string
  email_contato?: string
  telefone?: string
  telefone_contato?: string
  endereco?: string
  plano: 'basico' | 'profissional' | 'enterprise'
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  tenant_id: string
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
  tenant_id: string
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
  tenant_id: string
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
  tenant_id: string
  nome: string
  descricao?: string
  cor: string
  icone?: string
  ativo: boolean
  created_at: string
}

export interface Providencia {
  id: string
  tenant_id: string
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
  tenant_id: string
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
  tenant_id: string
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
