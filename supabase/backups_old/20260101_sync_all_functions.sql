-- =====================================================
-- Migration: Sincronização de Todas as Funções
-- Descrição: Consolida e sincroniza todas as funções SQL do sistema
-- Data: 2026-01-01
-- =====================================================

-- =====================================================
-- 1. FUNÇÃO: update_updated_at_column
-- Descrição: Atualiza automaticamente o campo updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Atualiza automaticamente o campo updated_at quando um registro é modificado';

-- =====================================================
-- 2. FUNÇÃO: handle_new_user
-- Descrição: Cria perfil automaticamente quando novo usuário é criado
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Cria perfil automaticamente quando um novo usuário é registrado';

-- =====================================================
-- 3. FUNÇÃO: expire_old_invites
-- Descrição: Expira convites antigos (tabela invites)
-- =====================================================
CREATE OR REPLACE FUNCTION public.expire_old_invites()
RETURNS void AS $$
BEGIN
    UPDATE public.invites
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.expire_old_invites() IS 'Marca convites pendentes como expirados quando passam da data de validade (tabela invites)';

-- =====================================================
-- 4. FUNÇÃO: expirar_convites_antigos
-- Descrição: Expira convites antigos (tabela convites)
-- =====================================================
CREATE OR REPLACE FUNCTION public.expirar_convites_antigos()
RETURNS void AS $$
BEGIN
    UPDATE public.convites
    SET status = 'expirado'
    WHERE status = 'pendente'
    AND validade < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.expirar_convites_antigos() IS 'Marca convites pendentes como expirados quando passam da validade (tabela convites)';

-- =====================================================
-- 5. FUNÇÃO: accept_invite
-- Descrição: Aceita convite e associa usuário à organização
-- =====================================================
CREATE OR REPLACE FUNCTION public.accept_invite(
    invite_token TEXT,
    user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    invite_record RECORD;
    result JSONB;
BEGIN
    -- Buscar convite válido
    SELECT * INTO invite_record
    FROM public.invites
    WHERE token = invite_token
    AND status = 'pending'
    AND expires_at > NOW();

    -- Verificar se convite existe
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Convite inválido ou expirado'
        );
    END IF;

    -- Atualizar perfil do usuário
    UPDATE public.profiles
    SET
        role = invite_record.role,
        organization_id = invite_record.organization_id,
        updated_at = NOW()
    WHERE id = user_id;

    -- Marcar convite como aceito
    UPDATE public.invites
    SET
        status = 'accepted',
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = invite_record.id;

    -- Retornar sucesso
    RETURN jsonb_build_object(
        'success', true,
        'role', invite_record.role,
        'organization_id', invite_record.organization_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.accept_invite(TEXT, UUID) IS 'Aceita um convite válido e associa o usuário à organização (tabela invites)';

-- =====================================================
-- 6. FUNÇÃO: aceitar_convite
-- Descrição: Aceita convite e associa usuário ao gabinete
-- =====================================================
CREATE OR REPLACE FUNCTION public.aceitar_convite(
    convite_token TEXT,
    user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    convite_record RECORD;
    result JSONB;
BEGIN
    -- Buscar convite válido
    SELECT * INTO convite_record
    FROM public.convites
    WHERE token = convite_token
    AND status = 'pendente'
    AND validade > NOW();

    -- Verificar se convite existe
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Convite inválido ou expirado'
        );
    END IF;

    -- Verificar se o email do convite corresponde ao email do usuário
    IF NOT EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = user_id
        AND email = convite_record.email
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Email do usuário não corresponde ao convite'
        );
    END IF;

    -- Atualizar perfil do usuário
    UPDATE public.profiles
    SET
        role = convite_record.cargo,
        gabinete_id = convite_record.gabinete_id,
        updated_at = NOW()
    WHERE id = user_id;

    -- Marcar convite como aceito
    UPDATE public.convites
    SET
        status = 'aceito',
        aceito_em = NOW(),
        aceito_por = user_id,
        updated_at = NOW()
    WHERE id = convite_record.id;

    -- Retornar sucesso
    RETURN jsonb_build_object(
        'success', true,
        'cargo', convite_record.cargo,
        'gabinete_id', convite_record.gabinete_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.aceitar_convite(TEXT, UUID) IS 'Aceita um convite válido e associa o usuário ao gabinete (tabela convites)';

-- =====================================================
-- 7. FUNÇÃO: revogar_convite
-- Descrição: Revoga um convite
-- =====================================================
CREATE OR REPLACE FUNCTION public.revogar_convite(
    convite_id UUID,
    user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    convite_record RECORD;
BEGIN
    -- Buscar convite
    SELECT * INTO convite_record
    FROM public.convites
    WHERE id = convite_id;

    -- Verificar se convite existe
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Convite não encontrado'
        );
    END IF;

    -- Verificar se usuário tem permissão (admin/gestor do mesmo gabinete)
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = user_id
        AND profiles.gabinete_id = convite_record.gabinete_id
        AND profiles.role IN ('admin', 'gestor')
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Sem permissão para revogar este convite'
        );
    END IF;

    -- Revogar convite
    UPDATE public.convites
    SET
        status = 'revogado',
        updated_at = NOW()
    WHERE id = convite_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Convite revogado com sucesso'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.revogar_convite(UUID, UUID) IS 'Revoga um convite (apenas admins/gestores do gabinete)';

