-- Migration Simplificada: Criar Gabinete do Vereador Thiago Tezzari
-- Execute este script completo no SQL Editor do Supabase

-- =====================================================
-- 1. CRIAR ORGANIZAÇÃO DO GABINETE
-- =====================================================
DO $$
DECLARE
    org_id UUID;
BEGIN
    -- Inserir organização
    INSERT INTO public.organizations (id, name, slug, type, settings)
    VALUES (
        gen_random_uuid(),
        'Gabinete do Vereador Thiago Tezzari',
        'vereador-thiago-tezzari',
        'municipal',
        jsonb_build_object(
            'parlamentar_name', 'Thiago Tezzari',
            'cargo', 'Vereador',
            'partido', 'A definir',
            'municipio', 'A definir',
            'uf', 'A definir',
            'description', 'Gabinete do Vereador Thiago Tezzari',
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
        settings = EXCLUDED.settings,
        updated_at = NOW()
    RETURNING id INTO org_id;

    RAISE NOTICE 'Organização criada com ID: %', org_id;
    RAISE NOTICE 'Slug: vereador-thiago-tezzari';
END $$;

-- =====================================================
-- 2. VERIFICAR ORGANIZAÇÃO CRIADA
-- =====================================================
SELECT 
    id,
    name,
    slug,
    type,
    settings,
    created_at
FROM public.organizations
WHERE slug = 'vereador-thiago-tezzari';

-- =====================================================
-- INSTRUÇÕES PARA CRIAR USUÁRIO ADMIN
-- =====================================================

/*
PASSO A PASSO PARA CRIAR O ADMIN DO GABINETE:

1. CRIAR USUÁRIO NO SUPABASE AUTH:
   - Vá em: Authentication > Users > Add User
   - Email: thiago.tezzari@gabinete.com.br (ou outro email)
   - Password: Defina uma senha segura
   - Marque "Auto Confirm User"
   - Clique em "Create User"
   - COPIE O USER ID gerado

2. BUSCAR ID DA ORGANIZAÇÃO:
   Execute esta query:
*/

SELECT id, name, slug 
FROM public.organizations 
WHERE slug = 'vereador-thiago-tezzari';

/*
3. CONFIGURAR PERFIL COMO ADMIN:
   Substitua USER_ID_AQUI e ORG_ID_AQUI pelos valores copiados:
*/

-- EXEMPLO (substitua os IDs):
-- INSERT INTO public.profiles (id, email, full_name, role, organization_id, onboarding_completed, metadata)
-- VALUES (
--     'USER_ID_AQUI'::uuid,
--     'thiago.tezzari@gabinete.com.br',
--     'Thiago Tezzari',
--     'admin',
--     'ORG_ID_AQUI'::uuid,
--     true,
--     jsonb_build_object('is_gabinete_admin', true, 'setup_date', NOW())
-- )
-- ON CONFLICT (id) DO UPDATE SET
--     role = 'admin',
--     organization_id = EXCLUDED.organization_id,
--     full_name = EXCLUDED.full_name,
--     onboarding_completed = true,
--     metadata = EXCLUDED.metadata,
--     updated_at = NOW();

/*
4. VERIFICAR CONFIGURAÇÃO:
   Execute esta query para confirmar:
*/

SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    o.name as organization_name,
    o.slug as organization_slug,
    p.onboarding_completed,
    p.metadata
FROM public.profiles p
LEFT JOIN public.organizations o ON o.id = p.organization_id
WHERE p.email = 'thiago.tezzari@gabinete.com.br';

/*
5. ATUALIZAR INFORMAÇÕES DO GABINETE (OPCIONAL):
   Após criar o admin, você pode atualizar as informações:
*/

-- UPDATE public.organizations
-- SET settings = settings || jsonb_build_object(
--     'partido', 'PARTIDO_AQUI',
--     'municipio', 'CIDADE_AQUI',
--     'uf', 'RS',
--     'telefone', '(XX) XXXXX-XXXX',
--     'email_contato', 'contato@gabinete.com.br'
-- )
-- WHERE slug = 'vereador-thiago-tezzari';

/*
RESUMO DOS COMANDOS:
====================

1. Execute esta migration completa primeiro
2. Crie o usuário no Supabase Auth Dashboard
3. Copie o User ID e Organization ID
4. Execute o INSERT INTO profiles (descomente e substitua os IDs)
5. Verifique com o SELECT final

PRONTO! O gabinete estará configurado e o admin poderá fazer login.
*/
