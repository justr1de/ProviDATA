'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Save, Building2 } from 'lucide-react'
import { toast } from 'sonner'

const tipoOptions = [
  { value: 'secretaria_municipal', label: 'Secretaria Municipal' },
  { value: 'secretaria_estadual', label: 'Secretaria Estadual' },
  { value: 'mp_estadual', label: 'Ministério Público Estadual' },
  { value: 'mp_federal', label: 'Ministério Público Federal' },
  { value: 'defensoria', label: 'Defensoria Pública' },
  { value: 'tribunal_contas', label: 'Tribunal de Contas' },
  { value: 'outros', label: 'Outros' },
]

export default function EditarOrgaoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'secretaria_municipal',
    sigla: '',
    email: '',
    telefone: '',
    endereco: '',
    responsavel: '',
  })

  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { tenant } = useAuthStore()
  const orgaoId = params.id as string

  useEffect(() => {
    const loadOrgao = async () => {
      if (!tenant || !orgaoId) return

      try {
        const { data, error } = await supabase
          .from('orgaos')
          .select('*')
          .eq('id', orgaoId)
          .eq('tenant_id', tenant.id)
          .single()

        if (error) throw error

        if (data) {
          setFormData({
            nome: data.nome || '',
            tipo: data.tipo || 'secretaria_municipal',
            sigla: data.sigla || '',
            email: data.email || '',
            telefone: data.telefone || '',
            endereco: data.endereco || '',
            responsavel: data.responsavel || '',
          })
        }
      } catch (error) {
        console.error('Error loading orgao:', error)
        toast.error('Erro ao carregar dados do órgão')
        router.push('/dashboard/orgaos')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadOrgao()
  }, [tenant, orgaoId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tenant) {
      toast.error('Erro de autenticação')
      return
    }

    if (!formData.nome || !formData.tipo) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('orgaos')
        .update({
          nome: formData.nome,
          tipo: formData.tipo,
          sigla: formData.sigla || null,
          email: formData.email || null,
          telefone: formData.telefone || null,
          endereco: formData.endereco || null,
          responsavel: formData.responsavel || null,
        })
        .eq('id', orgaoId)
        .eq('tenant_id', tenant.id)

      if (error) throw error

      toast.success('Órgão atualizado com sucesso!')
      router.push('/dashboard/orgaos')
    } catch (error) {
      console.error('Error updating orgao:', error)
      toast.error('Erro ao atualizar órgão')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orgaos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Órgão</h1>
          <p className="text-[var(--muted-foreground)]">
            Atualize os dados do órgão
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Dados do Órgão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              name="nome"
              label="Nome do Órgão *"
              placeholder="Ex: Secretaria Municipal de Obras"
              value={formData.nome}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name="tipo"
                label="Tipo *"
                options={tipoOptions}
                value={formData.tipo}
                onChange={handleChange}
                required
              />
              
              <Input
                name="sigla"
                label="Sigla"
                placeholder="Ex: SEMOB"
                value={formData.sigla}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="email"
                name="email"
                label="E-mail"
                placeholder="contato@orgao.gov.br"
                value={formData.email}
                onChange={handleChange}
              />
              
              <Input
                name="telefone"
                label="Telefone"
                placeholder="(00) 0000-0000"
                value={formData.telefone}
                onChange={handleChange}
              />
            </div>

            <Input
              name="responsavel"
              label="Responsável"
              placeholder="Nome do responsável pelo órgão"
              value={formData.responsavel}
              onChange={handleChange}
            />

            <Textarea
              name="endereco"
              label="Endereço"
              placeholder="Endereço completo do órgão"
              value={formData.endereco}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboard/orgaos">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" isLoading={isLoading}>
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  )
}
