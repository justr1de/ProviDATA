-- =====================================================
-- CRIAR FUNÇÃO accept_invite E ACEITAR CONVITE
-- =====================================================

-- PASSO 1: Criar função para aceitar convite
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

    -- Se não atualizou nenhuma linha, inserir novo perfil
    IF NOT FOUND THEN
        INSERT INTO public.profiles (id, email, role, organization_id, onboarding_completed)
        VALUES (
            user_id,
            invite_record.email,
            invite_record.role,
            invite_record.organization_id,
            true
        );
    END IF;

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

-- PASSO 2: Aceitar convite do Thiago Tezzari
SELECT public.accept_invite(
    'c10ed0efed16e0249bda42017f29ba4a29590323a7ebcd20d51b2865f4042e08',
    '49d00592-ff87-4bfc-b90a-6bd1929b48aa'::uuid
);

-- PASSO 3: Verificar resultado
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    o.name as organization_name,
    o.slug as organization_slug,
    p.onboarding_completed
FROM public.profiles p
LEFT JOIN public.organizations o ON o.id = p.organization_id
WHERE p.id = '49d00592-ff87-4bfc-b90a-6bd1929b48aa';

-- ✅ PRONTO! Login disponível com gab.thiagotezzari@gmail.com
