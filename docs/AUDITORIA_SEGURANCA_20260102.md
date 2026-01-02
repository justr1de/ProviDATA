# Auditoria de Segurança - 2026-01-02

## 📊 Resumo Executivo

**Data da Auditoria**: 2026-01-02T19:40:00Z  
**Tipo**: Security Advisors (Supabase Database Linter)  
**Status**: 🔴 **AÇÃO NECESSÁRIA** - Vulnerabilidades críticas encontradas

### Resumo de Achados

| Severidade | Quantidade | Status |
|-----------|-----------|--------|
| 🔴 **ERROR** | 11 | Requer correção imediata |
| 🟡 **WARN** | 19 | Requer análise e correção |
| **TOTAL** | **30** | - |

## 🔴 Problemas Críticos (ERROR)

### 1. RLS Desabilitado - Tabela `gabinetes` ⚠️ URGENTE

**Problema**: A tabela [`gabinetes`](../supabase/migrations/20260102183216_remote_schema.sql:780) possui políticas RLS configuradas, mas o RLS não está habilitado.

**Risco**: Dados expostos mesmo com políticas definidas. Usuários podem acessar todos os gabinetes sem restrições.

**Políticas Existentes**:
- `Users can insert gabinetes`
- `Users can update gabinetes`
- `Users can view gabinetes`
- `admin_full_access`
- `gabinetes_manage_member_admins`
- `gabinetes_manage_super_admin`
- `gabinetes_view_member`
- `gabinetes_view_super_admin`

**Correção**:
```sql
ALTER TABLE public.gabinetes ENABLE ROW LEVEL SECURITY;
```

