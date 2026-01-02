# Foreign Data Wrapper (FDW) Setup - S3 Vectors

## Contexto

O Foreign Data Wrapper `dataro_it_fdw_server` foi **removido** da migration principal [`20260102183216_remote_schema.sql`](../supabase/migrations/20260102183216_remote_schema.sql:1) por motivos de segurança.

**Motivo**: Credenciais de acesso ao Supabase Vault não devem estar em migrations versionadas no Git.

## Pré-requisitos

- Extension `wrappers` já instalada (presente na migration principal)
- Acesso às credenciais do Supabase Vault
- Permissões de `postgres` no banco de dados

## Configuração Manual (Por Ambiente)

### 1. Obter Credenciais do Vault

As credenciais devem ser obtidas via:

**Opção A - Supabase Dashboard**:
1. Acesse: Supabase Dashboard > Settings > Vault
2. Copie `Access Key ID` e `Secret Access Key`

**Opção B - CLI (se configurado)**:
```bash
supabase secrets list
```

### 2. Aplicar FDW Server

Execute no **SQL Editor** do Supabase ou via CLI:

```sql
-- 1. Criar Foreign Data Wrapper
CREATE FOREIGN DATA WRAPPER "dataro_it_fdw" 
  HANDLER "extensions"."s3_vectors_fdw_handler" 
  VALIDATOR "extensions"."s3_vectors_fdw_validator";

-- 2. Criar Server com credenciais do ambiente
CREATE SERVER "dataro_it_fdw_server" 
  FOREIGN DATA WRAPPER "dataro_it_fdw" 
  OPTIONS (
    "aws_region" 'us-west-2',
    "endpoint_url" 'https://wntiupkhjtgiaxiicxeq.storage.supabase.co/storage/v1/vector',
    "vault_access_key_id" '<SEU_ACCESS_KEY_ID>',      -- Substituir
    "vault_secret_access_key" '<SEU_SECRET_ACCESS_KEY>' -- Substituir
  );

-- 3. Definir owner
ALTER SERVER "dataro_it_fdw_server" OWNER TO "postgres";
```

### 3. Validar Configuração

```sql
-- Verificar se FDW foi criado
SELECT * FROM pg_foreign_data_wrapper WHERE fdwname = 'dataro_it_fdw';

-- Verificar se Server foi criado
SELECT * FROM pg_foreign_server WHERE srvname = 'dataro_it_fdw_server';
```

## Segurança e Boas Práticas

### ✅ Fazer

- Usar credenciais do Supabase Vault (não hardcoded)
- Aplicar FDW server **manualmente** em cada ambiente
- Rotacionar credenciais periodicamente
- Documentar credenciais em gerenciador de segredos (1Password, Vault, etc.)
- Validar que FDW está funcional após setup

### ❌ Não Fazer

- **NUNCA** commitar credenciais no Git
- **NUNCA** compartilhar credenciais em Slack/Email
- **NUNCA** usar mesmas credenciais em dev/staging/prod
- **NÃO** copiar/colar credenciais em logs ou documentação pública

## Ambientes

### Development

```bash
# Aplicar via Supabase CLI (se configurado para dev)
supabase db reset  # Já aplicará migrations
# Depois executar SQL acima manualmente no SQL Editor
```

### Staging

```bash
# Aplicar no SQL Editor do projeto staging
# Usar credenciais específicas de staging
```

### Production

```bash
# Aplicar no SQL Editor do projeto production
# Usar credenciais específicas de production
# VALIDAR em staging antes de aplicar em prod
```

## Troubleshooting

### Erro: "permission denied for foreign-data wrapper"

```sql
-- Garantir que usuário tem permissão
GRANT USAGE ON FOREIGN DATA WRAPPER dataro_it_fdw TO postgres;
```

### Erro: "invalid vault credentials"

- Verificar se credenciais estão corretas
- Rotacionar credenciais via Dashboard
- Verificar se Vault está habilitado no projeto

### Erro: "extension wrappers not found"

```sql
-- Instalar extension wrappers (já está na migration principal)
CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";
```

## Rollback do FDW

Se precisar remover o FDW:

```sql
-- Remover server (cascata remove objetos dependentes)
DROP SERVER IF EXISTS dataro_it_fdw_server CASCADE;

-- Remover wrapper
DROP FOREIGN DATA WRAPPER IF EXISTS dataro_it_fdw CASCADE;
```

## Alternativas

Se não precisar do FDW imediatamente:

1. **Adiar setup**: Aplicar apenas quando necessário para features que usam S3 Vectors
2. **Usar outras extensões**: Verificar se `pg_graphql` ou `storage` atendem necessidade
3. **API externa**: Acessar S3 via API do Supabase Storage em vez de FDW

## Referências

- [Supabase Wrappers Docs](https://supabase.com/docs/guides/database/extensions/wrappers)
- [S3 Vectors FDW](https://github.com/supabase/wrappers/tree/main/wrappers/src/fdw/s3_vectors_fdw)
- [Supabase Vault Docs](https://supabase.com/docs/guides/database/vault)

---

**Última atualização**: 2026-01-02T19:14:00Z  
**Responsável**: DevOps/Backend Team
