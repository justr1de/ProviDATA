# 🚀 Deploy Rápido - ProviDATA

## Opções de Deploy

### 1️⃣ Deploy Automático via Script (Recomendado)

```bash
npm run deploy
```

Ou:

```bash
./scripts/deploy-vercel.sh
```

### 2️⃣ Deploy Manual via CLI

**Preview:**
```bash
npm run deploy:preview
```

**Produção:**
```bash
npm run deploy:prod
```

### 3️⃣ Deploy via Dashboard da Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New..."** → **"Project"**
3. Importe seu repositório
4. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_ACCESS_TOKEN`
5. Clique em **"Deploy"**

## ⚙️ Variáveis de Ambiente Necessárias

Copie de `.env.local` ou use `.env.example` como referência:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_ACCESS_TOKEN=seu_access_token
```

## 📋 Checklist Pré-Deploy

- [ ] Código testado localmente (`npm run dev`)
- [ ] Build local executado com sucesso (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Mudanças commitadas no Git
- [ ] Push realizado para o repositório

## ⚡ Comandos Úteis

```bash
# Testar build localmente
npm run build

# Iniciar servidor de produção local
npm start

# Puxar variáveis de ambiente da Vercel
npm run vercel:env

# Deploy de preview (staging)
npm run deploy:preview

# Deploy de produção
npm run deploy:prod
```

## 🔧 Configuração Pós-Deploy

### No Supabase Dashboard

1. Vá em **Settings** → **API**
2. Adicione em **Site URL**: `https://seu-app.vercel.app`
3. Adicione em **Redirect URLs**: 
   ```
   https://seu-app.vercel.app/**
   https://seu-app.vercel.app/auth/callback
   ```

### No Dashboard da Vercel

1. Configure domínio customizado (opcional)
2. Ative Analytics
3. Configure notificações de deploy
4. Revise logs e métricas

## 📚 Documentação Completa

Consulte [`docs/DEPLOY_VERCEL.md`](docs/DEPLOY_VERCEL.md) para:
- Guia detalhado passo a passo
- Troubleshooting
- Otimizações avançadas
- Configuração de domínio customizado
- CI/CD e automações

## 🆘 Problemas Comuns

### Build Falha

```bash
# Teste localmente primeiro
npm run build

# Verifique erros de TypeScript/ESLint
npm run lint
```

### Variáveis de Ambiente Não Funcionam

- Certifique-se de usar prefixo `NEXT_PUBLIC_` para variáveis client-side
- Redeploy após adicionar/modificar variáveis
- Verifique se as variáveis estão no ambiente correto (Production/Preview/Development)

### Erro de CORS

- Adicione URL da Vercel no Supabase Dashboard
- Verifique configurações de redirect URLs

## 🎯 Primeira Vez Fazendo Deploy?

1. **Instale a Vercel CLI** (se ainda não tem):
   ```bash
   npm install -g vercel
   ```

2. **Faça login**:
   ```bash
   vercel login
   ```

3. **Execute o script automatizado**:
   ```bash
   npm run deploy
   ```

O script vai guiá-lo pelo processo completo!

## 📞 Suporte

- Documentação Vercel: https://vercel.com/docs
- Documentação Next.js: https://nextjs.org/docs/deployment
- Documentação Supabase: https://supabase.com/docs

---

**Última atualização**: 02/01/2026  
**Status**: ✅ Pronto para deploy
