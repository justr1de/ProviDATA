'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Tenant } from '@/types/database'
import {
  Shield,
  Users,
  Building2,
  Settings,
  UserPlus,
  Edit,
  XCircle,
  CheckCircle,
  Key,
  Mail,
  AlertTriangle,
  X,
  Loader2,
  Eye,
  EyeOff
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
  { id: 'seguranca', name: 'Segurança', icon: Key }
]

const roleOptions = [
  { value: 'user', label: 'Usuário' },
  { value: 'admin', label: 'Administrador' },
  { value: 'super_admin', label: 'Super Admin' }
]

export default function AdministracaoPage() {
  const [activeTab, setActiveTab] = useState('usuarios')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [savingUser, setSavingUser] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form state
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState('user')

  const supabase = createClient()
  const { tenant, user } = useAuthStore()

  const loadUsers = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('users').select('*').order('created_at', { ascending: false })
    if (!(user?.role === 'super_admin' || user?.email === 'contato@dataro-it.com.br')) {
      query = query.eq('gabinete_id', tenant?.id)
    }
    const { data } = await query
    if (data) {
      setUsers(data)
    }
    setLoading(false)
  }, [supabase, tenant?.id, user?.email, user?.role])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('users').update({ ativo: !currentStatus }).eq('id', userId)

    if (!error) {
      toast.success(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`)
      loadUsers()
    } else {
      toast.error('Erro ao atualizar status do usuário')
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newUserName || !newUserEmail || !newUserPassword) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (newUserPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setSavingUser(true)

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            nome: newUserName
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        if (authError.message.includes('already registered')) {
          toast.error('Este e-mail já está cadastrado')
        } else {
          toast.error(`Erro ao criar usuário: ${authError.message}`)
        }
        setSavingUser(false)
        return
      }

      if (authData.user) {
        // Criar registro na tabela users
        const { error: userError } = await supabase.from('users').insert({
          id: authData.user.id,
          gabinete_id: tenant?.id,
          nome: newUserName,
          email: newUserEmail,
          role: newUserRole,
          ativo: true
        })

        if (userError) {
          console.error('User table error:', userError)
          toast.error('Usuário criado no auth, mas houve erro ao salvar dados adicionais')
        } else {
          toast.success('Usuário criado com sucesso!')
          setShowNewUserModal(false)
          resetForm()
          loadUsers()
        }
      }
    } catch (error) {
      console.error('Create user error:', error)
      toast.error('Erro ao criar usuário')
    } finally {
      setSavingUser(false)
    }
  }

  const resetForm = () => {
    setNewUserName('')
    setNewUserEmail('')
    setNewUserPassword('')
    setNewUserRole('user')
    setShowPassword(false)
  }

  const closeModal = () => {
    setShowNewUserModal(false)
    resetForm()
  }

  return (
    <div className="max-w-[1400px] mx-auto px-1 md:px-2">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Shield style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
          <h1 className="text-xl md:text-2xl lg:text-[28px] font-bold" style={{ color: 'var(--foreground)' }}>
            Administração
          </h1>
        </div>
        <p style={{ fontSize: '16px', color: 'var(--foreground-muted)' }}>
          Gerencie usuários, configurações do gabinete e segurança do sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 md:mb-8 border-b border-[var(--border)] pb-0 overflow-x-auto">
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
      <div className="p-4 md:p-6 lg:p-7 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        {activeTab === 'usuarios' && (
          <div>
            {/* Users Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>Gerenciar Usuários</h2>
                <p style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>{users.length} usuário(s) cadastrado(s)</p>
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
                        <Loader2 style={{ width: '24px', height: '24px', animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
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
                    users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
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
                              }}
                            >
                              {u.nome?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)' }}>{u.nome || 'Sem nome'}</p>
                              <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Mail style={{ width: '12px', height: '12px' }} />
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              backgroundColor:
                                u.role === 'super_admin'
                                  ? 'rgba(139, 92, 246, 0.1)'
                                  : u.role === 'admin'
                                  ? 'rgba(59, 130, 246, 0.1)'
                                  : 'var(--muted)',
                              color: u.role === 'super_admin' ? '#8b5cf6' : u.role === 'admin' ? '#3b82f6' : 'var(--foreground)',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}
                          >
                            {u.role === 'super_admin' ? 'Super Admin' : u.role === 'admin' ? 'Administrador' : 'Usuário'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {u.ativo !== false ? (
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
                          {new Date(u.created_at).toLocaleDateString('pt-BR')}
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
                              onClick={() => toggleUserStatus(u.id, u.ativo !== false)}
                              style={{
                                padding: '8px',
                                borderRadius: '8px',
                                backgroundColor: u.ativo !== false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                border: 'none',
                                cursor: 'pointer',
                                color: u.ativo !== false ? '#ef4444' : '#22c55e'
                              }}
                              title={u.ativo !== false ? 'Desativar' : 'Ativar'}
                            >
                              {u.ativo !== false ? <XCircle style={{ width: '16px', height: '16px' }} /> : <CheckCircle style={{ width: '16px', height: '16px' }} />}
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

        {activeTab === 'gabinete' && <GabinetesAdmin />}

        {activeTab === 'seguranca' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '24px' }}>Configurações de Segurança</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--muted)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>Autenticação em Dois Fatores</h3>
                    <p style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>Adicione uma camada extra de segurança à sua conta</p>
                  </div>
                  <button
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Configurar
                  </button>
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--muted)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>Logs de Acesso</h3>
                    <p style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>Visualize o histórico de acessos ao sistema</p>
                  </div>
                  <button
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--secondary)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Ver Logs
                  </button>
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <AlertTriangle style={{ width: '24px', height: '24px', color: '#f59e0b', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>Sessões Ativas</h3>
                    <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', marginBottom: '12px' }}>
                      Você tem 1 sessão ativa. Encerre sessões que você não reconhece.
                    </p>
                    <button
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        backgroundColor: 'transparent',
                        color: '#f59e0b',
                        border: '1px solid #f59e0b',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Gerenciar Sessões
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo Usuário */}
      {showNewUserModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--card)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <UserPlus style={{ width: '22px', height: '22px', color: 'white' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--foreground)', margin: 0 }}>Novo Usuário</h2>
                  <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', margin: 0 }}>Adicione um novo membro ao gabinete</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--muted)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--foreground-muted)'
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateUser}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Nome */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Digite o nome completo"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '15px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="usuario@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '15px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Senha */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    Senha *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      style={{
                        width: '100%',
                        padding: '12px 48px 12px 16px',
                        fontSize: '15px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '4px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--foreground-muted)'
                      }}
                    >
                      {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    Função
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '15px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '20px 24px',
                  borderTop: '1px solid var(--border)',
                  backgroundColor: 'var(--muted)'
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={savingUser}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    cursor: savingUser ? 'not-allowed' : 'pointer',
                    opacity: savingUser ? 0.5 : 1
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '700',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    cursor: savingUser ? 'not-allowed' : 'pointer',
                    opacity: savingUser ? 0.7 : 1
                  }}
                >
                  {savingUser ? (
                    <>
                      <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                      Criando...
                    </>
                  ) : (
                    <>
                      <UserPlus style={{ width: '18px', height: '18px' }} />
                      Criar Usuário
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function GabinetesAdmin() {
  const [gabinetes, setGabinetes] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newGabinete, setNewGabinete] = useState<Partial<Tenant>>({})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const { user, tenant } = useAuthStore()

  const loadGabinetes = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('tenants').select('*').eq('type', 'gabinete').order('created_at', { ascending: false })
    if (!(user?.role === 'super_admin' || user?.email === 'contato@dataro-it.com.br')) {
      query = query.eq('id', tenant?.id)
    }
    const { data } = await query
    if (data) setGabinetes(data)
    setLoading(false)
  }, [supabase, tenant?.id, user?.email, user?.role])

  useEffect(() => {
    loadGabinetes()
  }, [loadGabinetes])

  const handleAtivarDesativar = async (id: string, ativo: boolean) => {
    await supabase.from('tenants').update({ ativo: !ativo }).eq('id', id)
    loadGabinetes()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await supabase
      .from('tenants')
      .insert({
        ...newGabinete,
        type: 'gabinete',
        ativo: true
      })
    setShowNewModal(false)
    setNewGabinete({})
    setSaving(false)
    loadGabinetes()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--foreground)' }}>Gabinetes</h2>
        <button
          onClick={() => setShowNewModal(true)}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          Novo Gabinete
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Parlamentar</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Município</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>UF</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                  Carregando...
                </td>
              </tr>
            ) : gabinetes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                  Nenhum gabinete encontrado
                </td>
              </tr>
            ) : (
              gabinetes.map((g) => (
                <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 10px' }}>{g.name}</td>
                  <td style={{ padding: '12px 10px' }}>{g.parlamentar_name}</td>
                  <td style={{ padding: '12px 10px' }}>{g.municipio}</td>
                  <td style={{ padding: '12px 10px' }}>{g.uf}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    {g.ativo ? <span style={{ color: '#22c55e', fontWeight: 600 }}>Ativo</span> : <span style={{ color: '#ef4444', fontWeight: 600 }}>Inativo</span>}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleAtivarDesativar(g.id, g.ativo)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: g.ativo ? '#fee2e2' : '#dcfce7',
                        color: g.ativo ? '#ef4444' : '#22c55e',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {g.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal Novo Gabinete */}
      {showNewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <form
            onSubmit={handleSave}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 32,
              minWidth: 340,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Novo Gabinete</h3>
            <input
              required
              placeholder="Nome"
              value={newGabinete.name || ''}
              onChange={(e) => setNewGabinete((v) => ({ ...v, name: e.target.value }))}
              style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
            <input
              placeholder="Parlamentar"
              value={newGabinete.parlamentar_name || ''}
              onChange={(e) => setNewGabinete((v) => ({ ...v, parlamentar_name: e.target.value }))}
              style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
            <input
              placeholder="Município"
              value={newGabinete.municipio || ''}
              onChange={(e) => setNewGabinete((v) => ({ ...v, municipio: e.target.value }))}
              style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
            <input
              placeholder="UF"
              value={newGabinete.uf || ''}
              onChange={(e) => setNewGabinete((v) => ({ ...v, uf: e.target.value }))}
              style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 6,
                  border: 'none',
                  background: '#f3f4f6',
                  color: '#374151',
                  fontWeight: 600
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 6,
                  border: 'none',
                  background: '#16a34a',
                  color: 'white',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}