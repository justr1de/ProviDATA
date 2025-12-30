'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
  History
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!providencia) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Providência não encontrada</h2>
        <p className="text-[var(--muted-foreground)] mb-4">
          A providência solicitada não existe ou você não tem permissão para visualizá-la.
        </p>
        <Link href="/dashboard/providencias">
          <Button>Voltar para Providências</Button>
        </Link>
      </div>
    )
  }

  const isOverdue = providencia.prazo_estimado && 
    new Date(providencia.prazo_estimado) < new Date() && 
    !['concluido', 'arquivado'].includes(providencia.status)

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/providencias">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-[var(--muted-foreground)]">
                {providencia.numero_protocolo}
              </span>
              <Badge className={`status-${providencia.status}`}>
                {statusLabels[providencia.status]}
              </Badge>
              <Badge className={`priority-${providencia.prioridade}`}>
                {priorityLabels[providencia.prioridade]}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold">{providencia.titulo}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/providencias/${providencia.id}/editar`}>
            <Button variant="outline">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Alerta de atraso */}
      {isOverdue && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                Prazo vencido
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">
                O prazo estimado para esta providência era {format(new Date(providencia.prazo_estimado!), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descrição */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{providencia.descricao}</p>
            </CardContent>
          </Card>

          {/* Localização */}
          {(providencia.localizacao_tipo || providencia.localizacao_descricao) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent>
                {providencia.localizacao_tipo && (
                  <Badge variant="outline" className="mb-2">
                    {providencia.localizacao_tipo === 'bairro' ? 'Bairro' :
                     providencia.localizacao_tipo === 'rua' ? 'Rua/Avenida' :
                     providencia.localizacao_tipo === 'regiao' ? 'Região' : 'Local Específico'}
                  </Badge>
                )}
                {providencia.localizacao_descricao && (
                  <p>{providencia.localizacao_descricao}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Atualizar Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Atualizar Status</CardTitle>
              <CardDescription>
                Altere o status da providência e adicione uma observação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Novo Status"
                options={statusOptions}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Providencia['status'])}
              />
              <Textarea
                label="Observação"
                placeholder="Adicione uma observação sobre a alteração..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
              <Button 
                onClick={handleUpdateStatus}
                disabled={newStatus === providencia.status || isUpdating}
                isLoading={isUpdating}
              >
                <MessageSquare className="w-4 h-4" />
                Atualizar Status
              </Button>
            </CardContent>
          </Card>

          {/* Histórico */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Alterações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historico.length === 0 ? (
                <p className="text-[var(--muted-foreground)] text-center py-4">
                  Nenhuma alteração registrada
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
                  <div className="space-y-6">
                    {historico.map((item, index) => {
                      const StatusIcon = item.status_novo ? statusIcons[item.status_novo] || Clock : Clock
                      return (
                        <div key={item.id} className="relative pl-10">
                          <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)]'
                          }`}>
                            <StatusIcon className="w-4 h-4" />
                          </div>
                          <div className="bg-[var(--secondary)] rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">
                                {item.acao === 'alteracao_status' ? 'Alteração de Status' :
                                 item.acao === 'criacao' ? 'Criação' :
                                 item.acao === 'edicao' ? 'Edição' : item.acao}
                              </span>
                              <span className="text-sm text-[var(--muted-foreground)]">
                                {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                            {item.status_anterior && item.status_novo && (
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`status-${item.status_anterior}`}>
                                  {statusLabels[item.status_anterior]}
                                </Badge>
                                <span>→</span>
                                <Badge className={`status-${item.status_novo}`}>
                                  {statusLabels[item.status_novo]}
                                </Badge>
                              </div>
                            )}
                            {item.observacao && (
                              <p className="text-sm text-[var(--muted-foreground)]">
                                {item.observacao}
                              </p>
                            )}
                            <p className="text-xs text-[var(--muted-foreground)] mt-2">
                              Por: {item.usuario?.nome || 'Sistema'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Data de Criação</p>
                  <p className="font-medium">
                    {format(new Date(providencia.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {providencia.prazo_estimado && (
                <div className="flex items-center gap-3">
                  <Clock className={`w-5 h-5 ${isOverdue ? 'text-red-500' : 'text-[var(--muted-foreground)]'}`} />
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Prazo Estimado</p>
                    <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {format(new Date(providencia.prazo_estimado), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}

              {providencia.categoria && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: providencia.categoria.cor }}
                  />
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Categoria</p>
                    <p className="font-medium">{providencia.categoria.nome}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cidadão */}
          {providencia.cidadao && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Cidadão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{providencia.cidadao.nome}</p>
                  {providencia.cidadao.cpf && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      CPF: {providencia.cidadao.cpf}
                    </p>
                  )}
                  {providencia.cidadao.telefone && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Tel: {providencia.cidadao.telefone}
                    </p>
                  )}
                  {providencia.cidadao.celular && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Cel: {providencia.cidadao.celular}
                    </p>
                  )}
                  {providencia.cidadao.email && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {providencia.cidadao.email}
                    </p>
                  )}
                  {providencia.cidadao.bairro && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Bairro: {providencia.cidadao.bairro}
                    </p>
                  )}
                </div>
                <Link href={`/dashboard/cidadaos/${providencia.cidadao.id}`}>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    Ver Perfil Completo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Órgão Destino */}
          {providencia.orgao_destino && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Órgão Destinatário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {providencia.orgao_destino.sigla && `${providencia.orgao_destino.sigla} - `}
                    {providencia.orgao_destino.nome}
                  </p>
                  {providencia.orgao_destino.email && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {providencia.orgao_destino.email}
                    </p>
                  )}
                  {providencia.orgao_destino.telefone && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {providencia.orgao_destino.telefone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações Internas */}
          {providencia.observacoes_internas && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações Internas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{providencia.observacoes_internas}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
