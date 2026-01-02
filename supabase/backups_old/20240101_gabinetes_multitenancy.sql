-- =====================================================
-- Migration: Sistema de Gabinetes (Multi-tenancy) e Convites
-- Descrição: Implementa estrutura completa de gabinetes parlamentares
--            com isolamento de dados e sistema de convites
-- Data: 2024-01-01
-- =====================================================

-- =====================================================
-- 1. TABELA DE GABINETES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.gabinetes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    municipio TEXT NOT NULL,
    uf TEXT NOT NULL CHECK (LENGTH(uf) = 2),
    
    -- Informações adicionais do gabinete
    parlamentar_nome TEXT,
    parlamentar_cargo TEXT CHECK (parlamentar_cargo IN ('vereador', 'prefeito', 'deputado_estadual', 'deputado_federal', 'senador', 'governador')),
    partido TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    
    -- Configurações e metadados
    logo_url TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    ativo BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT gabinetes_nome_municipio_uf_unique UNIQUE (nome, municipio, uf)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_gabinetes_municipio ON public.gabinetes(municipio);
CREATE INDEX IF NOT EXISTS idx_gabinetes_uf ON public.gabinetes(uf);
CREATE INDEX IF NOT EXISTS idx_gabinetes_ativo ON public.gabinetes(ativo);
CREATE INDEX IF NOT EXISTS idx_gabinetes_created_at ON public.gabinetes(created_at);

-- Comentários
COMMENT ON TABLE public.gabinetes IS 'Gabinetes parlamentares - unidade de multi-tenancy do sistema';
COMMENT ON COLUMN public.gabinetes.nome IS 'Nome do gabinete (ex: Gabinete Vereador João Silva)';
COMMENT ON COLUMN public.gabinetes.municipio IS 'Município onde o gabinete atua';
COMMENT ON COLUMN public.gabinetes.uf IS 'Unidade Federativa (sigla com 2 caracteres)';
COMMENT ON COLUMN public.gabinetes.settings IS 'Configurações personalizadas do gabinete em formato JSON';

-- =====================================================
-- 2. ADICIONAR COLUNA gabinete_id NA TABELA profiles
-- =====================================================

-- Adicionar coluna se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'gabinete_id'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN gabinete_id UUID REFERENCES public.gabinetes(id) ON DELETE SET NULL;
        
        -- Criar índice
        CREATE INDEX idx_profiles_gabinete ON public.profiles(gabinete_id);
        
        -- Comentário
        COMMENT ON COLUMN public.profiles.gabinete_id IS 'Gabinete ao qual o usuário pertence (multi-tenancy)';
    END IF;
END $$;

-- =====================================================
-- 3. TABELA DE CONVITES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.convites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dados do convite
    email TEXT NOT NULL,
    gabinete_id UUID NOT NULL REFERENCES public.gabinetes(id) ON DELETE CASCADE,
    cargo TEXT NOT NULL CHECK (cargo IN ('admin', 'gestor', 'assessor', 'operador', 'visualizador')),
    
    -- Controle do convite
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'expirado', 'revogado')),
    
    -- Datas
    validade TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    aceito_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Rastreamento
    convidado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    aceito_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Metadados adicionais
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    CONSTRAINT convites_email_gabinete_unique UNIQUE (email, gabinete_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_convites_email ON public.convites(email);
CREATE INDEX IF NOT EXISTS idx_convites_token ON public.convites(token);
CREATE INDEX IF NOT EXISTS idx_convites_status ON public.convites(status);
CREATE INDEX IF NOT EXISTS idx_convites_gabinete ON public.convites(gabinete_id);
CREATE INDEX IF NOT EXISTS idx_convites_validade ON public.convites(validade);
CREATE INDEX IF NOT EXISTS idx_convites_convidado_por ON public.convites(convidado_por);

-- Comentários
COMMENT ON TABLE public.convites IS 'Convites para novos usuários se juntarem a gabinetes';
COMMENT ON COLUMN public.convites.email IS 'Email do usuário convidado';
COMMENT ON COLUMN public.convites.cargo IS 'Cargo/papel que o usuário terá no gabinete';
COMMENT ON COLUMN public.convites.token IS 'Token único e seguro para aceitar o convite';
COMMENT ON COLUMN public.convites.status IS 'Status do convite: pendente, aceito, expirado, revogado';
COMMENT ON COLUMN public.convites.validade IS 'Data de expiração do convite (padrão: 7 dias)';

-- =====================================================
-- 4. TRIGGERS PARA updated_at
-- =====================================================

-- Trigger para gabinetes
DROP TRIGGER IF EXISTS update_gabinetes_updated_at ON public.gabinetes;
CREATE TRIGGER update_gabinetes_updated_at
    BEFORE UPDATE ON public.gabinetes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para convites
DROP TRIGGER IF EXISTS update_convites_updated_at ON public.convites;
CREATE TRIGGER update_convites_updated_at
    BEFORE UPDATE ON public.convites
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) - GABINETES
-- =====================================================

