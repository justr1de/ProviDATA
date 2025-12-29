'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const { tenant } = useAuthStore()
  const supabase = createClient()

  const loadCategorias = async () => {
    if (!tenant) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('nome')

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

    try {
      if (editingId) {
        const { error } = await supabase
          .from('categorias')
          .update({
            nome: formData.nome,
            descricao: formData.descricao || null,
            cor: formData.cor,
          })
          .eq('id', editingId)

        if (error) throw error
        toast.success('Categoria atualizada com sucesso')
      } else {
        const { error } = await supabase
          .from('categorias')
          .insert({
            tenant_id: tenant.id,
            nome: formData.nome,
            descricao: formData.descricao || null,
            cor: formData.cor,
          })

        if (error) throw error
        toast.success('Categoria criada com sucesso')
      }

      setFormData({ nome: '', descricao: '', cor: '#3B82F6' })
      setShowForm(false)
      setEditingId(null)
      loadCategorias()
    } catch (error) {
      console.error('Error saving categoria:', error)
      toast.error('Erro ao salvar categoria')
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
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Categoria excluída com sucesso')
      loadCategorias()
    } catch (error) {
      console.error('Error deleting categoria:', error)
      toast.error('Erro ao excluir categoria')
    }
  }

  const cancelForm = () => {
    setFormData({ nome: '', descricao: '', cor: '#3B82F6' })
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-[var(--muted-foreground)]">
            Gerencie as categorias de providências
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Nova Categoria
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome *"
                  placeholder="Nome da categoria"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
                
                <Input
                  label="Descrição"
                  placeholder="Descrição opcional"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Cor
                </label>
                <div className="flex flex-wrap gap-2">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.cor === color 
                          ? 'border-[var(--foreground)] scale-110' 
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, cor: color })}
                    />
                  ))}
                  <input
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="w-8 h-8 rounded-full cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={cancelForm}>
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4" />
                  {editingId ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {categorias.length} categoria{categorias.length !== 1 ? 's' : ''} cadastrada{categorias.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="text-[var(--muted-foreground)]">
                Nenhuma categoria cadastrada ainda
              </p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" />
                Criar Primeira Categoria
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className="p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: categoria.cor }}
                      />
                      <div>
                        <h4 className="font-medium">{categoria.nome}</h4>
                        {categoria.descricao && (
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {categoria.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(categoria)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(categoria.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
