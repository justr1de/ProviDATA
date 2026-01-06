# Análise de Inconsistências - ProviDATA

## Resumo Executivo

Após análise detalhada do código-fonte e da estrutura do banco de dados, foram identificadas **inconsistências críticas** entre o código e o banco de dados que estão causando problemas no funcionamento do sistema.

---

## 1. Estrutura do Banco de Dados (Supabase)

### Tabela Principal de Multi-Tenancy: `gabinetes`

```sql
CREATE TABLE IF NOT EXISTS "public"."gabinetes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "nome" text NOT NULL,
    "municipio" text NOT NULL,
    "uf" text NOT NULL,
    "parlamentar_nome" text,
    "parlamentar_cargo" text,
    "partido" text,
    "telefone" text,
    "email" text,
    "endereco" text,
    "logo_url" text,
    "settings" jsonb DEFAULT '{}',
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "telefone_parlamentar" text,
    "telefone_gabinete" text,
    "telefone_adicional" text,
    "email_parlamentar" text,
    "email_gabinete" text,
    "chefe_de_gabinete" text,
    "assessor_2" text,
    "twitter_x" text,
    "threads" text,
    "is_whatsapp_parlamentar" boolean DEFAULT false,
    "is_whatsapp_gabinete" boolean DEFAULT false,
    "is_whatsapp_adicional" boolean DEFAULT false,
    "slug" text,
    "subscription_status" text DEFAULT 'active'
);
```

### Tabela de Usuários: `users`

```sql
CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" uuid NOT NULL,
    "gabinete_id" uuid,  -- Referência para gabinetes
    "nome" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL,
    "telefone" varchar(20),
    "cargo" varchar(100),
    "role" varchar(50) DEFAULT 'colaborador',
    "avatar_url" text,
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);
```

**IMPORTANTE:** NÃO EXISTE tabela `tenants` no banco de dados!

---

## 2. Inconsistências Identificadas

### 🔴 CRÍTICO: Referência a tabela inexistente `tenants`

O código está fazendo queries para uma tabela `tenants` que **NÃO EXISTE** no banco de dados. A tabela correta é `gabinetes`.

#### Arquivos afetados:

| Arquivo | Linha | Query Problemática |
|---------|-------|-------------------|
| `src/app/dashboard/layout.tsx` | 139 | `.select('*, gabinete:tenants(*)')` |
| `src/app/cadastro/page.tsx` | 110 | `.from('tenants')` |
| `src/app/dashboard/configuracoes/page.tsx` | 60 | `.from('tenants')` |
| `src/app/dashboard/administracao/page.tsx` | 798 | `.from('tenants')` |

### 🟡 ATENÇÃO: Mapeamento de campos inconsistente

O código TypeScript usa nomes de campos diferentes dos existentes no banco:

| Campo no Código (TypeScript) | Campo no Banco (SQL) | Status |
|------------------------------|---------------------|--------|
| `name` | `nome` | ❌ Diferente |
| `parlamentar_name` | `parlamentar_nome` | ❌ Diferente |
| `cargo` | `parlamentar_cargo` | ❌ Diferente |
| `email_contato` | `email` | ❌ Diferente |
| `telefone_contato` | `telefone` | ❌ Diferente |

### 🟡 ATENÇÃO: Função `get_user_tenant_id()` usa `gabinete_id`

A função SQL `get_user_tenant_id()` está correta e retorna `gabinete_id` da tabela `profiles`:

```sql
CREATE OR REPLACE FUNCTION "public"."get_user_tenant_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT p.gabinete_id
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;
```

---

## 3. Impacto das Inconsistências

1. **Falha no carregamento de dados do gabinete** - O layout do dashboard tenta buscar dados de `tenants` que não existe
2. **Falha na criação de novos gabinetes** - A página de cadastro tenta inserir em `tenants`
3. **Falha nas configurações** - A página de configurações tenta atualizar `tenants`
4. **Falha na administração** - A página de administração tenta listar de `tenants`

---

## 4. Soluções Propostas

### Opção A: Atualizar o código para usar `gabinetes` (RECOMENDADO)

Alterar todas as queries para usar a tabela `gabinetes` e mapear os campos corretamente.

**Vantagens:**
- Não requer alterações no banco de dados
- Alinha o código com a estrutura existente
- Menor risco de perda de dados

**Arquivos a modificar:**
1. `src/app/dashboard/layout.tsx`
2. `src/app/cadastro/page.tsx`
3. `src/app/dashboard/configuracoes/page.tsx`
4. `src/app/dashboard/administracao/page.tsx`
5. `src/types/database.ts` (ajustar nomes dos campos)

### Opção B: Criar VIEW `tenants` como alias para `gabinetes`

Criar uma VIEW no banco de dados que mapeia `gabinetes` para `tenants` com os campos esperados pelo código.

**Vantagens:**
- Menor quantidade de alterações no código
- Mantém compatibilidade com código legado

**Desvantagens:**
- Adiciona complexidade ao banco de dados
- Pode causar confusão futura

---

## 5. Próximos Passos Recomendados

1. ✅ Análise concluída
2. ⏳ Aguardar aprovação do usuário para executar correções
3. 📝 Implementar a solução escolhida
4. 🧪 Testar todas as funcionalidades afetadas
5. 🚀 Deploy das correções

---

*Análise gerada em: 06/01/2026*
*Versão do código analisada: commit mais recente do branch main*
