-- =====================================================
-- Tabela de Andamentos (Histórico/Timeline)
-- Registra todas as ações e atualizações das providências
-- =====================================================

-- Criar tabela de andamentos
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
        'reabertura'         -- Providência foi reaberta
    )),
    
    -- Descrição detalhada da ação
    descricao text NOT NULL,
    
    -- Mudança de status (se houver)
    status_anterior text,
    status_novo text,
    
    -- Quem realizou a ação
    usuario_id uuid REFERENCES auth.users(id),
    usuario_nome text,
    
    -- Metadados adicionais (JSON para flexibilidade)
    metadados jsonb DEFAULT '{}',
    
    -- Timestamps
    created_at timestamptz DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_andamentos_providencia_id ON public.andamentos(providencia_id);
CREATE INDEX IF NOT EXISTS idx_andamentos_gabinete_id ON public.andamentos(gabinete_id);
CREATE INDEX IF NOT EXISTS idx_andamentos_created_at ON public.andamentos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_andamentos_tipo_acao ON public.andamentos(tipo_acao);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.andamentos ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuários só podem ver andamentos do seu gabinete
CREATE POLICY "Usuários podem ver andamentos do seu gabinete" ON public.andamentos
    FOR SELECT
    USING (gabinete_id = get_user_tenant_id());

-- Política para INSERT: usuários só podem criar andamentos no seu gabinete
CREATE POLICY "Usuários podem criar andamentos no seu gabinete" ON public.andamentos
    FOR INSERT
    WITH CHECK (gabinete_id = get_user_tenant_id());

-- Política para UPDATE: usuários só podem atualizar andamentos do seu gabinete
CREATE POLICY "Usuários podem atualizar andamentos do seu gabinete" ON public.andamentos
    FOR UPDATE
    USING (gabinete_id = get_user_tenant_id());

-- Política para DELETE: usuários só podem deletar andamentos do seu gabinete
CREATE POLICY "Usuários podem deletar andamentos do seu gabinete" ON public.andamentos
    FOR DELETE
    USING (gabinete_id = get_user_tenant_id());

-- Comentários na tabela
COMMENT ON TABLE public.andamentos IS 'Histórico de ações e atualizações das providências';
COMMENT ON COLUMN public.andamentos.tipo_acao IS 'Tipo da ação: criacao, atualizacao, encaminhamento, resposta, documento, comentario, conclusao, reabertura';
COMMENT ON COLUMN public.andamentos.metadados IS 'Dados adicionais em formato JSON (ex: número do ofício, arquivo anexado, etc)';

-- =====================================================
-- Função para registrar andamento automaticamente
-- =====================================================

CREATE OR REPLACE FUNCTION public.registrar_andamento(
    p_providencia_id uuid,
    p_tipo_acao text,
    p_descricao text,
    p_status_anterior text DEFAULT NULL,
    p_status_novo text DEFAULT NULL,
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
        p_metadados
    )
    RETURNING id INTO v_andamento_id;
    
    RETURN v_andamento_id;
END;
$$;

-- Conceder permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION public.registrar_andamento TO authenticated;
