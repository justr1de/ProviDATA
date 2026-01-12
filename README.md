# ProviDATA

[![CI/CD Pipeline](https://github.com/justr1de/ProviDATA/actions/workflows/ci.yml/badge.svg)](https://github.com/justr1de/ProviDATA/actions/workflows/ci.yml)
[![Deploy to Vercel](https://github.com/justr1de/ProviDATA/actions/workflows/deploy.yml/badge.svg)](https://github.com/justr1de/ProviDATA/actions/workflows/deploy.yml)
[![Security Check](https://github.com/justr1de/ProviDATA/actions/workflows/security.yml/badge.svg)](https://github.com/justr1de/ProviDATA/actions/workflows/security.yml)

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

### Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Instalação

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Build para produção
pnpm build
```

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

- Row Level Security (RLS) habilitado em todas as tabelas
- Isolamento de dados por tenant
- Autenticação via Supabase Auth
- Conformidade com LGPD

## CI/CD e Workflows

O projeto utiliza GitHub Actions para automatizar processos de CI/CD, deploy e verificações de segurança:

### 🔄 CI/CD Pipeline (`ci.yml`)

Executa em todos os pushs e pull requests:

- **Lint**: Validação de código com ESLint
- **Type Check**: Verificação de tipos TypeScript
- **Build**: Build do Next.js para garantir que o código compila

### 🚀 Deploy Automático (`deploy.yml`)

Executa apenas em pushs na branch `main`:

- Deploy automático para Vercel em produção
- Notificação de sucesso no deploy

### 🔒 Verificações de Segurança (`security.yml`)

Executa em pushs na `main`, pull requests e semanalmente às segundas-feiras:

- **Dependency Check**: Auditoria de dependências com `pnpm audit`
- **CodeQL**: Análise de código para identificar vulnerabilidades de segurança

### Secrets Necessários

Os seguintes secrets devem estar configurados no repositório:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Licença

Todos os direitos reservados © DATA-RO INTELIGÊNCIA TERRITORIAL
