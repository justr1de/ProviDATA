'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building2, 
  UserPlus, 
  Settings,
  Trash2,
  Edit,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { Tenant } from '@/types/database'

interface Usuario {
  id: string
  email: string
  nome_completo: string | null
  papel: string
  status: string
  created_at: string
  tenant_id: string
  tenant?: {
    nome: string
  }
}

interface GabineteForm {
  nome: string
  cnpj: string
  endereco: string
  telefone: string
  email: string
  status: 'ativo' | 'inativo'
}

export default function AdministracaoPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [gabinetes, setGabinetes] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [novoGabineteForm, setNovoGabineteForm] = useState<GabineteForm>({
    nome: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    email: '',
    status: 'ativo'
  })
  const [editingGabinete, setEditingGabinete] = useState<Tenant | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      
      // Carregar usuários
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select(`
          *,
          tenant:tenants(nome)
        `)
        .order('created_at', { ascending: false })

      if (usuariosError) throw usuariosError

      // Carregar gabinetes
      const { data: gabinetesData, error: gabinetesError } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false })

      if (gabinetesError) throw gabinetesError

      setUsuarios(usuariosData || [])
      setGabinetes(gabinetesData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCriarGabinete = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert([novoGabineteForm])
        .select()
        .single()

      if (error) throw error

      toast.success('Gabinete criado com sucesso!')
      setNovoGabineteForm({
        nome: '',
        cnpj: '',
        endereco: '',
        telefone: '',
        email: '',
        status: 'ativo'
      })
      carregarDados()
    } catch (error) {
      console.error('Erro ao criar gabinete:', error)
      toast.error('Erro ao criar gabinete')
    }
  }

  const handleAtualizarGabinete = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingGabinete) return

    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          nome: editingGabinete.nome,
          cnpj: editingGabinete.cnpj,
          endereco: editingGabinete.endereco,
          telefone: editingGabinete.telefone,
          email: editingGabinete.email,
          status: editingGabinete.status
        })
        .eq('id', editingGabinete.id)

      if (error) throw error

      toast.success('Gabinete atualizado com sucesso!')
      setEditingGabinete(null)
      carregarDados()
    } catch (error) {
      console.error('Erro ao atualizar gabinete:', error)
      toast.error('Erro ao atualizar gabinete')
    }
  }

  const handleDesativarGabinete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este gabinete?')) return

    try {
      const { error } = await supabase
        .from('tenants')
        .update({ status: 'inativo' })
        .eq('id', id)

      if (error) throw error

      toast.success('Gabinete desativado com sucesso!')
      carregarDados()
    } catch (error) {
      console.error('Erro ao desativar gabinete:', error)
      toast.error('Erro ao desativar gabinete')
    }
  }

  const handleAlterarStatusUsuario = async (id: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ status: novoStatus })
        .eq('id', id)

      if (error) throw error

      toast.success('Status do usuário atualizado!')
      carregarDados()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status do usuário')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, gabinetes e configurações do sistema
        </p>
      </div>

      <Tabs defaultValue="usuarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="gabinetes" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Gabinetes
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Usuários Tab */}
        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usuarios.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{usuario.nome_completo || 'Nome não informado'}</h3>
                        <Badge variant={usuario.status === 'ativo' ? 'default' : 'secondary'}>
                          {usuario.status}
                        </Badge>
                        <Badge variant="outline">{usuario.papel}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {usuario.email}
                        </span>
                        {usuario.tenant && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {usuario.tenant.nome}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAlterarStatusUsuario(
                          usuario.id,
                          usuario.status === 'ativo' ? 'inativo' : 'ativo'
                        )}
                      >
                        {usuario.status === 'ativo' ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gabinetes Tab */}
        <TabsContent value="gabinetes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Novo Gabinete</CardTitle>
              <CardDescription>
                Cadastre um novo gabinete no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCriarGabinete} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Gabinete</Label>
                    <Input
                      id="nome"
                      value={novoGabineteForm.nome}
                      onChange={(e) => setNovoGabineteForm({ ...novoGabineteForm, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={novoGabineteForm.cnpj}
                      onChange={(e) => setNovoGabineteForm({ ...novoGabineteForm, cnpj: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={novoGabineteForm.email}
                      onChange={(e) => setNovoGabineteForm({ ...novoGabineteForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={novoGabineteForm.telefone}
                      onChange={(e) => setNovoGabineteForm({ ...novoGabineteForm, telefone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={novoGabineteForm.endereco}
                      onChange={(e) => setNovoGabineteForm({ ...novoGabineteForm, endereco: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Gabinete
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gabinetes Cadastrados</CardTitle>
              <CardDescription>
                Lista de todos os gabinetes no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gabinetes.map((gabinete) => (
                  <div
                    key={gabinete.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    {editingGabinete?.id === gabinete.id ? (
                      <form onSubmit={handleAtualizarGabinete} className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-nome">Nome</Label>
                            <Input
                              id="edit-nome"
                              value={editingGabinete.nome}
                              onChange={(e) => setEditingGabinete({ ...editingGabinete, nome: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-cnpj">CNPJ</Label>
                            <Input
                              id="edit-cnpj"
                              value={editingGabinete.cnpj}
                              onChange={(e) => setEditingGabinete({ ...editingGabinete, cnpj: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-email">E-mail</Label>
                            <Input
                              id="edit-email"
                              type="email"
                              value={editingGabinete.email}
                              onChange={(e) => setEditingGabinete({ ...editingGabinete, email: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-telefone">Telefone</Label>
                            <Input
                              id="edit-telefone"
                              value={editingGabinete.telefone}
                              onChange={(e) => setEditingGabinete({ ...editingGabinete, telefone: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label htmlFor="edit-endereco">Endereço</Label>
                            <Input
                              id="edit-endereco"
                              value={editingGabinete.endereco}
                              onChange={(e) => setEditingGabinete({ ...editingGabinete, endereco: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm">Salvar</Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingGabinete(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{gabinete.nome}</h3>
                            <Badge variant={gabinete.status === 'ativo' ? 'default' : 'secondary'}>
                              {gabinete.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {gabinete.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {gabinete.telefone}
                            </span>
                            <span className="flex items-center gap-1 col-span-2">
                              <MapPin className="h-3 w-3" />
                              {gabinete.endereco}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingGabinete(gabinete)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDesativarGabinete(gabinete.id)}
                            disabled={gabinete.status === 'inativo'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Tab */}
        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Gerencie as configurações gerais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mr-2" />
                Em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
