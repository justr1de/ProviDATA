-- =====================================================
-- Sistema Completo de Andamentos com Anexos e Notificações
-- ProviDATA - Gestão de Providências Parlamentares
-- =====================================================

-- =====================================================
-- 1. TABELA DE ANDAMENTOS (Histórico/Timeline)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.andamentos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relacionamentos
    providencia_id uuid NOT NULL REFERENCES public.providencias(id) ON DELETE CASCADE,
    gabinete_id uuid NOT NULL REFERENCES public.gabinetes(id) ON DELETE CASCADE,
    
    -- Tipo de ação realizada
    tipo_acao text NOT NULL CHECK (tipo_acao IN (
        'criacao',           -- Providência foi criada
        'atualizacao',       -- Dados foram atualizados
        'encaminhamento',    -- Enviado para órgão
        'resposta',          -- Resposta recebida do órgão
        'documento',         -- Documento anexado
        'comentario',        -- Comentário/observação adicionado
        'conclusao',         -- Providência foi concluída
        'reabertura',        -- Providência foi reaberta
        'notificacao'        -- Notificação enviada ao cidadão
    )),
    
    -- Descrição detalhada da ação
    descricao text NOT NULL,
    
    -- Mudança de status (se houver)
    status_anterior text,
    status_novo text,
    
    -- Quem realizou a ação
    usuario_id uuid REFERENCES auth.users(id),
    usuario_nome text,
    
    -- Visibilidade para o cidadão
    visivel_cidadao boolean DEFAULT true,
    
    -- Metadados adicionais (JSON para flexibilidade)
    metadados jsonb DEFAULT '{}',
    
    -- Timestamps
    created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_andamentos_providencia_id ON public.andamentos(providencia_id);
CREATE INDEX IF NOT EXISTS idx_andamentos_gabinete_id ON public.andamentos(gabinete_id);
CREATE INDEX IF NOT EXISTS idx_andamentos_created_at ON public.andamentos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_andamentos_tipo_acao ON public.andamentos(tipo_acao);
CREATE INDEX IF NOT EXISTS idx_andamentos_visivel_cidadao ON public.andamentos(visivel_cidadao);

-- =====================================================
-- 2. TABELA DE ANEXOS DOS ANDAMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.andamentos_anexos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relacionamentos
    andamento_id uuid NOT NULL REFERENCES public.andamentos(id) ON DELETE CASCADE,
    gabinete_id uuid NOT NULL REFERENCES public.gabinetes(id) ON DELETE CASCADE,
    
    -- Informações do arquivo
    nome_arquivo text NOT NULL,
    nome_original text NOT NULL,
    tipo_arquivo text NOT NULL,  -- MIME type
    tamanho bigint NOT NULL,     -- Em bytes
    url_arquivo text NOT NULL,   -- URL no storage
    
    -- Metadados
    descricao text,
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    uploaded_by uuid REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_andamentos_anexos_andamento_id ON public.andamentos_anexos(andamento_id);
CREATE INDEX IF NOT EXISTS idx_andamentos_anexos_gabinete_id ON public.andamentos_anexos(gabinete_id);

