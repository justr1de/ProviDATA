'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Calendar,
  Users,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Trash2,
  MessageSquare,
  FileText,
  Send,
  History,
  Tag
} from 'lucide-react'
import type { Providencia, HistoricoProvidencia } from '@/types/database'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

const statusOptions = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'encaminhado', label: 'Encaminhado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'arquivado', label: 'Arquivado' },
]

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  em_analise: 'Em Análise',
  encaminhado: 'Encaminhado',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
}

const priorityLabels: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}

const statusIcons: Record<string, typeof Clock> = {
  pendente: Clock,
  em_analise: FileText,
  encaminhado: Send,
  em_andamento: History,
  concluido: CheckCircle2,
  arquivado: FileText,
}

export default function ProvidenciaDetailPage() {
  const [providencia, setProvidencia] = useState<Providencia | null>(null)
  const [historico, setHistorico] = useState<HistoricoProvidencia[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newStatus, setNewStatus] = useState<Providencia['status']>('pendente')
  const [observacao, setObservacao] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { tenant, user } = useAuthStore()
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    const loadProvidencia = async () => {
      if (!tenant || !id) return

      try {
        // Carregar usuário atual do Supabase Auth
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()
          if (userData) setCurrentUser(userData)
        }

        // Carregar providência
        const { data: provData, error: provError } = await supabase
          .from('providencias')
          .select(`
            *,
            cidadao:cidadaos(*),
            categoria:categorias(nome, cor),
            orgao_destino:orgaos(nome, sigla, email, telefone)
          `)
          .eq('id', id)
          .eq('tenant_id', tenant.id)
          .single()

        if (provError) throw provError
        setProvidencia(provData)
        setNewStatus(provData.status)

        // Carregar histórico
        const { data: histData } = await supabase
          .from('historico_providencias')
          .select(`
            *,
            usuario:users(nome)
          `)
          .eq('providencia_id', id)
          .order('created_at', { ascending: false })

        if (histData) setHistorico(histData)
      } catch (error) {
        console.error('Error loading providencia:', error)
        toast.error('Erro ao carregar providência')
      } finally {
        setIsLoading(false)
      }
    }

    loadProvidencia()
  }, [tenant, id, supabase])

  const handleUpdateStatus = async () => {
    const activeUser = currentUser || user
    if (!providencia || !activeUser || newStatus === providencia.status) return

    setIsUpdating(true)
    try {
      // Atualizar status
      const { error: updateError } = await supabase
        .from('providencias')
        .update({ 
          status: newStatus,
          data_conclusao: newStatus === 'concluido' ? new Date().toISOString() : null
        })
        .eq('id', providencia.id)

      if (updateError) throw updateError

      // Registrar no histórico
      const { error: histError } = await supabase
        .from('historico_providencias')
        .insert({
          providencia_id: providencia.id,
          usuario_id: activeUser.id,
          acao: 'alteracao_status',
          status_anterior: providencia.status,
          status_novo: newStatus,
          observacao: observacao || null,
        })

      if (histError) throw histError

      toast.success('Status atualizado com sucesso!')
      
      // Recarregar dados
      setProvidencia({ ...providencia, status: newStatus })
      setObservacao('')
      
      // Recarregar histórico
      const { data: histData } = await supabase
        .from('historico_providencias')
        .select(`
          *,
          usuario:users(nome)
        `)
        .eq('providencia_id', id)
        .order('created_at', { ascending: false })

      if (histData) setHistorico(histData)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Erro ao atualizar status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!providencia || !confirm('Tem certeza que deseja excluir esta providência? Esta ação não pode ser desfeita.')) return

    try {
      const { error } = await supabase
        .from('providencias')
        .delete()
        .eq('id', providencia.id)

      if (error) throw error

      toast.success('Providência excluída com sucesso')
      router.push('/dashboard/providencias')
    } catch (error) {
      console.error('Error deleting providencia:', error)
      toast.error('Erro ao excluir providência')
    }
  }

  // Estilos
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    overflow: 'hidden',
  }

  const cardHeaderStyle: React.CSSProperties = {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--muted)',
  }

  const cardContentStyle: React.CSSProperties = {
    padding: '24px',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--foreground)',
    marginBottom: '10px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '2px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '15px',
    outline: 'none',
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 14px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '20px',
    paddingRight: '48px',
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical',
    lineHeight: '1.6',
  }

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '10px',
    backgroundColor: 'var(--primary)',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }

  const buttonOutlineStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
  }

  const buttonDestructiveStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
  }

  const iconContainerStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '4px solid var(--primary)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    )
  }

  if (!providencia) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <AlertTriangle style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#f59e0b' }} />
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Providência não encontrada</h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '16px' }}>
          A providência solicitada não existe ou você não tem permissão para visualizá-la.
        </p>
        <Link href="/dashboard/providencias">
          <button style={buttonStyle}>Voltar para Providências</button>
        </Link>
      </div>
    )
  }

  const isOverdue = providencia.prazo_estimado && 
    new Date(providencia.prazo_estimado) < new Date() && 
    !['concluido', 'arquivado'].includes(providencia.status)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        alignItems: 'flex-start', 
        justifyContent: 'space-between', 
        gap: '20px', 
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <Link href="/dashboard/providencias">
            <button style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <ArrowLeft style={{ width: '20px', height: '20px', color: 'var(--foreground)' }} />
            </button>
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ 
                fontSize: '14px', 
                fontFamily: 'monospace', 
                color: 'var(--muted-foreground)',
                backgroundColor: 'var(--muted)',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                {providencia.numero_protocolo}
              </span>
              <Badge className={`status-${providencia.status}`}>
                {statusLabels[providencia.status]}
              </Badge>
              <Badge className={`priority-${providencia.prioridade}`}>
                {priorityLabels[providencia.prioridade]}
              </Badge>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--foreground)', margin: 0 }}>
              {providencia.titulo}
            </h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href={`/dashboard/providencias/${providencia.id}/editar`}>
            <button style={buttonOutlineStyle}>
              <Edit style={{ width: '16px', height: '16px' }} />
              Editar
            </button>
          </Link>
          <button style={buttonDestructiveStyle} onClick={handleDelete}>
            <Trash2 style={{ width: '16px', height: '16px' }} />
            Excluir
          </button>
        </div>
      </div>

      {/* Alerta de atraso */}
      {isOverdue && (
        <div style={{
          ...cardStyle,
          marginBottom: '24px',
          borderColor: '#fecaca',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
        }}>
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <AlertTriangle style={{ width: '24px', height: '24px', color: '#dc2626' }} />
            <div>
              <p style={{ fontWeight: '600', color: '#dc2626', margin: '0 0 4px 0' }}>
                Prazo vencido
              </p>
              <p style={{ fontSize: '14px', color: '#ef4444', margin: 0 }}>
                O prazo estimado para esta providência era {format(new Date(providencia.prazo_estimado!), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Coluna principal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Descrição */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={iconContainerStyle}>
                  <FileText style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>
                  Descrição
                </h2>
              </div>
            </div>
            <div style={cardContentStyle}>
              <p style={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: '1.7', 
                color: 'var(--foreground)',
                margin: 0 
              }}>
                {providencia.descricao}
              </p>
            </div>
          </div>

          {/* Localização */}
          {(providencia.localizacao_tipo || providencia.localizacao_descricao) && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ ...iconContainerStyle, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <MapPin style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>
                    Localização
                  </h2>
                </div>
              </div>
              <div style={cardContentStyle}>
                {providencia.localizacao_tipo && (
                  <Badge variant="outline" style={{ marginBottom: '12px' }}>
                    {providencia.localizacao_tipo === 'bairro' ? 'Bairro' :
                     providencia.localizacao_tipo === 'rua' ? 'Rua/Avenida' :
                     providencia.localizacao_tipo === 'regiao' ? 'Região' : 'Local Específico'}
                  </Badge>
                )}
                {providencia.localizacao_descricao && (
                  <p style={{ margin: 0, lineHeight: '1.6' }}>{providencia.localizacao_descricao}</p>
                )}
              </div>
            </div>
          )}

          {/* Atualizar Status */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...iconContainerStyle, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                  <MessageSquare style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)', margin: '0 0 4px 0' }}>
                    Atualizar Status
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>
                    Altere o status da providência e adicione uma observação
                  </p>
                </div>
              </div>
            </div>
            <div style={cardContentStyle}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Novo Status</label>
                <select
                  style={selectStyle}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Providencia['status'])}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Observação</label>
                <textarea
                  style={textareaStyle}
                  placeholder="Adicione uma observação sobre a alteração..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
              </div>
              <button 
                style={{
                  ...buttonStyle,
                  opacity: newStatus === providencia.status || isUpdating ? 0.5 : 1,
                  cursor: newStatus === providencia.status || isUpdating ? 'not-allowed' : 'pointer',
                }}
                onClick={handleUpdateStatus}
                disabled={newStatus === providencia.status || isUpdating}
              >
                <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                {isUpdating ? 'Atualizando...' : 'Atualizar Status'}
              </button>
            </div>
          </div>

          {/* Histórico */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...iconContainerStyle, backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
                  <History style={{ width: '20px', height: '20px', color: '#f97316' }} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>
                  Histórico de Alterações
                </h2>
              </div>
            </div>
            <div style={cardContentStyle}>
              {historico.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', padding: '24px 0' }}>
                  Nenhuma alteração registrada
                </p>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    backgroundColor: 'var(--border)',
                  }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {historico.map((item, index) => {
                      const StatusIcon = item.status_novo ? statusIcons[item.status_novo] || Clock : Clock
                      return (
                        <div key={item.id} style={{ position: 'relative', paddingLeft: '48px' }}>
                          <div style={{
                            position: 'absolute',
                            left: 0,
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: index === 0 ? 'var(--primary)' : 'var(--muted)',
                            color: index === 0 ? 'white' : 'var(--foreground)',
                          }}>
                            <StatusIcon style={{ width: '16px', height: '16px' }} />
                          </div>
                          <div style={{
                            backgroundColor: 'var(--muted)',
                            borderRadius: '12px',
                            padding: '16px 20px',
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              marginBottom: '10px',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}>
                              <span style={{ fontWeight: '600', color: 'var(--foreground)' }}>
                                {item.acao === 'alteracao_status' ? 'Alteração de Status' :
                                 item.acao === 'criacao' ? 'Criação' :
                                 item.acao === 'edicao' ? 'Edição' : item.acao}
                              </span>
                              <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                                {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                            {item.status_anterior && item.status_novo && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <Badge className={`status-${item.status_anterior}`}>
                                  {statusLabels[item.status_anterior]}
                                </Badge>
                                <span style={{ color: 'var(--muted-foreground)' }}>→</span>
                                <Badge className={`status-${item.status_novo}`}>
                                  {statusLabels[item.status_novo]}
                                </Badge>
                              </div>
                            )}
                            {item.observacao && (
                              <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: '0 0 8px 0' }}>
                                {item.observacao}
                              </p>
                            )}
                            <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
                              Por: {item.usuario?.nome || 'Sistema'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Informações */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...iconContainerStyle, backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                  <Calendar style={{ width: '20px', height: '20px', color: '#06b6d4' }} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>
                  Informações
                </h2>
              </div>
            </div>
            <div style={cardContentStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Calendar style={{ width: '20px', height: '20px', color: 'var(--muted-foreground)' }} />
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: '0 0 4px 0' }}>Data de Criação</p>
                    <p style={{ fontWeight: '600', margin: 0 }}>
                      {format(new Date(providencia.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {providencia.prazo_estimado && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Clock style={{ width: '20px', height: '20px', color: isOverdue ? '#ef4444' : 'var(--muted-foreground)' }} />
                    <div>
                      <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: '0 0 4px 0' }}>Prazo Estimado</p>
                      <p style={{ fontWeight: '600', margin: 0, color: isOverdue ? '#ef4444' : 'var(--foreground)' }}>
                        {format(new Date(providencia.prazo_estimado), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}

                {providencia.categoria && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Tag style={{ width: '20px', height: '20px', color: providencia.categoria.cor }} />
                    <div>
                      <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: '0 0 4px 0' }}>Categoria</p>
                      <p style={{ fontWeight: '600', margin: 0 }}>{providencia.categoria.nome}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cidadão */}
          {providencia.cidadao && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ ...iconContainerStyle, backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
                    <Users style={{ width: '20px', height: '20px', color: '#ec4899' }} />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>
                    Cidadão
                  </h2>
                </div>
              </div>
              <div style={cardContentStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontWeight: '600', fontSize: '16px', margin: 0 }}>{providencia.cidadao.nome}</p>
                  {providencia.cidadao.cpf && (
                    <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>
                      CPF: {providencia.cidadao.cpf}
                    </p>
                  )}
                  {providencia.cidadao.telefone && (
                    <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>
                      Tel: {providencia.cidadao.telefone}
                    </p>
                  )}
                  {providencia.cidadao.celular && (
                    <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>
                      Cel: {providencia.cidadao.celular}
                    </p>
                  )}
                  {providencia.cidadao.email && (
                    <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>
                      {providencia.cidadao.email}
                    </p>
                  )}
                  {providencia.cidadao.bairro && (
                    <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>
                      Bairro: {providencia.cidadao.bairro}
                    </p>
                  )}
                </div>
                <Link href={`/dashboard/cidadaos/${providencia.cidadao.id}`}>
                  <button style={{ ...buttonOutlineStyle, width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                    Ver Perfil Completo
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Órgão Destino */}
          {providencia.orgao_destino && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ ...iconContainerStyle, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                    <Building2 style={{ width: '20px', height: '20px', color: '#6366f1' }} />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>
                    Órgão Destinatário
                  </h2>
                </div>
              </div>
              <div style={cardContentStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontWeight: '600', fontSize: '16px', margin: 0 }}>
                    {providencia.orgao_destino.sigla && `${providencia.orgao_destino.sigla} - `}
                    {providencia.orgao_destino.nome}
                  </p>
                  {providencia.orgao_destino.email && (
                    <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>
                      {providencia.orgao_destino.email}
                    </p>
                  )}
                  {providencia.orgao_destino.telefone && (
                    <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>
                      {providencia.orgao_destino.telefone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Observações Internas */}
          {providencia.observacoes_internas && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ ...iconContainerStyle, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                    <FileText style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)', margin: 0 }}>
                    Observações Internas
                  </h2>
                </div>
              </div>
              <div style={cardContentStyle}>
                <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{providencia.observacoes_internas}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
