-- =====================================================
-- SOLUÇÃO DEFINITIVA
-- O problema: constraint aponta para public.users
-- A solução: Inserir o usuário em public.users primeiro
-- =====================================================

-- PASSO 1: Inserir usuário em public.users (se não existir)
INSERT INTO public.users (id, email, nome, tenant_id, role, ativo, created_at, updated_at)
SELECT 
    '49d00592-ff87-4bfc-b90a-6bd1929b48aa'::uuid,
    'gab.thiagotezzari@gmail.com',
    'Thiago Tezzari',
    '223c9f14-4961-43b4-a9d9-eeb00f1002cd'::uuid,
    'admin',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE id = '49d00592-ff87-4bfc-b90a-6bd1929b48aa'
);

-- PASSO 2: Inserir perfil em public.profiles
INSERT INTO public.profiles (id, email, full_name, role, organization_id, onboarding_completed, metadata)
VALUES (
    '49d00592-ff87-4bfc-b90a-6bd1929b48aa'::uuid,
    'gab.thiagotezzari@gmail.com',
    'Thiago Tezzari',
    'admin',
    '223c9f14-4961-43b4-a9d9-eeb00f1002cd'::uuid,
    true,
    jsonb_build_object('is_gabinete_admin', true, 'setup_date', NOW())
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    organization_id = EXCLUDED.organization_id,
    full_name = EXCLUDED.full_name,
    onboarding_completed = true,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- PASSO 3: Verificar resultado
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    o.name as organization_name,
    p.onboarding_completed
FROM public.profiles p
LEFT JOIN public.organizations o ON o.id = p.organization_id
WHERE p.email = 'gab.thiagotezzari@gmail.com';

-- ✅ PRONTO! Login disponível com:
-- Email: gab.thiagotezzari@gmail.com
-- Senha: (definida no Supabase Auth)
