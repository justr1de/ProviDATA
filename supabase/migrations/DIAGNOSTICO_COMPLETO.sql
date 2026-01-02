-- =====================================================
-- DIAGNÓSTICO COMPLETO DO PROBLEMA
-- =====================================================

-- 1. Verificar se existe tabela public.users
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
) as public_users_exists;

-- 2. Verificar constraint atual
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'profiles'
    AND kcu.column_name = 'id';

-- 3. Verificar se o usuário existe em auth.users
SELECT
    'auth.users' as tabela,
    id::text as id,
    email
FROM auth.users
WHERE id = '49d00592-ff87-4bfc-b90a-6bd1929b48aa';

-- 4. Verificar se existe tabela public.users e o usuário nela
SELECT
    'public.users' as tabela,
    id::text as id,
    email
FROM public.users
WHERE id::text = '49d00592-ff87-4bfc-b90a-6bd1929b48aa';

-- =====================================================
-- EXECUTE ESTE SCRIPT E ME ENVIE OS RESULTADOS
-- =====================================================
