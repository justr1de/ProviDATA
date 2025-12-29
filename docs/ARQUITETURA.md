# Arquitetura do Sistema ProviDATA

## Visão Geral

O **ProviDATA** é um sistema de gestão de providências parlamentares desenvolvido com arquitetura **serverless**, utilizando a stack moderna **GitHub + Supabase + Vercel**. Esta arquitetura garante escalabilidade, segurança e baixo custo operacional.

---

## Diagrama de Arquitetura

![Arquitetura ProviDATA](./arquitetura-v2.png)

---

## Componentes da Arquitetura

### 1. Frontend (Vercel + Next.js)

| Componente | Tecnologia | Função |
|------------|------------|--------|
| **Framework** | Next.js 15 | App Router, Server Components, SSR/SSG |
| **UI Library** | React 19 | Componentes reativos e estado |
| **Estilização** | Tailwind CSS | Design system responsivo |
| **Estado Global** | Zustand | Gerenciamento de estado leve |
| **Hospedagem** | Vercel | Deploy automático, CDN global, Edge Functions |

**Características:**
- **Server Components**: Renderização no servidor para melhor SEO e performance
- **App Router**: Roteamento baseado em arquivos com layouts aninhados
- **Middleware**: Proteção de rotas autenticadas
- **API Routes**: Funções serverless para operações sensíveis

---

### 2. Backend (Supabase)

| Serviço | Função |
|---------|--------|
| **PostgreSQL** | Banco de dados relacional com 9 tabelas |
| **Authentication** | Login/Signup com JWT tokens |
| **Row Level Security** | Isolamento multi-tenant por `tenant_id` |
| **Storage** | Armazenamento de arquivos (fotos, documentos) |
| **Realtime** | Subscriptions para atualizações em tempo real |

**Modelo de Dados:**

```
tenants (Gabinetes)
├── users (Usuários do sistema)
├── cidadaos (Solicitantes)
├── categorias (Tipos de providência)
├── orgaos (Órgãos destinatários)
└── providencias (Solicitações)
    ├── historico_providencias (Timeline)
    ├── anexos (Arquivos)
    └── notificacoes (Alertas)
```

---

### 3. CI/CD (GitHub + Vercel)

```
GitHub Repository
       │
       ▼
   Push to main
       │
       ▼
 Vercel Build
       │
       ▼
  Deploy Automático
       │
       ▼
 Preview/Production
```

**Fluxo de Deploy:**
1. Desenvolvedor faz push para `main`
2. Vercel detecta alterações automaticamente
3. Build do Next.js é executado
4. Deploy para produção em ~30 segundos
5. Preview deployments para branches/PRs

---

### 4. Segurança Multi-tenant

O sistema utiliza **Row Level Security (RLS)** do PostgreSQL para garantir isolamento total entre gabinetes:

```sql
-- Política RLS para providências
CREATE POLICY "Tenant isolation" ON providencias
  FOR ALL
  USING (tenant_id = get_current_tenant_id());
```

**Fluxo de Autenticação:**

```
Usuário → Login → Supabase Auth → JWT Token
                                      │
                                      ▼
                              RLS Policy Check
                                      │
                                      ▼
                              Dados Filtrados
                              (apenas do tenant)
```

---

### 5. Notificações

| Canal | Tecnologia | Uso |
|-------|------------|-----|
| **E-mail** | Resend/SendGrid | Alertas de prazo, atualizações |
| **Push** | Web Push API | Notificações em tempo real |
| **In-App** | Supabase Realtime | Badge de notificações |

---

## Fluxo de Dados

### Registro de Providência

```
1. Cidadão → Gabinete (presencial/telefone)
2. Equipe → Sistema (cadastro)
3. Sistema → Supabase (INSERT)
4. RLS → Valida tenant_id
5. Realtime → Notifica dashboard
6. API → Dispara e-mail/push
```

### Acompanhamento

```
1. Parlamentar → Dashboard
2. Next.js → Supabase Query
3. RLS → Filtra por tenant
4. Realtime → Atualiza em tempo real
5. Histórico → Timeline completa
```

---

## Escalabilidade

| Aspecto | Solução |
|---------|---------|
| **Usuários** | Vercel Edge Network (CDN global) |
| **Banco de Dados** | Supabase (PostgreSQL gerenciado) |
| **Arquivos** | Supabase Storage (S3 compatível) |
| **Picos de Acesso** | Serverless (escala automática) |

---

## Custos Estimados

| Serviço | Plano | Custo Mensal |
|---------|-------|--------------|
| **Vercel** | Pro | ~$20/mês |
| **Supabase** | Pro | ~$25/mês |
| **Domínio** | Anual | ~$12/ano |
| **Total** | - | **~$45/mês** |

*Valores para ~1000 usuários ativos/mês*

---

## Tecnologias Utilizadas

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Lucide Icons
- Sonner (Toasts)

### Backend
- Supabase
- PostgreSQL
- Row Level Security
- JWT Authentication

### DevOps
- GitHub
- Vercel
- GitHub Actions (opcional)

---

## Repositórios e Links

| Recurso | URL |
|---------|-----|
| **Produção** | https://providata.vercel.app |
| **GitHub** | https://github.com/justr1de/ProviDATA |
| **Supabase** | https://supabase.com/dashboard/project/wntiupkhjtgiaxiicxeq |
| **Vercel** | https://vercel.com/data-ro-hub/providata |

---

## Desenvolvido por

**DATA-RO INTELIGÊNCIA TERRITORIAL**

Todos os direitos reservados.
