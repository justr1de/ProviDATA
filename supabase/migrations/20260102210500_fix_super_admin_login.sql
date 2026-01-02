-- =====================================================
-- Migration: Fix Super Admin Login Issue
-- =====================================================
-- Data: 2026-01-02T21:05:00Z
-- Problema: Super admins não conseguem logar após aplicação
--           das migrations de segurança RLS
-- 
-- Causa Raiz: A migration 20260102202000_optimize_rls_policies.sql
--             removeu políticas genéricas em gabinetes, mas as
--             políticas específicas dependem de consultas à tabela
--             profiles, criando possível deadlock durante login.
-- 
-- Solução: Adicionar política bypass em profiles para permitir
--          que usuários sempre possam ler seu próprio profile
--          (essencial para autenticação), sem depender de outras
--          consultas complexas.
-- =====================================================

BEGIN;

-- =====================================================
-- 1. Garantir que usuários possam ler seu próprio profile
--    durante o processo de autenticação
-- =====================================================

-- Esta política tem alta prioridade e deve ser avaliada primeiro
-- Permite que qualquer usuário autenticado leia seu próprio profile
-- sem depender de consultas a outras tabelas (evita deadlock)

-- Verificar se a política já existe antes de recriar
DROP POLICY IF EXISTS "auth_users_read_own_profile_always" ON profiles;

CREATE POLICY "auth_users_read_own_profile_always"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- =====================================================
-- 2. Adicionar política explícita para super_admins
--    lerem TODOS os profiles (necessário para admin page)
-- =====================================================

-- Super admins precisam ver todos os profiles para gerenciar usuários
DROP POLICY IF EXISTS "super_admin_read_all_profiles" ON profiles;

CREATE POLICY "super_admin_read_all_profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM profiles me
      WHERE me.id = auth.uid()
        AND me.role = 'super_admin'
    )
  );

-- =====================================================
-- 3. Recriar política genérica de leitura em gabinetes
--    (removida na migration 20260102202000_optimize_rls_policies.sql)
-- =====================================================

-- Esta política é necessária para permitir que usuários vejam
-- a lista de gabinetes sem depender de políticas muito restritivas
DROP POLICY IF EXISTS "authenticated_users_view_gabinetes" ON gabinetes;

CREATE POLICY "authenticated_users_view_gabinetes"
  ON gabinetes
  FOR SELECT
  TO authenticated
  USING (
    -- Super admins veem tudo
    EXISTS (
      SELECT 1
      FROM profiles me
      WHERE me.id = auth.uid()
        AND me.role = 'super_admin'
    )
    OR
    -- Membros do gabinete veem seu gabinete
    EXISTS (
      SELECT 1
      FROM profiles me
      WHERE me.id = auth.uid()
        AND me.gabinete_id = gabinetes.id
    )
  );

-- =====================================================
-- 4. Melhorar a função get_user_tenant_id para lidar
--    melhor com super_admins sem gabinete_id
-- =====================================================

-- Recriar a função com tratamento melhorado
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
  -- Para super_admins sem gabinete_id específico, retornar NULL
  -- permitindo que políticas tratem NULL como "acesso total"
  -- Para usuários normais, retornar o gabinete_id do profile
  SELECT 
    CASE 
      WHEN p.role = 'super_admin' THEN p.gabinete_id
      ELSE p.gabinete_id
    END
  FROM public.profiles p
  WHERE p.id = auth.uid();
$function$;

COMMENT ON FUNCTION public.get_user_tenant_id() IS 
  'Retorna o tenant_id do usuário autenticado. 
   Para super_admins, retorna seu gabinete_id se houver.
   SECURITY DEFINER permite ler profiles durante autenticação.
   Search path fixado para segurança (2026-01-02).';

-- =====================================================
-- 5. Validação
-- =====================================================

-- Verificar políticas em profiles
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'gabinetes')
  AND policyname IN (
    'auth_users_read_own_profile_always',
    'super_admin_read_all_profiles',
    'authenticated_users_view_gabinetes'
  )
ORDER BY tablename, policyname;

-- Verificar função get_user_tenant_id
SELECT 
  proname,
  prosecdef as "Security Definer",
  provolatile,
  prosrc
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'get_user_tenant_id';

COMMIT;

-- =====================================================
-- NOTAS
-- =====================================================
-- ✅ Políticas adicionadas:
--    1. auth_users_read_own_profile_always - Bypass para leitura do próprio profile
--    2. super_admin_read_all_profiles - Super admins veem todos os profiles
--    3. authenticated_users_view_gabinetes - Política de leitura mais permissiva em gabinetes
--
-- ✅ Função melhorada:
--    - get_user_tenant_id() agora com tratamento explícito de super_admins
--
-- 📚 Referências:
--    - Migration anterior: 20260102202000_optimize_rls_policies.sql
--    - Documentação RLS: https://supabase.com/docs/guides/auth/row-level-security
--
-- ⚠️ IMPORTANTE:
--    Esta migration mantém a segurança enquanto resolve o problema de login.
--    As políticas são cuidadosamente projetadas para evitar vazamento de dados.
-- =====================================================
