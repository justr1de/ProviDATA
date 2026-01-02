-- Migration: Criar Super Admin
-- Descrição: Cria conta de administrador geral para gestão de todos os gabinetes

-- =====================================================
-- 1. CRIAR ORGANIZAÇÃO PRINCIPAL (DATARO)
-- =====================================================
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
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    settings = EXCLUDED.settings;

-- =====================================================
-- 2. CRIAR USUÁRIO SUPER ADMIN
-- =====================================================
-- NOTA: Este usuário precisa ser criado via Supabase Auth
-- O script abaixo é apenas para referência e documentação
-- Execute manualmente no Supabase Dashboard ou via API:

/*
Email: contato@dataro-it.com.br
Senha: @D4taRx1!
Role: admin
Organization: dataro-admin (00000000-0000-0000-0000-000000000001)
*/

-- =====================================================
-- 3. FUNÇÃO PARA CRIAR SUPER ADMIN
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_super_admin(
    admin_email TEXT,
    admin_password TEXT,
    admin_name TEXT DEFAULT 'Administrador Geral'
)
RETURNS JSONB AS $$
DECLARE
    new_user_id UUID;
    org_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Verificar se usuário já existe
    SELECT id INTO new_user_id
    FROM auth.users
    WHERE email = admin_email;

    IF new_user_id IS NOT NULL THEN
        -- Atualizar perfil existente
        UPDATE public.profiles
        SET
            role = 'admin',
            organization_id = org_id,
            full_name = admin_name,
            updated_at = NOW()
        WHERE id = new_user_id;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Usuário existente atualizado para super admin',
            'user_id', new_user_id
        );
    END IF;

    -- Se não existe, retornar instruções
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Usuário não encontrado. Crie primeiro via Supabase Auth Dashboard',
        'instructions', jsonb_build_object(
            'email', admin_email,
            'password', admin_password,
            'steps', jsonb_build_array(
                '1. Acesse Supabase Dashboard > Authentication > Users',
                '2. Clique em "Add User"',
                '3. Preencha email e senha',
                '4. Após criar, execute: SELECT public.setup_super_admin_profile(''user_id_aqui'');'
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. FUNÇÃO PARA CONFIGURAR PERFIL DE SUPER ADMIN
-- =====================================================
CREATE OR REPLACE FUNCTION public.setup_super_admin_profile(
    user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    org_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Atualizar ou criar perfil
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        organization_id,
        onboarding_completed,
        metadata
    )
    SELECT
        user_id,
        u.email,
        'Administrador Geral',
        'admin',
        org_id,
        true,
        jsonb_build_object(
            'is_super_admin', true,
            'can_manage_all_orgs', true
        )
    FROM auth.users u
    WHERE u.id = user_id
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        organization_id = org_id,
        full_name = 'Administrador Geral',
        onboarding_completed = true,
        metadata = jsonb_build_object(
            'is_super_admin', true,
            'can_manage_all_orgs', true
        ),
        updated_at = NOW();

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Perfil de super admin configurado com sucesso',
        'user_id', user_id,
        'organization_id', org_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. POLÍTICAS RLS PARA SUPER ADMIN
-- =====================================================

-- Super admins podem ver todas as organizações
DROP POLICY IF EXISTS "Super admins can view all organizations" ON public.organizations;
CREATE POLICY "Super admins can view all organizations"
    ON public.organizations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.organization_id = '00000000-0000-0000-0000-000000000001'
        )
    );

-- Super admins podem criar organizações
DROP POLICY IF EXISTS "Super admins can create organizations" ON public.organizations;
CREATE POLICY "Super admins can create organizations"
    ON public.organizations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.organization_id = '00000000-0000-0000-0000-000000000001'
        )
    );

-- Super admins podem atualizar todas as organizações
DROP POLICY IF EXISTS "Super admins can update all organizations" ON public.organizations;
CREATE POLICY "Super admins can update all organizations"
    ON public.organizations
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.organization_id = '00000000-0000-0000-0000-000000000001'
        )
    );

-- Super admins podem ver todos os perfis
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles AS admin_profile
            WHERE admin_profile.id = auth.uid()
            AND admin_profile.role = 'admin'
            AND admin_profile.organization_id = '00000000-0000-0000-0000-000000000001'
        )
    );

-- Super admins podem ver todos os convites
DROP POLICY IF EXISTS "Super admins can view all invites" ON public.invites;
CREATE POLICY "Super admins can view all invites"
    ON public.invites
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.organization_id = '00000000-0000-0000-0000-000000000001'
        )
    );

-- =====================================================
-- 6. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION public.create_super_admin IS 'Cria ou atualiza usuário como super admin';
COMMENT ON FUNCTION public.setup_super_admin_profile IS 'Configura perfil de super admin para usuário existente';

-- =====================================================
-- 7. INSTRUÇÕES DE USO
-- =====================================================

/*
INSTRUÇÕES PARA CRIAR O SUPER ADMIN:

1. Via Supabase Dashboard:
   - Acesse: Authentication > Users > Add User
   - Email: contato@dataro-it.com.br
   - Password: @D4taRx1!
   - Copie o User ID gerado

2. Execute no SQL Editor:
   SELECT public.setup_super_admin_profile('USER_ID_AQUI');

3. Verifique:
   SELECT * FROM public.profiles WHERE email = 'contato@dataro-it.com.br';

4. Teste o login:
   - Acesse /login
   - Use: contato@dataro-it.com.br / @D4taRx1!
   - Deve ter acesso total ao sistema

ALTERNATIVA - Via API (Node.js/TypeScript):

const { data, error } = await supabase.auth.admin.createUser({
  email: 'contato@dataro-it.com.br',
  password: '@D4taRx1!',
  email_confirm: true,
  user_metadata: {
    full_name: 'Administrador Geral'
  }
});

if (data.user) {
  await supabase.rpc('setup_super_admin_profile', {
    user_id: data.user.id
  });
}
*/
