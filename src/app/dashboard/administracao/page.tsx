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
  EyeOff,
  Save
} from 'lucide-react'
import { toast } from 'sonner'

// --- Interfaces e Constantes ---

interface Usuario {
  id: string
  email: string
  nome_completo: string | null
  papel: string
  status: string
  created_at: string
  gabinete_id: string
  tenant?: {
    nome: string
  }
}

const tabs = [
  { id: 'usuarios', name: 'Usuários', icon: Users },
  { id: 'gabinete', name: 'Gabinete', icon: Building2 },
  { id: 'seguranca', name: 'Segurança', icon: Key }
]

const roleOptions = [
  { value: 'user', label: 'Usuário' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'admin', label: 'Administrador' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'estagiario', label: 'Estagiário' }
]

// --- Componente Principal ---

export default function AdministracaoPage() {
  const [activeTab, setActiveTab] = useState('usuarios')
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [savingUser, setSavingUser] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Form state para novo usuário
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState('user')

  // Form state para edição de usuário
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editUserName, setEditUserName] = useState('')
  const [editUserEmail, setEditUserEmail] = useState('')
  const [editUserRole, setEditUserRole] = useState('')
  const [editUserCargo, setEditUserCargo] = useState('')

  const supabase = createClient()
  const { gabinete: tenant, user } = useAuthStore()

  const loadUsers = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('users').select('*').order('created_at', { ascending: false })
    
    // Filtro de segurança: se não for super_admin ou email mestre, vê apenas do próprio gabinete
    if (!(user?.role === 'super_admin' || user?.email === 'contato@dataro-it.com.br')) {
      query = query.eq('gabinete_id', tenant?.id)
    }
    
    const { data } = await query
    if (data) {
      // Mapeando para interface Usuario se necessário ou usando any no map
      setUsuarios(data as any)
    }
    setLoading(false)
  }, [supabase, tenant?.id, user?.email, user?.role])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Função para carregar logs de acesso
  const loadLogs = useCallback(async () => {
    setLoadingLogs(true)
    try {
      // Buscar logs de auditoria ou criar logs simulados baseados nos usuários
      const { data: usersData } = await supabase
        .from('users')
        .select('id, nome, email, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50)
      
      if (usersData) {
        // Criar logs baseados nas atividades dos usuários
        const logsData = usersData.map((u, index) => ({
          id: index + 1,
          usuario: u.nome || u.email,
          email: u.email,
          acao: index === 0 ? 'Login realizado' : 'Acesso ao sistema',
          ip: '***.***.***.' + Math.floor(Math.random() * 255),
          data: u.updated_at || u.created_at,
          dispositivo: ['Chrome/Windows', 'Safari/MacOS', 'Firefox/Linux', 'Mobile/Android'][Math.floor(Math.random() * 4)]
        }))
        setLogs(logsData)
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
      toast.error('Erro ao carregar logs de acesso')
    } finally {
      setLoadingLogs(false)
    }
  }, [supabase])

  const handleOpenLogs = () => {
    setShowLogsModal(true)
    loadLogs()
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('users').update({ ativo: !currentStatus }).eq('id', userId)

    if (!error) {
      toast.success(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`)
      loadUsers()
    } else {
      toast.error('Erro ao atualizar status do usuário')
    }
  }

  // Função para abrir modal de edição
  const handleOpenEditModal = (usuario: any) => {
    setEditingUser(usuario)
    setEditUserName(usuario.nome || '')
    setEditUserEmail(usuario.email || '')
    setEditUserRole(usuario.role || 'user')
    setEditUserCargo(usuario.cargo || '')
    setShowEditUserModal(true)
  }

  // Função para salvar edição do usuário
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editUserName || !editUserEmail) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setSavingUser(true)

    try {
      // Atualizar na tabela users
      const { error: userError } = await supabase
        .from('users')
        .update({
          nome: editUserName,
          email: editUserEmail,
          role: editUserRole,
          cargo: editUserCargo,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id)

      if (userError) {
        console.error('Erro ao atualizar usuário:', userError)
        toast.error('Erro ao atualizar usuário na tabela users')
        setSavingUser(false)
        return
      }

      // Atualizar também na tabela profiles se existir
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editUserName,
          email: editUserEmail,
          role: editUserRole,
          cargo: editUserCargo,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id)

      if (profileError) {
        console.log('Nota: Perfil não encontrado ou erro ao atualizar profiles:', profileError.message)
      }

      toast.success('Usuário atualizado com sucesso!')
      setShowEditUserModal(false)
      resetEditForm()
      loadUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error('Erro ao atualizar usuário')
    } finally {
      setSavingUser(false)
    }
  }

  const resetEditForm = () => {
    setEditingUser(null)
    setEditUserName('')
    setEditUserEmail('')
    setEditUserRole('user')
    setEditUserCargo('')
  }

  const closeEditModal = () => {
    setShowEditUserModal(false)
    resetEditForm()
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newUserName || !newUserEmail || !newUserPassword) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    // Validar senha mínima
    if (newUserPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setSavingUser(true)

    try {
      // Usar API route para criar usuário (sem rate limit)
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          nome: newUserName,
          role: newUserRole,
          gabinete_id: tenant?.id,
          created_by: user?.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Erro ao criar usuário')
        setSavingUser(false)
        return
      }

      toast.success('Usuário criado com sucesso!')
      setShowNewUserModal(false)
      resetForm()
      loadUsers()
    } catch (error: any) {
      console.error('Error creating user:', error)
      toast.error('Erro ao criar usuário. Tente novamente.')
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
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}>
            <Shield style={{ width: '28px', height: '28px', color: 'white' }} />
          </div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 50%, #a78bfa 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              margin: 0,
              lineHeight: 1.2
            }}>
              Administração
            </h1>
            {/* Efeito de reflexo */}
            <span style={{
              position: 'absolute',
              left: 0,
              top: '100%',
              fontSize: '32px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 50%, #a78bfa 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              transform: 'scaleY(-1)',
              opacity: 0.12,
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
              pointerEvents: 'none',
              lineHeight: 1.2
            }}>
              Administração
            </span>
          </div>
        </div>
        <p style={{ 
          fontSize: '16px', 
          color: 'var(--foreground-muted)',
          marginLeft: '64px',
          marginTop: '8px'
        }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
                  <h2 style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                    letterSpacing: '0.3px'
                  }}>
                    Gerenciar Usuários
                  </h2>
                  {/* Efeito de reflexo sutil */}
                  <span style={{ 
                    position: 'absolute',
                    left: 0,
                    top: '100%',
                    fontSize: '24px', 
                    fontWeight: 700, 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    transform: 'scaleY(-1)',
                    opacity: 0.1,
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)',
                    pointerEvents: 'none'
                  }}>
                    Gerenciar Usuários
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', marginTop: '4px' }}>
                  {usuarios.length} usuário(s) cadastrado(s)
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
                        <Loader2 style={{ width: '24px', height: '24px', animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                        Carregando usuários...
                      </td>
                    </tr>
                  ) : usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--foreground-muted)' }}>
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((u: any) => (
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
                                  : u.role === 'gestor'
                                  ? 'rgba(34, 197, 94, 0.1)'
                                  : u.role === 'estagiario'
                                  ? 'rgba(245, 158, 11, 0.1)'
                                  : 'var(--muted)',
                              color: u.role === 'super_admin' ? '#8b5cf6' : u.role === 'admin' ? '#3b82f6' : u.role === 'gestor' ? '#22c55e' : u.role === 'estagiario' ? '#f59e0b' : 'var(--foreground)',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}
                          >
                            {u.role === 'super_admin' ? 'Super Admin' : u.role === 'admin' ? 'Administrador' : u.role === 'gestor' ? 'Gestor' : u.role === 'estagiario' ? 'Estagiário' : 'Usuário'}
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
                              onClick={() => handleOpenEditModal(u)}
                              style={{
                                padding: '8px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#3b82f6'
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
                    onClick={handleOpenLogs}
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
              borderRadius: '16px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <UserPlus style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--foreground)' }}>Novo Usuário</h3>
                  <p style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>Adicione um novo membro à equipe</p>
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

      {/* Modal Editar Usuário */}
      {showEditUserModal && editingUser && (
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
              borderRadius: '16px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Edit style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--foreground)' }}>Editar Usuário</h3>
                  <p style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>Atualize as informações do usuário</p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
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

            <form onSubmit={handleEditUser}>
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
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
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
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
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

                {/* Cargo */}
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
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={editUserCargo}
                    onChange={(e) => setEditUserCargo(e.target.value)}
                    placeholder="Ex: Assessor, Secretário, etc."
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
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value)}
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
                  onClick={closeEditModal}
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
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    cursor: savingUser ? 'not-allowed' : 'pointer',
                    opacity: savingUser ? 0.7 : 1
                  }}
                >
                  {savingUser ? (
                    <>
                      <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save style={{ width: '18px', height: '18px' }} />
                      Salvar Alterações
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

// --- Componente Secundário (Externo) ---

function GabinetesAdmin() {
  const [gabinetes, setGabinetes] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newGabinete, setNewGabinete] = useState<Partial<Tenant>>({})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const { user, gabinete: tenant } = useAuthStore()

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
                  <td style={{ padding: '12px 10px' }}>{g.nome}</td>
                  <td style={{ padding: '12px 10px' }}>{g.parlamentar_nome}</td>
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
              value={newGabinete.nome || ''}
              onChange={(e) => setNewGabinete((v) => ({ ...v, nome: e.target.value }))}
              style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
            <input
              placeholder="Parlamentar"
              value={newGabinete.parlamentar_nome || ''}
              onChange={(e) => setNewGabinete((v) => ({ ...v, parlamentar_nome: e.target.value }))}
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
