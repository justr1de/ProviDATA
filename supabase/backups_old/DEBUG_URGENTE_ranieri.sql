-- ═══════════════════════════════════════════════════════════════
-- DEBUG URGENTE: Por que ranieri.braga@hotmail.com não tem acesso?
-- ═══════════════════════════════════════════════════════════════

\echo '═══════════════════════════════════════════════════════════════'
\echo '1. VERIFICAR SE USUÁRIO EXISTE NO AUTH.USERS'
\echo '═══════════════════════════════════════════════════════════════'

SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    CASE 
        WHEN id IS NOT NULL THEN '✅ Usuário existe'
        ELSE '❌ Usuário NÃO existe'
    END as status
FROM auth.users
WHERE email = 'ranieri.braga@hotmail.com';

\echo ''
\echo '═══════════════════════════════════════════════════════════════'
\echo '2. VERIFICAR PERFIL NO PUBLIC.PROFILES'
\echo '═══════════════════════════════════════════════════════════════'

SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.organization_id,
    o.slug as org_slug,
    p.onboarding_completed,
    p.metadata,
    CASE 
        WHEN p.id IS NOT NULL THEN '✅ Perfil existe'
        ELSE '❌ Perfil NÃO existe'
    END as status
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email = 'ranieri.braga@hotmail.com';

\echo ''
\echo '═══════════════════════════════════════════════════════════════'
\echo '3. VERIFICAR ORGANIZAÇÃO DATA-RO'
\echo '═══════════════════════════════════════════════════════════════'

SELECT 
    id,
    name,
    slug,
    type,
    settings,
    CASE 
        WHEN id = '00000000-0000-0000-0000-000000000001' THEN '✅ ID correto'
        ELSE '❌ ID incorreto'
    END as status
FROM public.organizations
WHERE id = '00000000-0000-0000-0000-000000000001'
   OR slug = 'dataro-admin';

\echo ''
\echo '═══════════════════════════════════════════════════════════════'
\echo '4. SIMULAÇÃO DO MIDDLEWARE (O QUE ELE VÊ)'
\echo '═══════════════════════════════════════════════════════════════'

SELECT 
    p.email,
    p.role,
    p.role = 'admin' as "role_é_admin?",
    p.organization_id,
    p.organization_id::text as "org_id_como_texto",
    '00000000-0000-0000-0000-000000000001'::uuid as "org_id_esperado",
    p.organization_id = '00000000-0000-0000-0000-000000000001'::uuid as "org_id_correto?",
    (p.role = 'admin' AND p.organization_id = '00000000-0000-0000-0000-000000000001'::uuid) as "middleware_aprovaria?",
    CASE 
        WHEN p.role = 'admin' AND p.organization_id = '00000000-0000-0000-0000-000000000001'::uuid 
        THEN '✅ MIDDLEWARE DEVE APROVAR'
        WHEN p.role != 'admin' 
        THEN '❌ PROBLEMA: role não é admin (é: ' || COALESCE(p.role, 'NULL') || ')'
        WHEN p.organization_id != '00000000-0000-0000-0000-000000000001'::uuid 
        THEN '❌ PROBLEMA: organization_id incorreto (é: ' || COALESCE(p.organization_id::text, 'NULL') || ')'
        ELSE '❌ PROBLEMA DESCONHECIDO'
    END as diagnostico
FROM public.profiles p
WHERE p.email = 'ranieri.braga@hotmail.com';

\echo ''
\echo '═══════════════════════════════════════════════════════════════'
\echo '5. COMPARAR COM OUTROS ADMINS (se existirem)'
\echo '═══════════════════════════════════════════════════════════════'

SELECT 
    p.email,
    p.role,
    p.organization_id,
    o.slug as org_slug,
    p.metadata->>'is_super_admin' as is_super_admin
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.role = 'admin'
ORDER BY p.created_at;

\echo ''
\echo '═══════════════════════════════════════════════════════════════'
\echo '6. VERIFICAR SE HÁ TRIGGER QUE PODE ESTAR INTERFERINDO'
\echo '═══════════════════════════════════════════════════════════════'

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles'
ORDER BY trigger_name;

\echo ''
\echo '═══════════════════════════════════════════════════════════════'
\echo '7. AÇÃO CORRETIVA - FORÇAR ATUALIZAÇÃO'
\echo '═══════════════════════════════════════════════════════════════'

-- Buscar o user_id primeiro
DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'ranieri.braga@hotmail.com';
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE '❌ ERRO CRÍTICO: Usuário % não existe no auth.users!', v_email;
        RAISE NOTICE '   AÇÃO: Crie o usuário no Supabase Dashboard primeiro!';
        RAISE NOTICE '   1. Authentication > Users > Add User';
        RAISE NOTICE '   2. Email: %', v_email;
        RAISE NOTICE '   3. Password: @Jujuba2103!';
        RAISE NOTICE '   4. Auto Confirm: YES';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Usuário encontrado: %', v_user_id;
    RAISE NOTICE '   Atualizando perfil...';
    
    -- Deletar perfil existente se houver problema
    DELETE FROM public.profiles WHERE id = v_user_id;
    
    -- Criar perfil do zero
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
    ) VALUES (
        v_user_id,
        v_email,
        'Ranieri Braga',
        'admin',
        '00000000-0000-0000-0000-000000000001'::uuid,
        true,
        jsonb_build_object(
            'is_super_admin', true,
            'can_manage_all_orgs', true,
            'force_created', true,
            'created_at', NOW()::text
        ),
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Perfil recriado com sucesso!';
    RAISE NOTICE '   Role: admin';
    RAISE NOTICE '   Organization ID: 00000000-0000-0000-0000-000000000001';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 PRÓXIMO PASSO:';
    RAISE NOTICE '   1. Feche TODAS as abas do navegador';
    RAISE NOTICE '   2. Abra uma nova aba privada';
    RAISE NOTICE '   3. Faça login novamente';
    RAISE NOTICE '   4. Tente acessar /admin/gabinetes';
END $$;

\echo ''
\echo '═══════════════════════════════════════════════════════════════'
\echo '8. VERIFICAÇÃO FINAL'
\echo '═══════════════════════════════════════════════════════════════'

SELECT 
    'VERIFICAÇÃO FINAL' as teste,
    p.email,
    p.role,
    p.organization_id::text as org_id,
    (p.role = 'admin' AND p.organization_id = '00000000-0000-0000-0000-000000000001'::uuid) as "deve_funcionar_agora?"
FROM public.profiles p
WHERE p.email = 'ranieri.braga@hotmail.com';
