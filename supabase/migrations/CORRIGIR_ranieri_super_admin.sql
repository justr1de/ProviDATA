-- =====================================================
-- CORREÇÃO FORÇADA: ranieri.braga@hotmail.com
-- Garantir que o perfil está 100% correto como super admin
-- =====================================================

-- PASSO 1: Forçar atualização do perfil
UPDATE public.profiles
SET 
    role = 'admin',
    organization_id = '00000000-0000-0000-0000-000000000001',
    full_name = 'Ranieri Braga',
    onboarding_completed = true,
    metadata = jsonb_build_object(
        'is_super_admin', true,
        'can_manage_all_orgs', true,
        'updated_at', NOW()::text,
        'updated_by', 'force_update_script'
    ),
    updated_at = NOW()
WHERE email = 'ranieri.braga@hotmail.com';

-- PASSO 2: Verificar resultado
SELECT 
    '✅ PERFIL ATUALIZADO' as status,
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.organization_id,
    o.name as organization_name,
    o.slug as organization_slug,
    p.onboarding_completed,
    p.metadata->>'is_super_admin' as is_super_admin,
    p.metadata->>'can_manage_all_orgs' as can_manage_all_orgs,
    CASE 
        WHEN p.role = 'admin' 
         AND p.organization_id = '00000000-0000-0000-0000-000000000001'
        THEN '✅ CONFIGURAÇÃO CORRETA'
        ELSE '❌ AINDA HÁ PROBLEMAS'
    END as validacao
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email = 'ranieri.braga@hotmail.com';

-- =====================================================
-- INSTRUÇÕES PÓS-EXECUÇÃO
-- =====================================================

/*
═══════════════════════════════════════════════════════════════
APÓS EXECUTAR ESTE SCRIPT:
═══════════════════════════════════════════════════════════════

1️⃣ LIMPAR SESSÃO DO NAVEGADOR:
   - Abra o DevTools (F12)
   - Vá em Application > Storage
   - Clique em "Clear site data"
   - OU simplesmente use uma aba anônima

2️⃣ FAZER LOGIN NOVAMENTE:
   - Acesse: /login
   - Email: ranieri.braga@hotmail.com
   - Senha: @Jujuba2103!

3️⃣ APÓS O LOGIN:
   - Você será redirecionado para /dashboard (NORMAL!)
   - Agora acesse MANUALMENTE: /admin/gabinetes
   - Você DEVE ter acesso agora

4️⃣ VERIFICAR ACESSO:
   - Tente acessar: http://127.0.0.1:3000/admin/gabinetes
   - Deve mostrar a lista de todos os gabinetes
   - Não deve redirecionar para /dashboard

═══════════════════════════════════════════════════════════════
POR QUE NÃO REDIRECIONA AUTOMATICAMENTE PARA /ADMIN?
═══════════════════════════════════════════════════════════════

O middleware atual (src/middleware.ts) faz o seguinte:

✅ Protege rotas /admin (só super admins podem acessar)
✅ Redireciona usuários autenticados de /login para /dashboard

❌ NÃO redireciona super admins automaticamente para /admin

Isso é INTENCIONAL no design atual. Super admins:
- Fazem login normalmente
- São redirecionados para /dashboard como qualquer usuário
- Mas TÊM ACESSO às rotas /admin quando acessam manualmente

Se quiser mudar isso, precisamos modificar o middleware.ts

═══════════════════════════════════════════════════════════════
TESTE RÁPIDO:
═══════════════════════════════════════════════════════════════

Execute no navegador após login:
window.location.href = '/admin/gabinetes'

Se funcionar = Perfil está correto! ✅
Se redirecionar para /dashboard = Perfil ainda tem problema ❌

═══════════════════════════════════════════════════════════════
*/
