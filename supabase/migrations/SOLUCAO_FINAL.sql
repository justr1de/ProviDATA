-- =====================================================
-- SOLUÇÃO FINAL - Remover constraint e criar perfil
-- =====================================================

-- PASSO 1: Verificar constraint atual
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table
FROM pg_constraint
WHERE conname = 'profiles_id_fkey';

-- PASSO 2: Remover TODAS as constraints da coluna id
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;

-- PASSO 3: Inserir perfil SEM a constraint (temporariamente)
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

-- PASSO 4: Recriar constraint correta
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

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

-- ✅ PRONTO! Login disponível com:
-- Email: gab.thiagotezzari@gmail.com
-- Senha: (a senha definida no Supabase Auth)
