# 🧪 Guia de Teste Local - Sistema de Onboarding

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Supabase CLI instalado
- Docker instalado (para Supabase local)

## 🚀 Passo a Passo

### 1. Instalar Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (via Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Ou via NPM (qualquer sistema)
npm install -g supabase
```

### 2. Iniciar Supabase Local

```bash
# Na raiz do projeto
supabase init

# Iniciar containers Docker do Supabase
supabase start
```

Isso irá iniciar:
- PostgreSQL (porta 54322)
- Studio (porta 54323)
- API Gateway (porta 54321)
- Auth (porta 54324)

**Anote as credenciais que aparecerem no terminal!**

### 3. Configurar Variáveis de Ambiente Local

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase Local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-local
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-local

# As keys aparecem quando você roda 'supabase start'
```

### 4. Aplicar Migrations

```bash
# Aplicar todas as migrations
supabase db reset

# Ou aplicar migrations específicas
supabase migration up
```

### 5. Executar Scripts SQL Adicionais

Acesse o Supabase Studio local em `http://localhost:54323` e execute:

1. **Criar Super Admin**:
```sql
-- Execute: supabase/migrations/20231231_create_super_admin.sql
```

2. **Criar Organização DATA-RO**:
```sql
-- Execute: supabase/migrations/20240101_create_dataro_organization.sql
```

3. **Vincular Super Admin**:
```sql
-- Execute: supabase/migrations/20240101_vincular_super_admin_dataro.sql
```

### 6. Instalar Dependências do Next.js

```bash
npm install
# ou
pnpm install
```

### 7. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
# ou
pnpm dev
```

Acesse: `http://localhost:3000`

## 🧪 Testes Manuais

### Teste 1: Login como Super Admin

1. Acesse `http://localhost:3000/login`
2. Faça login com:
   - **Email**: `contato@dataro-it.com.br`
   - **Senha**: `@D4taR1x`
3. Verifique se você é redirecionado para o dashboard

### Teste 2: Criar Convite (Super Admin)

```bash
# Via curl
curl -X POST http://localhost:3000/api/invites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "email": "teste@exemplo.com",
    "role": "gestor",
    "organization_id": "UUID_DA_ORGANIZACAO",
    "expires_in_days": 7
  }'
```

Ou use o Postman/Insomnia:
- **URL**: `POST http://localhost:3000/api/invites`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer SEU_TOKEN_JWT`
- **Body**:
```json
{
  "email": "teste@exemplo.com",
  "role": "gestor",
  "organization_id": "uuid-da-organizacao",
  "expires_in_days": 7
}
```

### Teste 3: Listar Convites

```bash
curl -X GET http://localhost:3000/api/invites \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### Teste 4: Buscar Convite por Token (Público)

```bash
curl -X GET "http://localhost:3000/api/invites/accept?token=TOKEN_DO_CONVITE"
```

### Teste 5: Aceitar Convite

1. Crie um novo usuário no Supabase Studio
2. Faça login com esse usuário
3. Aceite o convite:

```bash
curl -X POST http://localhost:3000/api/invites/accept \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DO_NOVO_USUARIO" \
  -d '{
    "token": "TOKEN_DO_CONVITE"
  }'
```

### Teste 6: Revogar Convite

```bash
curl -X PATCH http://localhost:3000/api/invites/ID_DO_CONVITE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "action": "revoke"
  }'
```

### Teste 7: Reenviar Convite

```bash
curl -X PATCH http://localhost:3000/api/invites/ID_DO_CONVITE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "action": "resend"
  }'
```

## 🔍 Verificar Dados no Banco

### Via Supabase Studio

Acesse `http://localhost:54323` e navegue até:
- **Table Editor** > `invites` - Ver convites criados
- **Table Editor** > `profiles` - Ver perfis de usuários
- **Table Editor** > `organizations` - Ver organizações

### Via SQL

No Supabase Studio, vá em **SQL Editor** e execute:

```sql
-- Ver todos os convites
SELECT 
  i.*,
  o.name as organization_name,
  p.full_name as invited_by_name
FROM invites i
LEFT JOIN organizations o ON o.id = i.organization_id
LEFT JOIN profiles p ON p.id = i.invited_by
ORDER BY i.created_at DESC;

-- Ver perfil do super admin
SELECT 
  p.*,
  o.name as organization_name,
  u.email
FROM profiles p
LEFT JOIN organizations o ON o.id = p.organization_id
LEFT JOIN auth.users u ON u.id = p.id
WHERE u.email = 'contato@dataro-it.com.br';

-- Ver organização DATA-RO
SELECT * FROM organizations WHERE slug = 'dataro';
```

## 🐛 Troubleshooting

### Erro: "Supabase not running"

```bash
# Parar e reiniciar
supabase stop
supabase start
```

### Erro: "Port already in use"

```bash
# Verificar portas em uso
lsof -i :54321
lsof -i :54322
lsof -i :54323

# Parar Supabase e liberar portas
supabase stop
```

### Erro: "Migration failed"

```bash
# Resetar banco de dados
supabase db reset

# Aplicar migrations novamente
supabase migration up
```

### Erro: "Cannot connect to database"

```bash
# Verificar status dos containers
docker ps

# Verificar logs
supabase status
```

### Erro: "Invalid JWT token"

1. Verifique se está usando o token correto
2. Obtenha um novo token fazendo login novamente
3. Verifique se o token não expirou

## 📊 Monitoramento

### Ver Logs do Next.js

```bash
# Terminal onde o Next.js está rodando
# Os logs aparecerão automaticamente
```

### Ver Logs do Supabase

```bash
# Logs do PostgreSQL
docker logs supabase_db_providata

# Logs da API
docker logs supabase_kong_providata

# Logs do Auth
docker logs supabase_auth_providata
```

## 🧹 Limpar Ambiente

```bash
# Parar Supabase
supabase stop

# Remover volumes (CUIDADO: apaga todos os dados)
supabase stop --no-backup

# Limpar containers Docker
docker system prune -a
```

## 📝 Checklist de Testes

- [ ] Supabase local iniciado
- [ ] Migrations aplicadas
- [ ] Super admin criado
- [ ] Organização DATA-RO criada
- [ ] Super admin vinculado à DATA-RO
- [ ] Next.js rodando
- [ ] Login como super admin funciona
- [ ] Criar convite funciona
- [ ] Listar convites funciona
- [ ] Buscar convite por token funciona
- [ ] Aceitar convite funciona
- [ ] Revogar convite funciona
- [ ] Reenviar convite funciona
- [ ] Permissões do super admin funcionam
- [ ] Permissões de admin normal funcionam

## 🚀 Deploy para Produção

Após testar localmente, você pode fazer deploy:

```bash
# 1. Fazer push das migrations para produção
supabase db push

# 2. Executar scripts SQL no Supabase Dashboard de produção
# - 20231231_create_super_admin.sql
# - 20240101_create_dataro_organization.sql
# - 20240101_vincular_super_admin_dataro.sql

# 3. Deploy do Next.js (Vercel, por exemplo)
vercel --prod
```

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs do Next.js no terminal
2. Logs do Supabase no Docker
3. Console do navegador (F12)
4. Network tab para ver requisições HTTP

Para mais informações, consulte:
- [Documentação do Supabase CLI](https://supabase.com/docs/guides/cli)
- [Documentação do Next.js](https://nextjs.org/docs)
- [`docs/SISTEMA_ONBOARDING.md`](./SISTEMA_ONBOARDING.md)
