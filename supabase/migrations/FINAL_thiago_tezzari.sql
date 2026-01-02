-- =====================================================
-- SCRIPT FINAL: Configurar Thiago Tezzari como Admin
-- User ID correto: 44d60692-ff87-48fc-3a9a-dbd1829b48aa
-- =====================================================

-- PASSO 1: Buscar ID da organização
SELECT id, name, slug 
FROM public.organizations 
WHERE slug = 'vereador-thiago-tezzari';

-- COPIE O ID DA ORGANIZAÇÃO QUE APARECER ACIMA
-- Exemplo: se aparecer "a1b2c3d4-1234-5678-90ab-cdef12345678"

-- PASSO 2: Configurar perfil como admin
-- SUBSTITUA 'ORG_ID_AQUI' na linha 21 pelo ID da organização copiado acima

INSERT INTO public.profiles (id, email, full_name, role, organization_id, onboarding_completed, metadata)
VALUES (
    '44d60692-ff87-48fc-3a9a-dbd1829b48aa'::uuid,
    'gab.thiagotezzari@gmail.com',
    'Thiago Tezzari',
    'admin',
    'ORG_ID_AQUI'::uuid,  -- ← SUBSTITUA AQUI pelo ID da organização
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

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- email: gab.thiagotezzari@gmail.com
-- full_name: Thiago Tezzari
-- role: admin
-- organization_name: Gabinete do Vereador Thiago Tezzari
-- organization_slug: vereador-thiago-tezzari
-- onboarding_completed: true
-- =====================================================