-- =====================================================
-- 8. FUNÇÃO: obter_estatisticas_gabinete
-- Descrição: Retorna estatísticas de usuários e convites do gabinete
-- =====================================================
CREATE OR REPLACE FUNCTION public.obter_estatisticas_gabinete(
    gabinete_uuid UUID
)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_usuarios', COUNT(DISTINCT p.id),
        'total_admins', COUNT(DISTINCT p.id) FILTER (WHERE p.role = 'admin'),
        'total_gestores', COUNT(DISTINCT p.id) FILTER (WHERE p.role = 'gestor'),
        'total_assessores', COUNT(DISTINCT p.id) FILTER (WHERE p.role = 'assessor'),
        'total_operadores', COUNT(DISTINCT p.id) FILTER (WHERE p.role = 'operador'),
        'total_visualizadores', COUNT(DISTINCT p.id) FILTER (WHERE p.role = 'visualizador'),
        'convites_pendentes', COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'pendente'),
        'convites_aceitos', COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'aceito')
    ) INTO stats
    FROM public.profiles p
    LEFT JOIN public.convites c ON c.gabinete_id = p.gabinete_id
    WHERE p.gabinete_id = gabinete_uuid;

    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.obter_estatisticas_gabinete(UUID) IS 'Retorna estatísticas de usuários e convites do gabinete';

-- =====================================================
-- 9. FUNÇÃO: create_super_admin
-- Descrição: Cria ou atualiza usuário como super admin
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

COMMENT ON FUNCTION public.create_super_admin IS 'Cria ou atualiza usuário como super admin';

-- =====================================================
-- 10. FUNÇÃO: setup_super_admin_profile
-- Descrição: Configura perfil de super admin para usuário existente
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

COMMENT ON FUNCTION public.setup_super_admin_profile IS 'Configura perfil de super admin para usuário existente';

-- =====================================================
-- RESUMO DAS FUNÇÕES SINCRONIZADAS
-- =====================================================
/*
FUNÇÕES CRIADAS/ATUALIZADAS:

1. update_updated_at_column() - Trigger para atualizar timestamps
2. handle_new_user() - Cria perfil automaticamente para novos usuários
3. expire_old_invites() - Expira convites da tabela 'invites'
4. expirar_convites_antigos() - Expira convites da tabela 'convites'
5. accept_invite(token, user_id) - Aceita convite (tabela invites)
6. aceitar_convite(token, user_id) - Aceita convite (tabela convites)
7. revogar_convite(convite_id, user_id) - Revoga convite
8. obter_estatisticas_gabinete(gabinete_uuid) - Estatísticas do gabinete
9. create_super_admin(email, password, name) - Cria super admin
10. setup_super_admin_profile(user_id) - Configura perfil de super admin

PARA EXECUTAR:
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole e execute este arquivo
4. Verifique se todas as funções foram criadas com sucesso
*/

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
