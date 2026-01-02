-- Migration: Sistema de Onboarding Híbrido
-- Descrição: Tabelas para gerenciar convites e onboarding de usuários

-- =====================================================
-- 1. TABELA DE CONVITES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'gestor', 'operador', 'visualizador')),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_invites_email ON public.invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_status ON public.invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_organization ON public.invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON public.invites(expires_at);

-- =====================================================
-- 2. TABELA DE ORGANIZAÇÕES (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('municipal', 'estadual', 'federal')),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA DE PERFIS DE USUÁRIO (estendida)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'visualizador' CHECK (role IN ('admin', 'gestor', 'operador', 'visualizador')),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- 4. FUNÇÃO PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_invites_updated_at ON public.invites;
CREATE TRIGGER update_invites_updated_at
    BEFORE UPDATE ON public.invites
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 5. FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil ao criar usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6.1 POLÍTICAS PARA INVITES
-- =====================================================

-- Admins podem ver todos os convites da sua organização
DROP POLICY IF EXISTS "Admins can view organization invites" ON public.invites;
CREATE POLICY "Admins can view organization invites"
    ON public.invites
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.organization_id = invites.organization_id
        )
    );

-- Admins podem criar convites para sua organização
DROP POLICY IF EXISTS "Admins can create invites" ON public.invites;
CREATE POLICY "Admins can create invites"
    ON public.invites
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.organization_id = invites.organization_id
        )
    );

-- Admins podem atualizar convites da sua organização
DROP POLICY IF EXISTS "Admins can update organization invites" ON public.invites;
CREATE POLICY "Admins can update organization invites"
    ON public.invites
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.organization_id = invites.organization_id
        )
    );

-- Admins podem deletar convites da sua organização
DROP POLICY IF EXISTS "Admins can delete organization invites" ON public.invites;
CREATE POLICY "Admins can delete organization invites"
    ON public.invites
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.organization_id = invites.organization_id
        )
    );

-- Qualquer pessoa pode ver convite válido pelo token (para aceitar)
DROP POLICY IF EXISTS "Anyone can view invite by token" ON public.invites;
CREATE POLICY "Anyone can view invite by token"
    ON public.invites
    FOR SELECT
    TO anon, authenticated
    USING (
        status = 'pending'
        AND expires_at > NOW()
    );

-- =====================================================
-- 6.2 POLÍTICAS PARA ORGANIZATIONS
-- =====================================================

-- Usuários podem ver sua própria organização
DROP POLICY IF EXISTS "Users can view own organization" ON public.organizations;
CREATE POLICY "Users can view own organization"
    ON public.organizations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = organizations.id
        )
    );

-- Admins podem atualizar sua organização
DROP POLICY IF EXISTS "Admins can update own organization" ON public.organizations;
CREATE POLICY "Admins can update own organization"
    ON public.organizations
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.organization_id = organizations.id
        )
    );

-- =====================================================
-- 6.3 POLÍTICAS PARA PROFILES
-- =====================================================

-- Usuários podem ver seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Usuários podem atualizar seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

-- Admins podem ver perfis da sua organização
DROP POLICY IF EXISTS "Admins can view organization profiles" ON public.profiles;
CREATE POLICY "Admins can view organization profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles AS admin_profile
            WHERE admin_profile.id = auth.uid()
            AND admin_profile.role = 'admin'
            AND admin_profile.organization_id = profiles.organization_id
        )
    );

-- Admins podem atualizar perfis da sua organização
DROP POLICY IF EXISTS "Admins can update organization profiles" ON public.profiles;
CREATE POLICY "Admins can update organization profiles"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles AS admin_profile
            WHERE admin_profile.id = auth.uid()
            AND admin_profile.role = 'admin'
            AND admin_profile.organization_id = profiles.organization_id
        )
    );

-- =====================================================
-- 7. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para expirar convites automaticamente
CREATE OR REPLACE FUNCTION public.expire_old_invites()
RETURNS void AS $$
BEGIN
    UPDATE public.invites
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aceitar convite
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

-- =====================================================
-- 8. DADOS INICIAIS (SEED)
-- =====================================================

-- Criar organização padrão se não existir
INSERT INTO public.organizations (name, slug, type)
VALUES ('Organização Padrão', 'default', 'municipal')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 9. COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE public.invites IS 'Convites para novos usuários se juntarem a organizações';
COMMENT ON TABLE public.organizations IS 'Organizações (prefeituras, órgãos públicos)';
COMMENT ON TABLE public.profiles IS 'Perfis estendidos dos usuários';

COMMENT ON COLUMN public.invites.token IS 'Token único para aceitar o convite';
COMMENT ON COLUMN public.invites.status IS 'Status do convite: pending, accepted, expired, revoked';
COMMENT ON COLUMN public.invites.expires_at IS 'Data de expiração do convite (padrão: 7 dias)';

COMMENT ON COLUMN public.profiles.role IS 'Papel do usuário: admin, gestor, operador, visualizador';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Se o usuário completou o onboarding';
COMMENT ON COLUMN public.profiles.onboarding_step IS 'Passo atual do onboarding (0-5)';