**Referência**: [Supabase Docs - RLS](https://supabase.com/docs/guides/database/database-linter?lint=0007_policy_exists_rls_disabled)

---

### 2. RLS Desabilitado - Tabelas OSM (9 tabelas)

**Tabelas Afetadas**:
- [`planet_osm_line`](../supabase/migrations/20260102183216_remote_schema.sql:948)
- [`planet_osm_point`](../supabase/migrations/20260102183216_remote_schema.sql:1035)
- [`planet_osm_polygon`](../supabase/migrations/20260102183216_remote_schema.sql:1112)
- [`planet_osm_roads`](../supabase/migrations/20260102183216_remote_schema.sql:1202)
- [`planet_osm_nodes`](../supabase/migrations/20260102183216_remote_schema.sql:1025)
- [`planet_osm_ways`](../supabase/migrations/20260102183216_remote_schema.sql:1279)
- [`planet_osm_rels`](../supabase/migrations/20260102183216_remote_schema.sql:1189)
- `spatial_ref_sys` (tabela do PostGIS)

**Risco**: Dados geográficos expostos publicamente sem controle de acesso.

**Correção**:
```sql
-- Opção 1: Habilitar RLS (se acesso controlado for necessário)
ALTER TABLE public.planet_osm_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planet_osm_point ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planet_osm_polygon ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planet_osm_roads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planet_osm_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planet_osm_ways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planet_osm_rels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Opção 2: Mover para schema privado (se não precisam ser públicas)
CREATE SCHEMA IF NOT EXISTS osm;
ALTER TABLE public.planet_osm_line SET SCHEMA osm;
-- Repetir para todas as tabelas OSM
```

**Referência**: [Supabase Docs - RLS](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)

---

### 3. RLS Desabilitado - Tabela `documentos`

**Problema**: Tabela [`documentos`](../supabase/migrations/20260102183216_remote_schema.sql:760) sem RLS habilitado.

**Risco**: Documentos de todos os gabinetes acessíveis por qualquer usuário autenticado.

**Correção**:
```sql
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- Adicionar políticas
CREATE POLICY "Users can view documentos in their tenant" 
  ON public.documentos FOR SELECT 
  USING (gabinete_id = public.get_user_tenant_id());

CREATE POLICY "Users can insert documentos" 
  ON public.documentos FOR INSERT 
  WITH CHECK (gabinete_id = public.get_user_tenant_id());

CREATE POLICY "Users can update documentos" 
  ON public.documentos FOR UPDATE 
  USING (gabinete_id = public.get_user_tenant_id());
```

**Referência**: [Supabase Docs - RLS](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)

---

## 🟡 Problemas de Atenção (WARN)

### 4. Search Path Mutável em Funções (19 funções)

**Problema**: Funções sem `search_path` fixo são vulneráveis a ataques de injeção de schema.

**Funções Afetadas**:
- [`accept_invite`](../supabase/migrations/20260102183216_remote_schema.sql:76)
- [`aceitar_convite`](../supabase/migrations/20260102183216_remote_schema.sql:139)
- [`check_prazo_providencias`](../supabase/migrations/20260102183216_remote_schema.sql:190)
- [`create_providencia_history`](../supabase/migrations/20260102183216_remote_schema.sql:227)
- [`create_super_admin`](../supabase/migrations/20260102183216_remote_schema.sql:255)
- [`expirar_convites_antigos`](../supabase/migrations/20260102183216_remote_schema.sql:310)
- [`generate_protocolo`](../supabase/migrations/20260102183216_remote_schema.sql:329)
- [`get_user_tenant_id`](../supabase/migrations/20260102183216_remote_schema.sql:357)
- [`handle_new_user`](../supabase/migrations/20260102183216_remote_schema.sql:369)
- [`obter_estatisticas_gabinete`](../supabase/migrations/20260102183216_remote_schema.sql:388)
- [`planet_osm_*_osm2pgsql_valid`](../supabase/migrations/20260102183216_remote_schema.sql:415) (4 funções)
- [`revogar_convite`](../supabase/migrations/20260102183216_remote_schema.sql:471)
- [`setup_super_admin_profile`](../supabase/migrations/20260102183216_remote_schema.sql:503)
- [`update_dashboard_stats`](../supabase/migrations/20260102183216_remote_schema.sql:560)
- [`update_updated_at`](../supabase/migrations/20260102183216_remote_schema.sql:620)
- [`update_updated_at_column`](../supabase/migrations/20260102183216_remote_schema.sql:633)

**Risco**: Atacantes podem manipular o `search_path` para executar código malicioso.

**Correção** (exemplo para `accept_invite`):
```sql
CREATE OR REPLACE FUNCTION public.accept_invite(invite_token text, user_id uuid) 
RETURNS jsonb
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth  -- ✅ Fixar search_path
AS $$
-- Código da função
$$;
```

**Referência**: [Supabase Docs - Search Path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)

---

### 5. View com SECURITY DEFINER

**Problema**: View [`dashboard_stats`](../supabase/migrations/20260102183216_remote_schema.sql:741) usa permissões do criador.

**Risco**: Potencial bypass de RLS se mal configurada.

**Análise**:
```sql
-- View atual
CREATE VIEW dashboard_stats AS
  SELECT gabinete_id, count(*) AS total_providencias ...
```

**Recomendação**: Converter para função com `SECURITY INVOKER` ou garantir que não expõe dados sensíveis.

**Referência**: [Supabase Docs - Security Definer](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)

---

### 6. Extensões no Schema Public

**Extensões Afetadas**:
- `postgis` (linha 48)
- `hstore` (linha 20)

**Risco**: Poluição do schema público, potencial conflito de nomes.

**Recomendação**:
```sql
-- Mover para schema dedicado
CREATE SCHEMA IF NOT EXISTS geo;
ALTER EXTENSION postgis SET SCHEMA geo;
ALTER EXTENSION hstore SET SCHEMA geo;
```

**Referência**: [Supabase Docs - Extensions](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public)

---

### 7. Proteção Contra Senhas Vazadas Desabilitada

**Problema**: Supabase Auth não está verificando senhas comprometidas contra HaveIBeenPwned.

**Risco**: Usuários podem usar senhas conhecidamente vazadas.

**Correção**: Habilitar via Supabase Dashboard
1. Acesse `Authentication > Policies`
2. Ative "Password Strength" e "Leaked Password Protection"

**Referência**: [Supabase Docs - Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

---

## 🎯 Plano de Ação

### Prioridade CRÍTICA (Imediato)

#### 1. Habilitar RLS na tabela `gabinetes`
```sql
ALTER TABLE public.gabinetes ENABLE ROW LEVEL SECURITY;
```
**Impacto**: ALTO - Vulnerabilidade de acesso  
**Esforço**: 1 linha SQL  
**Prazo**: Imediato

---

#### 2. Habilitar RLS na tabela `documentos` + Criar Políticas
```sql
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documentos_view_tenant" ON public.documentos 
  FOR SELECT USING (gabinete_id = public.get_user_tenant_id());

CREATE POLICY "documentos_insert_tenant" ON public.documentos 
  FOR INSERT WITH CHECK (gabinete_id = public.get_user_tenant_id());

CREATE POLICY "documentos_update_tenant" ON public.documentos 
  FOR UPDATE USING (gabinete_id = public.get_user_tenant_id());
```
**Impacto**: ALTO - Vazamento de documentos  
**Esforço**: ~15 linhas SQL  
**Prazo**: Imediato

---

### Prioridade ALTA (Esta Sprint)

#### 3. Fixar Search Path nas Funções de Negócio
Funções críticas que precisam de correção:
- `accept_invite` ✅ (SECURITY DEFINER já tem)
- `aceitar_convite` ✅ (SECURITY DEFINER já tem)
- `create_super_admin` ✅ (SECURITY DEFINER já tem)
- `setup_super_admin_profile` ✅ (SECURITY DEFINER já tem)
- `get_user_tenant_id` ⚠️ (precisa adicionar)
- Outros (análise caso a caso)

**Impacto**: MÉDIO - Vulnerabilidade potencial  
**Esforço**: ~2h (revisar e atualizar funções)  
**Prazo**: 3 dias

---

#### 4. RLS em Tabelas OSM
**Opções**:
- A) Habilitar RLS + criar política de leitura pública
- B) Mover para schema `osm` separado

