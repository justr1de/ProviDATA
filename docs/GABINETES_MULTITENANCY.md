# Sistema de Gabinetes (Multi-tenancy) e Convites

## Visão Geral

Este documento descreve a implementação do sistema de multi-tenancy baseado em Gabinetes Parlamentares, incluindo o sistema de convites para novos usuários.

## Estrutura do Banco de Dados

### Tabela: `gabinetes`

Representa os gabinetes parlamentares - a unidade principal de multi-tenancy do sistema.

**Campos:**
- `id` (UUID): Identificador único do gabinete
- `nome` (TEXT): Nome do gabinete (ex: "Gabinete Vereador João Silva")
- `municipio` (TEXT): Município onde o gabinete atua
- `uf` (TEXT): Unidade Federativa (sigla com 2 caracteres)
- `parlamentar_nome` (TEXT): Nome do parlamentar
- `parlamentar_cargo` (TEXT): Cargo do parlamentar (vereador, prefeito, deputado_estadual, etc.)
- `partido` (TEXT): Partido político
- `telefone` (TEXT): Telefone de contato
- `email` (TEXT): Email de contato
- `endereco` (TEXT): Endereço do gabinete
- `logo_url` (TEXT): URL do logotipo
- `settings` (JSONB): Configurações personalizadas
- `ativo` (BOOLEAN): Status do gabinete
- `created_at` (TIMESTAMPTZ): Data de criação
- `updated_at` (TIMESTAMPTZ): Data de atualização

**Constraints:**
- Unique: `(nome, municipio, uf)` - Evita duplicação de gabinetes

### Tabela: `convites`

Gerencia convites para novos usuários se juntarem a gabinetes.

**Campos:**
- `id` (UUID): Identificador único do convite
- `email` (TEXT): Email do usuário convidado
- `gabinete_id` (UUID): Referência ao gabinete
- `cargo` (TEXT): Cargo/papel no gabinete (admin, gestor, assessor, operador, visualizador)
- `token` (TEXT): Token único e seguro para aceitar o convite
- `status` (TEXT): Status do convite (pendente, aceito, expirado, revogado)
- `validade` (TIMESTAMPTZ): Data de expiração (padrão: 7 dias)
- `aceito_em` (TIMESTAMPTZ): Data de aceitação
- `convidado_por` (UUID): Usuário que criou o convite
- `aceito_por` (UUID): Usuário que aceitou o convite
- `metadata` (JSONB): Metadados adicionais
- `created_at` (TIMESTAMPTZ): Data de criação
- `updated_at` (TIMESTAMPTZ): Data de atualização

**Constraints:**
- Unique: `(email, gabinete_id)` - Um email só pode ter um convite ativo por gabinete

### Atualização: `profiles`

A tabela `profiles` foi estendida com:
- `gabinete_id` (UUID): Referência ao gabinete do usuário

## Row Level Security (RLS)

### Políticas para `gabinetes`

1. **Users can view own gabinete**: Usuários podem ver seu próprio gabinete
2. **Admins can update own gabinete**: Admins/gestores podem atualizar seu gabinete
3. **Super admins can view all gabinetes**: Super admins podem ver todos os gabinetes
4. **Super admins can create gabinetes**: Super admins podem criar novos gabinetes

### Políticas para `convites`

1. **Admins can view gabinete convites**: Admins/gestores podem ver convites do seu gabinete
2. **Admins can create convites**: Admins/gestores podem criar convites para seu gabinete
3. **Admins can update gabinete convites**: Admins/gestores podem atualizar convites do seu gabinete
4. **Admins can delete gabinete convites**: Admins/gestores podem deletar convites do seu gabinete
5. **Anyone can view convite by token**: Qualquer pessoa pode ver um convite válido pelo token

### Políticas para `profiles`

1. **Users can view same gabinete profiles**: Usuários podem ver perfis de outros usuários do mesmo gabinete

## Funções SQL

### `expirar_convites_antigos()`

Marca convites pendentes como expirados quando passam da validade.

```sql
SELECT public.expirar_convites_antigos();
```

### `aceitar_convite(convite_token TEXT, user_id UUID)`

Aceita um convite válido e associa o usuário ao gabinete.

**Parâmetros:**
- `convite_token`: Token único do convite
- `user_id`: ID do usuário que está aceitando

**Retorno:**
```json
{
  "success": true,
  "cargo": "assessor",
  "gabinete_id": "uuid-do-gabinete"
}
```

**Exemplo:**
```sql
SELECT public.aceitar_convite('token-do-convite', 'uuid-do-usuario');
```

### `revogar_convite(convite_id UUID, user_id UUID)`

Revoga um convite (apenas admins/gestores do gabinete).

**Parâmetros:**
- `convite_id`: ID do convite a ser revogado
- `user_id`: ID do usuário que está revogando

**Retorno:**
```json
{
  "success": true,
  "message": "Convite revogado com sucesso"
}
```

### `obter_estatisticas_gabinete(gabinete_uuid UUID)`

Retorna estatísticas de usuários e convites do gabinete.

