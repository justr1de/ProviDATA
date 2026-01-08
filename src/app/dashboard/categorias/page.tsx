'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { isSuperAdmin } from '@/lib/auth-utils'
import { 
  Plus, 
  FolderOpen,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react'
import type { Categoria } from '@/types/database'
import { toast } from 'sonner'

const defaultColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ nome: '', descricao: '', cor: '#3B82F6' })
  const { user, gabinete: tenant } = useAuthStore()
  const supabase = createClient()

  const loadCategorias = async () => {
    if (!tenant) return

    setIsLoading(true)
    try {
      let query = supabase
        .from('categorias')
        .select('*')
      
      // Filtrar por gabinete apenas se não for super admin
      if (!isSuperAdmin(user)) {
        query = query.eq('gabinete_id', tenant.id)
      }
      
      query = query.order('nome')

      const { data, error } = await query

      if (error) throw error

      setCategorias(data || [])
    } catch (error) {
      console.error('Error loading categorias:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategorias()
  }, [tenant])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tenant || !formData.nome) {
      toast.error('O nome é obrigatório')
      return
    }

    if (!formData.descricao || !formData.descricao.trim()) {
      toast.error('A descrição é obrigatória')
      return
    }

    // Verificar se já existe uma categoria com o mesmo nome no gabinete
    const nomeNormalizado = formData.nome.trim().toLowerCase()
    const categoriaExistente = categorias.find(
      cat => cat.nome.trim().toLowerCase() === nomeNormalizado && cat.id !== editingId
    )
    
    if (categoriaExistente) {
      toast.error('Já existe uma categoria com este nome neste gabinete')
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('categorias')
          .update({
            nome: formData.nome.trim(),
            descricao: formData.descricao?.trim() || null,
            cor: formData.cor,
          })
          .eq('id', editingId)

        if (error) {
          // Tratar erro de constraint unique
          if (error.code === '23505') {
            toast.error('Já existe uma categoria com este nome neste gabinete')
            return
          }
          throw error
        }
        toast.success('Categoria atualizada com sucesso')
      } else {
        const { error } = await supabase
          .from('categorias')
          .insert({
            gabinete_id: tenant.id,
            nome: formData.nome.trim(),
            descricao: formData.descricao?.trim() || null,
            cor: formData.cor,
          })

        if (error) {
          // Tratar erro de constraint unique
          if (error.code === '23505') {
            toast.error('Já existe uma categoria com este nome neste gabinete')
            return
          }
          throw error
        }
        toast.success('Categoria criada com sucesso')
      }

      setFormData({ nome: '', descricao: '', cor: '#3B82F6' })
      setShowForm(false)
      setEditingId(null)
      loadCategorias()
    } catch (error: any) {
      console.error('Error saving categoria:', error)
      if (error?.code === '23505') {
        toast.error('Já existe uma categoria com este nome neste gabinete')
      } else if (error?.code === '42501' || error?.message?.includes('permission')) {
        toast.error('Você não tem permissão para realizar esta operação')
      } else {
        toast.error('Erro ao salvar categoria')
      }
    }
  }

  const handleEdit = (categoria: Categoria) => {
    setFormData({
      nome: categoria.nome,
      descricao: categoria.descricao || '',
      cor: categoria.cor,
    })
    setEditingId(categoria.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    // Primeiro, verificar se há providências usando esta categoria
    try {
      const { count, error: countError } = await supabase
        .from('providencias')
        .select('*', { count: 'exact', head: true })
        .eq('categoria_id', id)

      if (countError) throw countError

      if (count && count > 0) {
        toast.error(`Não é possível excluir esta categoria. Existem ${count} providência(s) vinculada(s) a ela. Remova ou altere a categoria das providências antes de excluir.`)
        return
      }

      if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)

      if (error) {
        // Tratar erro de foreign key de forma mais amigável
        if (error.code === '23503') {
          toast.error('Não é possível excluir esta categoria. Existem providências vinculadas a ela.')
          return
        }
        throw error
      }

      toast.success('Categoria excluída com sucesso')
      loadCategorias()
    } catch (error: any) {
      console.error('Error deleting categoria:', error)
      if (error?.code === '23503') {
        toast.error('Não é possível excluir esta categoria. Existem providências vinculadas a ela.')
      } else {
        toast.error('Erro ao excluir categoria')
      }
    }
  }

  const cancelForm = () => {
    setFormData({ nome: '', descricao: '', cor: '#3B82F6' })
    setShowForm(false)
    setEditingId(null)
  }

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
    flexDirection: 'column',
    gap: '12px'
  }

  const cardContentStyle: React.CSSProperties = {
    padding: '24px'
  }

  const buttonStyle: React.CSSProperties = {
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
    cursor: 'pointer',
    transition: 'all 0.2s ease'
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '14px',
    outline: 'none'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--foreground)',
    marginBottom: '8px'
  }

  return (
    <div className="px-1 md:px-2">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <FolderOpen style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
          <h1 className="text-xl md:text-2xl lg:text-[28px] font-bold" style={{ color: 'var(--foreground)' }}>
            Categorias
          </h1>
        </div>
        <p className="text-sm md:text-base" style={{ color: 'var(--foreground-muted)', marginBottom: '16px' }}>
          Gerencie as categorias de providências
        </p>
        {!showForm && (
          <button style={buttonStyle} onClick={() => setShowForm(true)}>
            <Plus style={{ width: '18px', height: '18px' }} />
            Nova Categoria
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ ...cardStyle, marginBottom: '24px' }}>
          <div style={cardHeaderStyle}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
          </div>
          <div style={cardContentStyle}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Nome *</label>
                  <input
                    type="text"
                    placeholder="Nome da categoria"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Descrição *</label>
                  <input
                    type="text"
                    placeholder="Descrição da categoria"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Cor</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: formData.cor === color ? '3px solid var(--foreground)' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: formData.cor === color ? 'scale(1.1)' : 'scale(1)'
                      }}
                      onClick={() => setFormData({ ...formData, cor: color })}
                    />
                  ))}
                  <input
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: 'none',
                      padding: 0
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" style={buttonOutlineStyle} onClick={cancelForm}>
                  <X style={{ width: '18px', height: '18px' }} />
                  Cancelar
                </button>
                <button type="submit" style={buttonStyle}>
                  <Save style={{ width: '18px', height: '18px' }} />
                  {editingId ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--foreground)' }}>
            Categorias Cadastradas
          </h2>
          <span style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>
            {categorias.length} categoria{categorias.length !== 1 ? 's' : ''}
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
          ) : categorias.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FolderOpen style={{ width: '48px', height: '48px', color: 'var(--foreground-muted)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '16px', color: 'var(--foreground-muted)', marginBottom: '16px' }}>
                Nenhuma categoria cadastrada ainda
              </p>
              <button style={buttonStyle} onClick={() => setShowForm(true)}>
                <Plus style={{ width: '18px', height: '18px' }} />
                Criar Primeira Categoria
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--muted)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div 
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: categoria.cor,
                          flexShrink: 0
                        }}
                      />
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>
                          {categoria.nome}
                        </h4>
                        {categoria.descricao && (
                          <p style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>
                            {categoria.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        onClick={() => handleEdit(categoria)}
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
                        <Edit style={{ width: '16px', height: '16px' }} />
                      </button>
                      <button 
                        onClick={() => handleDelete(categoria.id)}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
