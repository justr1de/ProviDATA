# Validar Super Admin DATA-RO

## Objetivo
Configurar a conta **contato@dataro-it.com.br** como Super Admin com acesso total ao sistema.

## Pré-requisitos

### 1. Verificar se o usuário existe no Supabase Auth

Acesse o Supabase Dashboard → Authentication → Users e verifique se o e-mail **contato@dataro-it.com.br** está cadastrado.

**Se NÃO existir:**
1. Vá em Authentication → Users
2. Clique em "Add user"
3. Preencha:
   - Email: `contato@dataro-it.com.br`
   - Password: (defina uma senha segura)
   - Auto Confirm User: ✅ (marque esta opção)
4. Clique em "Create user"

**Se JÁ existir:**
- Anote o User ID (UUID)
- Verifique se o e-mail está confirmado (coluna "Confirmed")

## Executar a Migration

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse: Supabase Dashboard → SQL Editor
2. Clique em "New query"
3. Cole o conteúdo do arquivo: `supabase/migrations/20260101_validar_super_admin_dataro.sql`
4. Clique em "Run" (ou pressione Ctrl+Enter)
5. Verifique os logs de sucesso

### Opção 2: Via CLI Local

```bash
# Execute a migration
supabase db push

# Ou execute diretamente o arquivo
psql $DATABASE_URL -f supabase/migrations/20260101_validar_super_admin_dataro.sql
```

## Verificação

Após executar a migration, você verá mensagens como:

```
NOTICE: Usuário encontrado: [UUID]
NOTICE: Organização DATA-RO garantida: 00000000-0000-0000-0000-000000000001
NOTICE: Perfil do super admin criado/atualizado
NOTICE: E-mail confirmado no auth.users
NOTICE: ==============================================
NOTICE: SUPER ADMIN CONFIGURADO COM SUCESSO!
NOTICE: ==============================================
NOTICE: E-mail: contato@dataro-it.com.br
NOTICE: User ID: [UUID]
NOTICE: Organization ID: 00000000-0000-0000-0000-000000000001
NOTICE: Role: admin
NOTICE: ==============================================
```

E uma tabela mostrando os dados do perfil configurado.

## Testar o Acesso

1. Faça login com: **contato@dataro-it.com.br**
2. Acesse: `/admin`
3. Você deve ver o dashboard do Super Admin com:
   - Sidebar vermelha com logo DATA-RO
   - Badge "Super Admin"
   - Métricas globais
   - Acesso a todos os gabinetes

## Troubleshooting

### Erro: "Usuário não encontrado no auth.users"
**Solução:** Crie o usuário manualmente no Supabase Auth (veja Pré-requisitos acima)

### Erro: "Acesso negado" ao acessar /admin
**Possíveis causas:**
1. O usuário não está logado
2. A migration não foi executada corretamente
3. O perfil não tem `role = 'admin'` ou `organization_id` incorreto

**Verificar no SQL Editor:**
```sql
SELECT 
  p.id,
  p.email,
  p.role,
  p.organization_id,
  o.name as org_name
FROM profiles p
LEFT JOIN organizations o ON o.id = p.organization_id
WHERE p.email = 'contato@dataro-it.com.br';
```

Deve retornar:
- `role`: `admin`
- `organization_id`: `00000000-0000-0000-0000-000000000001`
- `org_name`: `DATA-RO Inteligência Territorial`

### Erro: "Email not confirmed"
**Solução:** Execute no SQL Editor:
```sql
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'contato@dataro-it.com.br';
```

## Estrutura Criada

A migration garante:

1. ✅ Organização DATA-RO existe (`organizations`)
2. ✅ Perfil do super admin criado (`profiles`)
3. ✅ Role configurado como `admin`
4. ✅ Organization ID vinculado: `00000000-0000-0000-0000-000000000001`
5. ✅ E-mail confirmado no `auth.users`
6. ✅ Metadata com flag `is_super_admin: true`
7. ✅ Onboarding marcado como completo

## Segurança

O middleware em [`src/middleware.ts`](../../src/middleware.ts) protege as rotas `/admin` verificando:

```typescript
const isSuperAdmin =
  profile?.role === 'admin' &&
  profile?.organization_id === '00000000-0000-0000-0000-000000000001'
```

Apenas usuários com estas duas condições podem acessar `/admin`.
