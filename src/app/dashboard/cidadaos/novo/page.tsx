'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Save, 
  User, 
  MapPin,
  Phone,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

const generoOptions = [
  { value: '', label: 'Selecione' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
  { value: 'nao_informar', label: 'Prefiro não informar' },
]

const ufOptions = [
  { value: '', label: 'UF' },
  { value: 'AC', label: 'AC' },
  { value: 'AL', label: 'AL' },
  { value: 'AP', label: 'AP' },
  { value: 'AM', label: 'AM' },
  { value: 'BA', label: 'BA' },
  { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' },
  { value: 'ES', label: 'ES' },
  { value: 'GO', label: 'GO' },
  { value: 'MA', label: 'MA' },
  { value: 'MT', label: 'MT' },
  { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' },
  { value: 'PA', label: 'PA' },
  { value: 'PB', label: 'PB' },
  { value: 'PR', label: 'PR' },
  { value: 'PE', label: 'PE' },
  { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' },
  { value: 'RN', label: 'RN' },
  { value: 'RS', label: 'RS' },
  { value: 'RO', label: 'RO' },
  { value: 'RR', label: 'RR' },
  { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' },
  { value: 'SE', label: 'SE' },
  { value: 'TO', label: 'TO' },
]

export default function NovoCidadaoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    genero: '',
    email: '',
    telefone: '',
    celular: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    observacoes: '',
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { tenant } = useAuthStore()

  const redirect = searchParams.get('redirect')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tenant) {
      toast.error('Erro de autenticação')
      return
    }

    if (!formData.nome) {
      toast.error('O nome é obrigatório')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('cidadaos')
        .insert({
          tenant_id: tenant.id,
          nome: formData.nome,
          cpf: formData.cpf || null,
          rg: formData.rg || null,
          data_nascimento: formData.data_nascimento || null,
          genero: formData.genero || null,
          email: formData.email || null,
          telefone: formData.telefone || null,
          celular: formData.celular || null,
          cep: formData.cep || null,
          endereco: formData.endereco || null,
          numero: formData.numero || null,
          complemento: formData.complemento || null,
          bairro: formData.bairro || null,
          cidade: formData.cidade || null,
          uf: formData.uf || null,
          observacoes: formData.observacoes || null,
        })

      if (error) throw error

      toast.success('Cidadão cadastrado com sucesso!')
      
      if (redirect === 'providencia') {
        router.push('/dashboard/providencias/nova')
      } else {
        router.push('/dashboard/cidadaos')
      }
    } catch (error) {
      console.error('Error creating cidadao:', error)
      toast.error('Erro ao cadastrar cidadão')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cidadaos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Novo Cidadão</h1>
          <p className="text-[var(--muted-foreground)]">
            Cadastre um novo cidadão no sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              name="nome"
              label="Nome Completo *"
              placeholder="Nome completo do cidadão"
              value={formData.nome}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                name="cpf"
                label="CPF"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                maxLength={14}
              />
              
              <Input
                name="rg"
                label="RG"
                placeholder="Número do RG"
                value={formData.rg}
                onChange={handleChange}
              />

              <Input
                type="date"
                name="data_nascimento"
                label="Data de Nascimento"
                value={formData.data_nascimento}
                onChange={handleChange}
              />
            </div>

            <Select
              name="genero"
              label="Gênero"
              options={generoOptions}
              value={formData.genero}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="email"
              name="email"
              label="E-mail"
              placeholder="email@exemplo.com"
              value={formData.email}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="telefone"
                label="Telefone"
                placeholder="(00) 0000-0000"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                maxLength={15}
              />
              
              <Input
                name="celular"
                label="Celular"
                placeholder="(00) 00000-0000"
                value={formData.celular}
                onChange={(e) => setFormData({ ...formData, celular: formatPhone(e.target.value) })}
                maxLength={15}
              />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                name="cep"
                label="CEP"
                placeholder="00000-000"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: formatCEP(e.target.value) })}
                maxLength={9}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Input
                  name="endereco"
                  label="Endereço"
                  placeholder="Rua, Avenida, etc."
                  value={formData.endereco}
                  onChange={handleChange}
                />
              </div>
              <Input
                name="numero"
                label="Número"
                placeholder="Nº"
                value={formData.numero}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="complemento"
                label="Complemento"
                placeholder="Apto, Bloco, etc."
                value={formData.complemento}
                onChange={handleChange}
              />
              
              <Input
                name="bairro"
                label="Bairro"
                placeholder="Nome do bairro"
                value={formData.bairro}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  name="cidade"
                  label="Cidade"
                  placeholder="Nome da cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                />
              </div>
              <Select
                name="uf"
                label="UF"
                options={ufOptions}
                value={formData.uf}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Observações</CardTitle>
            <CardDescription>
              Informações adicionais sobre o cidadão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="observacoes"
              placeholder="Observações gerais..."
              value={formData.observacoes}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* LGPD Notice */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Os dados pessoais coletados serão tratados de acordo com a Lei Geral de Proteção de Dados (LGPD) 
            e utilizados exclusivamente para o registro e acompanhamento de providências parlamentares.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboard/cidadaos">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" isLoading={isLoading}>
            <Save className="w-4 h-4" />
            Cadastrar Cidadão
          </Button>
        </div>
      </form>
    </div>
  )
}
