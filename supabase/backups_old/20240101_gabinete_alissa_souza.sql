-- =====================================================
-- CRIAR GABINETE DA VEREADORA ALISSA SOUZA
-- Email: aliissasouzaa@gmail.com
-- Senha: L1ssa@2026
-- =====================================================

-- PASSO 1: Criar organização do gabinete
INSERT INTO public.organizations (name, slug, type, settings)
VALUES (
    'Gabinete da Vereadora Alissa Souza',
    'vereadora-alissa-souza',
    'municipal',
    jsonb_build_object(
        'parlamentar_name', 'Alissa Souza',
        'cargo', 'Vereadora',
        'partido', 'A definir',
        'municipio', 'A definir',
        'uf', 'A definir',
        'description', 'Gabinete da Vereadora Alissa Souza',
        'features', jsonb_build_object(
            'providencias', true,
            'cidadaos', true,
            'relatorios', true,
            'mapa_calor', true,
            'notificacoes', true
        )
    )
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    settings = EXCLUDED.settings
RETURNING id, name, slug;

-- =====================================================
-- INSTRUÇÕES PARA COMPLETAR A CONFIGURAÇÃO:
-- =====================================================

/*
AGORA FAÇA NO SUPABASE DASHBOARD:

1. Vá em: Authentication > Users > Add User
2. Preencha:
   - Email: aliissasouzaa@gmail.com
   - Password: L1ssa@2026
   - Marque: "Auto Confirm User"
3. Clique em "Create User"
4. COPIE O USER ID gerado

5. Execute as queries abaixo substituindo os IDs:
*/

-- Buscar ID da organização criada
SELECT id, name, slug 
FROM public.organizations 
WHERE slug = 'vereadora-alissa-souza';

-- Criar convite (substitua ORG_ID_AQUI pelo ID acima)
-- INSERT INTO public.invites (email, role, organization_id, token, status, expires_at)
-- VALUES (
--     'aliissasouzaa@gmail.com',
--     'admin',
--     'ORG_ID_AQUI'::uuid,
--     encode(gen_random_bytes(32), 'hex'),
--     'pending',
--     NOW() + INTERVAL '30 days'
-- )
-- RETURNING id, token, email, role;

-- Aceitar convite (substitua TOKEN e USER_ID pelos valores corretos)
-- SELECT public.accept_invite('TOKEN_AQUI', 'USER_ID_AQUI'::uuid);

-- Verificar perfil criado
-- SELECT 
--     p.id, p.email, p.full_name, p.role,
--     o.name as organization_name,
--     p.onboarding_completed
-- FROM public.profiles p
-- LEFT JOIN public.organizations o ON o.id = p.organization_id
-- WHERE p.email = 'aliissasouzaa@gmail.com';
