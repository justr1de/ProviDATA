-- ═══════════════════════════════════════════════════════════════
-- SCRIPT COMPLETO: Configurar ranieri.braga@hotmail.com como Super Admin
-- ═══════════════════════════════════════════════════════════════

-- =====================================================
-- PARTE 1: GARANTIR ORGANIZAÇÃO DATA-RO
-- =====================================================
INSERT INTO public.organizations (id, name, slug, type, settings)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'DATA-RO - Administração Geral',
    'dataro-admin',
    'federal',
    jsonb_build_object(
        'is_super_admin_org', true,
        'can_manage_all_orgs', true,
        'description', 'Organização principal para gestão de todos os gabinetes'
    )
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    settings = EXCLUDED.settings;

-- =====================================================
-- PARTE 2: ATUALIZAR/CRIAR PERFIL COMO SUPER ADMIN
-- =====================================================
DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'ranieri.braga@hotmail.com';
    v_org_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário % não encontrado! Crie primeiro no Supabase Dashboard.', v_email;
    END IF;

    -- Criar ou atualizar perfil
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        organization_id,
        onboarding_completed,
        metadata,
        created_at,
        updated_at
    )
    VALUES (
        v_user_id,
        v_email,
        'Ranieri Braga',
        'admin',
        v_org_id,
        true,
        jsonb_build_object(
            'is_super_admin', true,
            'can_manage_all_orgs', true,
            'created_by', 'setup_script'
        ),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        organization_id = v_org_id,
        full_name = 'Ranieri Braga',
        onboarding_completed = true,
        metadata = jsonb_build_object(
            'is_super_admin', true,
            'can_manage_all_orgs', true,
            'updated_by', 'setup_script',
            'updated_at', NOW()::text
        ),
        updated_at = NOW();

    RAISE NOTICE '✅ Perfil configurado com sucesso para: %', v_email;
    RAISE NOTICE '   User ID: %', v_user_id;
    RAISE NOTICE '   Organization: DATA-RO (dataro-admin)';
    RAISE NOTICE '   Role: admin';
END $$;

-- =====================================================
-- PARTE 3: VERIFICAÇÃO COMPLETA
-- =====================================================
\echo '\n═══════════════════════════════════════════════════════════════'
\echo 'VERIFICAÇÃO DO PERFIL'
\echo '═══════════════════════════════════════════════════════════════\n'

SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    p.role,
    o.slug as organization_slug,
    p.organization_id,
    p.onboarding_completed,
    p.metadata->>'is_super_admin' as is_super_admin,
    p.metadata->>'can_manage_all_orgs' as can_manage_all_orgs,
    CASE 
        WHEN p.role = 'admin' 
         AND p.organization_id = '00000000-0000-0000-0000-000000000001'
         AND p.metadata->>'is_super_admin' = 'true'
        THEN '✅ SUPER ADMIN CONFIGURADO CORRETAMENTE'
        ELSE '❌ CONFIGURAÇÃO INCORRETA - Execute este script novamente'
    END as status
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email = 'ranieri.braga@hotmail.com';

-- =====================================================
-- PARTE 4: TESTE DE PERMISSÕES
-- =====================================================
\echo '\n═══════════════════════════════════════════════════════════════'
\echo 'TESTE DE PERMISSÕES RLS'
\echo '═══════════════════════════════════════════════════════════════\n'

-- Simular verificação do middleware
SELECT 
    'Verificação Middleware' as teste,
    p.role = 'admin' as check_role_admin,
    p.organization_id = '00000000-0000-0000-0000-000000000001' as check_org_dataro,
    (p.role = 'admin' AND p.organization_id = '00000000-0000-0000-0000-000000000001') as middleware_aprovaria
FROM public.profiles p
WHERE p.email = 'ranieri.braga@hotmail.com';

-- ═══════════════════════════════════════════════════════════════
-- INSTRUÇÕES FINAIS
-- ═══════════════════════════════════════════════════════════════

\echo '\n═══════════════════════════════════════════════════════════════'
\echo '📋 PRÓXIMOS PASSOS'
\echo '═══════════════════════════════════════════════════════════════\n'
\echo '1. LIMPAR CACHE DO NAVEGADOR:'
\echo '   - Pressione F12 para abrir DevTools'
\echo '   - Vá em Application > Storage'
\echo '   - Clique em "Clear site data"'
\echo '   - OU use uma aba anônima/privada'
\echo ''
\echo '2. FAZER LOGIN:'
\echo '   - Acesse: http://127.0.0.1:3000/login'
\echo '   - Email: ranieri.braga@hotmail.com'
\echo '   - Senha: @Jujuba2103!'
\echo ''
\echo '3. APÓS LOGIN (será redirecionado para /dashboard):'
\echo '   - Acesse MANUALMENTE: http://127.0.0.1:3000/admin/gabinetes'
\echo '   - Você DEVE ter acesso agora'
\echo ''
\echo '4. COMPORTAMENTO ESPERADO:'
\echo '   ✅ Login funciona'
\echo '   ✅ Redireciona para /dashboard (normal)'
\echo '   ✅ Pode acessar /admin/gabinetes manualmente'
\echo '   ✅ Vê todos os gabinetes do sistema'
\echo ''
\echo '═══════════════════════════════════════════════════════════════'
\echo '⚠️  IMPORTANTE'
\echo '═══════════════════════════════════════════════════════════════'
\echo ''
\echo 'O middleware NÃO redireciona automaticamente para /admin após login.'
\echo 'Isso é intencional. Super admins:'
\echo '  • Fazem login normalmente'
\echo '  • São redirecionados para /dashboard'
\echo '  • Mas TÊM ACESSO às rotas /admin quando acessam manualmente'
\echo ''
\echo 'Para mudar isso e redirecionar automaticamente para /admin,'
\echo 'seria necessário modificar o arquivo src/middleware.ts'
\echo ''
\echo '═══════════════════════════════════════════════════════════════\n'
