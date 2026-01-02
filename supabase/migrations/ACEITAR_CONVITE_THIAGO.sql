-- =====================================================
-- ACEITAR CONVITE E CONFIGURAR PERFIL
-- Token: c10ed0efed16e0249bda42017f29ba4a29590323a7ebcd20d51b2865f4042e08
-- User ID: 49d00592-ff87-4bfc-b90a-6bd1929b48aa
-- =====================================================

SELECT public.accept_invite(
    'c10ed0efed16e0249bda42017f29ba4a29590323a7ebcd20d51b2865f4042e08',
    '49d00592-ff87-4bfc-b90a-6bd1929b48aa'::uuid
);

-- =====================================================
-- VERIFICAR SE FUNCIONOU
-- =====================================================

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
WHERE p.email = 'gab.thiagotezzari@gmail.com';

-- ✅ Se aparecer os dados do Thiago Tezzari com role='admin', está pronto!
-- Ele pode fazer login com: gab.thiagotezzari@gmail.com
