-- =====================================================
-- Migration: Fix Categorias Duplicadas e Permissões
-- =====================================================
-- Data: 2026-01-07T19:30:00Z
-- Objetivo: 
--   1. Corrigir políticas RLS para super_admin
--   2. Unificar categorias duplicadas
--   3. Criar constraint UNIQUE para impedir duplicatas
-- =====================================================

BEGIN;

-- =====================================================
-- PARTE 1: CORRIGIR POLÍTICAS RLS
-- =====================================================

-- Remover todas as políticas antigas de categorias
DROP POLICY IF EXISTS "Admins can manage categorias" ON categorias;
DROP POLICY IF EXISTS "Users can view categorias in their tenant" ON categorias;
DROP POLICY IF EXISTS "Super admin can manage all categorias" ON categorias;
DROP POLICY IF EXISTS "Admins can manage categorias in their tenant" ON categorias;

-- Política para Super Admin - ACESSO TOTAL a todas as categorias
CREATE POLICY "super_admin_full_access_categorias"
  ON categorias
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
        AND users.role::text = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
        AND users.role::text = 'super_admin'
    )
  );

-- Política para Admins/Gestores do gabinete - gerenciar categorias do próprio gabinete
CREATE POLICY "tenant_admins_manage_categorias"
  ON categorias
  FOR ALL
  USING (
    gabinete_id = get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
        AND users.role::text = ANY(ARRAY['admin', 'gestor', 'assessor']::text[])
    )
  )
  WITH CHECK (
    gabinete_id = get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
        AND users.role::text = ANY(ARRAY['admin', 'gestor', 'assessor']::text[])
    )
  );

-- Política para visualização - todos os usuários do gabinete podem ver
CREATE POLICY "tenant_users_view_categorias"
  ON categorias
  FOR SELECT
  USING (gabinete_id = get_user_tenant_id());

-- =====================================================
-- PARTE 2: IDENTIFICAR E UNIFICAR CATEGORIAS DUPLICADAS
-- =====================================================

-- Criar tabela temporária com categorias duplicadas
CREATE TEMP TABLE categorias_duplicadas AS
SELECT 
    gabinete_id,
    LOWER(TRIM(nome)) as nome_normalizado,
    MIN(id) as id_manter,
    ARRAY_AGG(id ORDER BY created_at) as todos_ids
FROM categorias
GROUP BY gabinete_id, LOWER(TRIM(nome))
HAVING COUNT(*) > 1;

-- Atualizar providências para usar a categoria principal (a mais antiga)
UPDATE providencias p
SET categoria_id = cd.id_manter
FROM categorias_duplicadas cd
WHERE p.categoria_id = ANY(cd.todos_ids)
  AND p.categoria_id != cd.id_manter;

-- Excluir categorias duplicadas (manter apenas a mais antiga)
DELETE FROM categorias c
WHERE EXISTS (
    SELECT 1 FROM categorias_duplicadas cd
    WHERE c.id = ANY(cd.todos_ids)
      AND c.id != cd.id_manter
);

-- Limpar tabela temporária
DROP TABLE IF EXISTS categorias_duplicadas;

-- =====================================================
-- PARTE 3: CRIAR CONSTRAINT UNIQUE
-- =====================================================

-- Remover constraint se já existir
ALTER TABLE categorias DROP CONSTRAINT IF EXISTS categorias_gabinete_nome_unique;

-- Criar constraint UNIQUE para gabinete_id + nome (case insensitive)
-- Primeiro, normalizar os nomes existentes (trim)
UPDATE categorias SET nome = TRIM(nome);

-- Criar índice único case-insensitive
CREATE UNIQUE INDEX IF NOT EXISTS categorias_gabinete_nome_unique_idx 
ON categorias (gabinete_id, LOWER(nome));

COMMIT;

-- =====================================================
-- VERIFICAÇÃO PÓS-MIGRATION
-- =====================================================
-- Execute para verificar:
--
-- -- Verificar se ainda há duplicatas
-- SELECT gabinete_id, LOWER(nome), COUNT(*) 
-- FROM categorias 
-- GROUP BY gabinete_id, LOWER(nome) 
-- HAVING COUNT(*) > 1;
--
-- -- Verificar políticas criadas
-- SELECT policyname, cmd, permissive 
-- FROM pg_policies 
-- WHERE tablename = 'categorias';
-- =====================================================
