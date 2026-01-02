-- =====================================================
-- TRANSFORMAR contato@dataro-it.com.br EM SUPER ADMIN
-- =====================================================
-- Este script transforma uma conta existente em Super Admin
-- Data: 2026-01-01
-- =====================================================

-- PASSO 1: Verificar se a organização Super Admin existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = '00000000-0000-0000-0000-000000000001') THEN
        -- Criar organização Super Admin se não existir
        INSERT INTO public.organizations (id, name, slug, type, settings)
        VALUES (
            '00000000-0000-0000-0000-000000000001',
            'Dataro IT - Administração Geral',
            'dataro-admin',
            'federal',
            jsonb_build_object(
                'is_super_admin_org', true,
                'can_manage_all_orgs', true,
                'description', 'Organização principal para gestão de todos os gabinetes'
            )
        );
        RAISE NOTICE 'Organização Super Admin criada com sucesso!';
    ELSE
        RAISE NOTICE 'Organização Super Admin já existe.';
    END IF;
END $$;

-- PASSO 2: Buscar o usuário pelo email
DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
BEGIN
    -- Buscar usuário na tabela auth.users
    SELECT id, email INTO v_user_id, v_user_email
    FROM auth.users
    WHERE email = 'contato@dataro-it.com.br';

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'ERRO: Usuário com email contato@dataro-it.com.br não encontrado!
        
        INSTRUÇÕES:
        1. Primeiro crie o usuário no Supabase Dashboard:
           - Acesse: Authentication > Users > Add User
           - Email: contato@dataro-it.com.br
           - Password: (defina uma senha segura)
           - Marque "Auto Confirm User"
        
        2. Depois execute este script novamente.';
    END IF;

    RAISE NOTICE '✓ Usuário encontrado: % (ID: %)', v_user_email, v_user_id;

    -- PASSO 3: Atualizar ou criar perfil como Super Admin
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
        v_user_email,
        'Administrador Geral - DATA-RO',
        'admin',
        '00000000-0000-0000-0000-000000000001',
        true,
        jsonb_build_object(
            'is_super_admin', true,
            'can_manage_all_orgs', true,
            'permissions', jsonb_build_array(
                'manage_organizations',
                'manage_users',
                'manage_gabinetes',
                'view_all_data',
                'system_settings'
            )
        ),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        organization_id = '00000000-0000-0000-0000-000000000001',
        full_name = 'Administrador Geral - DATA-RO',
        onboarding_completed = true,
        metadata = jsonb_build_object(
            'is_super_admin', true,
            'can_manage_all_orgs', true,
            'permissions', jsonb_build_array(
                'manage_organizations',
                'manage_users',
                'manage_gabinetes',
                'view_all_data',
                'system_settings'
            )
        ),
        updated_at = NOW();

    RAISE NOTICE '✓ Perfil configurado como Super Admin!';

    -- PASSO 4: Verificar configuração
    RAISE NOTICE '
    ========================================
    CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!
    ========================================
    
    Detalhes da conta:
    - Email: %
    - User ID: %
    - Role: admin
    - Organization ID: 00000000-0000-0000-0000-000000000001
    - Organization: Dataro IT - Administração Geral
    
    Próximos passos:
    1. Faça logout se estiver logado
    2. Acesse: http://localhost:3000/login
    3. Entre com: contato@dataro-it.com.br
    4. Acesse: http://localhost:3000/admin
    
    Você agora tem acesso total ao painel Super Admin!
    ========================================
    ', v_user_email, v_user_id;

END $$;

-- PASSO 5: Verificar resultado final
SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    p.role,
    p.organization_id,
    o.name as organization_name,
    p.onboarding_completed,
    p.metadata,
    p.created_at,
    p.updated_at
FROM public.profiles p
LEFT JOIN public.organizations o ON o.id = p.organization_id
WHERE p.email = 'contato@dataro-it.com.br';
