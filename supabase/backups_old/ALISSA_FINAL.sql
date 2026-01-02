-- =====================================================
-- ACEITAR CONVITE E CONFIGURAR PERFIL ALISSA SOUZA
-- Token: 612a4e609cb3499b43147a185079d285a3b4ab08f07bcc1a4e2e5941a619c9ec
-- User ID: 5ad5aa2d-ee43-41a5-9ea7-1c51fb137d42
-- =====================================================

SELECT public.accept_invite(
    '612a4e609cb3499b43147a185079d285a3b4ab08f07bcc1a4e2e5941a619c9ec',
    '5ad5aa2d-ee43-41a5-9ea7-1c51fb137d42'::uuid
);

-- Verificar perfil criado
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
WHERE p.email = 'aliissasouzaa@gmail.com';

-- ✅ PRONTO! Login disponível com:
-- Email: aliissasouzaa@gmail.com
-- Senha: L1ssa@2026
