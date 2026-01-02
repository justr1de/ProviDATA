-- =====================================================
-- Migration: Consolidação do Modelo de Multi-tenancy
-- Descrição: Estabelece public.tenants como fonte de verdade
--            Adiciona tenant_id em todas as tabelas
--            Consolida invites/convites em modelo unificado
-- Data: 2026-01-02
-- Autor: Sistema ProviDATA
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELA TENANTS (Fonte de Verdade)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Informações básicas
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    
    -- Tipo e hierarquia
    type TEXT NOT NULL CHECK (type IN ('gabinete', 'organization', 'municipal', 'estadual', 'federal')),
    
    -- Informações parlamentares (para gabinetes)
    parlamentar_name TEXT,
    parlamentar_nickname TEXT,
    parlamentar_cargo TEXT CHECK (parlamentar_cargo IN ('vereador', 'prefeito', 'deputado_estadual', 'deputado_federal', 'senador', 'governador')),
    partido TEXT,
    
    -- Localização
    uf TEXT CHECK (LENGTH(uf) = 2 OR uf IS NULL),
    municipio TEXT,
    endereco TEXT,
    
    -- Contatos
    telefone TEXT,
    telefone_parlamentar TEXT,
    telefone_gabinete TEXT,
    telefone_adicional TEXT,
    email TEXT,
    email_parlamentar TEXT,
    email_gabinete TEXT,
    
    -- Assessores
    assessor_1 TEXT,
    assessor_2 TEXT,
    
    -- Configurações
    logo_url TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    plano TEXT DEFAULT 'basico' CHECK (plano IN ('basico', 'profissional', 'enterprise')),
    
    -- Status
    ativo BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Metadados para rastreamento de origem
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_type ON public.tenants(type);
CREATE INDEX IF NOT EXISTS idx_tenants_ativo ON public.tenants(ativo);
CREATE INDEX IF NOT EXISTS idx_tenants_municipio ON public.tenants(municipio);
CREATE INDEX IF NOT EXISTS idx_tenants_uf ON public.tenants(uf);

COMMENT ON TABLE public.tenants IS 'Fonte de verdade para multi-tenancy - consolida gabinetes e organizações';
COMMENT ON COLUMN public.tenants.type IS 'Tipo do tenant: gabinete, organization, municipal, estadual, federal';
COMMENT ON COLUMN public.tenants.metadata IS 'Metadados incluindo origem (gabinete/organization) e informações de migração';

-- =====================================================
-- 2. MIGRAR DADOS DE GABINETES PARA TENANTS
-- =====================================================

INSERT INTO public.tenants (
    id, name, slug, type, 
    parlamentar_name, parlamentar_cargo, partido,
    uf, municipio, endereco,
    telefone, telefone_parlamentar, telefone_gabinete, telefone_adicional,
    email, email_parlamentar, email_gabinete,
    assessor_1, assessor_2,
    logo_url, settings, ativo,
    created_at, updated_at,
    metadata
)
SELECT 
    g.id,
    g.nome,
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(g.nome, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) || '-' || LOWER(g.uf),
    'gabinete',
    g.parlamentar_nome,
    g.parlamentar_cargo,
    g.partido,
    g.uf,
    g.municipio,
    g.endereco,
    g.telefone,
    g.telefone_parlamentar,
    g.telefone_gabinete,
    g.telefone_adicional,
    g.email,
    g.email_parlamentar,
    g.email_gabinete,
    g.assessor_1,
    g.assessor_2,
    g.logo_url,
    g.settings,
    g.ativo,
    g.created_at,
    g.updated_at,
    jsonb_build_object('source', 'gabinetes', 'original_id', g.id)
FROM public.gabinetes g
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = g.id)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. MIGRAR DADOS DE ORGANIZATIONS PARA TENANTS
-- =====================================================

INSERT INTO public.tenants (
    id, name, slug, type,
    uf, municipio,
    email, telefone,
    logo_url, settings, ativo,
    created_at, updated_at,
    metadata
)
SELECT 
    o.id,
    o.name,
    o.slug,
    o.type,
    NULL, -- uf não existe em organizations
    NULL, -- municipio não existe em organizations
    NULL, -- email não existe em organizations
    NULL, -- telefone não existe em organizations
    NULL, -- logo_url não existe em organizations
    o.settings,
    TRUE, -- ativo por padrão
    o.created_at,
    o.updated_at,
    jsonb_build_object('source', 'organizations', 'original_id', o.id)
FROM public.organizations o
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = o.id)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    settings = EXCLUDED.settings,
    updated_at = EXCLUDED.updated_at,
    metadata = EXCLUDED.metadata;

