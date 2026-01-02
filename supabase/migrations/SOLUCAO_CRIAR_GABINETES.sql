-- =====================================================
-- SOLUÇÃO: Permitir Criação de Gabinetes
-- =====================================================
-- Problema identificado: Apenas super_admins podem criar gabinetes
-- Solução: Promover usuário atual para super_admin
-- =====================================================

-- OPÇÃO 1: Promover o usuário logado atualmente para super_admin
-- Execute isso se você quer se tornar super_admin
UPDATE public.profiles
SET role = 'super_admin'
WHERE id = auth.uid()
RETURNING id, email, full_name, role;

-- OPÇÃO 2: Promover a Alissa para super_admin (se ela for criar gabinetes)
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'aliissasouzaa@gmail.com'
RETURNING id, email, full_name, role;

-- OPÇÃO 3: Promover Ranieri para super_admin (se ele for criar gabinetes)
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'ranieri.bragas@hotmail.com'
RETURNING id, email, full_name, role;

-- =====================================================
-- Verificar quem é super_admin agora
-- =====================================================
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM public.profiles
WHERE role = 'super_admin'
ORDER BY created_at;

-- =====================================================
-- Após executar uma das opções acima:
-- =====================================================
-- 1. Faça logout e login novamente no sistema
-- 2. Tente criar o gabinete novamente
-- 3. Deve funcionar agora!
-- =====================================================

-- =====================================================
-- ALTERNATIVA: Criar política RLS mais permissiva
-- =====================================================
-- Se você NÃO quer criar super_admins, pode permitir que
-- usuários admin também criem gabinetes:

-- DROP POLICY IF EXISTS "Admins can create gabinetes" ON public.gabinetes;
-- CREATE POLICY "Admins can create gabinetes"
--     ON public.gabinetes
--     FOR INSERT
--     TO authenticated
--     WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM public.profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('super_admin', 'admin')
--         )
--     );