ALTER TABLE public.gabinetes ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seu próprio gabinete
DROP POLICY IF EXISTS "Users can view own gabinete" ON public.gabinetes;
CREATE POLICY "Users can view own gabinete"
    ON public.gabinetes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gabinete_id = gabinetes.id
        )
    );

-- Admins podem atualizar seu gabinete
DROP POLICY IF EXISTS "Admins can update own gabinete" ON public.gabinetes;
CREATE POLICY "Admins can update own gabinete"
    ON public.gabinetes
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gabinete_id = gabinetes.id
            AND profiles.role IN ('admin', 'gestor')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gabinete_id = gabinetes.id
            AND profiles.role IN ('admin', 'gestor')
        )
    );

-- Super admins podem ver todos os gabinetes
DROP POLICY IF EXISTS "Super admins can view all gabinetes" ON public.gabinetes;
CREATE POLICY "Super admins can view all gabinetes"
    ON public.gabinetes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

-- Super admins podem criar gabinetes
DROP POLICY IF EXISTS "Super admins can create gabinetes" ON public.gabinetes;
CREATE POLICY "Super admins can create gabinetes"
    ON public.gabinetes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) - CONVITES
-- =====================================================

ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;

-- Admins e gestores podem ver convites do seu gabinete
DROP POLICY IF EXISTS "Admins can view gabinete convites" ON public.convites;
CREATE POLICY "Admins can view gabinete convites"
    ON public.convites
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gabinete_id = convites.gabinete_id
            AND profiles.role IN ('admin', 'gestor')
        )
    );

-- Admins e gestores podem criar convites para seu gabinete
DROP POLICY IF EXISTS "Admins can create convites" ON public.convites;
CREATE POLICY "Admins can create convites"
    ON public.convites
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gabinete_id = convites.gabinete_id
            AND profiles.role IN ('admin', 'gestor')
        )
    );

-- Admins e gestores podem atualizar convites do seu gabinete
DROP POLICY IF EXISTS "Admins can update gabinete convites" ON public.convites;
CREATE POLICY "Admins can update gabinete convites"
    ON public.convites
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gabinete_id = convites.gabinete_id
            AND profiles.role IN ('admin', 'gestor')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gabinete_id = convites.gabinete_id
            AND profiles.role IN ('admin', 'gestor')
        )
    );

-- Admins e gestores podem deletar convites do seu gabinete
DROP POLICY IF EXISTS "Admins can delete gabinete convites" ON public.convites;
CREATE POLICY "Admins can delete gabinete convites"
    ON public.convites
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gabinete_id = convites.gabinete_id
            AND profiles.role IN ('admin', 'gestor')
        )
    );

-- Qualquer pessoa pode ver convite válido pelo token (para aceitar)
DROP POLICY IF EXISTS "Anyone can view convite by token" ON public.convites;
CREATE POLICY "Anyone can view convite by token"
    ON public.convites
    FOR SELECT
    TO anon, authenticated
    USING (
        status = 'pendente'
        AND validade > NOW()
    );

-- =====================================================
-- 7. ATUALIZAR POLÍTICAS RLS DE PROFILES
-- =====================================================

-- Usuários do mesmo gabinete podem ver perfis uns dos outros
DROP POLICY IF EXISTS "Users can view same gabinete profiles" ON public.profiles;
CREATE POLICY "Users can view same gabinete profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles AS user_profile
            WHERE user_profile.id = auth.uid()
            AND user_profile.gabinete_id = profiles.gabinete_id
        )
    );

-- =====================================================
-- 8. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para expirar convites automaticamente
CREATE OR REPLACE FUNCTION public.expirar_convites_antigos()
RETURNS void AS $$
BEGIN
    UPDATE public.convites
    SET status = 'expirado'
    WHERE status = 'pendente'
    AND validade < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aceitar convite
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

-- Função para revogar convite
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

-- Função para obter estatísticas do gabinete
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

-- =====================================================
-- 9. COMENTÁRIOS FINAIS
-- =====================================================

COMMENT ON FUNCTION public.expirar_convites_antigos() IS 'Marca convites pendentes como expirados quando passam da validade';
COMMENT ON FUNCTION public.aceitar_convite(TEXT, UUID) IS 'Aceita um convite válido e associa o usuário ao gabinete';
COMMENT ON FUNCTION public.revogar_convite(UUID, UUID) IS 'Revoga um convite (apenas admins/gestores do gabinete)';
COMMENT ON FUNCTION public.obter_estatisticas_gabinete(UUID) IS 'Retorna estatísticas de usuários e convites do gabinete';

-- =====================================================
-- 10. DADOS INICIAIS (SEED) - OPCIONAL
-- =====================================================

-- Criar gabinete de exemplo (comentado - descomentar se necessário)
-- INSERT INTO public.gabinetes (nome, municipio, uf, parlamentar_nome, parlamentar_cargo, partido)
-- VALUES ('Gabinete Exemplo', 'São Paulo', 'SP', 'João Silva', 'vereador', 'PARTIDO')
-- ON CONFLICT (nome, municipio, uf) DO NOTHING;
