-- =====================================================
-- SOLUÇÃO SIMPLES: Usar o sistema de convites existente
-- =====================================================

-- Criar convite para Thiago Tezzari
INSERT INTO public.invites (
    email,
    role,
    organization_id,
    token,
    status,
    expires_at,
    metadata
)
VALUES (
    'gab.thiagotezzari@gmail.com',
    'admin',
    '223c9f14-4961-43b4-a9d9-eeb00f1002cd'::uuid,
    encode(gen_random_bytes(32), 'hex'),
    'pending',
    NOW() + INTERVAL '30 days',
    jsonb_build_object('created_for', 'Thiago Tezzari', 'is_initial_admin', true)
)
RETURNING id, token, email, role;

-- =====================================================
-- COPIE O TOKEN QUE APARECER ACIMA
-- =====================================================

-- Depois acesse no navegador:
-- https://SEU_DOMINIO/convite/TOKEN_AQUI

-- O Thiago Tezzari vai:
-- 1. Acessar o link do convite
-- 2. Fazer login com gab.thiagotezzari@gmail.com
-- 3. O sistema vai automaticamente configurar o perfil dele como admin
-- 4. Pronto! Ele terá acesso completo ao gabinete

-- =====================================================
-- OU ACEITAR O CONVITE VIA SQL (mais rápido):
-- =====================================================

-- Buscar o token do convite criado
SELECT id, token, email, role, organization_id
FROM public.invites
WHERE email = 'gab.thiagotezzari@gmail.com'
AND status = 'pending'
ORDER BY created_at DESC
LIMIT 1;

-- Depois execute (substitua o TOKEN):
-- SELECT public.accept_invite('TOKEN_AQUI', '49d00592-ff87-4bfc-b90a-6bd1929b48aa'::uuid);
