# ProviDATA

Sistema de Gestão de Providências Parlamentares desenvolvido pela **DATA-RO INTELIGÊNCIA TERRITORIAL**.

## Sobre o Sistema

O ProviDATA é uma plataforma SaaS multi-tenant para gestão de providências parlamentares. Permite que vereadores, deputados e senadores gerenciem as solicitações dos cidadãos de forma organizada e transparente.

## Funcionalidades

- **Gestão de Providências**: Registre e acompanhe todas as solicitações com protocolo automático
- **Cadastro de Cidadãos**: Banco de dados completo dos solicitantes
- **Órgãos Destinatários**: Cadastro de secretarias, MP, defensoria e outros órgãos
- **Dashboard Analítico**: Estatísticas e indicadores em tempo real
- **Notificações**: Alertas sobre prazos e atualizações
- **Multi-tenant**: Ambiente isolado e seguro para cada gabinete

## Stack Tecnológica

- **Frontend**: Next.js 16 + React + TypeScript
- **Estilização**: Tailwind CSS
- **Backend/Auth**: Supabase (PostgreSQL + Auth)
- **Deploy**: Vercel
- **Repositório**: GitHub

## Estrutura do Projeto

```
src/
├── app/                    # Rotas e páginas (App Router)
│   ├── dashboard/          # Área logada
│   │   ├── providencias/   # Gestão de providências
│   │   ├── cidadaos/       # Gestão de cidadãos
│   │   ├── orgaos/         # Gestão de órgãos
│   │   └── categorias/     # Gestão de categorias
│   ├── login/              # Página de login
│   └── cadastro/           # Página de cadastro
├── components/             # Componentes reutilizáveis
│   └── ui/                 # Componentes de UI
├── lib/                    # Utilitários e configurações
│   └── supabase/           # Clientes Supabase
├── store/                  # Estado global (Zustand)
└── types/                  # Tipos TypeScript
```

## Configuração

### Pré-requisitos

- Node.js 18+ ou superior
- pnpm (gerenciador de pacotes)
- Conta no Supabase
- Conta na Vercel (para deploy)

### Variáveis de Ambiente

⚠️ **IMPORTANTE**: O sistema utiliza validação centralizada de variáveis de ambiente. Todas as variáveis obrigatórias devem estar configuradas antes de iniciar a aplicação.

#### Passo 1: Copiar o arquivo de exemplo

```bash
cp .env.example .env.local
```

#### Passo 2: Configurar as variáveis obrigatórias

Edite o arquivo `.env.local` e preencha os valores:

```env
# Supabase - Configurações públicas (podem ser expostas ao navegador)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase - Service Role Key (APENAS SERVER-SIDE)
# ⚠️ NUNCA exponha esta chave ao navegador
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Super Admins (lista separada por vírgulas)
SUPER_ADMIN_EMAILS=admin@example.com,outro@example.com

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Onde encontrar as credenciais do Supabase:

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** > **API**
3. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Instalação

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start

# Lint do código
pnpm lint
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

## Banco de Dados

O sistema utiliza Supabase com as seguintes tabelas principais:

- `tenants` - Gabinetes parlamentares (multi-tenant)
- `users` - Usuários do sistema
- `cidadaos` - Cidadãos cadastrados
- `providencias` - Providências/solicitações
- `categorias` - Categorias de providências
- `orgaos` - Órgãos destinatários
- `historico_providencias` - Histórico de alterações
- `anexos` - Arquivos anexados
- `notificacoes` - Notificações do sistema
- `dashboard_stats` - Estatísticas do dashboard

## Segurança

O ProviDATA implementa múltiplas camadas de segurança para proteger os dados dos gabinetes:

### 🔐 Autenticação e Autorização

- **Supabase Auth**: Sistema robusto de autenticação com JWT
- **Row Level Security (RLS)**: Habilitado em todas as tabelas do banco
- **Multi-tenant**: Isolamento completo de dados por gabinete
- **Roles**: Sistema de permissões (super_admin, admin, gestor, assessor)

### 🛡️ Proteção de Dados

- **Validação de Inputs**: Todos os inputs são validados e sanitizados
- **Limitação de Campos**: Tamanho máximo definido para prevenir ataques
- **SQL Injection**: Proteção via Supabase prepared statements
- **XSS Protection**: Sanitização de HTML e scripts maliciosos

### 🔑 Gerenciamento de Chaves

#### ✅ Chaves Públicas (Seguras para o navegador)
- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima (protegida por RLS)

#### ⚠️ Chaves Privadas (APENAS server-side)
- `SUPABASE_SERVICE_ROLE_KEY`: **NUNCA** exponha ao navegador
  - Bypassa RLS
  - Acesso total ao banco de dados
  - Usada apenas em API Routes e Server Components
  - Sistema valida automaticamente se está sendo usada no servidor

### 🚨 Boas Práticas de Segurança

1. **Variáveis de Ambiente**:
   - Use `.env.local` para desenvolvimento
   - Configure variáveis de ambiente na Vercel para produção
   - Nunca commite arquivos `.env*` no Git

2. **Service Role Key**:
   - Use apenas em código server-side
   - Arquivo `src/lib/env.ts` valida o contexto de uso
   - Adicione comentários de segurança onde é usada

3. **Super Admins**:
   - Configure via `SUPER_ADMIN_EMAILS`
   - Separe múltiplos emails com vírgulas
   - Nunca hardcode emails no código

4. **Rate Limiting**:
   - Considere implementar para APIs públicas
   - Opções: Upstash, Vercel KV, Cloudflare

### 📋 Conformidade

- **LGPD**: Sistema projetado para conformidade com a Lei Geral de Proteção de Dados
- **Auditoria**: Histórico de alterações em tabelas críticas
- **Backup**: Supabase realiza backups automáticos diários

## Licença

Todos os direitos reservados © DATA-RO INTELIGÊNCIA TERRITORIAL
