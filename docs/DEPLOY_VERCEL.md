# 🚀 Guia de Deploy na Vercel - ProviDATA

Este guia detalha o processo completo para fazer deploy da aplicação ProviDATA na Vercel.

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Conta no [GitHub](https://github.com) (se usar integração Git)
- Projeto Supabase configurado e em produção
- Node.js 20+ instalado localmente (para testes)

## 🔧 Configuração do Projeto

### 1. Preparação do Repositório

Certifique-se de que todos os arquivos estão commitados:

```bash
git add .
git commit -m "Preparar para deploy na Vercel"
git push origin main
```

### 2. Variáveis de Ambiente

As seguintes variáveis de ambiente são necessárias:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_ACCESS_TOKEN=seu_access_token
```

⚠️ **Importante**: Nunca commite o arquivo `.env.local` no Git!

## 🌐 Deploy via Dashboard da Vercel

### Passo 1: Importar Projeto

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New..."** → **"Project"**
3. Selecione seu repositório GitHub
4. Ou use **"Import Git Repository"** e cole a URL do seu repo

### Passo 2: Configurar o Projeto

**Framework Preset**: Next.js (detectado automaticamente)

**Build Configuration**:
- Build Command: `npm run build` (padrão)
- Output Directory: `.next` (padrão)
- Install Command: `npm install` (padrão)

**Root Directory**: `.` (raiz do projeto)

### Passo 3: Adicionar Variáveis de Ambiente

Na seção **"Environment Variables"**:

1. Adicione cada variável:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Sua URL do Supabase
   - Environment: Production, Preview, Development

2. Repita para:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_ACCESS_TOKEN`

### Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (normalmente 1-3 minutos)
3. Após conclusão, acesse a URL fornecida

## 🖥️ Deploy via CLI da Vercel

### Instalação da CLI

```bash
npm install -g vercel
```

### Login

```bash
vercel login
```

### Deploy

**Deploy de Preview (staging)**:
```bash
vercel
```

**Deploy de Produção**:
```bash
vercel --prod
```

### Adicionar Variáveis de Ambiente via CLI

```bash
# Produção
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_ACCESS_TOKEN production

# Preview
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_ACCESS_TOKEN preview

# Development
vercel env add NEXT_PUBLIC_SUPABASE_URL development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
vercel env add SUPABASE_ACCESS_TOKEN development
```

## 🔐 Configuração do Supabase

### 1. Adicionar URL da Vercel

No Supabase Dashboard:

1. Vá em **Settings** → **API**
2. Em **Site URL**, adicione: `https://seu-projeto.vercel.app`
3. Em **Redirect URLs**, adicione:
   ```
   https://seu-projeto.vercel.app/**
   https://seu-projeto.vercel.app/auth/callback
   ```

### 2. Configurar CORS

Se necessário, adicione a URL da Vercel nas configurações de CORS do Supabase.

## 🌍 Domínio Customizado

### Adicionar Domínio na Vercel

1. No projeto, vá em **Settings** → **Domains**
2. Clique em **"Add"**
3. Digite seu domínio (ex: `providata.com.br`)
4. Configure os DNS conforme instruções

### Configurações DNS

Adicione os registros no seu provedor de DNS:

**Para domínio raiz** (`providata.com.br`):
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**Para subdomínio** (`www.providata.com.br`):
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

## 📊 Monitoramento e Logs

### Acessar Logs

1. No Dashboard da Vercel, vá no projeto
2. Clique em **"Deployments"**
3. Selecione um deployment
4. Clique em **"Functions"** para ver logs

### Analytics

- Ative o **Vercel Analytics** em Settings → Analytics
- Monitore performance e Core Web Vitals

## 🔄 CI/CD Automático

A Vercel configura automaticamente CI/CD:

- **Push no `main`**: Deploy de produção
- **Pull Requests**: Deploy de preview
- **Outros branches**: Deploy de preview

### Configurar Branches Protegidos

No GitHub:
1. Settings → Branches
2. Adicione rule para `main`
3. Require status checks (Vercel)

## ⚡ Otimizações

### 1. Configurações de Performance

No [`next.config.ts`](../next.config.ts:1), adicione:

```typescript
const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['wntiupkhjtgiaxiicxeq.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### 2. Cache de Build

A Vercel faz cache automático, mas você pode otimizar:

```json
// vercel.json
{
  "github": {
    "silent": true
  },
  "regions": ["gru1"]
}
```

### 3. Variáveis de Ambiente por Branch

Configure variáveis diferentes para cada ambiente no Dashboard da Vercel.

## 🐛 Troubleshooting

### Build Falha

**Problema**: Erro durante build
**Solução**: 
```bash
# Teste localmente
npm run build

# Verifique logs na Vercel
# Corrija erros de TypeScript/ESLint
```

### Variáveis de Ambiente Não Funcionam

**Problema**: App não conecta ao Supabase
**Solução**:
1. Verifique se as variáveis estão corretas
2. Use prefixo `NEXT_PUBLIC_` para variáveis client-side
3. Redeploy após adicionar variáveis

### Erro 404 em Rotas

**Problema**: Rotas retornam 404
**Solução**:
1. Verifique estrutura de pastas em `src/app`
2. Certifique-se que [`middleware.ts`](../src/middleware.ts:1) está correto
3. Confira configurações de rewrite/redirect

### Problemas de CORS

**Problema**: Erro de CORS ao acessar Supabase
**Solução**:
1. Adicione URL da Vercel no Supabase
2. Verifique configurações de API

## 📚 Recursos

- [Documentação Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase + Vercel](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## ✅ Checklist de Deploy

- [ ] Código commitado e pushed para GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Build local executado com sucesso
- [ ] Projeto importado na Vercel
- [ ] Deploy executado com sucesso
- [ ] URL da Vercel adicionada ao Supabase
- [ ] Testes de autenticação funcionando
- [ ] Domínio customizado configurado (opcional)
- [ ] Analytics ativado
- [ ] Monitoramento configurado

## 🎉 Próximos Passos

Após deploy bem-sucedido:

1. Configure alertas de erro (Vercel Integrations)
2. Ative Speed Insights
3. Configure backups automáticos
4. Documente URL de produção
5. Comunique equipe sobre novo ambiente

---

**Última atualização**: 02/01/2026
**Autor**: Equipe ProviDATA
