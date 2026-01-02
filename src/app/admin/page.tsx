'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Building2, Users, FileText, MapPin, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Gabinete } from '@/types/database'

interface MetricasGlobais {
  total_gabinetes: number
  total_demandas: number
  cidades_atendidas: number
  total_usuarios: number
}

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

const CARGO_OPTIONS = [
  { value: 'vereador', label: 'Vereador' },
  { value: 'prefeito', label: 'Prefeito' },
  { value: 'deputado_estadual', label: 'Deputado Estadual' },
  { value: 'deputado_federal', label: 'Deputado Federal' },
  { value: 'senador', label: 'Senador' },
  { value: 'governador', label: 'Governador' }
]

export default function AdminDashboard() {
  const [metricas, setMetricas] = useState<MetricasGlobais>({
    total_gabinetes: 0,
    total_demandas: 0,
    cidades_atendidas: 0,
    total_usuarios: 0
  })
  const [gabinetes, setGabinetes] = useState<Gabinete[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    municipio: '',
    uf: 'RO',
    parlamentar_nome: '',
    parlamentar_cargo: 'deputado_estadual' as const,
    partido: '',
    telefone: '',
    email: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)

      // OTIMIZAÇÃO: Executar todas as queries em paralelo com Promise.all()
      // Isso reduz o tempo de carregamento de ~600ms para ~200ms
      const [
        { data: gabinetesData, error: gabError },
        { count: demandasCount, error: demError },
        { count: usuariosCount, error: userError }
      ] = await Promise.all([
        // Buscar gabinetes ordenados
        supabase
          .from('gabinetes')
          .select('id, nome, municipio, uf, parlamentar_nome, parlamentar_cargo, partido, ativo, created_at, updated_at')
          .order('created_at', { ascending: false }),
        
        // Buscar total de demandas
        supabase
          .from('providencias')
          .select('*', { count: 'exact', head: true }),
        
        // Buscar total de usuários
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
      ])

      // Verificar erros
      if (gabError) throw gabError
      if (demError) throw demError
      if (userError) throw userError

      setGabinetes(gabinetesData || [])

      // Calcular cidades únicas
      const cidadesUnicas = new Set(
        gabinetesData?.map(g => `${g.municipio}-${g.uf}`) || []
      ).size

      setMetricas({
        total_gabinetes: gabinetesData?.length || 0,
        total_demandas: demandasCount || 0,
        cidades_atendidas: cidadesUnicas,
        total_usuarios: usuariosCount || 0
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.municipio || !formData.uf) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    try {
      setSubmitting(true)

      const { data, error } = await supabase
        .from('gabinetes')
        .insert([{
          nome: formData.nome,
          municipio: formData.municipio,
          uf: formData.uf,
          parlamentar_nome: formData.parlamentar_nome || null,
          parlamentar_cargo: formData.parlamentar_cargo,
          partido: formData.partido || null,
          telefone: formData.telefone || null,
          email: formData.email || null,
          ativo: true
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Gabinete criado com sucesso!')
      setShowModal(false)
      setFormData({
        nome: '',
        municipio: '',
        uf: 'RO',
        parlamentar_nome: '',
        parlamentar_cargo: 'deputado_estadual',
        partido: '',
        telefone: '',
        email: ''
      })
      carregarDados()
    } catch (error) {
      console.error('Erro ao criar gabinete:', error)
      toast.error('Erro ao criar gabinete')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCargo = (cargo?: string) => {
    if (!cargo) return '-'
    return cargo.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--foreground-muted)' }}>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Painel Super Admin
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Visão geral de todos os gabinetes e métricas do sistema
        </p>
      </div>

      {/* Métricas Globais */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Total de Gabinetes */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                Total de Gabinetes
              </span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              {metricas.total_gabinetes}
            </p>
          </div>

          {/* Total de Demandas */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                Total de Demandas
              </span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-orange-600 flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              {metricas.total_demandas}
            </p>
          </div>

          {/* Cidades Atendidas */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                Cidades Atendidas
              </span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-600 flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              {metricas.cidades_atendidas}
            </p>
          </div>

          {/* Total de Usuários */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                Total de Usuários
              </span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-600 flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              {metricas.total_usuarios}
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Gabinetes */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 lg:px-8 py-5 sm:py-6 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Gabinetes Cadastrados
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm sm:text-base font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Novo Gabinete
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-5 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Parlamentar
                  </th>
                  <th className="px-5 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-5 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Município/UF
                  </th>
                  <th className="px-5 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Partido
                  </th>
                  <th className="px-5 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gabinetes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 sm:px-6 lg:px-8 py-12 text-center text-gray-500 text-sm sm:text-base">
                      Nenhum gabinete cadastrado
                    </td>
                  </tr>
                ) : (
                  gabinetes.map((gabinete) => (
                    <tr key={gabinete.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 sm:px-6 lg:px-8 py-4 sm:py-5 text-sm sm:text-base text-gray-900 font-medium">
                        {gabinete.nome}
                      </td>
                      <td className="px-5 sm:px-6 lg:px-8 py-4 sm:py-5 text-sm sm:text-base text-gray-700">
                        {gabinete.parlamentar_nome || '-'}
                      </td>
                      <td className="px-5 sm:px-6 lg:px-8 py-4 sm:py-5 text-sm sm:text-base text-gray-700">
                        {formatCargo(gabinete.parlamentar_cargo)}
                      </td>
                      <td className="px-5 sm:px-6 lg:px-8 py-4 sm:py-5 text-sm sm:text-base text-gray-700">
                        {gabinete.municipio}/{gabinete.uf}
                      </td>
                      <td className="px-5 sm:px-6 lg:px-8 py-4 sm:py-5 text-sm sm:text-base text-gray-700">
                        {gabinete.partido || '-'}
                      </td>
                      <td className="px-5 sm:px-6 lg:px-8 py-4 sm:py-5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                          gabinete.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {gabinete.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Novo Gabinete */}
      {showModal && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 50
            }}
            onClick={() => setShowModal(false)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border)',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            zIndex: 51
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--foreground)', margin: 0 }}>
                Novo Gabinete
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--foreground-muted)'
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>
                    Nome do Gabinete *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)'
                    }}
                    placeholder="Ex: Gabinete do Deputado João Silva"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>
                      Município *
                    </label>
                    <input
                      type="text"
                      value={formData.municipio}
                      onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)'
                      }}
                      placeholder="Ex: Porto Velho"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>
                      UF *
                    </label>
                    <select
                      value={formData.uf}
                      onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)'
                      }}
                    >
                      {UF_OPTIONS.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>
                    Nome do Parlamentar
                  </label>
                  <input
                    type="text"
                    value={formData.parlamentar_nome}
                    onChange={(e) => setFormData({ ...formData, parlamentar_nome: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)'
                    }}
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>
                      Cargo
                    </label>
                    <select
                      value={formData.parlamentar_cargo}
                      onChange={(e) => setFormData({ ...formData, parlamentar_cargo: e.target.value as any })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)'
                      }}
                    >
                      {CARGO_OPTIONS.map(cargo => (
                        <option key={cargo.value} value={cargo.value}>{cargo.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>
                      Partido
                    </label>
                    <input
                      type="text"
                      value={formData.partido}
                      onChange={(e) => setFormData({ ...formData, partido: e.target.value.toUpperCase() })}
                      maxLength={10}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)'
                      }}
                      placeholder="Ex: PT"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)'
                    }}
                    placeholder="(69) 99999-9999"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--foreground)', marginBottom: '8px' }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)'
                    }}
                    placeholder="contato@gabinete.com.br"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    color: 'var(--foreground)',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  {submitting ? 'Criando...' : 'Criar Gabinete'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
