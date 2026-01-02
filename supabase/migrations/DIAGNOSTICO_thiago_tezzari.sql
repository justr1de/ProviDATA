-- =====================================================
-- DIAGNÓSTICO: Verificar usuário Thiago Tezzari
-- =====================================================

-- PASSO 1: Verificar se o usuário existe no auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users
WHERE id = '223c9f14-4961-43b4-a9d9-eeb00f1002cd';

-- Se retornar vazio, o usuário NÃO foi criado corretamente
-- Se retornar dados, o usuário existe

-- PASSO 2: Verificar todos os usuários com email do Thiago
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
WHERE email = 'gab.thiagotezzari@gmail.com';

-- PASSO 3: Verificar se já existe perfil
SELECT 
    id,
    email,
    full_name,
    role,
    organization_id
FROM public.profiles
WHERE email = 'gab.thiagotezzari@gmail.com';

-- =====================================================
-- SOLUÇÃO 1: Se o usuário não existe no auth.users
-- =====================================================
/*
Você precisa criar o usuário primeiro no Supabase Dashboard:

1. Vá em: Authentication > Users > Add User
2. Email: gab.thiagotezzari@gmail.com
3. Password: (defina uma senha)
4. Marque: Auto Confirm User
5. Clique em Create User
6. COPIE O NOVO USER ID que será gerado

Depois execute o script EXECUTAR_AGORA_thiago_tezzari.sql com o novo ID
*/

-- =====================================================
-- SOLUÇÃO 2: Se o usuário existe mas com ID diferente
-- =====================================================
/*
Se o PASSO 2 acima retornou um usuário com ID diferente,
use o ID correto que apareceu na query.

Por exemplo, se apareceu:
id: 12345678-abcd-efgh-ijkl-mnopqrstuvwx

Execute:
*/

-- Buscar ID da organização
SELECT id FROM public.organizations WHERE slug = 'vereador-thiago-tezzari';

-- Configurar perfil (substitua ORG_ID_AQUI e USER_ID_CORRETO)
-- INSERT INTO public.profiles (id, email, full_name, role, organization_id, onboarding_completed, metadata)
-- VALUES (
--     'USER_ID_CORRETO'::uuid,  -- ← Use o ID que apareceu no PASSO 2
--     'gab.thiagotezzari@gmail.com',
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
