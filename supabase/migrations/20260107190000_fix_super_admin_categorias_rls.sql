-- =====================================================
-- Migration: Fix Super Admin RLS for Categorias
-- =====================================================
-- Data: 2026-01-07T19:00:00Z
-- Objetivo: Permitir que super_admin gerencie categorias de qualquer gabinete
-- =====================================================

BEGIN;

-- =====================================================
-- 1. REMOVER POLÍTICAS ANTIGAS DE CATEGORIAS
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage categorias" ON categorias;
DROP POLICY IF EXISTS "Users can view categorias in their tenant" ON categorias;
DROP POLICY IF EXISTS "Super admin can manage all categorias" ON categorias;

-- =====================================================
-- 2. CRIAR POLÍTICA PARA SUPER ADMIN (ACESSO TOTAL)
-- =====================================================

-- Super admin pode fazer qualquer operação em qualquer categoria
CREATE POLICY "Super admin can manage all categorias"
  ON categorias
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = (SELECT auth.uid())
        AND users.role::text = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = (SELECT auth.uid())
        AND users.role::text = 'super_admin'
    )
  );

-- =====================================================
-- 3. CRIAR POLÍTICA PARA ADMINS DO GABINETE
-- =====================================================

-- Admins e assessores podem gerenciar categorias do seu gabinete
CREATE POLICY "Admins can manage categorias in their tenant"
  ON categorias
  FOR ALL
  USING (
    gabinete_id = get_user_tenant_id()
    AND EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = (SELECT auth.uid())
        AND users.role::text = ANY(ARRAY['admin', 'assessor', 'gestor']::text[])
    )
  )
  WITH CHECK (
    gabinete_id = get_user_tenant_id()
    AND EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = (SELECT auth.uid())
        AND users.role::text = ANY(ARRAY['admin', 'assessor', 'gestor']::text[])
    )
  );

-- =====================================================
-- 4. CRIAR POLÍTICA DE VISUALIZAÇÃO PARA USUÁRIOS
-- =====================================================

-- Todos os usuários podem ver categorias do seu gabinete
CREATE POLICY "Users can view categorias in their tenant"
  ON categorias
  FOR SELECT
  USING (gabinete_id = get_user_tenant_id());

COMMIT;

-- =====================================================
-- VERIFICAÇÃO PÓS-MIGRATION
-- =====================================================
-- Execute para verificar as políticas criadas:
--
-- SELECT policyname, cmd, permissive, roles, qual
-- FROM pg_policies
-- WHERE tablename = 'categorias'
-- ORDER BY policyname;
-- =====================================================