-- =====================================================
-- 3. TABELA DE NOTIFICAÇÕES ENVIADAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notificacoes_cidadao (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relacionamentos
    providencia_id uuid NOT NULL REFERENCES public.providencias(id) ON DELETE CASCADE,
    andamento_id uuid REFERENCES public.andamentos(id) ON DELETE SET NULL,
    cidadao_id uuid NOT NULL REFERENCES public.cidadaos(id) ON DELETE CASCADE,
    gabinete_id uuid NOT NULL REFERENCES public.gabinetes(id) ON DELETE CASCADE,
    
    -- Tipo de notificação
    tipo_notificacao text NOT NULL CHECK (tipo_notificacao IN (
        'email',
        'sms',
        'whatsapp',
        'push'
    )),
    
    -- Conteúdo
    assunto text,
    mensagem text NOT NULL,
    
    -- Status do envio
    status text NOT NULL DEFAULT 'pendente' CHECK (status IN (
        'pendente',
        'enviado',
        'entregue',
        'lido',
        'erro'
    )),
    
    -- Detalhes do envio
    destinatario text NOT NULL,  -- Email ou telefone
    erro_mensagem text,
    enviado_em timestamptz,
    entregue_em timestamptz,
    lido_em timestamptz,
    
    -- Metadados
    metadados jsonb DEFAULT '{}',
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    enviado_por uuid REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notificacoes_providencia_id ON public.notificacoes_cidadao(providencia_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_cidadao_id ON public.notificacoes_cidadao(cidadao_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_gabinete_id ON public.notificacoes_cidadao(gabinete_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_status ON public.notificacoes_cidadao(status);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON public.notificacoes_cidadao(created_at DESC);

-- =====================================================
-- 4. TABELA DE TOKENS DE ACESSO PÚBLICO (para cidadãos)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.providencias_tokens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relacionamentos
    providencia_id uuid NOT NULL REFERENCES public.providencias(id) ON DELETE CASCADE,
    cidadao_id uuid NOT NULL REFERENCES public.cidadaos(id) ON DELETE CASCADE,
    
    -- Token único para acesso público
    token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    
    -- Validade
    ativo boolean DEFAULT true,
    expira_em timestamptz DEFAULT (now() + interval '1 year'),
    
    -- Rastreamento de uso
    ultimo_acesso timestamptz,
    total_acessos integer DEFAULT 0,
    
    -- Timestamps
    created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_providencias_tokens_token ON public.providencias_tokens(token);
CREATE INDEX IF NOT EXISTS idx_providencias_tokens_providencia_id ON public.providencias_tokens(providencia_id);
CREATE INDEX IF NOT EXISTS idx_providencias_tokens_cidadao_id ON public.providencias_tokens(cidadao_id);

-- =====================================================
-- 5. HABILITAR RLS (Row Level Security)
-- =====================================================

ALTER TABLE public.andamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.andamentos_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_cidadao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providencias_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas para ANDAMENTOS
CREATE POLICY "Usuários podem ver andamentos do seu gabinete" ON public.andamentos
    FOR SELECT USING (gabinete_id = get_user_tenant_id());

CREATE POLICY "Usuários podem criar andamentos no seu gabinete" ON public.andamentos
    FOR INSERT WITH CHECK (gabinete_id = get_user_tenant_id());

CREATE POLICY "Usuários podem atualizar andamentos do seu gabinete" ON public.andamentos
    FOR UPDATE USING (gabinete_id = get_user_tenant_id());

CREATE POLICY "Usuários podem deletar andamentos do seu gabinete" ON public.andamentos
    FOR DELETE USING (gabinete_id = get_user_tenant_id());

-- Políticas para ANEXOS
CREATE POLICY "Usuários podem ver anexos do seu gabinete" ON public.andamentos_anexos
    FOR SELECT USING (gabinete_id = get_user_tenant_id());

CREATE POLICY "Usuários podem criar anexos no seu gabinete" ON public.andamentos_anexos
    FOR INSERT WITH CHECK (gabinete_id = get_user_tenant_id());

CREATE POLICY "Usuários podem deletar anexos do seu gabinete" ON public.andamentos_anexos
    FOR DELETE USING (gabinete_id = get_user_tenant_id());

-- Políticas para NOTIFICAÇÕES
CREATE POLICY "Usuários podem ver notificações do seu gabinete" ON public.notificacoes_cidadao
    FOR SELECT USING (gabinete_id = get_user_tenant_id());

CREATE POLICY "Usuários podem criar notificações no seu gabinete" ON public.notificacoes_cidadao
    FOR INSERT WITH CHECK (gabinete_id = get_user_tenant_id());

CREATE POLICY "Usuários podem atualizar notificações do seu gabinete" ON public.notificacoes_cidadao
    FOR UPDATE USING (gabinete_id = get_user_tenant_id());

-- Políticas para TOKENS (acesso público)
CREATE POLICY "Usuários podem ver tokens do seu gabinete" ON public.providencias_tokens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.providencias p 
            WHERE p.id = providencia_id 
            AND p.gabinete_id = get_user_tenant_id()
        )
    );

CREATE POLICY "Usuários podem criar tokens para providências do seu gabinete" ON public.providencias_tokens
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.providencias p 
            WHERE p.id = providencia_id 
            AND p.gabinete_id = get_user_tenant_id()
        )
    );

-- Política para acesso público via token (sem autenticação)
CREATE POLICY "Acesso público via token válido" ON public.providencias_tokens
    FOR SELECT USING (ativo = true AND expira_em > now());

