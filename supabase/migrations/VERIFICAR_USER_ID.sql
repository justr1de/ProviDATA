-- =====================================================
-- VERIFICAR USER ID CORRETO
-- =====================================================

-- Buscar usuário pelo email no auth.users
SELECT 
    id as user_id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'gab.thiagotezzari@gmail.com';

-- COPIE O "user_id" QUE APARECER ACIMA
-- Este é o ID correto que deve ser usado

-- =====================================================
-- VERIFICAR TODOS OS USUÁRIOS (se não encontrar acima)
-- =====================================================

SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Se o email gab.thiagotezzari@gmail.com não aparecer na primeira query,
-- procure na lista acima e me envie o ID correto
