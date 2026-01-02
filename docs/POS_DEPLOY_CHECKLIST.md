# ✅ Checklist Pós-Deploy - ProviDATA

## 🎯 Ações Obrigatórias Após Deploy

### 1. Configurar Supabase Authentication

**Local**: Supabase Dashboard → Authentication → URL Configuration

✅ **Site URL**
```
https://seu-app.vercel.app
```

✅ **Redirect URLs** (adicione todas):
```
https://seu-app.vercel.app/**
https://seu-app.vercel.app/auth/callback
https://seu-app.vercel.app/login
https://seu-app.vercel.app/dashboard
https://seu-app.vercel.app/admin
```

✅ **Additional Redirect URLs** (se usar domínio customizado):
```
https://seu-dominio.com.br/**
https://seu-dominio.com.br/auth/callback
```

### 2. Testar Autenticação

- [ ] Acesse a URL de produção
- [ ] Tente fazer login com usuário existente
- [ ] Verifique se o redirect após login funciona
- [ ] Teste logout
- [ ] Teste reset de senha (se aplicável)

### 3. Verificar Variáveis de Ambiente

No Dashboard da Vercel:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` está correta
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correta
- [ ] `SUPABASE_ACCESS_TOKEN` está correta (se usar)
- [ ] Variáveis estão nos ambientes corretos (Production/Preview)

### 4. Testar Funcionalidades Principais

#### Como Super Admin
- [ ] Acesso à página `/admin`
- [ ] Listar gabinetes
- [ ] Criar novo gabinete
- [ ] Gerenciar convites
- [ ] Alternar status de gabinetes

#### Como Usuário de Gabinete
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Criar providência
- [ ] Ver cidadãos
- [ ] Acessar relatórios

### 5. Verificar RLS (Row Level Security)

Execute no Supabase SQL Editor:

```sql
-- Verificar se RLS está ativo em todas as tabelas principais
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'tenants',
        'profiles',
        'users_roles',
        'cidadaos',
        'providencias'
    )
ORDER BY tablename;
```

**Resultado esperado**: `rowsecurity = true` para todas

### 6. Monitoramento Inicial

#### Na Vercel
- [ ] Acesse **Analytics** e verifique se está coletando dados
- [ ] Configure alertas em **Settings** → **Notifications**
- [ ] Revise logs em **Deployments** → último deploy → **Functions**

#### No Supabase
- [ ] Verifique **Database** → **Logs** para erros
- [ ] Monitore uso em **Settings** → **Usage**
- [ ] Revise queries lentas em **Database** → **Query Performance**

### 7. Performance e SEO

- [ ] Teste velocidade: [PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] Verifique Core Web Vitals
- [ ] Teste responsividade em mobile
- [ ] Verifique meta tags (título, descrição)

### 8. Segurança

- [ ] HTTPS está ativo (Vercel faz automaticamente)
- [ ] Headers de segurança configurados
- [ ] RLS policies testadas
- [ ] Não há dados sensíveis expostos no client-side
- [ ] API keys não estão expostas no código

### 9. Backup e Recuperação

- [ ] Configure backups automáticos no Supabase
- [ ] Documente processo de rollback
- [ ] Teste restore de backup (em ambiente de staging)
- [ ] Mantenha migrations versionadas no Git

### 10. Documentação

- [ ] Documente URL de produção
- [ ] Atualize README com URL de produção
- [ ] Documente variáveis de ambiente usadas
- [ ] Registre versão deployada
- [ ] Compartilhe acesso com equipe

## 🔄 Manutenção Contínua

### Semanal
- Revisar logs de erro
- Verificar performance
- Monitorar uso de recursos

### Mensal
- Atualizar dependências
- Revisar políticas de segurança
- Backup manual adicional
- Revisar analytics

### Trimestral
- Auditoria de segurança completa
- Otimização de performance
- Revisão de custos
- Planejamento de melhorias

## 📊 Métricas para Acompanhar

### Performance
- Tempo de carregamento da página inicial
- Time to Interactive (TTI)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)

### Uso
- Número de usuários ativos
- Taxa de conversão de login
- Páginas mais acessadas
- Tempo médio de sessão

### Técnicas
- Taxa de erro
- Uptime
- Latência de API
- Uso de banco de dados

## 🆘 Problemas Comuns Pós-Deploy

### Usuários não conseguem fazer login

**Causa**: URL não configurada no Supabase  
**Solução**: Adicione a URL em Authentication → URL Configuration

### Página retorna 404

**Causa**: Roteamento incorreto ou build com erro  
**Solução**: Verifique estrutura de pastas e faça rebuild

### Erro de CORS

**Causa**: Supabase não reconhece a origem  
**Solução**: Adicione URL nas redirect URLs

### Dados não aparecem

**Causa**: RLS bloqueando acesso  
**Solução**: Revise policies de RLS para a tabela

### Performance lenta

**Causa**: Queries não otimizadas  
**Solução**: Adicione índices, otimize queries

## 📞 Contatos Úteis

- **Suporte Vercel**: https://vercel.com/support
- **Suporte Supabase**: https://supabase.com/support
- **Documentação**: Ver [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md)

## ✨ Próximos Passos Recomendados

1. **Domínio Customizado**: Configure `providata.com.br`
2. **SSL Customizado**: (Vercel já fornece SSL gratuito)
3. **CDN**: (Vercel já fornece CDN global)
4. **Monitoring**: Configure Sentry ou similar
5. **Backups**: Configure rotina automática
6. **CI/CD**: Configure testes automáticos em PRs
7. **Staging**: Crie ambiente de staging separado

---

**Data do Deploy**: _________________  
**Versão Deployada**: _________________  
**URL de Produção**: _________________  
**Responsável**: _________________  

**Status**: 
- [ ] Deploy concluído
- [ ] Testes básicos OK
- [ ] Configurações aplicadas
- [ ] Equipe notificada
- [ ] Documentação atualizada

---

**Última atualização**: 02/01/2026
