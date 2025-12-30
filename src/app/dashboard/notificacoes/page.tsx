'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
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

const tipoColors: Record<string, { bg: string; text: string }> = {
  info: { bg: '#dbeafe', text: '#1e40af' },
  alerta: { bg: '#fef3c7', text: '#92400e' },
  prazo: { bg: '#fecaca', text: '#991b1b' },
  atualizacao: { bg: '#e0e7ff', text: '#3730a3' },
  sucesso: { bg: '#dcfce7', text: '#166534' },
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

  // Estilos padronizados
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    overflow: 'hidden'
  }

  const cardHeaderStyle: React.CSSProperties = {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }

  const cardContentStyle: React.CSSProperties = {
    padding: '24px'
  }

  const buttonOutlineStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }

  const badgeStyle = (colors: { bg: string; text: string }): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: colors.bg,
    color: colors.text
  })

  return (
    <div style={{ padding: '0 8px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Bell style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--foreground)' }}>
              Notificações
            </h1>
          </div>
          <p style={{ fontSize: '16px', color: 'var(--foreground-muted)' }}>
            {unreadCount > 0 
              ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}`
              : 'Todas as notificações foram lidas'
            }
          </p>
        </div>
        {unreadCount > 0 && (
          <button style={buttonOutlineStyle} onClick={handleMarkAllAsRead}>
            <CheckCheck style={{ width: '18px', height: '18px' }} />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Main Card */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>
            Todas as Notificações
          </h2>
          <span style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>
            {notificacoes.length} notificação{notificacoes.length !== 1 ? 'ões' : ''}
          </span>
        </div>
        <div style={cardContentStyle}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--border)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : notificacoes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Bell style={{ width: '48px', height: '48px', color: 'var(--foreground-muted)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '16px', color: 'var(--foreground-muted)' }}>
                Nenhuma notificação
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notificacoes.map((notificacao) => {
                const Icon = tipoIcons[notificacao.tipo] || Bell
                const colors = tipoColors[notificacao.tipo] || tipoColors.info
                return (
                  <div
                    key={notificacao.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '20px',
                      borderRadius: '12px',
                      border: `1px solid ${!notificacao.lida ? '#3b82f6' : 'var(--border)'}`,
                      backgroundColor: !notificacao.lida ? 'rgba(59, 130, 246, 0.05)' : 'var(--muted)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: colors.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon style={{ width: '22px', height: '22px', color: colors.text }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)' }}>
                          {notificacao.titulo}
                        </h4>
                        <span style={badgeStyle({ bg: 'var(--muted)', text: 'var(--foreground-muted)' })}>
                          {tipoLabels[notificacao.tipo]}
                        </span>
                        {!notificacao.lida && (
                          <span style={badgeStyle({ bg: '#3b82f6', text: 'white' })}>
                            Nova
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', lineHeight: '1.5', marginBottom: '12px' }}>
                        {notificacao.mensagem}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>
                          {format(new Date(notificacao.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        {notificacao.providencia_id && (
                          <Link 
                            href={`/dashboard/providencias/${notificacao.providencia_id}`}
                            style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}
                          >
                            Ver providência
                          </Link>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {!notificacao.lida && (
                        <button 
                          onClick={() => handleMarkAsRead(notificacao.id)}
                          title="Marcar como lida"
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--background)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--foreground-muted)'
                          }}
                        >
                          <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(notificacao.id)}
                        title="Excluir"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--background)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#ef4444'
                        }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