**Recomendação**: Opção A (menos disruptivo)
```sql
-- Para cada tabela OSM
ALTER TABLE public.planet_osm_* ENABLE ROW LEVEL SECURITY;
CREATE POLICY "osm_public_read" ON public.planet_osm_* 
  FOR SELECT USING (true);
```

**Impacto**: MÉDIO - Dados OSM são tipicamente públicos  
**Esforço**: ~30min  
**Prazo**: 5 dias

---

### Prioridade MÉDIA (Próximo Sprint)

#### 5. Mover Extensões para Schemas Dedicados
```sql
CREATE SCHEMA IF NOT EXISTS geo;
ALTER EXTENSION postgis SET SCHEMA geo;
ALTER EXTENSION hstore SET SCHEMA geo;
```

**Impacto**: BAIXO - Organização  
**Esforço**: ~1h (testar compatibilidade)  
**Prazo**: 2 semanas

---

#### 6. Habilitar Proteção de Senhas Vazadas
Via Dashboard: `Authentication > Policies`

**Impacto**: MÉDIO - Segurança de contas  
**Esforço**: 5min (configuração)  
**Prazo**: 1 semana

---

## 📋 Script de Correção Imediata

```sql
-- ============================================================================
-- CORREÇÃO CRÍTICA - RLS
-- ============================================================================

-- 1. Habilitar RLS na tabela gabinetes
ALTER TABLE public.gabinetes ENABLE ROW LEVEL SECURITY;

-- 2. Habilitar RLS na tabela documentos
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas para documentos
CREATE POLICY "documentos_view_tenant" ON public.documentos 
  FOR SELECT USING (gabinete_id = public.get_user_tenant_id());

CREATE POLICY "documentos_insert_tenant" ON public.documentos 
  FOR INSERT WITH CHECK (gabinete_id = public.get_user_tenant_id());

CREATE POLICY "documentos_update_tenant" ON public.documentos 
  FOR UPDATE USING (gabinete_id = public.get_user_tenant_id());

-- 4. Validar
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('gabinetes', 'documentos')
ORDER BY tablename;
```