-- =====================================================
-- 6. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para registrar andamento com notificação opcional
CREATE OR REPLACE FUNCTION public.registrar_andamento(
    p_providencia_id uuid,
    p_tipo_acao text,
    p_descricao text,
    p_status_anterior text DEFAULT NULL,
    p_status_novo text DEFAULT NULL,
    p_visivel_cidadao boolean DEFAULT true,
    p_notificar_cidadao boolean DEFAULT false,
    p_metadados jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_gabinete_id uuid;
    v_usuario_id uuid;
    v_usuario_nome text;
    v_andamento_id uuid;
    v_cidadao record;
BEGIN
    -- Obter gabinete_id da providência
    SELECT gabinete_id INTO v_gabinete_id
    FROM public.providencias
    WHERE id = p_providencia_id;
    
    -- Obter dados do usuário atual
    v_usuario_id := auth.uid();
    
    SELECT nome INTO v_usuario_nome
    FROM public.profiles
    WHERE id = v_usuario_id;
    
    -- Inserir andamento
    INSERT INTO public.andamentos (
        providencia_id,
        gabinete_id,
        tipo_acao,
        descricao,
        status_anterior,
        status_novo,
        usuario_id,
        usuario_nome,
        visivel_cidadao,
        metadados
    ) VALUES (
        p_providencia_id,
        v_gabinete_id,
        p_tipo_acao,
        p_descricao,
        p_status_anterior,
        p_status_novo,
        v_usuario_id,
        v_usuario_nome,
        p_visivel_cidadao,
        p_metadados
    )
    RETURNING id INTO v_andamento_id;
    
    RETURN v_andamento_id;
END;
$$;

-- Função para gerar token de acesso público para cidadão
CREATE OR REPLACE FUNCTION public.gerar_token_acesso(
    p_providencia_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cidadao_id uuid;
    v_token text;
BEGIN
    -- Obter cidadão da providência
    SELECT cidadao_id INTO v_cidadao_id
    FROM public.providencias
    WHERE id = p_providencia_id;
    
    -- Verificar se já existe token ativo
    SELECT token INTO v_token
    FROM public.providencias_tokens
    WHERE providencia_id = p_providencia_id
    AND cidadao_id = v_cidadao_id
    AND ativo = true
    AND expira_em > now();
    
    -- Se não existe, criar novo
    IF v_token IS NULL THEN
        INSERT INTO public.providencias_tokens (
            providencia_id,
            cidadao_id
        ) VALUES (
            p_providencia_id,
            v_cidadao_id
        )
        RETURNING token INTO v_token;
    END IF;
    
    RETURN v_token;
END;
$$;

-- Função para buscar providência por token (acesso público)
CREATE OR REPLACE FUNCTION public.buscar_providencia_por_token(
    p_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
    v_token_record record;
BEGIN
    -- Buscar e validar token
    SELECT * INTO v_token_record
    FROM public.providencias_tokens
    WHERE token = p_token
    AND ativo = true
    AND expira_em > now();
    
    IF v_token_record IS NULL THEN
        RETURN jsonb_build_object('error', 'Token inválido ou expirado');
    END IF;
    
    -- Atualizar estatísticas de acesso
    UPDATE public.providencias_tokens
    SET ultimo_acesso = now(),
        total_acessos = total_acessos + 1
    WHERE id = v_token_record.id;
    
    -- Buscar dados da providência
    SELECT jsonb_build_object(
        'providencia', jsonb_build_object(
            'id', p.id,
            'protocolo', p.protocolo,
            'titulo', p.titulo,
            'descricao', p.descricao,
            'status', p.status,
            'prioridade', p.prioridade,
            'created_at', p.created_at,
            'updated_at', p.updated_at
        ),
        'cidadao', jsonb_build_object(
            'nome', c.nome
        ),
        'orgao', jsonb_build_object(
            'nome', o.nome
        ),
        'categoria', jsonb_build_object(
            'nome', cat.nome
        ),
        'andamentos', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', a.id,
                    'tipo_acao', a.tipo_acao,
                    'descricao', a.descricao,
                    'status_anterior', a.status_anterior,
                    'status_novo', a.status_novo,
                    'created_at', a.created_at,
                    'anexos', (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'nome', ax.nome_original,
                                'tipo', ax.tipo_arquivo,
                                'url', ax.url_arquivo
                            )
                        )
                        FROM public.andamentos_anexos ax
                        WHERE ax.andamento_id = a.id
                    )
                )
                ORDER BY a.created_at DESC
            )
            FROM public.andamentos a
            WHERE a.providencia_id = p.id
            AND a.visivel_cidadao = true
        )
    ) INTO v_result
    FROM public.providencias p
    LEFT JOIN public.cidadaos c ON c.id = p.cidadao_id
    LEFT JOIN public.orgaos o ON o.id = p.orgao_id
    LEFT JOIN public.categorias cat ON cat.id = p.categoria_id
    WHERE p.id = v_token_record.providencia_id;
    
    RETURN v_result;
END;
$$;

-- Conceder permissões
GRANT EXECUTE ON FUNCTION public.registrar_andamento TO authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_token_acesso TO authenticated;
GRANT EXECUTE ON FUNCTION public.buscar_providencia_por_token TO anon, authenticated;

-- =====================================================
-- 7. COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE public.andamentos IS 'Histórico de ações e atualizações das providências';
COMMENT ON TABLE public.andamentos_anexos IS 'Documentos anexados aos andamentos';
COMMENT ON TABLE public.notificacoes_cidadao IS 'Registro de notificações enviadas aos cidadãos';
COMMENT ON TABLE public.providencias_tokens IS 'Tokens de acesso público para cidadãos acompanharem providências';

COMMENT ON COLUMN public.andamentos.visivel_cidadao IS 'Se true, o andamento será visível no portal público do cidadão';
COMMENT ON COLUMN public.notificacoes_cidadao.tipo_notificacao IS 'Canal de envio: email, sms, whatsapp ou push';
COMMENT ON COLUMN public.providencias_tokens.token IS 'Token único para acesso público sem autenticação';
