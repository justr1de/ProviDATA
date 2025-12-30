'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Shield, 
  Users, 
  Building2, 
  Settings,
  UserPlus,
  Edit,
  Trash2,
  Key,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  nome: string
  email: string
  role: string
  ativo: boolean
  created_at: string
}

const tabs = [
  { id: 'usuarios', name: 'Usuários', icon: Users },
  { id: 'gabinete', name: 'Gabinete', icon: Building2 },
  { id: 'seguranca', name: 'Segurança', icon: Key },
]

export default function AdministracaoPage() {
  const [activeTab, setActiveTab] = useState('usuarios')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setUsers(data)
    }
    setLoading(false)
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('users')
      .update({ ativo: !currentStatus })
      .eq('id', userId)

    if (!error) {
      toast.success(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`)
      loadUsers()
    } else {
      toast.error('Erro ao atualizar status do usuário')
    }
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Shield style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--foreground)' }}>
            Administração
          </h1>
        </div>
        <p style={{ fontSize: '16px', color: 'var(--foreground-muted)' }}>
          Gerencie usuários, configurações do gabinete e segurança do sistema
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '32px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 24px',
                borderRadius: '12px 12px 0 0',
                backgroundColor: isActive ? 'var(--card)' : 'transparent',
                border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                borderBottom: isActive ? '1px solid var(--card)' : '1px solid transparent',
                marginBottom: '-1px',
                fontSize: '15px',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? 'var(--primary)' : 'var(--foreground-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon style={{ width: '20px', height: '20px' }} />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div style={{
        padding: '28px',
        borderRadius: '16px',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)'
      }}>
        {activeTab === 'usuarios' && (
          <div>
            {/* Users Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>
                  Gerenciar Usuários
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>
                  {users.length} usuário(s) cadastrado(s)
                </p>
              </div>
              <button
                onClick={() => setShowNewUserModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <UserPlus style={{ width: '18px', height: '18px' }} />
                Novo Usuário
              </button>
            </div>

            {/* Users Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usuário</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Função</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cadastro</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--foreground-muted)' }}>
                        Carregando usuários...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--foreground-muted)' }}>
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '600',
                              fontSize: '16px'
                            }}>
                              {user.nome?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)' }}>
                                {user.nome || 'Sem nome'}
                              </p>
                              <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Mail style={{ width: '12px', height: '12px' }} />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: user.role === 'superadmin' ? 'rgba(139, 92, 246, 0.1)' : 'var(--muted)',
                            color: user.role === 'superadmin' ? '#8b5cf6' : 'var(--foreground)',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}>
                            {user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Administrador' : 'Usuário'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {user.ativo !== false ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontSize: '14px' }}>
                              <CheckCircle style={{ width: '16px', height: '16px' }} />
                              Ativo
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '14px' }}>
                              <XCircle style={{ width: '16px', height: '16px' }} />
                              Inativo
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: 'var(--foreground-muted)' }}>
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button
                              style={{
                                padding: '8px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--muted)',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--foreground-muted)'
                              }}
                              title="Editar"
                            >
                              <Edit style={{ width: '16px', height: '16px' }} />
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user.id, user.ativo !== false)}
                              style={{
                                padding: '8px',
                                borderRadius: '8px',
                                backgroundColor: user.ativo !== false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                border: 'none',
                                cursor: 'pointer',
                                color: user.ativo !== false ? '#ef4444' : '#22c55e'
                              }}
                              title={user.ativo !== false ? 'Desativar' : 'Ativar'}
                            >
                              {user.ativo !== false ? <XCircle style={{ width: '16px', height: '16px' }} /> : <CheckCircle style={{ width: '16px', height: '16px' }} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'gabinete' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '24px' }}>
              Configurações do Gabinete
            </h2>
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              backgroundColor: 'var(--muted)', 
              borderRadius: '12px',
              border: '2px dashed var(--border)'
            }}>
              <Building2 style={{ width: '48px', height: '48px', color: 'var(--foreground-muted)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '16px', color: 'var(--foreground-muted)' }}>
                Configurações do gabinete em desenvolvimento
              </p>
            </div>
          </div>
        )}

        {activeTab === 'seguranca' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '24px' }}>
              Configurações de Segurança
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Security Options */}
              <div style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: 'var(--muted)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>
                      Autenticação em Dois Fatores
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                  </div>
                  <button style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Configurar
                  </button>
                </div>
              </div>

              <div style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: 'var(--muted)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>
                      Logs de Acesso
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>
                      Visualize o histórico de acessos ao sistema
                    </p>
                  </div>
                  <button style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--secondary)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Ver Logs
                  </button>
                </div>
              </div>

              <div style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <AlertTriangle style={{ width: '24px', height: '24px', color: '#f59e0b', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>
                      Sessões Ativas
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', marginBottom: '12px' }}>
                      Você tem 1 sessão ativa. Encerre sessões que você não reconhece.
                    </p>
                    <button style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      color: '#f59e0b',
                      border: '1px solid #f59e0b',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      Gerenciar Sessões
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
