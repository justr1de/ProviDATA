-- =====================================================
-- DIAGNÓSTICO: Verificar status da conta contato@dataro-it.com.br
-- =====================================================

-- 1. Verificar se o usuário existe no auth.users
SELECT 
    '1. USUÁRIO NO AUTH.USERS' as etapa,
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN id IS NOT NULL THEN '✓ Usuário existe'
        ELSE '✗ Usuário NÃO existe - precisa criar'
    END as status
FROM auth.users
WHERE email = 'contato@dataro-it.com.br';

-- 2. Verificar se o perfil existe
SELECT 
    '2. PERFIL NA TABELA PROFILES' as etapa,
    id,
    email,
    full_name,
    role,
    organization_id,
    onboarding_completed,
    metadata,
    CASE 
        WHEN role = 'admin' AND organization_id = '00000000-0000-0000-0000-000000000001' 
        THEN '✓ Configurado como Super Admin'
        WHEN role IS NOT NULL 
        THEN '⚠ Perfil existe mas NÃO é Super Admin'
        ELSE '✗ Perfil NÃO existe'
    END as status
FROM public.profiles
WHERE email = 'contato@dataro-it.com.br';

-- 3. Verificar se a organização Super Admin existe
SELECT 
    '3. ORGANIZAÇÃO SUPER ADMIN' as etapa,
    id,
    name,
    slug,
    type,
    settings,
    CASE 
        WHEN id = '00000000-0000-0000-0000-000000000001' 
        THEN '✓ Organização Super Admin existe'
        ELSE '✗ Organização com ID incorreto'
    END as status
FROM public.organizations
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 4. Verificar todas as organizações (para debug)
SELECT 
    '4. TODAS AS ORGANIZAÇÕES' as etapa,
    id,
    name,
    slug,
    type,
    created_at
FROM public.organizations
ORDER BY created_at DESC
LIMIT 5;

-- 5. Verificar se há outros usuários admin
SELECT 
    '5. OUTROS USUÁRIOS ADMIN' as etapa,
    p.id,
    p.email,
    p.role,
    p.organization_id,
    o.name as org_name
FROM public.profiles p
LEFT JOIN public.organizations o ON o.id = p.organization_id
WHERE p.role = 'admin'
ORDER BY p.created_at DESC
LIMIT 5;

-- 6. Resumo do diagnóstico
DO $$
DECLARE
    v_user_exists BOOLEAN;
    v_profile_exists BOOLEAN;
    v_is_super_admin BOOLEAN;
    v_org_exists BOOLEAN;
    v_user_id UUID;
    v_profile_role TEXT;
    v_profile_org_id UUID;
BEGIN
    -- Verificar usuário
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'contato@dataro-it.com.br')
    INTO v_user_exists;
    
    -- Verificar perfil
    SELECT 
        EXISTS(SELECT 1 FROM public.profiles WHERE email = 'contato@dataro-it.com.br'),
        role,
        organization_id
    INTO v_profile_exists, v_profile_role, v_profile_org_id
    FROM public.profiles
    WHERE email = 'contato@dataro-it.com.br';
    
    -- Verificar se é super admin
    v_is_super_admin := (v_profile_role = 'admin' AND v_profile_org_id = '00000000-0000-0000-0000-000000000001');
    
    -- Verificar organização
    SELECT EXISTS(SELECT 1 FROM public.organizations WHERE id = '00000000-0000-0000-0000-000000000001')
    INTO v_org_exists;
    
    RAISE NOTICE '
╔════════════════════════════════════════════════════════════════╗
║           DIAGNÓSTICO: contato@dataro-it.com.br                ║
╚════════════════════════════════════════════════════════════════╝

📊 STATUS ATUAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Usuário existe no auth.users?        %
2. Perfil existe na tabela profiles?    %
3. Role do perfil:                       %
4. Organization ID:                      %
5. É Super Admin?                        %
6. Organização Super Admin existe?      %

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 AÇÕES NECESSÁRIAS:
',
    CASE WHEN v_user_exists THEN '✓ SIM' ELSE '✗ NÃO' END,
    CASE WHEN v_profile_exists THEN '✓ SIM' ELSE '✗ NÃO' END,
    COALESCE(v_profile_role, 'N/A'),
    COALESCE(v_profile_org_id::TEXT, 'N/A'),
    CASE WHEN v_is_super_admin THEN '✓ SIM' ELSE '✗ NÃO' END,
    CASE WHEN v_org_exists THEN '✓ SIM' ELSE '✗ NÃO' END;
    
    -- Ações recomendadas
    IF NOT v_user_exists THEN
        RAISE NOTICE '❌ PROBLEMA: Usuário não existe no sistema
        
   SOLUÇÃO:
   1. Acesse Supabase Dashboard > Authentication > Users
   2. Clique em "Add User"
   3. Email: contato@dataro-it.com.br
   4. Password: (defina uma senha segura)
   5. Marque "Auto Confirm User"
   6. Depois execute: TRANSFORMAR_EM_SUPER_ADMIN.sql
';
    ELSIF NOT v_org_exists THEN
        RAISE NOTICE '❌ PROBLEMA: Organização Super Admin não existe
        
   SOLUÇÃO:
   Execute o script: TRANSFORMAR_EM_SUPER_ADMIN.sql
   (Ele criará a organização automaticamente)
';
    ELSIF NOT v_is_super_admin THEN
        RAISE NOTICE '❌ PROBLEMA: Usuário existe mas não é Super Admin
        
   SOLUÇÃO:
   Execute o script: TRANSFORMAR_EM_SUPER_ADMIN.sql
   (Ele atualizará o perfil para Super Admin)
';
    ELSE
        RAISE NOTICE '✅ TUDO CERTO! Usuário já é Super Admin
        
   PRÓXIMOS PASSOS:
   1. Faça logout se estiver logado
   2. Limpe o cache do navegador
   3. Faça login novamente
   4. Acesse: http://localhost:3000/admin
';
    END IF;
    
    RAISE NOTICE '
╚════════════════════════════════════════════════════════════════╝
';
END $$;
