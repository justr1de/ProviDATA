-- =====================================================
-- SCRIPT COMPLETO E PRONTO PARA EXECUTAR
-- Configurar Thiago Tezzari como Admin do Gabinete
-- =====================================================
-- User ID: 44d60692-ff87-48fc-3a9a-dbd1829b48aa
-- Organization ID: 223c9f14-4961-43b4-a9d9-eeb00f1002cd
-- =====================================================

INSERT INTO public.profiles (id, email, full_name, role, organization_id, onboarding_completed, metadata)
VALUES (
    '44d60692-ff87-48fc-3a9a-dbd1829b48aa'::uuid,
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
    p.onboarding_completed,
    p.created_at
FROM public.profiles p
LEFT JOIN public.organizations o ON o.id = p.organization_id
WHERE p.email = 'gab.thiagotezzari@gmail.com';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- id: 44d60692-ff87-48fc-3a9a-dbd1829b48aa
-- email: gab.thiagotezzari@gmail.com
-- full_name: Thiago Tezzari
-- role: admin
-- organization_name: Gabinete do Vereador Thiago Tezzari
-- organization_slug: vereador-thiago-tezzari
-- onboarding_completed: true
-- =====================================================

-- PRONTO! Agora o Vereador Thiago Tezzari pode fazer login com:
-- Email: gab.thiagotezzari@gmail.com
-- Senha: (a senha que você definiu ao criar o usuário)
