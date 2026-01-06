# GitHub Actions Workflows

Este documento descreve os workflows automatizados configurados no projeto ProviDATA.

## 📋 Workflows Implementados

### 1. CI/CD Pipeline (`ci.yml`)

**Trigger**: Todos os pushs e pull requests em qualquer branch

**Propósito**: Garantir qualidade de código antes de merge

**Jobs**:
- **lint**: Executa ESLint para validar padrões de código
- **typecheck**: Valida tipos TypeScript com `tsc --noEmit`
- **build**: Testa build do Next.js para garantir que o projeto compila

**Tempo estimado**: ~3-5 minutos

### 2. Deploy to Vercel (`deploy.yml`)

**Trigger**: Push na branch `main` apenas

**Propósito**: Deploy automático em produção

**Jobs**:
- **deploy**: Realiza deploy usando Vercel CLI
- **Notificação**: Exibe mensagem de sucesso com URL

**Tempo estimado**: ~2-3 minutos

**Variáveis necessárias**:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### 3. Security Check (`security.yml`)

**Trigger**: 
- Push na branch `main`
- Pull requests para `main`
- Agendado: toda segunda-feira às 9h (cron: `0 9 * * 1`)

**Propósito**: Verificação contínua de segurança

**Jobs**:
- **dependency-check**: Auditoria de dependências npm/pnpm
  - Falha se encontrar vulnerabilidades de nível `high` ou superior
- **codeql**: Análise estática de código
  - Detecta vulnerabilidades de segurança em JavaScript/TypeScript
  - Integrado com GitHub Security

**Tempo estimado**: ~5-7 minutos

## 🔐 Secrets Necessários

Configure os seguintes secrets no GitHub (Settings → Secrets → Actions):

| Secret | Descrição | Onde Obter |
|--------|-----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase | Supabase Dashboard |
| `VERCEL_TOKEN` | Token de autenticação Vercel | Vercel Account Settings |
| `VERCEL_ORG_ID` | ID da organização Vercel | `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | ID do projeto Vercel | `.vercel/project.json` |

## 📊 Badges de Status

Adicione ao README.md:

```markdown
[![CI/CD Pipeline](https://github.com/justr1de/ProviDATA/actions/workflows/ci.yml/badge.svg)](https://github.com/justr1de/ProviDATA/actions/workflows/ci.yml)
[![Deploy to Vercel](https://github.com/justr1de/ProviDATA/actions/workflows/deploy.yml/badge.svg)](https://github.com/justr1de/ProviDATA/actions/workflows/deploy.yml)
[![Security Check](https://github.com/justr1de/ProviDATA/actions/workflows/security.yml/badge.svg)](https://github.com/justr1de/ProviDATA/actions/workflows/security.yml)
```

## 🚀 Fluxo de Trabalho

### Para Desenvolvimento
1. Crie uma branch feature: `git checkout -b feature/minha-feature`
2. Faça commits e push: `git push origin feature/minha-feature`
3. CI/CD Pipeline executará automaticamente (lint, typecheck, build)
4. Abra Pull Request para `main`
5. Aguarde aprovação dos checks
6. Merge para `main`
7. Deploy automático é acionado

### Para Hotfix
1. Branch diretamente de `main`: `git checkout -b hotfix/correcao`
2. CI valida a correção
3. PR para `main`
4. Merge → Deploy automático

## 🔍 Monitoramento

### Verificar Status dos Workflows
1. Acesse: `https://github.com/justr1de/ProviDATA/actions`
2. Selecione o workflow desejado
3. Visualize logs detalhados de cada job

### Alertas de Segurança
1. Acesse: `https://github.com/justr1de/ProviDATA/security`
2. Verifique "Code scanning alerts" e "Dependabot alerts"
3. CodeQL alertas aparecem automaticamente em PRs

## 🛠️ Manutenção

### Atualizar Versões
- **pnpm**: Editar `version` em `pnpm/action-setup@v3`
- **Node.js**: Editar `node-version` em `actions/setup-node@v4`
- **Actions**: Atualizar versões das actions (v4, v3, etc.)

### Adicionar Novos Checks
1. Edite `.github/workflows/ci.yml`
2. Adicione novo job seguindo o padrão existente
3. Teste em branch feature antes de merge

### Desabilitar Workflow
1. Acesse GitHub Actions
2. Selecione o workflow
3. Clique em "..." → "Disable workflow"

## ✅ Benefícios

- ✅ **Qualidade**: Código validado automaticamente antes de merge
- ✅ **Segurança**: Verificações contínuas de vulnerabilidades
- ✅ **Velocidade**: Deploy automático em produção
- ✅ **Confiabilidade**: Testes executados em ambiente limpo
- ✅ **Rastreabilidade**: Histórico completo de builds e deploys
- ✅ **Feedback Rápido**: Desenvolvedores notificados imediatamente sobre erros

## 🐛 Troubleshooting

### CI Pipeline falha no lint
```bash
# Executar localmente
pnpm lint
# Corrigir erros e commit
```

### Build falha por falta de variáveis de ambiente
- Verificar se secrets estão configurados no GitHub
- Variáveis `NEXT_PUBLIC_*` devem estar em secrets

### Deploy falha
- Verificar tokens Vercel
- Executar localmente: `pnpm build` para testar

### Security check com vulnerabilidades
```bash
# Verificar localmente
pnpm audit
# Atualizar dependências
pnpm update
# Ou corrigir manualmente no package.json
```

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [pnpm Actions](https://github.com/pnpm/action-setup)
