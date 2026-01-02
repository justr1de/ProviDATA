-- =====================================================
-- CRIAR SUPER ADMIN: ranieri.braga@hotmail.com
-- Senha: @Jujuba2103!
-- Organização: DATA-RO (00000000-0000-0000-0000-000000000001)
-- =====================================================

-- =====================================================
-- PASSO 1: GARANTIR QUE A ORGANIZAÇÃO DATA-RO EXISTE
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
-- PASSO 2: VERIFICAR SE O USUÁRIO JÁ EXISTE
-- =====================================================
DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'ranieri.braga@hotmail.com';
    v_org_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Buscar usuário existente
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email;

    IF v_user_id IS NOT NULL THEN
        -- Usuário existe, atualizar perfil para super admin
        RAISE NOTICE 'Usuário encontrado: %. Atualizando para super admin...', v_user_id;
        
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
                'created_by', 'migration_script'
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
                'updated_by', 'migration_script'
            ),
            updated_at = NOW();
        
        RAISE NOTICE 'Perfil atualizado com sucesso!';
    ELSE
        -- Usuário não existe
        RAISE NOTICE 'Usuário % não encontrado no auth.users', v_email;
        RAISE NOTICE 'AÇÃO NECESSÁRIA: Crie o usuário primeiro via Supabase Dashboard';
        RAISE NOTICE '1. Acesse: Authentication > Users > Add User';
        RAISE NOTICE '2. Email: %', v_email;
        RAISE NOTICE '3. Senha: @Jujuba2103!';
        RAISE NOTICE '4. Execute este script novamente após criar o usuário';
    END IF;
END $$;

-- =====================================================
-- PASSO 3: VERIFICAR RESULTADO
-- =====================================================
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    o.name as organization_name,
    o.slug as organization_slug,
    p.onboarding_completed,
    p.metadata,
    p.created_at,
    p.updated_at
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email = 'ranieri.braga@hotmail.com';

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================

/*
═══════════════════════════════════════════════════════════════
INSTRUÇÕES PARA CRIAR O SUPER ADMIN ranieri.braga@hotmail.com
═══════════════════════════════════════════════════════════════

📋 CREDENCIAIS:
   Email: ranieri.braga@hotmail.com
   Senha: @Jujuba2103!

═══════════════════════════════════════════════════════════════
OPÇÃO 1 - SE O USUÁRIO JÁ EXISTE NO AUTH.USERS:
═══════════════════════════════════════════════════════════════
   ✓ Execute este script diretamente no SQL Editor
   ✓ O perfil será criado/atualizado automaticamente como super admin

═══════════════════════════════════════════════════════════════
OPÇÃO 2 - SE O USUÁRIO NÃO EXISTE (MAIS PROVÁVEL):
═══════════════════════════════════════════════════════════════
   
   PASSO A PASSO:
   
   1️⃣ Acesse o Supabase Dashboard
      https://supabase.com/dashboard/project/[seu-projeto]
   
   2️⃣ Navegue até: Authentication > Users
   
   3️⃣ Clique em "Add User" (botão verde no canto superior direito)
   
   4️⃣ Preencha o formulário:
      ┌─────────────────────────────────────────┐
      │ Email: ranieri.braga@hotmail.com        │
      │ Password: @Jujuba2103!                  │
      │ Auto Confirm User: ✓ YES (IMPORTANTE!)  │
      └─────────────────────────────────────────┘
   
   5️⃣ Clique em "Create User"
   
   6️⃣ Volte ao SQL Editor e execute este script completo
   
   7️⃣ Verifique o resultado com a query SELECT no final

═══════════════════════════════════════════════════════════════
VERIFICAÇÃO DO SUPER ADMIN:
═══════════════════════════════════════════════════════════════

Execute esta query para confirmar:

SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    o.name as organization_name,
    o.slug as organization_slug,
    p.onboarding_completed,
    p.metadata->>'is_super_admin' as is_super_admin,
    p.metadata->>'can_manage_all_orgs' as can_manage_all_orgs
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.email = 'ranieri.braga@hotmail.com';

✅ RESULTADO ESPERADO:
   • role = 'admin'
   • organization_slug = 'dataro-admin'
   • is_super_admin = 'true'
   • can_manage_all_orgs = 'true'
   • onboarding_completed = true

═══════════════════════════════════════════════════════════════
TESTE DE LOGIN:
═══════════════════════════════════════════════════════════════

   1️⃣ Acesse a aplicação: /login
   
   2️⃣ Faça login com:
      Email: ranieri.braga@hotmail.com
      Senha: @Jujuba2103!
   
   3️⃣ Verifique o acesso:
      ✓ Deve redirecionar para /admin ou /dashboard
      ✓ Deve ter acesso a /admin/gabinetes
      ✓ Deve ver TODOS os gabinetes do sistema
      ✓ Deve ter permissões completas de administração

═══════════════════════════════════════════════════════════════
PERMISSÕES DO SUPER ADMIN:
═══════════════════════════════════════════════════════════════

   ✅ Ver todas as organizações
   ✅ Criar novas organizações
   ✅ Atualizar organizações existentes
   ✅ Ver todos os perfis de usuários
   ✅ Ver todos os convites
   ✅ Gerenciar todos os gabinetes
   ✅ Criar e gerenciar convites para qualquer gabinete
   ✅ Acesso total ao sistema

═══════════════════════════════════════════════════════════════
TROUBLESHOOTING:
═══════════════════════════════════════════════════════════════

❌ Se o login não funcionar:
   1. Verifique se o usuário foi criado: Authentication > Users
   2. Verifique se o email foi confirmado (Auto Confirm User = YES)
   3. Execute este script novamente
   4. Limpe o cache do navegador e tente novamente

❌ Se não tiver permissões de super admin:
   1. Execute a query de verificação acima
   2. Confirme que role = 'admin' e organization_id está correto
   3. Execute este script novamente para forçar atualização

═══════════════════════════════════════════════════════════════
*/
