# Rollback Plan - Migration 20260102183216

## Informações de Baseline

- **Branch de trabalho**: `chore/migration-20260102-security`
- **Commit base**: `c6f16ed3b47584e53daaf224539067c9513d5737`
- **Data da branch**: 2026-01-02T19:12:35Z
- **Migration original**: [`supabase/migrations/20260102183216_remote_schema.sql`](../supabase/migrations/20260102183216_remote_schema.sql:1)

## Problemas de Segurança Identificados

### 🚨 CRÍTICO: Credenciais Hardcoded (Linhas 646-656)

**Localização**: [`supabase/migrations/20260102183216_remote_schema.sql`](../supabase/migrations/20260102183216_remote_schema.sql:646)

```sql
CREATE FOREIGN DATA WRAPPER "dataro_it_fdw" HANDLER "extensions"."s3_vectors_fdw_handler" VALIDATOR "extensions"."s3_vectors_fdw_validator";

CREATE SERVER "dataro_it_fdw_server" FOREIGN DATA WRAPPER "dataro_it_fdw" OPTIONS (
    "aws_region" 'us-west-2',
    "endpoint_url" 'https://wntiupkhjtgiaxiicxeq.storage.supabase.co/storage/v1/vector',
    "vault_access_key_id" 'fe827365-e995-43f9-b06d-19faa08e9a1e',      -- ⚠️ EXPOSTO
    "vault_secret_access_key" 'b4de251b-74ec-498b-910d-395d9cb4f7c8'   -- ⚠️ EXPOSTO
);
```

**Risco**: Credenciais de acesso ao Supabase Vault expostas em migration versionada.

### ⚠️ Outros Riscos Identificados

1. **Extensão PostGIS** (Linha 48): Extensão pesada, pode impactar performance em produção
2. **Tabelas OSM gigantes** (Linhas 959-1297): `planet_osm_*` podem consumir muito espaço
3. **Múltiplos GRANTs amplos** (Linhas 2082-8314): Revisar se todos são necessários

## Estratégia de Correção

### 1. Remover FDW Server da Migration Principal

A criação do Foreign Data Wrapper Server será:
- **Removida** da migration versionada
- **Documentada** em arquivo separado de setup de ambiente
- Aplicada **manualmente** em cada ambiente (dev/staging/prod)

### 2. Alternativa Segura para FDW

Criar migration separada não-versionada em:
`supabase/migrations/.local/setup_fdw_server.sql`

Ou aplicar via CLI/Dashboard com variáveis de ambiente.

## Procedimento de Rollback

### Caso a migration já tenha sido aplicada:

```bash
# 1. Voltar para branch main
git checkout main

# 2. Reverter para commit base
git reset --hard c6f16ed3b47584e53daaf224539067c9513d5737

# 3. Se necessário, reverter no banco (Supabase)
# Acessar Dashboard > SQL Editor e executar:
```

```sql
-- Drop do FDW server (se criado)
DROP SERVER IF EXISTS dataro_it_fdw_server CASCADE;
DROP FOREIGN DATA WRAPPER IF EXISTS dataro_it_fdw CASCADE;

-- Verificar se migration foi aplicada
SELECT * FROM supabase_migrations.schema_migrations 
WHERE version = '20260102183216';

-- Se necessário, remover registro da migration
DELETE FROM supabase_migrations.schema_migrations 
WHERE version = '20260102183216';
```

### Caso ainda não tenha sido aplicada:

```bash
# 1. Descartar alterações na branch
git checkout main
git branch -D chore/migration-20260102-security

# 2. Voltar ao estado anterior
git reset --hard c6f16ed3b47584e53daaf224539067c9513d5737
```

## Próximos Passos (Após Correção)

1. ✅ Remover linhas 646-659 da migration principal
2. ✅ Criar documentação de setup do FDW Server
3. ✅ Documentar variáveis de ambiente necessárias
4. ⏭️ Aplicar migration corrigida em ambiente de desenvolvimento
5. ⏭️ Validar funcionamento sem credenciais hardcoded
6. ⏭️ Aplicar em staging/produção com segredos via Vault

## Rotação de Credenciais

**IMPORTANTE**: As credenciais expostas devem ser rotacionadas:

```
vault_access_key_id: fe827365-e995-43f9-b06d-19faa08e9a1e
vault_secret_access_key: b4de251b-74ec-498b-910d-395d9cb4f7c8
```

### Como rotacionar:

1. Acessar Supabase Dashboard > Settings > Vault
2. Gerar novas chaves de acesso
3. Atualizar o FDW server com as novas credenciais
4. Invalidar as chaves antigas

## Checklist de Segurança

- [x] Credenciais removidas da migration (linhas 646-648)
- [x] FDW server documentado separadamente (docs/FDW_SETUP.md)
- [x] Template criado (.local/setup_fdw_server.sql.template)
- [x] .gitignore atualizado para proteger credenciais
- [x] README criado em .local/ com instruções de uso
- [x] Auditoria de advisors executada → [30 problemas encontrados](AUDITORIA_SEGURANCA_20260102.md)
- [x] Migration de correção RLS criada (20260102194500_fix_rls_security.sql)
- [ ] Credenciais antigas rotacionadas (REQUER AÇÃO MANUAL VIA DASHBOARD)
- [ ] Migration testada sem segredos hardcoded (REQUER TESTE EM DEV)
- [ ] Migration de correção RLS aplicada e validada (PRÓXIMO PASSO)

## Contatos de Emergência

Em caso de exposição de credenciais ou incidente de segurança:
- Rotacionar imediatamente via Supabase Dashboard
- Verificar logs de acesso: `SELECT * FROM auth.audit_log_entries`
- Notificar equipe de segurança

---

**Última atualização**: 2026-01-02T19:12:35Z
