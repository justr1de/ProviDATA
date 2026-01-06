# AGENTS.md - Copilot Agent Instructions for ProviDATA

## Overview

ProviDATA is a **multi-tenant SaaS platform** for managing parliamentary services (providências parlamentares). Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Supabase** (PostgreSQL + Auth + Realtime).

**Key Requirement**: All data access **MUST** respect tenant isolation via Row Level Security (RLS).

## Technology Stack

- **Frontend**: Next.js 16 (App Router, Server Components), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Deployment**: Vercel (automatic deployment on push to `main`)
- **Package Manager**: pnpm

## Build/Test/Lint Instructions

### Installation
```bash
pnpm install
# or
npm install
```
**Note**: Project prefers `pnpm` but `npm` works as well.

### Development
```bash
pnpm dev
# or
npm run dev
```
Starts development server at http://localhost:3000

### Production Build
```bash
pnpm build
# or
npm run build
```

### Linting
```bash
pnpm lint
# or
npm run lint
```
Uses ESLint with Next.js configuration. All code must pass linting before merging.

### Environment Variables
Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── dashboard/              # Authenticated area
│   │   ├── providencias/       # Providências management
│   │   ├── cidadaos/           # Citizens management
│   │   ├── orgaos/             # Government agencies management
│   │   ├── categorias/         # Categories management
│   │   ├── notificacoes/       # Notifications
│   │   ├── relatorios/         # Reports
│   │   └── administracao/      # Admin panel
│   ├── login/                  # Login page
│   └── cadastro/               # Registration page
├── components/                 # Reusable components
│   └── ui/                     # UI components (buttons, inputs, cards, etc.)
├── lib/                        # Utilities and configurations
│   ├── supabase/               # Supabase clients (client.ts, server.ts, middleware.ts)
│   ├── services/               # Business logic services
│   └── auth-utils.ts           # Authentication utilities
├── store/                      # Zustand global state stores
├── types/                      # TypeScript type definitions
│   └── database.ts             # Database schema types
└── middleware.ts               # Next.js middleware for auth protection
```

## Coding Conventions

### TypeScript
- **Always use TypeScript** for all code
- Use explicit types, avoid `any` unless absolutely necessary
- Define types in `src/types/` for domain entities
- Use interfaces for object shapes, types for unions/primitives

### React/Next.js
- Prefer **Server Components** by default
- Use `"use client"` directive only when needed (hooks, event handlers, browser APIs)
- Follow Next.js App Router conventions:
  - `page.tsx` for routes
  - `layout.tsx` for layouts
  - `loading.tsx` for loading states
  - `error.tsx` for error boundaries

### Component Structure
- Place reusable UI components in `src/components/ui/`
- Use Tailwind CSS for all styling
- Follow existing component patterns (see `src/components/ui/button.tsx`, `card.tsx`, etc.)
- Props should be typed with TypeScript interfaces

### State Management
- Use **Zustand** for global state (see `src/store/`)
- Keep state minimal and focused
- Prefer server-side data fetching over client-side state when possible

### Data Fetching
- Use Supabase client utilities from `src/lib/supabase/`
  - `server.ts` for Server Components
  - `client.ts` for Client Components
  - `middleware.ts` for middleware
- **ALWAYS filter by `tenant_id`** for multi-tenant data isolation
- Use Row Level Security (RLS) - never bypass it

### File Naming
- Use kebab-case for files: `my-component.tsx`, `user-service.ts`
- Page files: `page.tsx`
- Component files: `button.tsx`, `card.tsx`

### Code Style
- Use single quotes for strings (enforced by ESLint)
- Use semicolons (enforced by ESLint)
- 2-space indentation
- Use arrow functions for callbacks and functional components
- Add comments only when necessary to explain complex logic

## Security Requirements

### Multi-Tenant Isolation
- **CRITICAL**: All database queries MUST filter by `tenant_id`
- Never expose data from other tenants
- Always use RLS policies - they are your first line of defense
- Test tenant isolation for any new features

### Authentication
- Use Supabase Auth for all authentication
- Check user authentication in middleware (`src/middleware.ts`)
- Protected routes are under `/dashboard/*`
- Use `src/lib/auth-utils.ts` for auth helpers

### Data Access Patterns
```typescript
// ✅ CORRECT - Filtered by tenant_id
const { data } = await supabase
  .from('providencias')
  .select('*')
  .eq('tenant_id', user.tenant_id);

// ❌ WRONG - Missing tenant filter (security risk!)
const { data } = await supabase
  .from('providencias')
  .select('*');
```

### Input Validation
- Validate all user inputs
- Use Zod for schema validation (see `react-hook-form` + `@hookform/resolvers`)
- Sanitize data before database operations

## Database Schema

Key tables (all have `tenant_id` for multi-tenant isolation):
- `tenants` - Gabinetes/Offices
- `users` - System users
- `cidadaos` - Citizens
- `providencias` - Service requests/providências
- `categorias` - Categories
- `orgaos` - Government agencies
- `historico_providencias` - Change history
- `anexos` - File attachments
- `notificacoes` - Notifications
- `dashboard_stats` - Dashboard statistics

Refer to `src/types/database.ts` for complete type definitions.

## Acceptance Criteria for Changes

All code changes must meet these criteria:

1. **Build Success**: `pnpm build` must complete without errors
2. **Linting**: `pnpm lint` must pass with no errors
3. **Type Safety**: No TypeScript errors (`tsc --noEmit` passes)
4. **Security**: 
   - Multi-tenant isolation respected (queries filtered by `tenant_id`)
   - No hardcoded secrets or credentials
   - Input validation in place
5. **Functionality**: Manually test changes in development environment
6. **Code Style**: Follows project conventions outlined above
7. **Documentation**: Update relevant docs if changing architecture or APIs

### For UI Changes
- Must be responsive (mobile, tablet, desktop)
- Must follow existing design patterns (Tailwind classes, component structure)
- Must be accessible (semantic HTML, proper ARIA labels)

### For Database Changes
- Must include Supabase migrations in `supabase/migrations/`
- Must maintain RLS policies
- Must not break existing queries

## Common Tasks

### Adding a New Page
1. Create file in `src/app/dashboard/[feature]/page.tsx`
2. Use Server Component by default
3. Fetch data with Supabase server client
4. Use UI components from `src/components/ui/`

### Adding a New Component
1. Create in `src/components/ui/[component-name].tsx`
2. Export as named export
3. Type props with TypeScript interface
4. Use Tailwind for styling

### Adding a New Database Table
1. Create migration in `supabase/migrations/`
2. Add RLS policies for tenant isolation
3. Update `src/types/database.ts` with new types
4. Test queries with proper tenant filtering

### Adding State Management
1. Create store in `src/store/[feature]-store.ts`
2. Use Zustand patterns from existing stores
3. Keep state minimal

## Important Files to Reference

- **Architecture**: `docs/ARQUITETURA.md`
- **Multi-tenant Details**: `docs/GABINETES_MULTITENANCY.md`
- **Security**: `SECURITY.md`, `docs/RESULTADO_FINAL_SEGURANCA.md`
- **Deployment**: `DEPLOY_README.md`, `docs/DEPLOY_VERCEL.md`
- **Database Types**: `src/types/database.ts`
- **Supabase Config**: `src/lib/supabase/`

## Notes for Copilot Agent

- This is a **production system** serving real users - be careful with changes
- **Security is paramount** - always respect multi-tenant isolation
- Follow Next.js 16 best practices (Server Components, App Router)
- Test changes locally before committing (`pnpm dev`)
- When in doubt, check existing patterns in the codebase
- The project uses Portuguese for UI/UX but code should use English

## Getting Help

- Check `README.md` for project overview
- Check `DOCUMENTACAO.md` for detailed documentation
- Review existing code in similar features for patterns
- Consult Supabase documentation for database operations
- Consult Next.js documentation for framework features