**Retorno:**
```json
{
  "total_usuarios": 10,
  "total_admins": 2,
  "total_gestores": 3,
  "total_assessores": 5,
  "total_operadores": 0,
  "total_visualizadores": 0,
  "convites_pendentes": 3,
  "convites_aceitos": 7
}
```

## Tipos TypeScript

### Interfaces Principais

```typescript
import { 
  Gabinete, 
  Convite, 
  Profile,
  AceitarConviteResponse,
  RevogarConviteResponse,
  EstatisticasGabinete,
  ConviteFormData,
  GabineteFormData
} from '@/types/database'
```

### Exemplo de Uso

#### Criar um Convite

```typescript
import { createClient } from '@/lib/supabase/server'
import { ConviteFormData } from '@/types/database'

const supabase = createClient()

const conviteData: ConviteFormData = {
  email: 'usuario@example.com',
  gabinete_id: 'uuid-do-gabinete',
  cargo: 'assessor',
  metadata: {
    departamento: 'Comunicação'
  }
}

const { data, error } = await supabase
  .from('convites')
  .insert(conviteData)
  .select()
  .single()
```

#### Aceitar um Convite

```typescript
const { data, error } = await supabase
  .rpc('aceitar_convite', {
    convite_token: 'token-do-convite',
    user_id: 'uuid-do-usuario'
  })

if (data?.success) {
  console.log('Convite aceito!', data.cargo, data.gabinete_id)
}
```

#### Listar Convites do Gabinete

```typescript
const { data: convites, error } = await supabase
  .from('convites')
  .select(`
    *,
    gabinete:gabinetes(*)
  `)
  .eq('gabinete_id', 'uuid-do-gabinete')
  .order('created_at', { ascending: false })
```

#### Obter Estatísticas

```typescript
const { data: stats, error } = await supabase
  .rpc('obter_estatisticas_gabinete', {
    gabinete_uuid: 'uuid-do-gabinete'
  })

console.log(`Total de usuários: ${stats.total_usuarios}`)
console.log(`Convites pendentes: ${stats.convites_pendentes}`)
```

## Fluxo de Convite

1. **Admin/Gestor cria convite**
   - Insere registro na tabela `convites`
   - Sistema gera token único automaticamente
   - Validade padrão: 7 dias

2. **Envio do convite**
   - Email é enviado com link contendo o token
   - Link: `/convite/[token]`

3. **Usuário acessa o link**
   - Sistema valida o token
   - Verifica se convite está pendente e não expirado
   - Exibe informações do gabinete

4. **Usuário aceita o convite**
   - Cria conta ou faz login
   - Sistema chama `aceitar_convite()`
   - Perfil é atualizado com `gabinete_id` e `cargo`
   - Convite é marcado como aceito

## Hierarquia de Cargos

1. **super_admin**: Acesso total ao sistema, pode criar gabinetes
2. **admin**: Administrador do gabinete, pode gerenciar usuários e convites
3. **gestor**: Pode gerenciar usuários e convites do gabinete
4. **assessor**: Acesso completo aos dados do gabinete
5. **operador**: Pode criar e editar registros
6. **visualizador**: Apenas visualização

## Isolamento de Dados (Multi-tenancy)

Todas as consultas devem filtrar por `gabinete_id` para garantir isolamento:

```typescript
// ✅ Correto - filtra por gabinete
const { data } = await supabase
  .from('providencias')
  .select('*')
  .eq('tenant_id', gabineteId)

// ❌ Errado - pode vazar dados de outros gabinetes
const { data } = await supabase
  .from('providencias')
  .select('*')
```

As políticas RLS garantem que mesmo queries incorretas não vazem dados entre gabinetes.

## Migração

Para aplicar a migration:

```bash
# Via Supabase CLI
supabase db push

# Ou execute o arquivo SQL diretamente no Supabase Dashboard
# supabase/migrations/20240101_gabinetes_multitenancy.sql
```

## Manutenção

### Expirar Convites Antigos

Recomenda-se executar periodicamente (ex: via cron job):

```sql
SELECT public.expirar_convites_antigos();
```

### Limpar Convites Expirados

```sql
DELETE FROM public.convites 
WHERE status = 'expirado' 
AND updated_at < NOW() - INTERVAL '30 days';
```

## Segurança

1. **Tokens**: Gerados com 32 bytes aleatórios, codificados em hexadecimal
2. **RLS**: Todas as tabelas têm políticas RLS ativas
3. **Validação**: Funções SQL validam permissões antes de executar ações
4. **Isolamento**: Dados de um gabinete nunca vazam para outro
5. **Expiração**: Convites expiram automaticamente após 7 dias

## Troubleshooting

### Convite não aparece para o admin

Verifique se o usuário tem o cargo correto:
```sql
SELECT role, gabinete_id FROM profiles WHERE id = 'user-id';
```

### Erro ao aceitar convite

Verifique se o convite está válido:
```sql
SELECT status, validade FROM convites WHERE token = 'token';
```

### Usuário não vê dados do gabinete

Verifique se o `gabinete_id` está configurado:
```sql
SELECT gabinete_id FROM profiles WHERE id = 'user-id';
```
