'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Trash2,
  CheckCheck
} from 'lucide-react'
import type { Notificacao } from '@/types/database'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

const tipoIcons: Record<string, typeof Bell> = {
  info: Bell,
  alerta: AlertTriangle,
  prazo: Clock,
  atualizacao: FileText,
  sucesso: CheckCircle2,
}

const tipoLabels: Record<string, string> = {
  info: 'Informação',
  alerta: 'Alerta',
  prazo: 'Prazo',
  atualizacao: 'Atualização',
  sucesso: 'Sucesso',
}

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore()
  const supabase = createClient()

  const loadNotificacoes = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setNotificacoes(data || [])
    } catch (error) {
      console.error('Error loading notificacoes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotificacoes()
  }, [user])

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', id)

      if (error) throw error

      setNotificacoes(notificacoes.map(n => 
        n.id === id ? { ...n, lida: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('usuario_id', user.id)
        .eq('lida', false)

      if (error) throw error

      setNotificacoes(notificacoes.map(n => ({ ...n, lida: true })))
      toast.success('Todas as notificações foram marcadas como lidas')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Erro ao marcar notificações como lidas')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('id', id)

      if (error) throw error

      setNotificacoes(notificacoes.filter(n => n.id !== id))
      toast.success('Notificação excluída')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Erro ao excluir notificação')
    }
  }

  const unreadCount = notificacoes.filter(n => !n.lida).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-[var(--muted-foreground)]">
            {unreadCount > 0 
              ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}`
              : 'Todas as notificações foram lidas'
            }
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {notificacoes.length} notificação{notificacoes.length !== 1 ? 'ões' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="text-[var(--muted-foreground)]">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificacoes.map((notificacao) => {
                const Icon = tipoIcons[notificacao.tipo] || Bell
                return (
                  <div
                    key={notificacao.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border border-[var(--border)] transition-colors ${
                      !notificacao.lida ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notificacao.tipo === 'alerta' ? 'bg-amber-100 text-amber-600' :
                      notificacao.tipo === 'prazo' ? 'bg-red-100 text-red-600' :
                      notificacao.tipo === 'sucesso' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{notificacao.titulo}</h4>
                        <Badge variant="outline">
                          {tipoLabels[notificacao.tipo]}
                        </Badge>
                        {!notificacao.lida && (
                          <Badge variant="default">Nova</Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] mb-2">
                        {notificacao.mensagem}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {format(new Date(notificacao.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        {notificacao.providencia_id && (
                          <Link 
                            href={`/dashboard/providencias/${notificacao.providencia_id}`}
                            className="text-xs text-[var(--primary)] hover:underline"
                          >
                            Ver providência
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!notificacao.lida && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleMarkAsRead(notificacao.id)}
                          title="Marcar como lida"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(notificacao.id)}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
