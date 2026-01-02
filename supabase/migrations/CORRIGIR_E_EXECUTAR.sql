-- =====================================================
-- CORRIGIR CONSTRAINT E CRIAR PERFIL
-- =====================================================

-- PASSO 1: Verificar se o usuário existe no auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE id = '49d00592-ff87-4bfc-b90a-6bd1929b48aa';

-- Se retornou o usuário acima, continue

-- PASSO 2: Remover constraint antiga (se existir)
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- PASSO 3: Recriar constraint correta apontando para auth.users
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- PASSO 4: Criar perfil do Thiago Tezzari
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

-- PASSO 5: Verificar resultado
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

-- ✅ Se aparecer os dados do Thiago Tezzari, está pronto!
-- Ele pode fazer login com: gab.thiagotezzari@gmail.com
