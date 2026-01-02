-- =====================================================
-- Migration: Consolidação do Modelo de Multi-tenancy (v2 - CORRIGIDA)
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

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gabinetes') THEN
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
            LOWER(REGEXP_REPLACE(REGEXP_REPLACE(g.nome, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) || '-' || LOWER(COALESCE(g.uf, 'br')),
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
        
        RAISE NOTICE 'Migrados % gabinetes para tenants', (SELECT COUNT(*) FROM public.tenants WHERE metadata->>'source' = 'gabinetes');
    ELSE
        RAISE NOTICE 'Tabela gabinetes não existe, pulando migração de gabinetes';
    END IF;
END $$;

-- =====================================================
-- 3. MIGRAR DADOS DE ORGANIZATIONS PARA TENANTS
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
        -- Verificar se a coluna type existe em organizations
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'organizations' 
            AND column_name = 'type'
        ) THEN
            -- Migrar com coluna type
            INSERT INTO public.tenants (
                id, name, slug, type,
                logo_url, settings, ativo,
                created_at, updated_at,
                metadata
            )
            SELECT 
                o.id,
                o.name,
                o.slug,
                COALESCE(o.type, 'organization'),
                NULL, -- logo_url
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
        ELSE
            -- Migrar sem coluna type (usar organization como padrão)
            INSERT INTO public.tenants (
                id, name, slug, type,
                logo_url, settings, ativo,
                created_at, updated_at,
                metadata
            )
            SELECT 
                o.id,
                o.name,
                o.slug,
                'organization', -- tipo padrão
                NULL, -- logo_url
                o.settings,
                TRUE, -- ativo por padrão
                o.created_at,
                o.updated_at,
                jsonb_build_object('source', 'organizations', 'original_id', o.id)
            FROM public.organizations o
            WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = o.id)
            ON CONFLICT (slug) DO UPDATE SET
                name = EXCLUDED.name,
                settings = EXCLUDED.settings,
                updated_at = EXCLUDED.updated_at,
                metadata = EXCLUDED.metadata;
        END IF;
        
        RAISE NOTICE 'Migradas % organizations para tenants', (SELECT COUNT(*) FROM public.tenants WHERE metadata->>'source' = 'organizations');
    ELSE
        RAISE NOTICE 'Tabela organizations não existe, pulando migração de organizations';
    END IF;
END $$;

-- =====================================================
-- 4. ADICIONAR tenant_id EM PROFILES
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
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
            
            RAISE NOTICE 'Coluna tenant_id adicionada em profiles';
        ELSE
            RAISE NOTICE 'Coluna tenant_id já existe em profiles';
        END IF;
        
        -- Migrar gabinete_id para tenant_id em profiles
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'gabinete_id') THEN
            UPDATE public.profiles
            SET tenant_id = gabinete_id
            WHERE gabinete_id IS NOT NULL AND tenant_id IS NULL;
            
            RAISE NOTICE 'Migrados gabinete_id para tenant_id em profiles';
        END IF;
        
        -- Migrar organization_id para tenant_id em profiles
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'organization_id') THEN
            UPDATE public.profiles
            SET tenant_id = organization_id
            WHERE organization_id IS NOT NULL AND tenant_id IS NULL;
            
            RAISE NOTICE 'Migrados organization_id para tenant_id em profiles';
        END IF;
    ELSE
        RAISE NOTICE 'Tabela profiles não existe';
    END IF;
END $$;

-- =====================================================
-- 5. CONSOLIDAR INVITES COM tenant_id
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invites') THEN
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
            
            RAISE NOTICE 'Coluna tenant_id adicionada em invites';
        END IF;
        
        -- Migrar organization_id para tenant_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invites' AND column_name = 'organization_id') THEN
            UPDATE public.invites
            SET tenant_id = organization_id
            WHERE organization_id IS NOT NULL AND tenant_id IS NULL;
            
            RAISE NOTICE 'Migrados organization_id para tenant_id em invites';
        END IF;
    ELSE
        RAISE NOTICE 'Tabela invites não existe';
    END IF;
END $$;

-- =====================================================
-- 6. CONSOLIDAR CONVITES COM tenant_id
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'convites') THEN
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
            
            RAISE NOTICE 'Coluna tenant_id adicionada em convites';
        END IF;
        
        -- Migrar gabinete_id para tenant_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'convites' AND column_name = 'gabinete_id') THEN
            UPDATE public.convites
            SET tenant_id = gabinete_id
            WHERE gabinete_id IS NOT NULL AND tenant_id IS NULL;
            
            RAISE NOTICE 'Migrados gabinete_id para tenant_id em convites';
        END IF;
    ELSE
        RAISE NOTICE 'Tabela convites não existe';
    END IF;
END $$;

-- =====================================================
-- 7. CRIAR FUNÇÃO UNIFICADA PARA ACEITAR CONVITES
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
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invites') THEN
        SELECT 
            i.id, i.email, i.role, i.tenant_id, i.status, i.expires_at,
            'invites' as source
        INTO invite_record
        FROM public.invites i
        WHERE i.token = invite_token
        AND i.status = 'pending'
        AND i.expires_at > NOW()
        LIMIT 1;
    END IF;

    -- Se não encontrou em invites, tentar em convites
    IF NOT FOUND AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'convites') THEN
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
-- 8. ATUALIZAR RLS PARA USAR tenant_id
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
-- 9. TRIGGER PARA ATUALIZAR updated_at EM TENANTS
-- =====================================================

-- Verificar se a função update_updated_at_column existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE OR REPLACE FUNCTION public.update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
    END IF;
END $$;

DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 10. VIEWS DE COMPATIBILIDADE (OPCIONAL)
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
-- 11. FUNÇÃO PARA OBTER TENANT DO USUÁRIO ATUAL
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
-- 12. ÍNDICES COMPOSTOS PARA PERFORMANCE
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
    RAISE NOTICE 'Migration de Consolidação Concluída (v2)';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tabela public.tenants criada como fonte de verdade';
    RAISE NOTICE 'tenant_id adicionado em profiles, invites, convites';
    RAISE NOTICE 'Função accept_invite_unified() criada';
    RAISE NOTICE 'RLS policies atualizadas para usar tenant_id';
    RAISE NOTICE 'Views de compatibilidade criadas';
    RAISE NOTICE '========================================';
    
    -- Estatísticas
    RAISE NOTICE 'Tenants totais: %', (SELECT COUNT(*) FROM public.tenants);
    RAISE NOTICE 'Tenants tipo gabinete: %', (SELECT COUNT(*) FROM public.tenants WHERE type = 'gabinete');
    RAISE NOTICE 'Tenants tipo organization: %', (SELECT COUNT(*) FROM public.tenants WHERE type = 'organization');
    RAISE NOTICE 'Profiles com tenant_id: %', (SELECT COUNT(*) FROM public.profiles WHERE tenant_id IS NOT NULL);
    RAISE NOTICE '========================================';
END $$;
