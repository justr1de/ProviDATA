-- =====================================================
-- CRIAR CONVITE PARA ALISSA SOUZA
-- Organization ID: a0cfa138-efc8-4373-91ef-ddd2958178a4
-- =====================================================

-- Criar convite
INSERT INTO public.invites (email, role, organization_id, token, status, expires_at)
VALUES (
    'aliissasouzaa@gmail.com',
    'admin',
    'a0cfa138-efc8-4373-91ef-ddd2958178a4'::uuid,
    encode(gen_random_bytes(32), 'hex'),
    'pending',
    NOW() + INTERVAL '30 days'
)
RETURNING id, token, email, role;

-- COPIE O TOKEN QUE APARECER ACIMA
-- Depois me envie o TOKEN e o USER ID que você criou no Supabase Auth