-- =====================================================
-- 4. ADICIONAR tenant_id EM PROFILES
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;
        
        CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);
        
        COMMENT ON COLUMN public.profiles.tenant_id IS 'Tenant ao qual o usuário pertence (fonte de verdade)';
    END IF;
END $$;

-- Migrar gabinete_id para tenant_id em profiles
UPDATE public.profiles
SET tenant_id = gabinete_id
WHERE gabinete_id IS NOT NULL AND tenant_id IS NULL;

-- Migrar organization_id para tenant_id em profiles
UPDATE public.profiles
SET tenant_id = organization_id
WHERE organization_id IS NOT NULL AND tenant_id IS NULL;

-- =====================================================
-- 5. ADICIONAR tenant_id EM USERS (se existir)
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) THEN
        -- Adicionar tenant_id se não existir
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND column_name = 'tenant_id'
        ) THEN
            ALTER TABLE public.users 
            ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
            
            CREATE INDEX idx_users_tenant_id ON public.users(tenant_id);
            
            COMMENT ON COLUMN public.users.tenant_id IS 'Tenant ao qual o usuário pertence';
        END IF;
        
        -- Migrar dados existentes
        UPDATE public.users
        SET tenant_id = users.tenant_id
        WHERE users.tenant_id IS NOT NULL;
    END IF;
END $$;

-- =====================================================
-- 6. CONSOLIDAR INVITES COM tenant_id
-- =====================================================

-- Adicionar tenant_id na tabela invites se não existir
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'invites'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'invites' 
            AND column_name = 'tenant_id'
        ) THEN
            ALTER TABLE public.invites 
            ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
            
            CREATE INDEX idx_invites_tenant_id ON public.invites(tenant_id);
            
            COMMENT ON COLUMN public.invites.tenant_id IS 'Tenant para o qual o convite é direcionado';
        END IF;
        
        -- Migrar organization_id para tenant_id
        UPDATE public.invites
        SET tenant_id = organization_id
        WHERE organization_id IS NOT NULL AND tenant_id IS NULL;
    END IF;
END $$;

-- =====================================================
-- 7. CONSOLIDAR CONVITES COM tenant_id
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'convites'
    ) THEN
        -- Adicionar tenant_id se não existir
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'convites' 
            AND column_name = 'tenant_id'
        ) THEN
            ALTER TABLE public.convites 
            ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
            
            CREATE INDEX idx_convites_tenant_id ON public.convites(tenant_id);
            
            COMMENT ON COLUMN public.convites.tenant_id IS 'Tenant para o qual o convite é direcionado';
        END IF;
        
        -- Migrar gabinete_id para tenant_id
        UPDATE public.convites
        SET tenant_id = gabinete_id
        WHERE gabinete_id IS NOT NULL AND tenant_id IS NULL;
    END IF;
END $$;

-- =====================================================
-- 8. CRIAR FUNÇÃO UNIFICADA PARA ACEITAR CONVITES
-- =====================================================

CREATE OR REPLACE FUNCTION public.accept_invite_unified(
    invite_token TEXT,
    user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    invite_record RECORD;
BEGIN
    -- Tentar buscar em invites
    SELECT 
        i.id, i.email, i.role, i.tenant_id, i.status, i.expires_at,
        'invites' as source
    INTO invite_record
    FROM public.invites i
    WHERE i.token = invite_token
    AND i.status = 'pending'
    AND i.expires_at > NOW()
    LIMIT 1;

    -- Se não encontrou em invites, tentar em convites
    IF NOT FOUND THEN
        SELECT 
            c.id, c.email, c.cargo as role, c.tenant_id, c.status, c.validade as expires_at,
            'convites' as source
        INTO invite_record
        FROM public.convites c
        WHERE c.token = invite_token
        AND c.status = 'pendente'
        AND c.validade > NOW()
        LIMIT 1;
    END IF;

    -- Verificar se convite foi encontrado
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Convite inválido ou expirado'
        );
    END IF;

    -- Verificar se o email corresponde
    IF NOT EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = user_id
        AND email = invite_record.email
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Email do usuário não corresponde ao convite'
        );
    END IF;

    -- Atualizar perfil do usuário com tenant_id
    UPDATE public.profiles
    SET
        role = invite_record.role,
        tenant_id = invite_record.tenant_id,
        organization_id = invite_record.tenant_id, -- Manter compatibilidade
        gabinete_id = invite_record.tenant_id, -- Manter compatibilidade
        updated_at = NOW()
    WHERE id = user_id;

    -- Marcar convite como aceito na tabela apropriada
    IF invite_record.source = 'invites' THEN
        UPDATE public.invites
        SET
            status = 'accepted',
            accepted_at = NOW(),
            updated_at = NOW()
        WHERE id = invite_record.id;
    ELSE
        UPDATE public.convites
        SET
            status = 'aceito',
            aceito_em = NOW(),
            aceito_por = user_id,
            updated_at = NOW()
        WHERE id = invite_record.id;
    END IF;

    -- Retornar sucesso
    RETURN jsonb_build_object(
        'success', true,
        'role', invite_record.role,
        'tenant_id', invite_record.tenant_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.accept_invite_unified(TEXT, UUID) IS 'Função unificada para aceitar convites de ambas as tabelas (invites/convites) usando tenant_id';

-- =====================================================
-- 9. ATUALIZAR RLS PARA USAR tenant_id
-- =====================================================

-- RLS para tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
CREATE POLICY "Users can view own tenant"
    ON public.tenants
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = tenants.id
        )
    );

