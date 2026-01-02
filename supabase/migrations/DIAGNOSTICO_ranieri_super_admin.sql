-- =====================================================
-- DIAGNÓSTICO COMPLETO: ranieri.braga@hotmail.com
-- =====================================================

-- 1. VERIFICAR SE O USUÁRIO EXISTE NO AUTH
SELECT 
    '1. USUÁRIO NO AUTH.USERS' as verificacao,
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'ranieri.braga@hotmail.com';

-- 2. VERIFICAR PERFIL COMPLETO
SELECT 
    '2. PERFIL NO PUBLIC.PROFILES' as verificacao,
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.organization_id,
    o.name as organization_name,
    o.slug as organization_slug,
    p.onboarding_completed,
    p.metadata,
    p.created_at,
    p.updated_at
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email = 'ranieri.braga@hotmail.com';

-- 3. VERIFICAR ORGANIZAÇÃO DATA-RO
SELECT 
    '3. ORGANIZAÇÃO DATA-RO' as verificacao,
    id,
    name,
    slug,
    type,
    settings
FROM public.organizations
WHERE id = '00000000-0000-0000-0000-000000000001'
   OR slug = 'dataro-admin';

-- 4. VERIFICAR SE É SUPER ADMIN (DETALHADO)
SELECT 
    '4. VERIFICAÇÃO DE SUPER ADMIN' as verificacao,
    p.email,
    p.role = 'admin' as is_admin_role,
    p.organization_id = '00000000-0000-0000-0000-000000000001' as is_dataro_org,
    p.metadata->>'is_super_admin' as metadata_is_super_admin,
    p.metadata->>'can_manage_all_orgs' as metadata_can_manage_all_orgs,
    p.onboarding_completed,
    CASE 
        WHEN p.role = 'admin' 
         AND p.organization_id = '00000000-0000-0000-0000-000000000001'
         AND p.metadata->>'is_super_admin' = 'true'
        THEN '✅ É SUPER ADMIN'
        ELSE '❌ NÃO É SUPER ADMIN'
    END as status_super_admin
FROM public.profiles p
WHERE p.email = 'ranieri.braga@hotmail.com';

-- 5. COMPARAR COM OUTRO SUPER ADMIN (se existir)
SELECT 
    '5. COMPARAÇÃO COM OUTROS ADMINS' as verificacao,
    p.email,
    p.role,
    p.organization_id,
    o.slug as org_slug,
    p.metadata->>'is_super_admin' as is_super_admin,
    p.onboarding_completed
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.role = 'admin'
ORDER BY p.created_at;

-- 6. VERIFICAR POLÍTICAS RLS PARA SUPER ADMIN
SELECT 
    '6. POLÍTICAS RLS ATIVAS' as verificacao,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('organizations', 'profiles', 'invites')
  AND policyname ILIKE '%super%admin%'
ORDER BY tablename, policyname;

-- =====================================================
-- ANÁLISE E RECOMENDAÇÕES
-- =====================================================

DO $$
DECLARE
    v_user_exists BOOLEAN;
    v_profile_exists BOOLEAN;
    v_is_admin BOOLEAN;
    v_correct_org BOOLEAN;
    v_has_metadata BOOLEAN;
    v_email TEXT := 'ranieri.braga@hotmail.com';
BEGIN
    -- Verificar usuário
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = v_email) INTO v_user_exists;
    
    -- Verificar perfil
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE email = v_email) INTO v_profile_exists;
    
    -- Verificar role admin
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE email = v_email AND role = 'admin'
    ) INTO v_is_admin;
    
    -- Verificar organização correta
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE email = v_email 
        AND organization_id = '00000000-0000-0000-0000-000000000001'
    ) INTO v_correct_org;
    
    -- Verificar metadata
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE email = v_email 
        AND metadata->>'is_super_admin' = 'true'
    ) INTO v_has_metadata;
    
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'DIAGNÓSTICO: %', v_email;
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'Usuário existe no auth.users: %', v_user_exists;
    RAISE NOTICE 'Perfil existe no profiles: %', v_profile_exists;
    RAISE NOTICE 'Role é admin: %', v_is_admin;
    RAISE NOTICE 'Organização é DATA-RO: %', v_correct_org;
    RAISE NOTICE 'Metadata is_super_admin: %', v_has_metadata;
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    
    IF NOT v_user_exists THEN
        RAISE NOTICE '❌ PROBLEMA: Usuário não existe no auth.users';
        RAISE NOTICE '   SOLUÇÃO: Crie o usuário no Supabase Dashboard';
    END IF;
    
    IF NOT v_profile_exists THEN
        RAISE NOTICE '❌ PROBLEMA: Perfil não existe';
        RAISE NOTICE '   SOLUÇÃO: Execute o script 20260101_criar_super_admin_ranieri.sql';
    END IF;
    
    IF v_profile_exists AND NOT v_is_admin THEN
        RAISE NOTICE '❌ PROBLEMA: Role não é admin';
        RAISE NOTICE '   SOLUÇÃO: Execute UPDATE abaixo';
    END IF;
    
    IF v_profile_exists AND NOT v_correct_org THEN
        RAISE NOTICE '❌ PROBLEMA: Organização incorreta';
        RAISE NOTICE '   SOLUÇÃO: Execute UPDATE abaixo';
    END IF;
    
    IF v_profile_exists AND NOT v_has_metadata THEN
        RAISE NOTICE '❌ PROBLEMA: Metadata is_super_admin não configurada';
        RAISE NOTICE '   SOLUÇÃO: Execute UPDATE abaixo';
    END IF;
    
    IF v_user_exists AND v_profile_exists AND v_is_admin AND v_correct_org AND v_has_metadata THEN
        RAISE NOTICE '✅ TUDO CORRETO! O usuário está configurado como super admin';
        RAISE NOTICE '   Se ainda não funciona, o problema pode estar no middleware.ts';
    END IF;
    
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
