# Guia de Setup - ProviDATA

Este guia contém instruções detalhadas para configurar o ambiente de desenvolvimento do ProviDATA.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Supabase](#configuração-do-supabase)
3. [Configuração das Variáveis de Ambiente](#configuração-das-variáveis-de-ambiente)
4. [Instalação e Execução](#instalação-e-execução)
5. [Configurações de Segurança](#configurações-de-segurança)
6. [Deploy em Produção](#deploy-em-produção)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 20+** ([Download](https://nodejs.org/))
- **npm** ou **pnpm** (recomendado)
- **Git** ([Download](https://git-scm.com/))
- Conta no **Supabase** ([Criar conta](https://supabase.com))
- Conta no **Vercel** (apenas para deploy) ([Criar conta](https://vercel.com))

### Verificar Instalações

```bash
node --version  # deve retornar v20.x ou superior
npm --version   # ou pnpm --version
git --version
```

---

## 🗄️ Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em "New Project"
3. Preencha:
   - **Nome**: ProviDATA (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte e guarde-a
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
4. Aguarde a criação do projeto (pode levar alguns minutos)

### 2. Obter Credenciais

Após criar o projeto:

1. Acesse **Settings** → **API**
2. Você verá três informações importantes:

   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public: eyJhbGc...  (chave pública)
   service_role: eyJhbGc...  (chave secreta)
   ```

3. **Copie estas credenciais** - você precisará delas para configurar as variáveis de ambiente

### 3. Executar Migrations do Banco de Dados

O schema do banco está em `supabase/migrations/`. Para aplicar:

1. Instale a CLI do Supabase:
   ```bash
   npm install -g supabase
   ```

2. Link com seu projeto:
   ```bash
   supabase link --project-ref seu-project-id
   ```

3. Execute as migrations:
   ```bash
   supabase db push
   ```

Ou execute os scripts SQL manualmente no **SQL Editor** do Supabase.

---

## 🔐 Configuração das Variáveis de Ambiente

### 1. Copiar Arquivo de Exemplo

Na raiz do projeto:

```bash
cp .env.example .env.local
```

### 2. Preencher Variáveis Obrigatórias

Edite o arquivo `.env.local`:

```env
# ========================================
# SUPABASE (Obrigatório)
# ========================================

# Project URL do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Anon Key (chave pública) - segura para uso no frontend
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Service Role Key - CRÍTICO: NUNCA exponha no frontend
# Esta chave tem permissões administrativas totais
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# ========================================
# SUPER ADMIN (Obrigatório)
# ========================================

# Lista de emails de super administradores
# Separados por vírgula, sem espaços
SUPER_ADMIN_EMAILS=contato@dataro-it.com.br,seu-email@empresa.com

# ========================================
# APLICAÇÃO (Opcional)
# ========================================

# URL base da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Variáveis Opcionais

#### Rate Limiting com Upstash Redis

Para habilitar rate limiting nas APIs públicas:

1. Crie conta em [console.upstash.com](https://console.upstash.com)
2. Crie um novo Redis database
3. Copie as credenciais REST:

```env
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxx
```

---

## 🚀 Instalação e Execução

### 1. Clonar Repositório

```bash
git clone https://github.com/justr1de/ProviDATA.git
cd ProviDATA
```

### 2. Instalar Dependências

```bash
# Com npm
npm install

# Ou com pnpm (recomendado)
pnpm install
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
# ou
pnpm dev
```

O sistema estará disponível em [http://localhost:3000](http://localhost:3000)

### 4. Build para Produção

```bash
npm run build
npm start
# ou
pnpm build
pnpm start
```

---

## 🛡️ Configurações de Segurança

### Proteção da Service Role Key

⚠️ **CRÍTICO**: A `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser exposta:

- ✅ Apenas no `.env.local` (desenvolvimento)
- ✅ Apenas em variáveis de ambiente do servidor (produção)
- ❌ NUNCA no código fonte
- ❌ NUNCA em variáveis `NEXT_PUBLIC_*`
- ❌ NUNCA commitada no Git

### Configurar Super Admins

Super admins têm acesso total ao sistema. Para adicionar/remover:

1. Edite `SUPER_ADMIN_EMAILS` no `.env.local`
2. Separe múltiplos emails por vírgula:
   ```env
   SUPER_ADMIN_EMAILS=admin1@empresa.com,admin2@empresa.com
   ```
3. Reinicie o servidor

### Row Level Security (RLS)

O sistema usa RLS do Supabase para isolamento de dados:

- Cada tenant (gabinete) vê apenas seus próprios dados
- Super admins podem ver todos os dados
- Verificações são feitas no banco de dados, não apenas no frontend

### Validação de Dados

O sistema implementa validação em múltiplas camadas:

1. **Cliente** (UI): Validação com Zod e react-hook-form
2. **API**: Sanitização e validação de inputs
3. **Banco**: Constraints e triggers

---

## 🌐 Deploy em Produção

### Deploy no Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project" e importe o repositório
4. Configure as variáveis de ambiente:
   - Vá em **Settings** → **Environment Variables**
   - Adicione todas as variáveis do `.env.local`
   - **IMPORTANTE**: Nunca exponha a `SUPABASE_SERVICE_ROLE_KEY` publicamente

5. O Vercel fará o deploy automaticamente

### Variáveis de Ambiente no Vercel

Para cada variável:

1. **Name**: Nome da variável (ex: `SUPABASE_SERVICE_ROLE_KEY`)
2. **Value**: Valor da variável
3. **Environment**: Escolha `Production`, `Preview`, ou `Development`

⚠️ **Variáveis sensíveis devem ser marcadas como "Sensitive" no Vercel**

### Domínio Customizado

Após o deploy:

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções

---

## 🔍 Troubleshooting

### Erro: "Variável de ambiente não definida"

**Causa**: Falta configurar variável no `.env.local`

**Solução**:
1. Verifique se `.env.local` existe
2. Compare com `.env.example`
3. Reinicie o servidor de desenvolvimento

### Erro: "Failed to fetch from Supabase"

**Causa**: Credenciais Supabase incorretas ou projeto inativo

**Solução**:
1. Verifique `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Confirme que o projeto Supabase está ativo
3. Teste as credenciais no Supabase Dashboard

### Erro: "Access Denied" em operações admin

**Causa**: Email não está configurado como super admin

**Solução**:
1. Adicione seu email em `SUPER_ADMIN_EMAILS`
2. Reinicie o servidor
3. Faça logout e login novamente

### Build falha com erro TypeScript

**Causa**: Tipos desatualizados ou conflito de dependências

**Solução**:
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules .next
npm install
# ou
pnpm install
```

### Rate Limiting não funciona

**Causa**: Upstash Redis não configurado

**Solução**:
1. Rate limiting é **opcional**
2. Se não configurar Upstash, o sistema funciona normalmente sem rate limiting
3. Para habilitar, configure `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`

---

## 📚 Recursos Adicionais

- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Repositório do Projeto](https://github.com/justr1de/ProviDATA)

---

## 💬 Suporte

Para dúvidas ou problemas:

- Abra uma issue no GitHub
- Entre em contato: contato@dataro-it.com.br
- WhatsApp: (69) 99908-9202

---

**© 2024 DATA-RO INTELIGÊNCIA TERRITORIAL - Todos os direitos reservados**
