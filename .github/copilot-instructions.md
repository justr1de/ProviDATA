
# Copilot Instructions for ProviDATA

## Visão Geral e Arquitetura
ProviDATA é uma plataforma SaaS multi-tenant para gestão de providências parlamentares, construída sobre Next.js (App Router), React, TypeScript, Tailwind CSS e Supabase (PostgreSQL + Auth). O sistema organiza solicitações de cidadãos, providências parlamentares e integra dashboards analíticos em tempo real.

### Arquitetura
- **Frontend**: Next.js 16 (App Router, layouts aninhados, Server Components), React 19, Tailwind CSS, Zustand para estado global.
- **Backend/Auth**: Supabase (PostgreSQL, Auth, Storage, Realtime, Row Level Security).
- **DevOps**: Deploy automático via Vercel (push em `main`), preview para branches/PRs.
- **Segurança**: RLS ativo em todas as tabelas, isolamento multi-tenant obrigatório.

### Fluxos de Dados (exemplo)
- Registro: Cidadão → Gabinete → Sistema → Supabase (INSERT) → RLS valida tenant → Notificação em tempo real → E-mail/push.
- Acompanhamento: Parlamentar → Dashboard → Supabase Query (filtra tenant) → Realtime → Timeline.

## Estrutura e Convenções
- **src/app/**: Rotas/páginas (App Router). Subpastas refletem domínios: `dashboard/providencias/`, `dashboard/cidadaos/`, etc.
- **src/components/ui/**: Componentes de UI reutilizáveis, estilizados com Tailwind.
- **src/lib/supabase/**: Configuração e clientes Supabase para autenticação e queries.
- **src/store/**: Estado global via Zustand.
- **src/types/**: Tipos TypeScript para entidades do domínio.
- **public/**: Assets estáticos.

## Workflows e Comandos
- **Instalação**: `pnpm install`
- **Desenvolvimento**: `pnpm dev`
- **Build Produção**: `pnpm build`
- **Variáveis de ambiente**: `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Integrações e Padrões
- **Supabase**: Queries e autenticação sempre via utilitários em `src/lib/supabase/`.
- **RLS**: Nunca acessar dados sem filtrar por tenant. Use sempre o campo `tenant_id` nas queries.
- **Autenticação**: Hooks/helpers do Supabase para login/logout e sessão. Veja `src/lib/supabase/server.ts` e `src/store/auth-store.ts`.
- **Componentização**: Prefira componentes de UI em `src/components/ui/` para consistência visual.
- **Estado**: Use Zustand (`src/store/`) para estados globais, evitando contextos React desnecessários.
- **Tipos**: Sempre tipar dados e respostas de API usando arquivos em `src/types/`.

## Exemplos e Boas Práticas
- Nova tela de gestão: crie subpasta em `src/app/dashboard/<domínio>/` e use componentes de UI + hooks Supabase.
- Nova entidade: defina tipo em `src/types/`, crie store se necessário, integre queries via Supabase.
- Notificações: utilize Supabase Realtime e APIs de e-mail/push conforme fluxo de dados.
- Para dashboards, use hooks customizados para queries agregadas e componentes de visualização em `ui/`.

## Referências Rápidas
- **Dashboard**: `src/app/dashboard/`
- **Providências**: `src/app/dashboard/providencias/`
- **Cidadãos**: `src/app/dashboard/cidadaos/`
- **Órgãos**: `src/app/dashboard/orgaos/`
- **Supabase Client**: `src/lib/supabase/client.ts`
- **Autenticação**: `src/lib/supabase/server.ts`, `src/store/auth-store.ts`
- **Tipos**: `src/types/database.ts`

Consulte o `README.md` e `docs/ARQUITETURA.md` para detalhes de tabelas, fluxos e decisões arquiteturais. Siga sempre o padrão multi-tenant e respeite o isolamento de dados por gabinete.