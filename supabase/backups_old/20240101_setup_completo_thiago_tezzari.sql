-- =====================================================
-- SETUP COMPLETO: Sistema + Gabinete Thiago Tezzari
-- Execute este script completo no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- PARTE 1: CRIAR TABELAS BASE (se não existirem)
-- =====================================================

-- Tabela de Organizações
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('municipal', 'estadual', 'federal')),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Perfis
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

-- Tabela de Convites
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_invites_email ON public.invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_status ON public.invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_organization ON public.invites(organization_id);

-- =====================================================
-- PARTE 2: HABILITAR RLS
-- =====================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 3: POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Usuários podem ver sua própria organização
DROP POLICY IF EXISTS "Users can view own organization" ON public.organizations;
CREATE POLICY "Users can view own organization"
    ON public.organizations FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = organizations.id
        )
    );

-- Usuários podem ver seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT TO authenticated
    USING (id = auth.uid());

-- Usuários podem atualizar seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE TO authenticated
    USING (id = auth.uid());

-- =====================================================
-- PARTE 4: FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
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
-- PARTE 5: FUNÇÃO PARA ATUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_invites_updated_at ON public.invites;
CREATE TRIGGER update_invites_updated_at
    BEFORE UPDATE ON public.invites
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PARTE 6: CRIAR ORGANIZAÇÃO DATARO (SUPER ADMIN)
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
-- PARTE 7: CRIAR GABINETE THIAGO TEZZARI
-- =====================================================

INSERT INTO public.organizations (name, slug, type, settings)
VALUES (
    'Gabinete do Vereador Thiago Tezzari',
    'vereador-thiago-tezzari',
    'municipal',
    jsonb_build_object(
        'parlamentar_name', 'Thiago Tezzari',
        'cargo', 'Vereador',
        'partido', 'A definir',
        'municipio', 'A definir',
        'uf', 'A definir',
        'description', 'Gabinete do Vereador Thiago Tezzari',
        'features', jsonb_build_object(
            'providencias', true,
            'cidadaos', true,
            'relatorios', true,
            'mapa_calor', true,
            'notificacoes', true
        )
    )
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    settings = EXCLUDED.settings;

-- =====================================================
-- VERIFICAR ORGANIZAÇÕES CRIADAS
-- =====================================================

SELECT 
    id,
    name,
    slug,
    type,
    created_at
FROM public.organizations
ORDER BY created_at;

-- =====================================================
-- INSTRUÇÕES PARA CRIAR USUÁRIO ADMIN
-- =====================================================

/*
PRÓXIMOS PASSOS:

1. CRIAR USUÁRIO NO SUPABASE AUTH:
   - Vá em: Authentication > Users > Add User
   - Email: gab.thiagotezzari@gmail.com
   - Password: Defina uma senha segura
   - Marque "Auto Confirm User"
   - COPIE O USER ID gerado

2. BUSCAR ID DA ORGANIZAÇÃO:
*/

SELECT id, name, slug
FROM public.organizations
WHERE slug = 'vereador-thiago-tezzari';

/*
3. CONFIGURAR PERFIL COMO ADMIN:
   Substitua USER_ID_AQUI e ORG_ID_AQUI:
*/

-- INSERT INTO public.profiles (id, email, full_name, role, organization_id, onboarding_completed, metadata)
-- VALUES (
--     'USER_ID_AQUI'::uuid,
--     'gab.thiagotezzari@gmail.com',
--     'Thiago Tezzari',
--     'admin',
--     'ORG_ID_AQUI'::uuid,
--     true,
--     jsonb_build_object('is_gabinete_admin', true, 'setup_date', NOW())
-- )
-- ON CONFLICT (id) DO UPDATE SET
--     role = 'admin',
--     organization_id = EXCLUDED.organization_id,
--     full_name = EXCLUDED.full_name,
--     onboarding_completed = true,
--     metadata = EXCLUDED.metadata,
--     updated_at = NOW();

/*
4. VERIFICAR:
*/

-- SELECT
--     p.id, p.email, p.full_name, p.role,
--     o.name as organization_name,
--     p.onboarding_completed
-- FROM public.profiles p
-- LEFT JOIN public.organizations o ON o.id = p.organization_id
-- WHERE p.email = 'gab.thiagotezzari@gmail.com';
