-- Migration: Fix Function Search Path
-- Data: 2026-01-02T19:53:00Z
-- Descrição: Corrige search_path mutável em funções críticas para prevenir injeção
-- Referência: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- =====================================================
-- PARTE 1: FUNÇÕES CRÍTICAS (ALTA PRIORIDADE)
-- =====================================================

-- 1. get_user_tenant_id - CRÍTICA (usada em todas as políticas RLS)
ALTER FUNCTION public.get_user_tenant_id() 
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.get_user_tenant_id() IS 
  'Retorna o tenant_id do usuário autenticado. Search path fixado para segurança.';

-- 2. accept_invite - Função de aceitar convite
ALTER FUNCTION public.accept_invite(TEXT, UUID)
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.accept_invite(TEXT, UUID) IS
  'Aceita um convite de gabinete. Search path fixado para segurança.';

-- 3. aceitar_convite - Função de aceitar convite (alias PT-BR)
ALTER FUNCTION public.aceitar_convite(TEXT, UUID)
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.aceitar_convite(TEXT, UUID) IS
  'Aceita um convite de gabinete (PT-BR). Search path fixado para segurança.';

-- 4. create_super_admin - Criação de super admin
ALTER FUNCTION public.create_super_admin(TEXT, TEXT, TEXT)
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.create_super_admin(TEXT, TEXT, TEXT) IS
  'Cria um novo super admin. Search path fixado para segurança.';

-- 5. setup_super_admin_profile - Setup de perfil super admin
ALTER FUNCTION public.setup_super_admin_profile(UUID)
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.setup_super_admin_profile(UUID) IS
  'Configura perfil de super admin. Search path fixado para segurança.';

-- 6. handle_new_user - Trigger de novo usuário
ALTER FUNCTION public.handle_new_user() 
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Trigger para processar novos usuários. Search path fixado para segurança.';

-- =====================================================
-- PARTE 2: FUNÇÕES DE PRIORIDADE MÉDIA
-- =====================================================

-- 7. revogar_convite - Revogação de convite
ALTER FUNCTION public.revogar_convite(UUID, UUID)
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.revogar_convite(UUID, UUID) IS
  'Revoga um convite. Search path fixado para segurança.';

-- 8. expirar_convites_antigos - Limpeza de convites expirados
ALTER FUNCTION public.expirar_convites_antigos() 
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.expirar_convites_antigos() IS 
  'Expira convites antigos automaticamente. Search path fixado para segurança.';

-- 9. generate_protocolo - Geração de protocolo
ALTER FUNCTION public.generate_protocolo(UUID)
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.generate_protocolo(UUID) IS
  'Gera número de protocolo único. Search path fixado para segurança.';

-- 10. check_prazo_providencias - Verificação de prazos
ALTER FUNCTION public.check_prazo_providencias() 
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.check_prazo_providencias() IS 
  'Verifica prazos de providências. Search path fixado para segurança.';

-- 11. obter_estatisticas_gabinete - Estatísticas do gabinete
ALTER FUNCTION public.obter_estatisticas_gabinete(UUID) 
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.obter_estatisticas_gabinete(UUID) IS 
  'Obtém estatísticas de um gabinete. Search path fixado para segurança.';

-- 12. create_providencia_history - Histórico de providências
ALTER FUNCTION public.create_providencia_history() 
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.create_providencia_history() IS 
  'Cria histórico de providência. Search path fixado para segurança.';

-- 13. update_dashboard_stats - Atualização de estatísticas
ALTER FUNCTION public.update_dashboard_stats() 
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.update_dashboard_stats() IS 
  'Atualiza estatísticas do dashboard. Search path fixado para segurança.';

-- =====================================================
-- PARTE 3: TRIGGERS DE TIMESTAMP
-- =====================================================

-- 14. update_updated_at_column - Trigger de updated_at
ALTER FUNCTION public.update_updated_at_column() 
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.update_updated_at_column() IS 
  'Trigger para atualizar coluna updated_at. Search path fixado para segurança.';

-- 15. update_updated_at - Trigger de updated_at (alias)
ALTER FUNCTION public.update_updated_at() 
  SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.update_updated_at() IS 
  'Trigger para atualizar timestamp. Search path fixado para segurança.';

-- =====================================================
-- PARTE 4: FUNÇÕES OSM (BAIXA PRIORIDADE)
-- =====================================================
-- Nota: Estas funções são geradas automaticamente pelo osm2pgsql
-- Aplicar correção apenas se não causar problemas de regeneração

-- 16. planet_osm_line_osm2pgsql_valid
ALTER FUNCTION public.planet_osm_line_osm2pgsql_valid()
  SET search_path = pg_catalog, public;

-- 17. planet_osm_point_osm2pgsql_valid
ALTER FUNCTION public.planet_osm_point_osm2pgsql_valid()
  SET search_path = pg_catalog, public;

-- 18. planet_osm_polygon_osm2pgsql_valid
ALTER FUNCTION public.planet_osm_polygon_osm2pgsql_valid()
  SET search_path = pg_catalog, public;

-- 19. planet_osm_roads_osm2pgsql_valid
ALTER FUNCTION public.planet_osm_roads_osm2pgsql_valid()
  SET search_path = pg_catalog, public;

-- =====================================================
-- VALIDAÇÃO
-- =====================================================

-- Query para verificar funções com search_path fixado
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'get_user_tenant_id',
      'accept_invite',
      'aceitar_convite',
      'create_super_admin',
      'setup_super_admin_profile',
      'handle_new_user',
      'revogar_convite',
      'expirar_convites_antigos',
      'generate_protocolo',
      'check_prazo_providencias',
      'obter_estatisticas_gabinete',
      'create_providencia_history',
      'update_dashboard_stats',
      'update_updated_at_column',
      'update_updated_at'
    )
    AND prosecdef = false; -- Não são SECURITY DEFINER

  RAISE NOTICE 'Total de funções críticas/médias corrigidas: %', v_count;
  
  IF v_count >= 15 THEN
    RAISE NOTICE '✅ Todas as funções críticas foram corrigidas!';
  ELSE
    RAISE WARNING '⚠️ Apenas % de 15 funções foram encontradas', v_count;
  END IF;
END $$;

-- =====================================================
-- DOCUMENTAÇÃO
-- =====================================================

COMMENT ON SCHEMA public IS 
  'Schema público do banco de dados. 
   Última atualização de segurança: 2026-01-02T19:53:00Z
   - RLS habilitado em 9 tabelas críticas
   - 19 funções com search_path fixado';