## 📊 Detalhamento dos Achados

### Tabelas sem RLS (10)

| Tabela | Schema | Tem Políticas? | Ação Recomendada |
|--------|--------|----------------|------------------|
| `gabinetes` | public | ✅ Sim (8) | Habilitar RLS |
| `documentos` | public | ❌ Não | Habilitar RLS + Criar Políticas |
| `planet_osm_line` | public | ❌ Não | Habilitar RLS + Política pública |
| `planet_osm_point` | public | ❌ Não | Habilitar RLS + Política pública |
| `planet_osm_polygon` | public | ❌ Não | Habilitar RLS + Política pública |
| `planet_osm_roads` | public | ❌ Não | Habilitar RLS + Política pública |
| `planet_osm_nodes` | public | ❌ Não | Habilitar RLS + Política pública |
| `planet_osm_ways` | public | ❌ Não | Habilitar RLS + Política pública |
| `planet_osm_rels` | public | ❌ Não | Habilitar RLS + Política pública |
| `spatial_ref_sys` | public | ❌ Não | Habilitar RLS + Política pública |

### Funções com Search Path Mutável (19)

Todas as funções listadas precisam adicionar:
```sql
SET search_path = public, auth
```

Ou para funções simples:
```sql
SET search_path TO public
```

## 🔄 Próximos Passos

### Fase 1: Correções Críticas (Hoje)
- [x] ~~Remover credenciais da migration~~ (Concluído)
- [x] ~~Criar template FDW~~ (Concluído)
- [x] ~~Atualizar .gitignore~~ (Concluído)
- [ ] Habilitar RLS em `gabinetes`
- [ ] Habilitar RLS em `documentos` + criar políticas
- [ ] Validar correções

### Fase 2: Correções de Alta Prioridade (Esta Semana)
- [ ] Fixar search_path em funções críticas
- [ ] Habilitar RLS em tabelas OSM
- [ ] Criar políticas adequadas para OSM
- [ ] Rotacionar credenciais expostas (FDW)

### Fase 3: Melhorias (Próximas 2 Semanas)
- [ ] Mover extensões para schemas dedicados
- [ ] Revisar view `dashboard_stats` (SECURITY DEFINER)
- [ ] Habilitar proteção de senhas vazadas
- [ ] Documentar padrões de segurança

## 📝 Relatório para Stakeholders

### Situação Atual
✅ **Credenciais removidas** da migration versionada  
🔴 **11 vulnerabilidades críticas** de RLS identificadas  
🟡 **19 avisos** de search_path em funções  

### Risco Imediato
- **ALTO**: Tabela `gabinetes` exposta sem RLS (mesmo com políticas definidas)
- **ALTO**: Tabela `documentos` completamente exposta
- **MÉDIO**: Dados OSM sem controle de acesso

### Tempo Estimado para Correção Completa
- **Crítico**: 1-2 horas
- **Alta Prioridade**: 1-2 dias
- **Melhorias**: 1 semana

## 🔗 Links Úteis

- [Checklist de Segurança](ROLLBACK_MIGRATION_20260102.md#checklist-de-segurança)
- [Documentação FDW](FDW_SETUP.md)
- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [Row Level Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)

---

**Última atualização**: 2026-01-02T19:40:00Z  
**Responsável**: Security/DevOps Team  
**Status**: 🔴 Ação Requerida
