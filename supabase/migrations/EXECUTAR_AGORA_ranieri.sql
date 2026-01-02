-- ═══════════════════════════════════════════════════════════════
-- SCRIPT SIMPLIFICADO: Configurar ranieri.braga@hotmail.com
-- ═══════════════════════════════════════════════════════════════

-- PASSO 1: Garantir organização DATA-RO
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

-- PASSO 2: Verificar se usuário existe e criar/atualizar perfil
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
        RAISE EXCEPTION 'ERRO: Usuário % não encontrado no auth.users! Crie o usuário primeiro no Supabase Dashboard: Authentication > Users > Add User (Email: %, Password: @Jujuba2103!, Auto Confirm: YES)', v_email, v_email;
    END IF;

    RAISE NOTICE 'Usuario encontrado: %', v_user_id;
    
    -- Deletar perfil existente para recriar do zero
    DELETE FROM public.profiles WHERE id = v_user_id;
    RAISE NOTICE 'Perfil antigo deletado (se existia)';
    
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
        v_org_id,
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
    
    RAISE NOTICE 'Perfil criado com sucesso!';
    RAISE NOTICE 'Role: admin';
    RAISE NOTICE 'Organization ID: %', v_org_id;
END $$;

-- PASSO 3: Verificar configuração
SELECT 
    'VERIFICACAO FINAL' as status,
    p.id as user_id,
    p.email,
    p.full_name,
    p.role,
    p.organization_id,
    o.slug as org_slug,
    p.onboarding_completed,
    p.metadata->>'is_super_admin' as is_super_admin,
    CASE 
        WHEN p.role = 'admin' AND p.organization_id = '00000000-0000-0000-0000-000000000001'
        THEN 'CONFIGURADO CORRETAMENTE - DEVE FUNCIONAR'
        ELSE 'PROBLEMA NA CONFIGURACAO'
    END as resultado
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email = 'ranieri.braga@hotmail.com';

-- PASSO 4: Simular verificação do middleware
SELECT 
    'SIMULACAO MIDDLEWARE' as teste,
    p.email,
    p.role = 'admin' as role_e_admin,
    p.organization_id = '00000000-0000-0000-0000-000000000001' as org_e_dataro,
    (p.role = 'admin' AND p.organization_id = '00000000-0000-0000-0000-000000000001') as middleware_vai_aprovar
FROM public.profiles p
WHERE p.email = 'ranieri.braga@hotmail.com';

/*
═══════════════════════════════════════════════════════════════
PROXIMOS PASSOS APOS EXECUTAR ESTE SCRIPT:
═══════════════════════════════════════════════════════════════

1. Verifique os resultados das queries acima
   - resultado deve ser: "CONFIGURADO CORRETAMENTE - DEVE FUNCIONAR"
   - middleware_vai_aprovar deve ser: true

2. Feche TODAS as abas do navegador

3. Abra uma nova aba privada

4. Acesse: http://127.0.0.1:3000/login?redirect=%2Fadmin

5. Faça login:
   - Email: ranieri.braga@hotmail.com
   - Senha: @Jujuba2103!

6. Você DEVE ser redirecionado para /admin automaticamente

Se ainda não funcionar, copie e cole aqui os resultados das queries
de verificação acima para eu analisar.
═══════════════════════════════════════════════════════════════
*/
