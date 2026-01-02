# Instruções para Sincronizar Funções com Supabase

## Arquivo de Migration Criado
**Arquivo:** [`20260101_sync_all_functions.sql`](./20260101_sync_all_functions.sql)

Este arquivo consolida todas as funções SQL do sistema em um único arquivo de migração.

---

## Funções Incluídas

### 1. **update_updated_at_column()**
- **Tipo:** Trigger Function
- **Descrição:** Atualiza automaticamente o campo `updated_at` quando um registro é modificado
- **Uso:** Aplicada via triggers em várias tabelas

### 2. **handle_new_user()**
- **Tipo:** Trigger Function
- **Descrição:** Cria perfil automaticamente quando um novo usuário é registrado
- **Uso:** Trigger em `auth.users` após INSERT

### 3. **expire_old_invites()**
- **Tipo:** Utility Function
- **Descrição:** Marca convites pendentes como expirados (tabela `invites`)
- **Parâmetros:** Nenhum
- **Retorno:** void

### 4. **expirar_convites_antigos()**
- **Tipo:** Utility Function
- **Descrição:** Marca convites pendentes como expirados (tabela `convites`)
- **Parâmetros:** Nenhum
- **Retorno:** void

### 5. **accept_invite(invite_token TEXT, user_id UUID)**
- **Tipo:** Business Logic
- **Descrição:** Aceita um convite válido e associa o usuário à organização
- **Tabela:** `invites`
- **Retorno:** JSONB com resultado da operação

### 6. **aceitar_convite(convite_token TEXT, user_id UUID)**
- **Tipo:** Business Logic
- **Descrição:** Aceita um convite válido e associa o usuário ao gabinete
- **Tabela:** `convites`
- **Retorno:** JSONB com resultado da operação

### 7. **revogar_convite(convite_id UUID, user_id UUID)**
- **Tipo:** Business Logic
- **Descrição:** Revoga um convite (apenas admins/gestores do gabinete)
- **Retorno:** JSONB com resultado da operação

### 8. **obter_estatisticas_gabinete(gabinete_uuid UUID)**
- **Tipo:** Analytics
- **Descrição:** Retorna estatísticas de usuários e convites do gabinete
- **Retorno:** JSONB com estatísticas completas

### 9. **create_super_admin(admin_email TEXT, admin_password TEXT, admin_name TEXT)**
- **Tipo:** Admin Setup
- **Descrição:** Cria ou atualiza usuário como super admin
- **Retorno:** JSONB com resultado da operação

### 10. **setup_super_admin_profile(user_id UUID)**
- **Tipo:** Admin Setup
- **Descrição:** Configura perfil de super admin para usuário existente
- **Retorno:** JSONB com resultado da operação

---

## Como Executar a Sincronização

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o **Supabase Dashboard**
2. Navegue até **SQL Editor**
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo [`20260101_sync_all_functions.sql`](./20260101_sync_all_functions.sql)
5. Cole no editor SQL
6. Clique em **Run** ou pressione `Ctrl+Enter`
7. Aguarde a execução completa
8. Verifique se não há erros

### Opção 2: Via Supabase CLI

```bash
# Certifique-se de estar na raiz do projeto
cd /workspaces/ProviDATA

# Execute a migração
npx supabase migration up

# Ou execute diretamente o arquivo
npx supabase db execute -f supabase/migrations/20260101_sync_all_functions.sql
```

### Opção 3: Via psql (se tiver acesso direto ao banco)

```bash
psql -h [seu-host] -U postgres -d postgres -f supabase/migrations/20260101_sync_all_functions.sql
```

---

## Verificação Pós-Sincronização

Após executar a migração, execute os seguintes comandos SQL para verificar se todas as funções foram criadas:

```sql
-- Listar todas as funções públicas
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'update_updated_at_column',
    'handle_new_user',
    'expire_old_invites',
    'expirar_convites_antigos',
    'accept_invite',
    'aceitar_convite',
    'revogar_convite',
    'obter_estatisticas_gabinete',
    'create_super_admin',
    'setup_super_admin_profile'
)
ORDER BY routine_name;

-- Deve retornar 10 funções
```

### Resultado Esperado:
Você deve ver **10 funções** listadas:
- ✅ accept_invite
- ✅ aceitar_convite
- ✅ create_super_admin
- ✅ expirar_convites_antigos
- ✅ expire_old_invites
- ✅ handle_new_user
- ✅ obter_estatisticas_gabinete
- ✅ revogar_convite
- ✅ setup_super_admin_profile
- ✅ update_updated_at_column

---

## Testando as Funções

### Testar expire_old_invites()
```sql
SELECT public.expire_old_invites();
```

### Testar expirar_convites_antigos()
```sql
SELECT public.expirar_convites_antigos();
```

### Testar obter_estatisticas_gabinete()
```sql
-- Substitua pelo UUID de um gabinete existente
SELECT public.obter_estatisticas_gabinete('seu-gabinete-uuid-aqui');
```

### Testar setup_super_admin_profile()
```sql
-- Substitua pelo UUID de um usuário existente
SELECT public.setup_super_admin_profile('seu-user-uuid-aqui');
```

---

## Uso das Funções no Código

### Exemplo 1: Aceitar Convite (Next.js API Route)
```typescript
const { data, error } = await supabase.rpc('aceitar_convite', {
  convite_token: token,
  user_id: user.id
});

if (data?.success) {
  console.log('Convite aceito com sucesso!');
}
```

### Exemplo 2: Obter Estatísticas do Gabinete
```typescript
const { data, error } = await supabase.rpc('obter_estatisticas_gabinete', {
  gabinete_uuid: gabineteId
});

console.log('Total de usuários:', data.total_usuarios);
console.log('Convites pendentes:', data.convites_pendentes);
```

### Exemplo 3: Revogar Convite
```typescript
const { data, error } = await supabase.rpc('revogar_convite', {
  convite_id: conviteId,
  user_id: userId
});
```

---

## Troubleshooting

### Erro: "function already exists"
Se você ver este erro, é porque a função já existe. Não se preocupe, o script usa `CREATE OR REPLACE` que atualiza a função automaticamente.

### Erro: "permission denied"
Certifique-se de estar executando como usuário `postgres` ou um usuário com permissões adequadas.

### Erro: "table does not exist"
Certifique-se de que as migrations de criação de tabelas foram executadas primeiro:
- `20231231_onboarding_system.sql`
- `20240101_gabinetes_multitenancy.sql`

---

## Próximos Passos

1. ✅ Execute a migração
2. ✅ Verifique se todas as funções foram criadas
3. ✅ Teste as funções principais
4. ✅ Atualize seu código frontend/backend para usar as funções via RPC
5. ✅ Configure cron jobs para executar `expire_old_invites()` e `expirar_convites_antigos()` periodicamente

---

## Agendamento Automático de Expiração

Para configurar a expiração automática de convites, você pode usar o Supabase Cron Jobs (pg_cron):

```sql
-- Executar diariamente à meia-noite
SELECT cron.schedule(
  'expire-old-invites-daily',
  '0 0 * * *',
  $$SELECT public.expire_old_invites()$$
);

SELECT cron.schedule(
  'expirar-convites-antigos-daily',
  '0 0 * * *',
  $$SELECT public.expirar_convites_antigos()$$
);
```

---

## Suporte

Se encontrar algum problema durante a sincronização, verifique:
1. Logs do Supabase Dashboard
2. Mensagens de erro no SQL Editor
3. Políticas RLS que podem estar bloqueando acesso às tabelas
4. Permissões do usuário que está executando as funções

---

**Última atualização:** 2026-01-01
**Versão:** 1.0.0
