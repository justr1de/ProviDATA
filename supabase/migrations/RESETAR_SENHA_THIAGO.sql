-- =====================================================
-- RESETAR SENHA E CONFIRMAR EMAIL DO THIAGO TEZZARI
-- =====================================================

-- OPÇÃO 1: Confirmar email (caso não esteja confirmado)
UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    confirmation_token = NULL
WHERE id = '49d00592-ff87-4bfc-b90a-6bd1929b48aa';

-- OPÇÃO 2: Verificar status do usuário
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    confirmation_token
FROM auth.users
WHERE id = '49d00592-ff87-4bfc-b90a-6bd1929b48aa';

-- =====================================================
-- PARA RESETAR A SENHA:
-- =====================================================
-- Vá no Supabase Dashboard:
-- 1. Authentication > Users
-- 2. Encontre o usuário gab.thiagotezzari@gmail.com
-- 3. Clique nos 3 pontinhos (...)
-- 4. Clique em "Send password recovery"
-- OU
-- 5. Clique em "Reset password" e defina uma nova senha

-- =====================================================
-- OU DEFINA UMA NOVA SENHA DIRETAMENTE (mais rápido):
-- =====================================================
-- No Supabase Dashboard:
-- 1. Authentication > Users
-- 2. Clique no usuário gab.thiagotezzari@gmail.com
-- 3. Na aba "User Management"
-- 4. Clique em "Reset Password"
-- 5. Digite a nova senha: Tezzari@2024
-- 6. Clique em "Update User"

-- Depois tente fazer login com:
-- Email: gab.thiagotezzari@gmail.com
-- Senha: Tezzari@2024
