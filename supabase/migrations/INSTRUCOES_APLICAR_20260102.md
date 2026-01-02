# Instruções para Aplicar a Migration 20260102_consolidate_tenant_model

## Situação Atual

O histórico de migrations no banco de dados remoto está dessincronizado com os arquivos locais. O CLI do Supabase está tentando reaplicar migrations antigas que já foram executadas, causando conflitos.

## Opções para Aplicar a Migration

### Opção 1: Aplicar via Supabase Dashboard (RECOMENDADO)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard/project/wntiupkhjtgiaxiicxeq)
2. Vá para **SQL Editor**
3. Abra o arquivo [`supabase/migrations/20260102_consolidate_tenant_model_v2.sql`](./20260102_consolidate_tenant_model_v2.sql) **(USE A VERSÃO V2 - CORRIGIDA)**
4. Copie todo o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Execute o SQL
7. Verifique os logs e estatísticas no final para confirmar que a migration foi aplicada com sucesso

### Opção 2: Limpar o Histórico de Migrations e Reaplicar

**⚠️ ATENÇÃO: Esta opção deve ser usada com cuidado em produção**

```bash
# 1. Fazer backup do histórico atual
SUPABASE_ACCESS_TOKEN=sbp_6b9745c2d47c470e0a54ae7bde2d5bfabda09606 \
npx supabase db dump --data-only --table supabase_migrations.schema_migrations > backup_migrations.sql

# 2. Limpar o histórico de migrations no banco
# Execute via Dashboard SQL Editor:
# DELETE FROM supabase_migrations.schema_migrations;

# 3. Reaplicar todas as migrations
SUPABASE_ACCESS_TOKEN=sbp_6b9745c2d47c470e0a54ae7bde2d5bfabda09606 \
npx supabase db push --include-all
```

### Opção 3: Aplicar Apenas as Migrations Necessárias

Se você sabe que todas as migrations anteriores já foram aplicadas, pode marcar manualmente no histórico:

```bash
# Inserir registro manual no histórico (via SQL Editor do Dashboard)
INSERT INTO supabase_migrations.schema_migrations (version, name, statements) 
VALUES 
  ('20260102', '20260102_consolidate_tenant_model', ARRAY['-- migration applied manually']::text[]),
  ('20260102', '20260102_performance_indexes', ARRAY['-- migration applied manually']::text[])
ON CONFLICT (version) DO NOTHING;
```

Depois execute os SQLs das migrations diretamente via Dashboard.

## O Que a Migration Faz

A migration [`20260102_consolidate_tenant_model.sql`](./20260102_consolidate_tenant_model.sql) consolida o modelo de multi-tenancy:

1. **Cria a tabela `tenants`** como fonte de verdade única
2. **Migra dados de `gabinetes` e `organizations`** para `tenants`
3. **Adiciona `tenant_id`** em todas as tabelas relevantes (`profiles`, `users`, `invites`, `convites`)
4. **Cria função unificada** `accept_invite_unified()` para aceitar convites de ambas as tabelas
5. **Atualiza RLS policies** para usar `tenant_id`
6. **Cria views de compatibilidade** para manter código legado funcionando
7. **Adiciona índices** para performance

## Token Configurado

O token de acesso está configurado no arquivo [`.env.local`](../../.env.local):

```
SUPABASE_ACCESS_TOKEN=sbp_6b9745c2d47c470e0a54ae7bde2d5bfabda09606
```

## Verificação Pós-Aplicação

Após aplicar a migration, verifique se funcionou executando:

```sql
-- Verificar se a tabela tenants foi criada
SELECT COUNT(*) FROM public.tenants;

-- Verificar se tenant_id foi adicionado em profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name = 'tenant_id';

-- Verificar se a função foi criada
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'accept_invite_unified';
```

## Contato

Se tiver problemas ao aplicar a migration, revise os logs de erro e verifique se há conflitos de dados no banco.