DROP POLICY IF EXISTS "Admins can update own tenant" ON public.tenants;
CREATE POLICY "Admins can update own tenant"
    ON public.tenants
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = tenants.id
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Atualizar política de profiles para usar tenant_id
DROP POLICY IF EXISTS "Users can view same tenant profiles" ON public.profiles;
CREATE POLICY "Users can view same tenant profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles AS user_profile
            WHERE user_profile.id = auth.uid()
            AND user_profile.tenant_id = profiles.tenant_id
        )
    );

-- =====================================================
-- 10. TRIGGER PARA ATUALIZAR updated_at EM TENANTS
-- =====================================================

DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 11. VIEWS DE COMPATIBILIDADE (OPCIONAL)
-- =====================================================

-- View para manter compatibilidade com código legado que usa gabinetes
CREATE OR REPLACE VIEW public.gabinetes_view AS
SELECT 
    id,
    name as nome,
    municipio,
    uf,
    parlamentar_name as parlamentar_nome,
    parlamentar_cargo,
    partido,
    telefone,
    telefone_parlamentar,
    telefone_gabinete,
    telefone_adicional,
    email,
    email_parlamentar,
    email_gabinete,
    assessor_1,
    assessor_2,
    endereco,
    logo_url,
    settings,
    ativo,
    created_at,
    updated_at
FROM public.tenants
WHERE type = 'gabinete';

COMMENT ON VIEW public.gabinetes_view IS 'View de compatibilidade para código legado que usa gabinetes';

-- View para manter compatibilidade com código legado que usa organizations
CREATE OR REPLACE VIEW public.organizations_view AS
SELECT 
    id,
    name,
    slug,
    type,
    settings,
    created_at,
    updated_at
FROM public.tenants
WHERE type IN ('organization', 'municipal', 'estadual', 'federal');

COMMENT ON VIEW public.organizations_view IS 'View de compatibilidade para código legado que usa organizations';

-- =====================================================
-- 12. FUNÇÃO PARA OBTER TENANT DO USUÁRIO ATUAL
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
    current_tenant_id UUID;
BEGIN
    SELECT tenant_id INTO current_tenant_id
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN current_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.get_current_tenant_id() IS 'Retorna o tenant_id do usuário autenticado atual';

-- =====================================================
-- 13. VERIFICAÇÃO DE INTEGRIDADE
-- =====================================================

-- Verificar se todos os profiles têm tenant_id
DO $$
DECLARE
    profiles_sem_tenant INTEGER;
BEGIN
    SELECT COUNT(*) INTO profiles_sem_tenant
    FROM public.profiles
    WHERE tenant_id IS NULL
    AND (gabinete_id IS NOT NULL OR organization_id IS NOT NULL);
    
    IF profiles_sem_tenant > 0 THEN
        RAISE NOTICE 'AVISO: % perfis com gabinete_id/organization_id mas sem tenant_id', profiles_sem_tenant;
    ELSE
        RAISE NOTICE 'OK: Todos os perfis com tenant associado têm tenant_id';
    END IF;
END $$;

-- =====================================================
-- 14. ÍNDICES COMPOSTOS PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_tenant_role ON public.profiles(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_tenants_type_ativo ON public.tenants(type, ativo);

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration de Consolidação Concluída';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tabela public.tenants criada como fonte de verdade';
    RAISE NOTICE 'tenant_id adicionado em profiles, users, invites, convites';
    RAISE NOTICE 'Função accept_invite_unified() criada';
    RAISE NOTICE 'RLS policies atualizadas para usar tenant_id';
    RAISE NOTICE 'Views de compatibilidade criadas';
    RAISE NOTICE '========================================';
END $$;
