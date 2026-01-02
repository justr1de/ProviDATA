-- =====================================================
-- SCRIPT PRONTO PARA EXECUTAR
-- Configurar Thiago Tezzari como Admin do Gabinete
-- =====================================================

-- PASSO 1: Buscar ID da organização
SELECT id, name, slug 
FROM public.organizations 
WHERE slug = 'vereador-thiago-tezzari';

-- COPIE O ID QUE APARECER ACIMA E SUBSTITUA NA LINHA 18 ABAIXO
-- Exemplo: se aparecer "a1b2c3d4-1234-5678-90ab-cdef12345678"
-- Substitua 'ORG_ID_AQUI' por 'a1b2c3d4-1234-5678-90ab-cdef12345678'

-- PASSO 2: Configurar perfil como admin
INSERT INTO public.profiles (id, email, full_name, role, organization_id, onboarding_completed, metadata)
VALUES (
    '223c9f14-4961-43b4-a9d9-eeb00f1002cd'::uuid,
    'gab.thiagotezzari@gmail.com',
    'Thiago Tezzari',
    'admin',
    'ORG_ID_AQUI'::uuid,  -- ← SUBSTITUA AQUI pelo ID da organização que apareceu acima
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

-- PASSO 3: Verificar se funcionou
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    o.name as organization_name,
    o.slug as organization_slug,
    p.onboarding_completed,
    p.created_at
FROM public.profiles p
LEFT JOIN public.organizations o ON o.id = p.organization_id
WHERE p.email = 'gab.thiagotezzari@gmail.com';

-- Se aparecer os dados do Thiago Tezzari com organization_name preenchido, está pronto!
